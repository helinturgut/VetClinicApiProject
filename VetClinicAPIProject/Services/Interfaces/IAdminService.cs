using VetClinicAPIProject.DTOs.Admin;

namespace VetClinicAPIProject.Services.Interfaces;

public interface IAdminService
{
    Task<IEnumerable<PendingVeterinarianDto>> GetPendingVeterinariansAsync();
    Task<VeterinarianApprovalDto> ApproveVeterinarianAsync(string userId);
}
