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

    public TreatmentsController(ITreatmentService treatmentService)
    {
        _treatmentService = treatmentService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TreatmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<TreatmentDto>>> GetTreatmentsByVisitId([FromRoute] int visitId)
    {
        var treatments = await _treatmentService.GetTreatmentsByVisitIdAsync(visitId);
        return Ok(treatments);
    }

    [HttpPost]
    [ProducesResponseType(typeof(TreatmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TreatmentDto>> CreateTreatment([FromRoute] int visitId, [FromBody] CreateTreatmentDto dto)
    {
        var createdTreatment = await _treatmentService.CreateTreatmentAsync(visitId, dto);
        return CreatedAtAction(nameof(GetTreatmentsByVisitId), new { visitId }, createdTreatment);
    }
}
