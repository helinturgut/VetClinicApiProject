using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VetClinicAPIProject.DTOs.Pet;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;
    private readonly ILogger<PetsController> _logger;

    public PetsController(IPetService petService, ILogger<PetsController> logger)
    {
        _petService = petService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PetDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PetDto>>> GetPets()
    {
        var pets = await _petService.GetAllPetsAsync();
        return Ok(pets);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PetDto>> GetPetById(int id)
    {
        try
        {
            var pet = await _petService.GetPetByIdAsync(id);
            return Ok(pet);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Pet lookup failed for ID {PetId}", id);
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id:int}/history")]
    [ProducesResponseType(typeof(PetDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PetDetailsDto>> GetPetHistory(int id)
    {
        try
        {
            var petHistory = await _petService.GetPetHistoryAsync(id);
            return Ok(petHistory);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Pet history lookup failed for ID {PetId}", id);
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(PetDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PetDto>> CreatePet([FromBody] CreatePetDto dto)
    {
        try
        {
            var createdPet = await _petService.CreatePetAsync(dto);
            return CreatedAtAction(nameof(GetPetById), new { id = createdPet.PetId }, createdPet);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Pet creation failed due to missing dependency");
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Pet creation could not be completed");
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PetDto>> UpdatePet(int id, [FromBody] UpdatePetDto dto)
    {
        try
        {
            var updatedPet = await _petService.UpdatePetAsync(id, dto);
            return Ok(updatedPet);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Pet update failed for ID {PetId}", id);
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Pet update could not be completed for ID {PetId}", id);
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Veterinarian")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeletePet(int id)
    {
        try
        {
            var deleted = await _petService.DeletePetAsync(id);
            if (!deleted)
            {
                return BadRequest("Pet could not be deleted.");
            }

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Pet delete failed for ID {PetId}", id);
            return NotFound(ex.Message);
        }
    }
}
