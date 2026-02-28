using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Services.Implementations;

namespace VetClinicAPIProject.Tests.Services;

public class AdminServiceTests
{
    [Fact]
    public async Task GetPendingVeterinariansAsync_ReturnsOnlyUnapprovedVeterinarians()
    {
        var userManagerMock = CreateUserManagerMock();
        userManagerMock
            .Setup(manager => manager.GetUsersInRoleAsync("Veterinarian"))
            .ReturnsAsync(
            [
                new ApplicationUser { Id = "1", Email = "pending1@example.com", FullName = "Pending One", IsApproved = false },
                new ApplicationUser { Id = "2", Email = "approved@example.com", FullName = "Approved Vet", IsApproved = true },
                new ApplicationUser { Id = "3", Email = "pending2@example.com", FullName = "Pending Two", IsApproved = false }
            ]);

        var service = new AdminService(userManagerMock.Object, Mock.Of<ILogger<AdminService>>());

        var result = (await service.GetPendingVeterinariansAsync()).ToList();

        Assert.Equal(2, result.Count);
        Assert.All(result, item => Assert.Contains("pending", item.Email));
    }

    [Fact]
    public async Task ApproveVeterinarianAsync_WhenPendingVeterinarianExists_ApprovesAndReturnsDto()
    {
        var userManagerMock = CreateUserManagerMock();
        var user = new ApplicationUser
        {
            Id = "vet-1",
            Email = "vet1@example.com",
            FullName = "Vet One",
            IsApproved = false
        };

        userManagerMock.Setup(manager => manager.FindByIdAsync("vet-1")).ReturnsAsync(user);
        userManagerMock.Setup(manager => manager.IsInRoleAsync(user, "Veterinarian")).ReturnsAsync(true);
        userManagerMock.Setup(manager => manager.UpdateAsync(user)).ReturnsAsync(IdentityResult.Success);

        var service = new AdminService(userManagerMock.Object, Mock.Of<ILogger<AdminService>>());

        var result = await service.ApproveVeterinarianAsync("vet-1");

        Assert.True(result.IsApproved);
        Assert.Equal("vet-1", result.UserId);
        userManagerMock.Verify(manager => manager.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task ApproveVeterinarianAsync_WhenAlreadyApproved_ReturnsApprovedWithoutUpdate()
    {
        var userManagerMock = CreateUserManagerMock();
        var user = new ApplicationUser
        {
            Id = "vet-2",
            Email = "vet2@example.com",
            FullName = "Vet Two",
            IsApproved = true
        };

        userManagerMock.Setup(manager => manager.FindByIdAsync("vet-2")).ReturnsAsync(user);
        userManagerMock.Setup(manager => manager.IsInRoleAsync(user, "Veterinarian")).ReturnsAsync(true);

        var service = new AdminService(userManagerMock.Object, Mock.Of<ILogger<AdminService>>());

        var result = await service.ApproveVeterinarianAsync("vet-2");

        Assert.True(result.IsApproved);
        userManagerMock.Verify(manager => manager.UpdateAsync(It.IsAny<ApplicationUser>()), Times.Never);
    }

    [Fact]
    public async Task ApproveVeterinarianAsync_WhenUserDoesNotExist_ThrowsKeyNotFoundException()
    {
        var userManagerMock = CreateUserManagerMock();
        userManagerMock.Setup(manager => manager.FindByIdAsync("missing")).ReturnsAsync((ApplicationUser?)null);

        var service = new AdminService(userManagerMock.Object, Mock.Of<ILogger<AdminService>>());

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.ApproveVeterinarianAsync("missing"));
    }

    [Fact]
    public async Task ApproveVeterinarianAsync_WhenUserIsNotVeterinarian_ThrowsInvalidOperationException()
    {
        var userManagerMock = CreateUserManagerMock();
        var user = new ApplicationUser
        {
            Id = "admin-1",
            Email = "admin@example.com",
            FullName = "Admin User",
            IsApproved = true
        };

        userManagerMock.Setup(manager => manager.FindByIdAsync("admin-1")).ReturnsAsync(user);
        userManagerMock.Setup(manager => manager.IsInRoleAsync(user, "Veterinarian")).ReturnsAsync(false);

        var service = new AdminService(userManagerMock.Object, Mock.Of<ILogger<AdminService>>());

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ApproveVeterinarianAsync("admin-1"));
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
}
