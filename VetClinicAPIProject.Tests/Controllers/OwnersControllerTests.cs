using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.Controllers;
using VetClinicAPIProject.DTOs.Owner;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Tests.Controllers;

public class OwnersControllerTests
{
    private readonly Mock<IOwnerService> _ownerServiceMock;
    private readonly Mock<ILogger<OwnersController>> _loggerMock;
    private readonly OwnersController _controller;

    public OwnersControllerTests()
    {
        _ownerServiceMock = new Mock<IOwnerService>();
        _loggerMock = new Mock<ILogger<OwnersController>>();
        _controller = new OwnersController(_ownerServiceMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task GetOwners_ReturnsOk_WithOwnerList()
    {
        // Arrange
        var owners = new List<OwnerDto>
        {
            new() { OwnerId = 1, FullName = "Alice", Email = "alice@example.com", Phone = "1234567890" },
            new() { OwnerId = 2, FullName = "Bob",   Email = "bob@example.com",   Phone = "0987654321" }
        };

        _ownerServiceMock.Setup(s => s.GetAllOwnersAsync()).ReturnsAsync(owners);

        // Act
        var result = await _controller.GetOwners();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsAssignableFrom<IEnumerable<OwnerDto>>(okResult.Value);
        Assert.Equal(2, body.Count());
    }

    [Fact]
    public async Task GetOwnerById_ReturnsOk_WhenOwnerExists()
    {
        // Arrange
        var owner = new OwnerDto { OwnerId = 1, FullName = "Alice", Email = "alice@example.com", Phone = "1234567890" };
        _ownerServiceMock.Setup(s => s.GetOwnerByIdAsync(1)).ReturnsAsync(owner);

        // Act
        var result = await _controller.GetOwnerById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<OwnerDto>(okResult.Value);
        Assert.Equal(1, body.OwnerId);
        Assert.Equal("Alice", body.FullName);
    }

    [Fact]
    public async Task CreateOwner_ReturnsCreatedAtAction_WithOwner()
    {
        // Arrange
        var dto = new CreateOwnerDto
        {
            FullName = "Charlie",
            Email = "charlie@example.com",
            Phone = "1112223333"
        };

        var created = new OwnerDto
        {
            OwnerId = 3,
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone
        };

        _ownerServiceMock.Setup(s => s.CreateOwnerAsync(dto)).ReturnsAsync(created);

        // Act
        var result = await _controller.CreateOwner(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var body = Assert.IsType<OwnerDto>(createdResult.Value);
        Assert.Equal(3, body.OwnerId);
        Assert.Equal("Charlie", body.FullName);
    }

    [Fact]
    public async Task UpdateOwner_ReturnsOk_WithUpdatedOwner()
    {
        // Arrange
        var dto = new UpdateOwnerDto { FullName = "Alice Updated", Phone = "9998887777", Email = "alice@example.com" };
        var updated = new OwnerDto { OwnerId = 1, FullName = "Alice Updated", Phone = "9998887777", Email = "alice@example.com" };

        _ownerServiceMock.Setup(s => s.UpdateOwnerAsync(1, dto)).ReturnsAsync(updated);

        // Act
        var result = await _controller.UpdateOwner(1, dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<OwnerDto>(okResult.Value);
        Assert.Equal("Alice Updated", body.FullName);
    }

    [Fact]
    public async Task DeleteOwner_ReturnsNoContent_WhenDeleteSucceeds()
    {
        // Arrange
        _ownerServiceMock.Setup(s => s.DeleteOwnerAsync(1)).ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteOwner(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteOwner_ReturnsBadRequest_WhenDeleteFails()
    {
        // Arrange
        _ownerServiceMock.Setup(s => s.DeleteOwnerAsync(99)).ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteOwner(99);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}
