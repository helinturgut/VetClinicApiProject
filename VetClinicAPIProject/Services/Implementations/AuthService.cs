using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using VetClinicAPIProject.DTOs.Auth;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser is not null)
        {
            _logger.LogWarning("Registration failed because email already exists: {Email}", dto.Email);
            throw new InvalidOperationException("A user with this email already exists.");
        }

        const string defaultRole = "Veterinarian";
        if (!await _roleManager.RoleExistsAsync(defaultRole))
        {
            _logger.LogWarning("Registration failed because role does not exist: {Role}", defaultRole);
            throw new InvalidOperationException("Default role is not configured.");
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            IsApproved = false
        };

        var createResult = await _userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            _logger.LogWarning("Registration failed for email {Email}. Errors: {Errors}", dto.Email, errors);
            throw new InvalidOperationException(errors);
        }

        var roleResult = await _userManager.AddToRoleAsync(user, defaultRole);
        if (!roleResult.Succeeded)
        {
            var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
            _logger.LogError("Role assignment failed for user {UserId}. Errors: {Errors}", user.Id, errors);
            throw new InvalidOperationException(errors);
        }

        _logger.LogInformation(
            "User registered successfully with ID {UserId} and role {Role}. Approval required: {RequiresApproval}",
            user.Id,
            defaultRole,
            true);

        await _emailService.SendWelcomeEmailAsync(user.Email ?? string.Empty, user.FullName);

        return new RegisterResponseDto
        {
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = defaultRole,
            RequiresApproval = true,
            Message = "Registration successful. Await admin approval."
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null)
        {
            _logger.LogWarning("Login failed because email does not exist: {Email}", dto.Email);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var validPassword = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!validPassword)
        {
            _logger.LogWarning("Login failed due to invalid password for user {UserId}", user.Id);
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(role))
        {
            _logger.LogWarning("Login failed because user {UserId} has no assigned role", user.Id);
            throw new InvalidOperationException("User role is not configured.");
        }

        if (roles.Contains("Veterinarian") && !user.IsApproved)
        {
            _logger.LogWarning("Login failed because veterinarian account is pending approval for user {UserId}", user.Id);
            throw new UnauthorizedAccessException("Your account is pending admin approval.");
        }

        _logger.LogInformation("User {UserId} logged in successfully with role {Role}", user.Id, role);
        return await GenerateJwtTokenAsync(user, role);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto)
    {
        var principal = GetPrincipalFromExpiredToken(dto.Token);
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("Refresh token failed: could not extract user ID from token");
            throw new UnauthorizedAccessException("Invalid token.");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiry <= DateTime.UtcNow)
        {
            _logger.LogWarning("Refresh token failed for user {UserId}: invalid or expired refresh token", userId);
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? string.Empty;

        _logger.LogInformation("Refresh token accepted for user {UserId}, issuing new tokens", userId);
        return await GenerateJwtTokenAsync(user, role);
    }

    private async Task<AuthResponseDto> GenerateJwtTokenAsync(ApplicationUser user, string role)
    {
        var secret = _configuration["JwtSettings:Secret"];
        var issuer = _configuration["JwtSettings:Issuer"];
        var audience = _configuration["JwtSettings:Audience"];
        var expirationMinutes = _configuration.GetValue<int>("JwtSettings:ExpirationInMinutes");

        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException("JWT settings are missing from configuration.");
        }

        if (expirationMinutes <= 0)
        {
            throw new InvalidOperationException("JWT expiration setting must be greater than zero.");
        }

        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var jwt = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

       
        var refreshToken = GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(jwt),
            RefreshToken = refreshToken,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = role,
            Expiration = expiresAt
        };
    }

    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var secret = _configuration["JwtSettings:Secret"]
            ?? throw new InvalidOperationException("JWT secret is not configured.");

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false, // allow expired tokens for refresh
            ValidateIssuerSigningKey = true,
            ValidIssuer = _configuration["JwtSettings:Issuer"],
            ValidAudience = _configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
        };

        var handler = new JwtSecurityTokenHandler();
        var principal = handler.ValidateToken(token, validationParameters, out var securityToken);

        if (securityToken is not JwtSecurityToken jwt ||
            !jwt.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Invalid token.");
        }

        return principal;
    }
}
