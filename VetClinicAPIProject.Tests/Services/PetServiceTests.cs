using Microsoft.Extensions.Logging;
using Moq;
using VetClinicAPIProject.DTOs.Pet;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Implementations;

namespace VetClinicAPIProject.Tests.Services;

public class PetServiceTests
{
    private readonly Mock<IPetRepository> _petRepositoryMock = new();
    private readonly Mock<IOwnerRepository> _ownerRepositoryMock = new();
    private readonly PetService _service;

    public PetServiceTests()
    {
        _service = new PetService(
            _petRepositoryMock.Object,
            _ownerRepositoryMock.Object,
            Mock.Of<ILogger<PetService>>());
    }

    [Fact]
    public async Task CreatePetAsync_WhenOwnerDoesNotExist_ThrowsKeyNotFoundException()
    {
        var dto = new CreatePetDto
        {
            Name = "Milo",
            Species = "Cat",
            Age = 3,
            OwnerId = 100
        };

        _ownerRepositoryMock
            .Setup(repo => repo.OwnerExistsAsync(dto.OwnerId))
            .ReturnsAsync(false);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreatePetAsync(dto));

        _petRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Pet>()), Times.Never);
        _petRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task CreatePetAsync_WhenOwnerExists_ReturnsPetDtoWithOwnerName()
    {
        var dto = new CreatePetDto
        {
            Name = "Milo",
            Species = "Cat",
            Breed = "Siamese",
            Age = 3,
            Gender = "Male",
            Weight = 4.2m,
            OwnerId = 5
        };

        var owner = new Owner { OwnerId = 5, FullName = "Jane Owner" };

        _ownerRepositoryMock.Setup(repo => repo.OwnerExistsAsync(5)).ReturnsAsync(true);
        _petRepositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<Pet>()))
            .Callback<Pet>(pet => pet.PetId = 21)
            .Returns(Task.CompletedTask);
        _petRepositoryMock.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);
        _petRepositoryMock
            .Setup(repo => repo.GetPetWithOwnerAsync(21))
            .ReturnsAsync(new Pet
            {
                PetId = 21,
                Name = dto.Name,
                Species = dto.Species,
                Breed = dto.Breed,
                Age = dto.Age,
                Gender = dto.Gender!,
                Weight = dto.Weight,
                OwnerId = dto.OwnerId,
                Owner = owner
            });

        var result = await _service.CreatePetAsync(dto);

        Assert.Equal(21, result.PetId);
        Assert.Equal("Milo", result.Name);
        Assert.Equal("Jane Owner", result.OwnerName);
        _petRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Pet>()), Times.Once);
        _petRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetPetHistoryAsync_WhenPetExists_ReturnsMappedAndOrderedHistory()
    {
        var pet = new Pet
        {
            PetId = 7,
            Name = "Luna",
            Species = "Dog",
            Breed = "Mixed",
            Age = 5,
            Gender = "Female",
            Weight = 20.5m,
            OwnerId = 3,
            Owner = new Owner
            {
                OwnerId = 3,
                FullName = "Owner Name",
                Phone = "123",
                Email = "owner@example.com",
                Address = "Address"
            },
            Visits =
            [
                new Visit
                {
                    VisitId = 2,
                    PetId = 7,
                    VeterinarianId = "vet-2",
                    Complaint = "Second",
                    Diagnoses =
                    [
                        new Diagnosis { DiagnosisId = 5, VisitId = 2, DiseaseName = "Z condition" },
                        new Diagnosis { DiagnosisId = 1, VisitId = 2, DiseaseName = "A condition" }
                    ],
                    Treatments =
                    [
                        new Treatment { TreatmentId = 4, VisitId = 2, TreatmentName = "Z treatment" },
                        new Treatment { TreatmentId = 2, VisitId = 2, TreatmentName = "A treatment" }
                    ]
                },
                new Visit
                {
                    VisitId = 1,
                    PetId = 7,
                    VeterinarianId = "vet-1",
                    Complaint = "First",
                    Diagnoses = [new Diagnosis { DiagnosisId = 3, VisitId = 1, DiseaseName = "Only diagnosis" }],
                    Treatments = [new Treatment { TreatmentId = 3, VisitId = 1, TreatmentName = "Only treatment" }]
                }
            ]
        };

        _petRepositoryMock
            .Setup(repo => repo.GetPetWithFullHistoryAsync(7))
            .ReturnsAsync(pet);

        var result = await _service.GetPetHistoryAsync(7);

        Assert.Equal(7, result.PetId);
        Assert.Equal("Owner Name", result.OwnerName);
        Assert.Equal(2, result.Visits.Count);
        Assert.Equal(1, result.Visits[0].VisitId);
        Assert.Equal(2, result.Visits[1].VisitId);
        Assert.Equal(1, result.Visits[1].Diagnoses[0].DiagnosisId);
        Assert.Equal(5, result.Visits[1].Diagnoses[1].DiagnosisId);
        Assert.Equal(2, result.Visits[1].Treatments[0].TreatmentId);
        Assert.Equal(4, result.Visits[1].Treatments[1].TreatmentId);
    }
}
