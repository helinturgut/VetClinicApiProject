using Microsoft.AspNetCore.Identity;
using VetClinicAPIProject.DTOs.Admin;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class AdminService : IAdminService
{
    private const string VeterinarianRole = "Veterinarian";

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<AdminService> _logger;

    public AdminService(UserManager<ApplicationUser> userManager, ILogger<AdminService> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<IEnumerable<PendingVeterinarianDto>> GetPendingVeterinariansAsync()
    {
        var veterinarians = await _userManager.GetUsersInRoleAsync(VeterinarianRole);

        var pendingVeterinarians = veterinarians
            .Where(user => !user.IsApproved)
            .Select(user => new PendingVeterinarianDto
            {
                UserId = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName
            })
            .ToList();

        _logger.LogInformation("Retrieved {Count} pending veterinarian accounts", pendingVeterinarians.Count);
        return pendingVeterinarians;
    }

    public async Task<VeterinarianApprovalDto> ApproveVeterinarianAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            _logger.LogWarning("Veterinarian approval failed because user was not found: {UserId}", userId);
            throw new KeyNotFoundException($"User not found with ID: {userId}");
        }

        var isVeterinarian = await _userManager.IsInRoleAsync(user, VeterinarianRole);
        if (!isVeterinarian)
        {
            _logger.LogWarning(
                "Veterinarian approval failed because user {UserId} is not in role {Role}",
                userId,
                VeterinarianRole);
            throw new InvalidOperationException("Only veterinarian accounts can be approved.");
        }

        if (!user.IsApproved)
        {
            user.IsApproved = true;
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
                _logger.LogError("Failed to approve veterinarian {UserId}. Errors: {Errors}", userId, errors);
                throw new InvalidOperationException(errors);
            }

            _logger.LogInformation("Veterinarian account approved for user {UserId}", userId);
        }
        else
        {
            _logger.LogInformation("Veterinarian account already approved for user {UserId}", userId);
        }

        return new VeterinarianApprovalDto
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            IsApproved = user.IsApproved
        };
    }
}
