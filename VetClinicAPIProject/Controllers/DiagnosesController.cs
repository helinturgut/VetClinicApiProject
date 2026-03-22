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
        _logger.LogInformation("Fetching diagnoses for visit {VisitId}", visitId);
        var diagnoses = await _diagnosisService.GetDiagnosesByVisitIdAsync(visitId);
        return Ok(diagnoses);
    }

    [HttpPost]
    [ProducesResponseType(typeof(DiagnosisDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DiagnosisDto>> CreateDiagnosis([FromRoute] int visitId, [FromBody] CreateDiagnosisDto dto)
    {
        _logger.LogInformation("Creating diagnosis for visit {VisitId}", visitId);
        var createdDiagnosis = await _diagnosisService.CreateDiagnosisAsync(visitId, dto);
        _logger.LogInformation("Diagnosis created with ID {DiagnosisId} for visit {VisitId}", createdDiagnosis.DiagnosisId, visitId);
        return CreatedAtAction(nameof(GetDiagnosesByVisitId), new { visitId }, createdDiagnosis);
    }
}
