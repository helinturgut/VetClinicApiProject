using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.DTOs.Treatment;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Implementations;

namespace VetClinicAPIProject.Tests.Services;

public class TreatmentServiceTests
{
    private readonly Mock<ITreatmentRepository> _treatmentRepositoryMock = new();
    private readonly Mock<IVisitRepository> _visitRepositoryMock = new();
    private readonly TreatmentService _service;

    public TreatmentServiceTests()
    {
        _service = new TreatmentService(
            _treatmentRepositoryMock.Object,
            _visitRepositoryMock.Object,
            Mock.Of<ILogger<TreatmentService>>());
    }

    [Fact]
    public async Task GetTreatmentsByVisitIdAsync_WhenVisitDoesNotExist_ThrowsKeyNotFoundException()
    {
        _visitRepositoryMock.Setup(repo => repo.GetByIdAsync(4)).ReturnsAsync((Visit?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetTreatmentsByVisitIdAsync(4));
    }

    [Fact]
    public async Task GetTreatmentsByVisitIdAsync_WhenVisitExists_ReturnsMappedTreatments()
    {
        _visitRepositoryMock.Setup(repo => repo.GetByIdAsync(2)).ReturnsAsync(new Visit { VisitId = 2 });
        _treatmentRepositoryMock
            .Setup(repo => repo.GetByVisitIdAsync(2))
            .ReturnsAsync(
            [
                new Treatment
                {
                    TreatmentId = 1,
                    VisitId = 2,
                    TreatmentName = "Treatment A",
                    Medication = "Med A",
                    Dosage = "1/day",
                    Instructions = "After food",
                    Cost = 20
                }
            ]);

        var result = await _service.GetTreatmentsByVisitIdAsync(2);
        var list = result.ToList();

        Assert.Single(list);
        Assert.Equal("Treatment A", list[0].TreatmentName);
        Assert.Equal(20, list[0].Cost);
    }

    [Fact]
    public async Task CreateTreatmentAsync_WhenSaveFails_ThrowsInvalidOperationException()
    {
        _visitRepositoryMock.Setup(repo => repo.GetByIdAsync(7)).ReturnsAsync(new Visit { VisitId = 7 });
        _treatmentRepositoryMock.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(false);

        var dto = new CreateTreatmentDto
        {
            TreatmentName = "Tx",
            Medication = "Med",
            Dosage = "2/day",
            Instructions = "With water",
            Cost = 42
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateTreatmentAsync(7, dto));
        _treatmentRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Treatment>()), Times.Once);
        _treatmentRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }
}
