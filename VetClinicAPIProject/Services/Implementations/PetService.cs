using VetClinicAPIProject.DTOs.Diagnosis;
using VetClinicAPIProject.DTOs.Owner;
using VetClinicAPIProject.DTOs.Pet;
using VetClinicAPIProject.DTOs.Treatment;
using VetClinicAPIProject.DTOs.Visit;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class PetService : IPetService
{
    private readonly IPetRepository _petRepository;
    private readonly IOwnerRepository _ownerRepository;
    private readonly ILogger<PetService> _logger;

    public PetService(
        IPetRepository petRepository,
        IOwnerRepository ownerRepository,
        ILogger<PetService> logger)
    {
        _petRepository = petRepository;
        _ownerRepository = ownerRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<PetDto>> GetAllPetsAsync()
    {
        var pets = await _petRepository.GetAllAsync();
        var petDtos = new List<PetDto>();

        foreach (var pet in pets)
        {
            var petWithOwner = await _petRepository.GetPetWithOwnerAsync(pet.PetId);
            petDtos.Add(MapPetToDto(petWithOwner ?? pet));
        }

        _logger.LogInformation("Retrieved {Count} pets", petDtos.Count);
        return petDtos;
    }

    public async Task<PetDto> GetPetByIdAsync(int id)
    {
        var pet = await _petRepository.GetPetWithOwnerAsync(id);
        if (pet is null)
        {
            _logger.LogWarning("Pet not found with ID {PetId}", id);
            throw new KeyNotFoundException($"Pet not found with ID: {id}");
        }

        _logger.LogInformation("Retrieved pet with ID {PetId}", id);
        return MapPetToDto(pet);
    }

    public async Task<PetDto> CreatePetAsync(CreatePetDto dto)
    {
        var ownerExists = await _ownerRepository.OwnerExistsAsync(dto.OwnerId);
        if (!ownerExists)
        {
            _logger.LogWarning("Pet creation failed because owner {OwnerId} does not exist", dto.OwnerId);
            throw new KeyNotFoundException($"Owner not found with ID: {dto.OwnerId}");
        }

        var pet = new Pet
        {
            Name = dto.Name,
            Species = dto.Species,
            Breed = dto.Breed,
            Age = dto.Age,
            Gender = dto.Gender ?? string.Empty,
            Weight = dto.Weight,
            OwnerId = dto.OwnerId
        };

        await _petRepository.AddAsync(pet);
        var saved = await _petRepository.SaveChangesAsync();
        if (!saved)
        {
            _logger.LogError("Pet creation failed for owner {OwnerId}", dto.OwnerId);
            throw new InvalidOperationException("Failed to create pet.");
        }

        var createdPet = await _petRepository.GetPetWithOwnerAsync(pet.PetId) ?? pet;
        _logger.LogInformation("Created pet with ID {PetId} for owner {OwnerId}", pet.PetId, pet.OwnerId);
        return MapPetToDto(createdPet);
    }

    public async Task<PetDto> UpdatePetAsync(int id, UpdatePetDto dto)
    {
        var pet = await _petRepository.GetByIdAsync(id);
        if (pet is null)
        {
            _logger.LogWarning("Pet not found with ID {PetId}", id);
            throw new KeyNotFoundException($"Pet not found with ID: {id}");
        }

        if (dto.OwnerId.HasValue && !await _ownerRepository.OwnerExistsAsync(dto.OwnerId.Value))
        {
            _logger.LogWarning("Pet update failed because owner {OwnerId} does not exist", dto.OwnerId.Value);
            throw new KeyNotFoundException($"Owner not found with ID: {dto.OwnerId.Value}");
        }

        var hasChanges = false;

        if (dto.Name is not null && dto.Name != pet.Name)
        {
            pet.Name = dto.Name;
            hasChanges = true;
        }

        if (dto.Species is not null && dto.Species != pet.Species)
        {
            pet.Species = dto.Species;
            hasChanges = true;
        }

        if (dto.Breed != pet.Breed)
        {
            pet.Breed = dto.Breed;
            hasChanges = true;
        }

        if (dto.Age.HasValue && dto.Age.Value != pet.Age)
        {
            pet.Age = dto.Age.Value;
            hasChanges = true;
        }

        if (dto.Gender is not null && dto.Gender != pet.Gender)
        {
            pet.Gender = dto.Gender;
            hasChanges = true;
        }

        if (dto.Weight.HasValue && dto.Weight.Value != pet.Weight)
        {
            pet.Weight = dto.Weight.Value;
            hasChanges = true;
        }

        if (dto.OwnerId.HasValue && dto.OwnerId.Value != pet.OwnerId)
        {
            pet.OwnerId = dto.OwnerId.Value;
            hasChanges = true;
        }

        if (hasChanges)
        {
            _petRepository.Update(pet);
            var saved = await _petRepository.SaveChangesAsync();
            if (!saved)
            {
                _logger.LogError("Pet update failed for ID {PetId}", id);
                throw new InvalidOperationException("Failed to update pet.");
            }
        }

        var updatedPet = await _petRepository.GetPetWithOwnerAsync(id) ?? pet;
        _logger.LogInformation("Updated pet with ID {PetId}", id);
        return MapPetToDto(updatedPet);
    }

    public async Task<bool> DeletePetAsync(int id)
    {
        var pet = await _petRepository.GetByIdAsync(id);
        if (pet is null)
        {
            _logger.LogWarning("Pet not found with ID {PetId}", id);
            throw new KeyNotFoundException($"Pet not found with ID: {id}");
        }

        _petRepository.Delete(pet);
        var deleted = await _petRepository.SaveChangesAsync();
        _logger.LogInformation("Delete pet operation for ID {PetId} completed with status {Deleted}", id, deleted);
        return deleted;
    }

    public async Task<PetDetailsDto> GetPetHistoryAsync(int id)
    {
        var pet = await _petRepository.GetPetWithFullHistoryAsync(id);
        if (pet is null)
        {
            _logger.LogWarning("Pet history lookup failed for ID {PetId}", id);
            throw new KeyNotFoundException($"Pet not found with ID: {id}");
        }

        _logger.LogInformation("Retrieved full pet history for ID {PetId}", id);
        return new PetDetailsDto
        {
            PetId = pet.PetId,
            Name = pet.Name,
            Species = pet.Species,
            Breed = pet.Breed,
            Age = pet.Age,
            Gender = pet.Gender,
            Weight = pet.Weight,
            OwnerName = pet.Owner?.FullName ?? string.Empty,
            LastCheckInDate = pet.LastCheckInDate,
            CreatedAt = pet.CreatedAt,
            Owner = pet.Owner is null ? null : MapOwnerToDto(pet.Owner),
            Visits = pet.Visits
                .OrderBy(v => v.VisitId)
                .Select(v => MapVisitToDto(v, pet.Name))
                .ToList()
        };
    }

    private static PetDto MapPetToDto(Pet pet)
    {
        return new PetDto
        {
            PetId = pet.PetId,
            Name = pet.Name,
            Species = pet.Species,
            Breed = pet.Breed,
            Age = pet.Age,
            Gender = pet.Gender,
            Weight = pet.Weight,
            OwnerName = pet.Owner?.FullName ?? string.Empty,
            LastCheckInDate = pet.LastCheckInDate,
            CreatedAt = pet.CreatedAt
        };
    }

    private static OwnerDto MapOwnerToDto(Owner owner)
    {
        return new OwnerDto
        {
            OwnerId = owner.OwnerId,
            FullName = owner.FullName,
            Phone = owner.Phone,
            Email = owner.Email,
            Address = owner.Address,
            CreatedAt = owner.CreatedAt,
            PetCount = owner.Pets.Count
        };
    }

    private static VisitDto MapVisitToDto(Visit visit, string fallbackPetName)
    {
        return new VisitDto
        {
            VisitId = visit.VisitId,
            PetId = visit.PetId,
            PetName = visit.Pet?.Name ?? fallbackPetName,
            VeterinarianName = visit.Veterinarian?.FullName ?? visit.VeterinarianId,
            VisitDate = visit.VisitDate,
            Complaint = visit.Complaint,
            Notes = visit.Notes,
            Temperature = visit.Temperature,
            Status = visit.Status,
            CreatedAt = visit.CreatedAt,
            Diagnoses = visit.Diagnoses
                .OrderBy(d => d.DiagnosisId)
                .Select(MapDiagnosisToDto)
                .ToList(),
            Treatments = visit.Treatments
                .OrderBy(t => t.TreatmentId)
                .Select(MapTreatmentToDto)
                .ToList()
        };
    }

    private static DiagnosisDto MapDiagnosisToDto(Diagnosis diagnosis)
    {
        return new DiagnosisDto
        {
            DiagnosisId = diagnosis.DiagnosisId,
            VisitId = diagnosis.VisitId,
            DiseaseName = diagnosis.DiseaseName,
            Description = diagnosis.Description,
            Severity = diagnosis.Severity,
            DiagnosedAt = diagnosis.DiagnosedAt
        };
    }

    private static TreatmentDto MapTreatmentToDto(Treatment treatment)
    {
        return new TreatmentDto
        {
            TreatmentId = treatment.TreatmentId,
            VisitId = treatment.VisitId,
            TreatmentName = treatment.TreatmentName,
            Medication = treatment.Medication,
            Dosage = treatment.Dosage,
            Instructions = treatment.Instructions,
            Cost = treatment.Cost
        };
    }
}
