using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinicAPIProject.DTOs.Admin;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Controllers;

[ApiController]
[Route("api/admin/veterinarians")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("pending")]
    [ProducesResponseType(typeof(IEnumerable<PendingVeterinarianDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PendingVeterinarianDto>>> GetPendingVeterinarians()
    {
        var pendingVeterinarians = await _adminService.GetPendingVeterinariansAsync();
        return Ok(pendingVeterinarians);
    }

    [HttpPut("{userId}/approve")]
    [ProducesResponseType(typeof(VeterinarianApprovalDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VeterinarianApprovalDto>> ApproveVeterinarian(string userId)
    {
        var approvedVeterinarian = await _adminService.ApproveVeterinarianAsync(userId);
        return Ok(approvedVeterinarian);
    }
}
