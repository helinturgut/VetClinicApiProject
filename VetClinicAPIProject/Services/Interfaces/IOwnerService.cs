using VetClinicAPIProject.DTOs.Owner;

namespace VetClinicAPIProject.Services.Interfaces;

public interface IOwnerService
{
    Task<IEnumerable<OwnerDto>> GetAllOwnersAsync();
    Task<OwnerDto> GetOwnerByIdAsync(int id);
    Task<OwnerDto> CreateOwnerAsync(CreateOwnerDto dto);
    Task<OwnerDto> UpdateOwnerAsync(int id, UpdateOwnerDto dto);
    Task<bool> DeleteOwnerAsync(int id);
}
