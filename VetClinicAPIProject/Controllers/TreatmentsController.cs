using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinicAPIProject.DTOs.Treatment;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Controllers;

[ApiController]
[Route("api/visits/{visitId:int}/treatments")]
[Authorize(Roles = "Admin,Veterinarian")]
public class TreatmentsController : ControllerBase
{
    private readonly ITreatmentService _treatmentService;
    private readonly ILogger<TreatmentsController> _logger;

    public TreatmentsController(ITreatmentService treatmentService, ILogger<TreatmentsController> logger)
    {
        _treatmentService = treatmentService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TreatmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<TreatmentDto>>> GetTreatmentsByVisitId([FromRoute] int visitId)
    {
        try
        {
            var treatments = await _treatmentService.GetTreatmentsByVisitIdAsync(visitId);
            return Ok(treatments);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Treatment lookup failed for visit ID {VisitId}", visitId);
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(TreatmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TreatmentDto>> CreateTreatment([FromRoute] int visitId, [FromBody] CreateTreatmentDto dto)
    {
        try
        {
            var createdTreatment = await _treatmentService.CreateTreatmentAsync(visitId, dto);
            return CreatedAtAction(nameof(GetTreatmentsByVisitId), new { visitId }, createdTreatment);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Treatment creation failed for visit ID {VisitId}", visitId);
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Treatment creation could not be completed for visit ID {VisitId}", visitId);
            return BadRequest(ex.Message);
        }
    }
}
