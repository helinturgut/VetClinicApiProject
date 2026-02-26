using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinicAPIProject.DTOs.Owner;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OwnersController : ControllerBase
{
    private readonly IOwnerService _ownerService;
    private readonly ILogger<OwnersController> _logger;

    public OwnersController(IOwnerService ownerService, ILogger<OwnersController> logger)
    {
        _ownerService = ownerService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<OwnerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<OwnerDto>>> GetOwners()
    {
        var owners = await _ownerService.GetAllOwnersAsync();
        return Ok(owners);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(OwnerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OwnerDto>> GetOwnerById(int id)
    {
        try
        {
            var owner = await _ownerService.GetOwnerByIdAsync(id);
            return Ok(owner);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Owner lookup failed for ID {OwnerId}", id);
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(OwnerDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OwnerDto>> CreateOwner([FromBody] CreateOwnerDto dto)
    {
        var createdOwner = await _ownerService.CreateOwnerAsync(dto);
        return CreatedAtAction(nameof(GetOwnerById), new { id = createdOwner.OwnerId }, createdOwner);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(OwnerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OwnerDto>> UpdateOwner(int id, [FromBody] UpdateOwnerDto dto)
    {
        try
        {
            var updatedOwner = await _ownerService.UpdateOwnerAsync(id, dto);
            return Ok(updatedOwner);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Owner update failed for ID {OwnerId}", id);
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Owner update could not be completed for ID {OwnerId}", id);
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOwner(int id)
    {
        try
        {
            var deleted = await _ownerService.DeleteOwnerAsync(id);
            if (!deleted)
            {
                return BadRequest("Owner could not be deleted.");
            }

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Owner delete failed for ID {OwnerId}", id);
            return NotFound(ex.Message);
        }
    }
}
