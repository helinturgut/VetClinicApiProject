using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.DTOs.Auth;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Services.Implementations;

namespace VetClinicAPIProject.Tests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ThrowsInvalidOperationException()
    {
        var userManagerMock = CreateUserManagerMock();
        var roleManagerMock = CreateRoleManagerMock();
        var configuration = BuildJwtConfiguration();

        userManagerMock
            .Setup(manager => manager.FindByEmailAsync("existing@example.com"))
            .ReturnsAsync(new ApplicationUser { Id = "1", Email = "existing@example.com" });

        var service = new AuthService(
            userManagerMock.Object,
            roleManagerMock.Object,
            configuration,
            Mock.Of<ILogger<AuthService>>());

        var dto = new RegisterDto
        {
            FullName = "Existing User",
            Email = "existing@example.com",
            Password = "Password123!"
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(dto));
    }

    [Fact]
    public async Task LoginAsync_WhenCredentialsAreValid_ReturnsTokenResponse()
    {
        var userManagerMock = CreateUserManagerMock();
        var roleManagerMock = CreateRoleManagerMock();
        var configuration = BuildJwtConfiguration();

        var user = new ApplicationUser
        {
            Id = "user-1",
            Email = "user@example.com",
            FullName = "Valid User",
            UserName = "user@example.com"
        };

        userManagerMock.Setup(manager => manager.FindByEmailAsync(user.Email!)).ReturnsAsync(user);
        userManagerMock.Setup(manager => manager.CheckPasswordAsync(user, "Password123!")).ReturnsAsync(true);
        userManagerMock.Setup(manager => manager.GetRolesAsync(user)).ReturnsAsync(["Veterinarian"]);

        var service = new AuthService(
            userManagerMock.Object,
            roleManagerMock.Object,
            configuration,
            Mock.Of<ILogger<AuthService>>());

        var result = await service.LoginAsync(new LoginDto
        {
            Email = user.Email!,
            Password = "Password123!"
        });

        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        Assert.Equal("user@example.com", result.Email);
        Assert.Equal("Veterinarian", result.Role);
    }

    private static IConfiguration BuildJwtConfiguration()
    {
        var settings = new Dictionary<string, string?>
        {
            ["JwtSettings:Secret"] = "ThisSecretKeyMustBeAtLeast32CharactersLong!!",
            ["JwtSettings:Issuer"] = "VetClinicApi",
            ["JwtSettings:Audience"] = "VetClinicApi",
            ["JwtSettings:ExpirationInMinutes"] = "60"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();
    }

    private static Mock<UserManager<ApplicationUser>> CreateUserManagerMock()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(
            store.Object,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!);
    }

    private static Mock<RoleManager<IdentityRole>> CreateRoleManagerMock()
    {
        var store = new Mock<IRoleStore<IdentityRole>>();
        return new Mock<RoleManager<IdentityRole>>(
            store.Object,
            null!,
            null!,
            null!,
            null!);
    }
}
