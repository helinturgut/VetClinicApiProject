using VetClinicAPIProject.DTOs.Treatment;

namespace VetClinicAPIProject.Services.Interfaces;

public interface ITreatmentService
{
    Task<IEnumerable<TreatmentDto>> GetTreatmentsByVisitIdAsync(int visitId);
    Task<TreatmentDto> CreateTreatmentAsync(int visitId, CreateTreatmentDto dto);
    Task<TreatmentDto> UpdateTreatmentAsync(int visitId, int treatmentId, CreateTreatmentDto dto);
    Task DeleteTreatmentAsync(int visitId, int treatmentId);
}
