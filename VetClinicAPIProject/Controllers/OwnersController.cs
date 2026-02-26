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
        var owner = await _ownerService.GetOwnerByIdAsync(id);
        return Ok(owner);
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
        var updatedOwner = await _ownerService.UpdateOwnerAsync(id, dto);
        return Ok(updatedOwner);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOwner(int id)
    {
        var deleted = await _ownerService.DeleteOwnerAsync(id);
        if (!deleted)
        {
            _logger.LogWarning("Owner delete returned false for ID {OwnerId}", id);
            return BadRequest("Owner could not be deleted.");
        }

        return NoContent();
    }
}
