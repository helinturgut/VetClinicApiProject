using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinicAPIProject.DTOs.Diagnosis;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Controllers;

[ApiController]
[Route("api/visits/{visitId:int}/diagnoses")]
[Authorize(Roles = "Admin,Veterinarian")]
public class DiagnosesController : ControllerBase
{
    private readonly IDiagnosisService _diagnosisService;
    private readonly ILogger<DiagnosesController> _logger;

    public DiagnosesController(IDiagnosisService diagnosisService, ILogger<DiagnosesController> logger)
    {
        _diagnosisService = diagnosisService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<DiagnosisDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<DiagnosisDto>>> GetDiagnosesByVisitId([FromRoute] int visitId)
    {
        try
        {
            var diagnoses = await _diagnosisService.GetDiagnosesByVisitIdAsync(visitId);
            return Ok(diagnoses);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Diagnosis lookup failed for visit ID {VisitId}", visitId);
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(DiagnosisDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DiagnosisDto>> CreateDiagnosis([FromRoute] int visitId, [FromBody] CreateDiagnosisDto dto)
    {
        try
        {
            var createdDiagnosis = await _diagnosisService.CreateDiagnosisAsync(visitId, dto);
            return CreatedAtAction(nameof(GetDiagnosesByVisitId), new { visitId }, createdDiagnosis);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Diagnosis creation failed for visit ID {VisitId}", visitId);
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Diagnosis creation could not be completed for visit ID {VisitId}", visitId);
            return BadRequest(ex.Message);
        }
    }
}
