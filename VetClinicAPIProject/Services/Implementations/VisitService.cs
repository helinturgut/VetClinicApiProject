using VetClinicAPIProject.DTOs.Diagnosis;
using VetClinicAPIProject.DTOs.Treatment;
using VetClinicAPIProject.DTOs.Visit;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class VisitService : IVisitService
{
    private readonly IVisitRepository _visitRepository;
    private readonly IPetRepository _petRepository;
    private readonly ILogger<VisitService> _logger;

    public VisitService(
        IVisitRepository visitRepository,
        IPetRepository petRepository,
        ILogger<VisitService> logger)
    {
        _visitRepository = visitRepository;
        _petRepository = petRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<VisitDto>> GetAllVisitsAsync()
    {
        var visits = await _visitRepository.GetAllAsync();
        var visitDtos = new List<VisitDto>();

        foreach (var visit in visits)
        {
            var visitWithDetails = await _visitRepository.GetVisitWithDetailsAsync(visit.VisitId);
            visitDtos.Add(MapVisitToDto(visitWithDetails ?? visit));
        }

        _logger.LogInformation("Retrieved {Count} visits", visitDtos.Count);
        return visitDtos;
    }

    public async Task<VisitDto> GetVisitByIdAsync(int id)
    {
        var visit = await _visitRepository.GetVisitWithDetailsAsync(id);
        if (visit is null)
        {
            _logger.LogWarning("Visit not found with ID {VisitId}", id);
            throw new KeyNotFoundException($"Visit not found with ID: {id}");
        }

        _logger.LogInformation("Retrieved visit with ID {VisitId}", id);
        return MapVisitToDto(visit);
    }

    public async Task<VisitDto> CreateVisitAsync(CreateVisitDto dto, string veterinarianId)
    {
        if (string.IsNullOrWhiteSpace(veterinarianId))
        {
            _logger.LogWarning("Visit creation failed because veterinarian ID was not provided");
            throw new InvalidOperationException("Veterinarian ID is required to create a visit.");
        }

        var pet = await _petRepository.GetByIdAsync(dto.PetId);
        if (pet is null)
        {
            _logger.LogWarning("Visit creation failed because pet {PetId} does not exist", dto.PetId);
            throw new KeyNotFoundException($"Pet not found with ID: {dto.PetId}");
        }

        var visit = new Visit
        {
            PetId = dto.PetId,
            VeterinarianId = veterinarianId,
            VisitDate = dto.VisitDate,
            Complaint = dto.Complaint,
            Notes = dto.Notes,
            Temperature = dto.Temperature,
            Status = dto.Status
        };

        await _visitRepository.AddAsync(visit);

        pet.LastCheckInDate = dto.VisitDate;
        _petRepository.Update(pet);

        var saved = await _visitRepository.SaveChangesAsync();
        if (!saved)
        {
            _logger.LogError("Visit creation failed for pet {PetId}", dto.PetId);
            throw new InvalidOperationException("Failed to create visit.");
        }

        var createdVisit = await _visitRepository.GetVisitWithDetailsAsync(visit.VisitId) ?? visit;
        _logger.LogInformation("Created visit with ID {VisitId} for pet {PetId}", visit.VisitId, visit.PetId);
        return MapVisitToDto(createdVisit);
    }

    public async Task<VisitDto> UpdateVisitAsync(int id, UpdateVisitDto dto)
    {
        var visit = await _visitRepository.GetByIdAsync(id);
        if (visit is null)
        {
            _logger.LogWarning("Visit not found with ID {VisitId}", id);
            throw new KeyNotFoundException($"Visit not found with ID: {id}");
        }

        if (dto.PetId.HasValue)
        {
            var petExists = await _petRepository.GetByIdAsync(dto.PetId.Value) is not null;
            if (!petExists)
            {
                _logger.LogWarning("Visit update failed because pet {PetId} does not exist", dto.PetId.Value);
                throw new KeyNotFoundException($"Pet not found with ID: {dto.PetId.Value}");
            }
        }

        var hasChanges = false;

        if (dto.PetId.HasValue && dto.PetId.Value != visit.PetId)
        {
            visit.PetId = dto.PetId.Value;
            hasChanges = true;
        }

        if (dto.VisitDate.HasValue && dto.VisitDate.Value != visit.VisitDate)
        {
            visit.VisitDate = dto.VisitDate.Value;
            hasChanges = true;
        }

        if (dto.Complaint != visit.Complaint)
        {
            visit.Complaint = dto.Complaint;
            hasChanges = true;
        }

        if (dto.Notes != visit.Notes)
        {
            visit.Notes = dto.Notes;
            hasChanges = true;
        }

        if (dto.Temperature.HasValue && dto.Temperature.Value != visit.Temperature)
        {
            visit.Temperature = dto.Temperature.Value;
            hasChanges = true;
        }

        if (dto.Status != visit.Status)
        {
            visit.Status = dto.Status;
            hasChanges = true;
        }

        if (hasChanges)
        {
            _visitRepository.Update(visit);
            var saved = await _visitRepository.SaveChangesAsync();
            if (!saved)
            {
                _logger.LogError("Visit update failed for ID {VisitId}", id);
                throw new InvalidOperationException("Failed to update visit.");
            }
        }

        var updatedVisit = await _visitRepository.GetVisitWithDetailsAsync(id) ?? visit;
        _logger.LogInformation("Updated visit with ID {VisitId}", id);
        return MapVisitToDto(updatedVisit);
    }

    public async Task<bool> DeleteVisitAsync(int id)
    {
        var visit = await _visitRepository.GetByIdAsync(id);
        if (visit is null)
        {
            _logger.LogWarning("Visit not found with ID {VisitId}", id);
            throw new KeyNotFoundException($"Visit not found with ID: {id}");
        }

        _visitRepository.Delete(visit);
        var deleted = await _visitRepository.SaveChangesAsync();
        _logger.LogInformation("Delete visit operation for ID {VisitId} completed with status {Deleted}", id, deleted);
        return deleted;
    }

    private static VisitDto MapVisitToDto(Visit visit)
    {
        return new VisitDto
        {
            VisitId = visit.VisitId,
            PetId = visit.PetId,
            PetName = visit.Pet?.Name ?? string.Empty,
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
