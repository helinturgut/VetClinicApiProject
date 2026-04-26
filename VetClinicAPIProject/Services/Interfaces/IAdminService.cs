using VetClinicAPIProject.DTOs.Admin;

namespace VetClinicAPIProject.Services.Interfaces;

public interface IAdminService
{
    Task<IEnumerable<PendingVeterinarianDto>> GetPendingVeterinariansAsync();
    Task<IEnumerable<PendingVeterinarianDto>> GetApprovedVeterinariansAsync();
    Task<VeterinarianApprovalDto> ApproveVeterinarianAsync(string userId);
    Task RejectVeterinarianAsync(string userId);
    Task DeleteVeterinarianAsync(string userId);
}
