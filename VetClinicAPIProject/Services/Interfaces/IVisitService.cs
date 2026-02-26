using VetClinicAPIProject.DTOs.Visit;

namespace VetClinicAPIProject.Services.Interfaces;

public interface IVisitService
{
    Task<IEnumerable<VisitDto>> GetAllVisitsAsync();
    Task<VisitDto> GetVisitByIdAsync(int id);
    Task<VisitDto> CreateVisitAsync(CreateVisitDto dto, string veterinarianId);
    Task<VisitDto> UpdateVisitAsync(int id, UpdateVisitDto dto);
    Task<bool> DeleteVisitAsync(int id);
}
