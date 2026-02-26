using VetClinicAPIProject.DTOs.Diagnosis;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class DiagnosisService : IDiagnosisService
{
    private readonly IDiagnosisRepository _diagnosisRepository;
    private readonly IVisitRepository _visitRepository;
    private readonly ILogger<DiagnosisService> _logger;

    public DiagnosisService(
        IDiagnosisRepository diagnosisRepository,
        IVisitRepository visitRepository,
        ILogger<DiagnosisService> logger)
    {
        _diagnosisRepository = diagnosisRepository;
        _visitRepository = visitRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<DiagnosisDto>> GetDiagnosesByVisitIdAsync(int visitId)
    {
        var visit = await _visitRepository.GetByIdAsync(visitId);
        if (visit is null)
        {
            _logger.LogWarning("Diagnosis lookup failed because visit {VisitId} does not exist", visitId);
            throw new KeyNotFoundException($"Visit not found with ID: {visitId}");
        }

        var diagnoses = await _diagnosisRepository.GetByVisitIdAsync(visitId);
        var diagnosisDtos = diagnoses.Select(MapDiagnosisToDto).ToList();
        _logger.LogInformation("Retrieved {Count} diagnoses for visit {VisitId}", diagnosisDtos.Count, visitId);
        return diagnosisDtos;
    }

    public async Task<DiagnosisDto> CreateDiagnosisAsync(int visitId, CreateDiagnosisDto dto)
    {
        var visit = await _visitRepository.GetByIdAsync(visitId);
        if (visit is null)
        {
            _logger.LogWarning("Diagnosis creation failed because visit {VisitId} does not exist", visitId);
            throw new KeyNotFoundException($"Visit not found with ID: {visitId}");
        }

        var diagnosis = new Diagnosis
        {
            VisitId = visitId,
            DiseaseName = dto.DiseaseName,
            Description = dto.Description,
            Severity = dto.Severity
        };

        await _diagnosisRepository.AddAsync(diagnosis);
        var saved = await _diagnosisRepository.SaveChangesAsync();
        if (!saved)
        {
            _logger.LogError("Diagnosis creation failed for visit {VisitId}", visitId);
            throw new InvalidOperationException("Failed to create diagnosis.");
        }

        _logger.LogInformation("Created diagnosis with ID {DiagnosisId} for visit {VisitId}", diagnosis.DiagnosisId, visitId);
        return MapDiagnosisToDto(diagnosis);
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
}
