using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.DTOs.Owner;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Implementations;

namespace VetClinicAPIProject.Tests.Services;

public class OwnerServiceTests
{
    private readonly Mock<IOwnerRepository> _ownerRepositoryMock = new();
    private readonly OwnerService _service;

    public OwnerServiceTests()
    {
        _service = new OwnerService(_ownerRepositoryMock.Object, Mock.Of<ILogger<OwnerService>>());
    }

    [Fact]
    public async Task GetOwnerByIdAsync_WhenOwnerDoesNotExist_ThrowsKeyNotFoundException()
    {
        _ownerRepositoryMock
            .Setup(repo => repo.GetOwnerWithPetsAsync(42))
            .ReturnsAsync((Owner?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetOwnerByIdAsync(42));
    }

    [Fact]
    public async Task CreateOwnerAsync_WhenSaveSucceeds_ReturnsMappedOwnerDto()
    {
        var createdAt = DateTime.UtcNow;
        var dto = new CreateOwnerDto
        {
            FullName = "Jane Owner",
            Phone = "555123",
            Email = "jane@example.com",
            Address = "Main Street"
        };

        _ownerRepositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<Owner>()))
            .Callback<Owner>(owner =>
            {
                owner.OwnerId = 10;
                owner.CreatedAt = createdAt;
            })
            .Returns(Task.CompletedTask);

        _ownerRepositoryMock
            .Setup(repo => repo.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _service.CreateOwnerAsync(dto);

        Assert.Equal(10, result.OwnerId);
        Assert.Equal("Jane Owner", result.FullName);
        Assert.Equal("555123", result.Phone);
        Assert.Equal("jane@example.com", result.Email);
        Assert.Equal("Main Street", result.Address);
        Assert.Equal(createdAt, result.CreatedAt);
        Assert.Equal(0, result.PetCount);
        _ownerRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Owner>()), Times.Once);
        _ownerRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteOwnerAsync_WhenOwnerDoesNotExist_ThrowsKeyNotFoundException()
    {
        _ownerRepositoryMock
            .Setup(repo => repo.GetByIdAsync(99))
            .ReturnsAsync((Owner?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteOwnerAsync(99));
    }
}
