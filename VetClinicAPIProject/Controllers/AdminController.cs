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
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, ILogger<AdminController> logger)
    {
        _adminService = adminService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PendingVeterinarianDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PendingVeterinarianDto>>> GetApprovedVeterinarians()
    {
        _logger.LogInformation("Fetching all approved veterinarians");
        var vets = await _adminService.GetApprovedVeterinariansAsync();
        return Ok(vets);
    }

    [HttpGet("pending")]
    [ProducesResponseType(typeof(IEnumerable<PendingVeterinarianDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PendingVeterinarianDto>>> GetPendingVeterinarians()
    {
        _logger.LogInformation("Fetching all pending veterinarians");
        var pendingVeterinarians = await _adminService.GetPendingVeterinariansAsync();
        _logger.LogInformation("Returned {Count} pending veterinarians", pendingVeterinarians.Count());
        return Ok(pendingVeterinarians);
    }

    [HttpPut("{userId}/approve")]
    [ProducesResponseType(typeof(VeterinarianApprovalDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VeterinarianApprovalDto>> ApproveVeterinarian(string userId)
    {
        _logger.LogInformation("Approving veterinarian with ID {UserId}", userId);
        var approvedVeterinarian = await _adminService.ApproveVeterinarianAsync(userId);
        _logger.LogInformation("Veterinarian {UserId} approved successfully", userId);
        return Ok(approvedVeterinarian);
    }

    [HttpDelete("{userId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteVeterinarian(string userId)
    {
        _logger.LogInformation("Deleting veterinarian with ID {UserId}", userId);
        await _adminService.DeleteVeterinarianAsync(userId);
        _logger.LogInformation("Veterinarian {UserId} deleted successfully", userId);
        return NoContent();
    }

    [HttpDelete("{userId}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectVeterinarian(string userId)
    {
        _logger.LogInformation("Rejecting veterinarian with ID {UserId}", userId);
        await _adminService.RejectVeterinarianAsync(userId);
        _logger.LogInformation("Veterinarian {UserId} rejected and deleted successfully", userId);
        return NoContent();
    }
}
