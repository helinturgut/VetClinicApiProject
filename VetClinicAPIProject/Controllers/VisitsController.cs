using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinicAPIProject.DTOs.Visit;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Veterinarian")]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;
    private readonly ILogger<VisitsController> _logger;

    public VisitsController(IVisitService visitService, ILogger<VisitsController> logger)
    {
        _visitService = visitService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<VisitDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<VisitDto>>> GetVisits()
    {
        var visits = await _visitService.GetAllVisitsAsync();
        return Ok(visits);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(VisitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VisitDto>> GetVisitById(int id)
    {
        var visit = await _visitService.GetVisitByIdAsync(id);
        return Ok(visit);
    }

    [HttpPost]
    [ProducesResponseType(typeof(VisitDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VisitDto>> CreateVisit([FromBody] CreateVisitDto dto)
    {
        var veterinarianId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(veterinarianId))
        {
            _logger.LogWarning("Create visit failed because veterinarian claim was missing");
            return Unauthorized("User identity is invalid.");
        }

        var createdVisit = await _visitService.CreateVisitAsync(dto, veterinarianId);
        return CreatedAtAction(nameof(GetVisitById), new { id = createdVisit.VisitId }, createdVisit);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(VisitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<VisitDto>> UpdateVisit(int id, [FromBody] UpdateVisitDto dto)
    {
        var updatedVisit = await _visitService.UpdateVisitAsync(id, dto);
        return Ok(updatedVisit);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteVisit(int id)
    {
        var deleted = await _visitService.DeleteVisitAsync(id);
        if (!deleted)
        {
            _logger.LogWarning("Visit delete returned false for ID {VisitId}", id);
            return BadRequest("Visit could not be deleted.");
        }

        return NoContent();
    }
}
