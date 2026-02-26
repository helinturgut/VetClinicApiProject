using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.DTOs.Diagnosis;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Implementations;

namespace VetClinicAPIProject.Tests.Services;

public class DiagnosisServiceTests
{
    private readonly Mock<IDiagnosisRepository> _diagnosisRepositoryMock = new();
    private readonly Mock<IVisitRepository> _visitRepositoryMock = new();
    private readonly DiagnosisService _service;

    public DiagnosisServiceTests()
    {
        _service = new DiagnosisService(
            _diagnosisRepositoryMock.Object,
            _visitRepositoryMock.Object,
            Mock.Of<ILogger<DiagnosisService>>());
    }

    [Fact]
    public async Task GetDiagnosesByVisitIdAsync_WhenVisitDoesNotExist_ThrowsKeyNotFoundException()
    {
        _visitRepositoryMock.Setup(repo => repo.GetByIdAsync(9)).ReturnsAsync((Visit?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.GetDiagnosesByVisitIdAsync(9));
    }

    [Fact]
    public async Task GetDiagnosesByVisitIdAsync_WhenVisitExists_ReturnsMappedDiagnoses()
    {
        _visitRepositoryMock.Setup(repo => repo.GetByIdAsync(5)).ReturnsAsync(new Visit { VisitId = 5 });
        _diagnosisRepositoryMock
            .Setup(repo => repo.GetByVisitIdAsync(5))
            .ReturnsAsync(
            [
                new Diagnosis
                {
                    DiagnosisId = 1,
                    VisitId = 5,
                    DiseaseName = "Condition A",
                    Description = "Desc A",
                    Severity = "Mild",
                    DiagnosedAt = DateTime.UtcNow
                },
                new Diagnosis
                {
                    DiagnosisId = 2,
                    VisitId = 5,
                    DiseaseName = "Condition B",
                    Description = "Desc B",
                    Severity = "Severe",
                    DiagnosedAt = DateTime.UtcNow
                }
            ]);

        var result = await _service.GetDiagnosesByVisitIdAsync(5);

        var list = result.ToList();
        Assert.Equal(2, list.Count);
        Assert.Equal("Condition A", list[0].DiseaseName);
        Assert.Equal("Condition B", list[1].DiseaseName);
    }

    [Fact]
    public async Task CreateDiagnosisAsync_WhenSaveFails_ThrowsInvalidOperationException()
    {
        _visitRepositoryMock.Setup(repo => repo.GetByIdAsync(3)).ReturnsAsync(new Visit { VisitId = 3 });
        _diagnosisRepositoryMock.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(false);

        var dto = new CreateDiagnosisDto
        {
            DiseaseName = "Condition X",
            Description = "Description",
            Severity = "Moderate"
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateDiagnosisAsync(3, dto));
        _diagnosisRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Diagnosis>()), Times.Once);
        _diagnosisRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }
}
