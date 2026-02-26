using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.DTOs.Visit;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Implementations;

namespace VetClinicAPIProject.Tests.Services;

public class VisitServiceTests
{
    private readonly Mock<IVisitRepository> _visitRepositoryMock = new();
    private readonly Mock<IPetRepository> _petRepositoryMock = new();
    private readonly VisitService _service;

    public VisitServiceTests()
    {
        _service = new VisitService(
            _visitRepositoryMock.Object,
            _petRepositoryMock.Object,
            Mock.Of<ILogger<VisitService>>());
    }

    [Fact]
    public async Task CreateVisitAsync_WhenVeterinarianIdIsMissing_ThrowsInvalidOperationException()
    {
        var dto = new CreateVisitDto { PetId = 1, VisitDate = DateTime.UtcNow };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateVisitAsync(dto, ""));

        _visitRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Visit>()), Times.Never);
        _visitRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task CreateVisitAsync_WhenPetExists_UpdatesLastCheckInDateAndReturnsVisitDto()
    {
        var visitDate = new DateTime(2026, 2, 26, 10, 30, 0, DateTimeKind.Utc);
        var dto = new CreateVisitDto
        {
            PetId = 3,
            VisitDate = visitDate,
            Complaint = "Cough"
        };

        var pet = new Pet { PetId = 3, Name = "Luna" };

        _petRepositoryMock.Setup(repo => repo.GetByIdAsync(dto.PetId)).ReturnsAsync(pet);
        _visitRepositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<Visit>()))
            .Callback<Visit>(visit => visit.VisitId = 12)
            .Returns(Task.CompletedTask);
        _visitRepositoryMock.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);
        _visitRepositoryMock
            .Setup(repo => repo.GetVisitWithDetailsAsync(12))
            .ReturnsAsync(new Visit
            {
                VisitId = 12,
                PetId = 3,
                VeterinarianId = "vet-1",
                VisitDate = visitDate,
                Complaint = "Cough",
                Pet = new Pet { PetId = 3, Name = "Luna" }
            });

        var result = await _service.CreateVisitAsync(dto, "vet-1");

        Assert.Equal(12, result.VisitId);
        Assert.Equal(3, result.PetId);
        Assert.Equal("Luna", result.PetName);
        Assert.Equal(visitDate, pet.LastCheckInDate);
        _petRepositoryMock.Verify(
            repo => repo.Update(It.Is<Pet>(p => p.PetId == 3 && p.LastCheckInDate == visitDate)),
            Times.Once);
        _visitRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetVisitByIdAsync_WhenVisitDoesNotExist_ThrowsKeyNotFoundException()
    {
        _visitRepositoryMock
            .Setup(repo => repo.GetVisitWithDetailsAsync(404))
            .ReturnsAsync((Visit?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetVisitByIdAsync(404));
    }
}
