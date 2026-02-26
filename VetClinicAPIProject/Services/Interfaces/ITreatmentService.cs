using VetClinicAPIProject.DTOs.Treatment;

namespace VetClinicAPIProject.Services.Interfaces;

public interface ITreatmentService
{
    Task<IEnumerable<TreatmentDto>> GetTreatmentsByVisitIdAsync(int visitId);
    Task<TreatmentDto> CreateTreatmentAsync(int visitId, CreateTreatmentDto dto);
}
