using VetClinicAPIProject.DTOs.Diagnosis;

namespace VetClinicAPIProject.Services.Interfaces;

public interface IDiagnosisService
{
    Task<IEnumerable<DiagnosisDto>> GetDiagnosesByVisitIdAsync(int visitId);
    Task<DiagnosisDto> CreateDiagnosisAsync(int visitId, CreateDiagnosisDto dto);
}
