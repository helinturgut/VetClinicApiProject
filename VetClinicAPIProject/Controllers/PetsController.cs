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
        var pet = await _petService.GetPetByIdAsync(id);
        return Ok(pet);
    }

    [HttpGet("{id:int}/history")]
    [ProducesResponseType(typeof(PetDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PetDetailsDto>> GetPetHistory(int id)
    {
        var petHistory = await _petService.GetPetHistoryAsync(id);
        return Ok(petHistory);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PetDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PetDto>> CreatePet([FromBody] CreatePetDto dto)
    {
        var createdPet = await _petService.CreatePetAsync(dto);
        return CreatedAtAction(nameof(GetPetById), new { id = createdPet.PetId }, createdPet);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PetDto>> UpdatePet(int id, [FromBody] UpdatePetDto dto)
    {
        var updatedPet = await _petService.UpdatePetAsync(id, dto);
        return Ok(updatedPet);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Veterinarian")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeletePet(int id)
    {
        var deleted = await _petService.DeletePetAsync(id);
        if (!deleted)
        {
            _logger.LogWarning("Pet delete returned false for ID {PetId}", id);
            return BadRequest("Pet could not be deleted.");
        }

        return NoContent();
    }
}
