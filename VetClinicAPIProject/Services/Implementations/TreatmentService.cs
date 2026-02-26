using VetClinicAPIProject.DTOs.Treatment;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class TreatmentService : ITreatmentService
{
    private readonly ITreatmentRepository _treatmentRepository;
    private readonly IVisitRepository _visitRepository;
    private readonly ILogger<TreatmentService> _logger;

    public TreatmentService(
        ITreatmentRepository treatmentRepository,
        IVisitRepository visitRepository,
        ILogger<TreatmentService> logger)
    {
        _treatmentRepository = treatmentRepository;
        _visitRepository = visitRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<TreatmentDto>> GetTreatmentsByVisitIdAsync(int visitId)
    {
        var visit = await _visitRepository.GetByIdAsync(visitId);
        if (visit is null)
        {
            _logger.LogWarning("Treatment lookup failed because visit {VisitId} does not exist", visitId);
            throw new KeyNotFoundException($"Visit not found with ID: {visitId}");
        }

        var treatments = await _treatmentRepository.GetByVisitIdAsync(visitId);
        var treatmentDtos = treatments.Select(MapTreatmentToDto).ToList();
        _logger.LogInformation("Retrieved {Count} treatments for visit {VisitId}", treatmentDtos.Count, visitId);
        return treatmentDtos;
    }

    public async Task<TreatmentDto> CreateTreatmentAsync(int visitId, CreateTreatmentDto dto)
    {
        var visit = await _visitRepository.GetByIdAsync(visitId);
        if (visit is null)
        {
            _logger.LogWarning("Treatment creation failed because visit {VisitId} does not exist", visitId);
            throw new KeyNotFoundException($"Visit not found with ID: {visitId}");
        }

        var treatment = new Treatment
        {
            VisitId = visitId,
            TreatmentName = dto.TreatmentName,
            Medication = dto.Medication,
            Dosage = dto.Dosage,
            Instructions = dto.Instructions,
            Cost = dto.Cost
        };

        await _treatmentRepository.AddAsync(treatment);
        var saved = await _treatmentRepository.SaveChangesAsync();
        if (!saved)
        {
            _logger.LogError("Treatment creation failed for visit {VisitId}", visitId);
            throw new InvalidOperationException("Failed to create treatment.");
        }

        _logger.LogInformation("Created treatment with ID {TreatmentId} for visit {VisitId}", treatment.TreatmentId, visitId);
        return MapTreatmentToDto(treatment);
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
