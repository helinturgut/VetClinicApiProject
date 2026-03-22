using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.Controllers;
using VetClinicAPIProject.DTOs.Auth;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly Mock<ILogger<AuthController>> _loggerMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _loggerMock = new Mock<ILogger<AuthController>>();
        _controller = new AuthController(_authServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Register_ReturnsCreated_WhenSuccessful()
    {
        // Arrange
        var dto = new RegisterDto
        {
            FullName = "Jane Smith",
            Email = "jane@example.com",
            Password = "Password1"
        };

        var response = new RegisterResponseDto
        {
            Email = dto.Email,
            FullName = dto.FullName,
            Role = "Veterinarian",
            RequiresApproval = true,
            Message = "Registration successful. Await admin approval."
        };

        _authServiceMock.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(response);

        // Act
        var result = await _controller.Register(dto);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status201Created, objectResult.StatusCode);
        var body = Assert.IsType<RegisterResponseDto>(objectResult.Value);
        Assert.Equal(dto.Email, body.Email);
    }

    [Fact]
    public async Task Login_ReturnsOk_WithToken_WhenCredentialsValid()
    {
        // Arrange
        var dto = new LoginDto { Email = "admin@admin.com", Password = "Password123" };

        var response = new AuthResponseDto
        {
            Token = "jwt-token",
            RefreshToken = "refresh-token",
            Email = dto.Email,
            FullName = "Admin",
            Role = "Admin",
            Expiration = DateTime.UtcNow.AddHours(1)
        };

        _authServiceMock.Setup(s => s.LoginAsync(dto)).ReturnsAsync(response);

        // Act
        var result = await _controller.Login(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<AuthResponseDto>(okResult.Value);
        Assert.Equal("jwt-token", body.Token);
        Assert.Equal("refresh-token", body.RefreshToken);
    }

    [Fact]
    public async Task Refresh_ReturnsOk_WithNewTokens_WhenRefreshTokenValid()
    {
        // Arrange
        var dto = new RefreshTokenDto
        {
            Token = "expired-jwt-token",
            RefreshToken = "valid-refresh-token"
        };

        var response = new AuthResponseDto
        {
            Token = "new-jwt-token",
            RefreshToken = "new-refresh-token",
            Email = "admin@admin.com",
            FullName = "Admin",
            Role = "Admin",
            Expiration = DateTime.UtcNow.AddHours(1)
        };

        _authServiceMock.Setup(s => s.RefreshTokenAsync(dto)).ReturnsAsync(response);

        // Act
        var result = await _controller.Refresh(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<AuthResponseDto>(okResult.Value);
        Assert.Equal("new-jwt-token", body.Token);
        Assert.Equal("new-refresh-token", body.RefreshToken);
    }
}
