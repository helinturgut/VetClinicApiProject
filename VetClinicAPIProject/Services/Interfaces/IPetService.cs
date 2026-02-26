using VetClinicAPIProject.DTOs.Pet;

namespace VetClinicAPIProject.Services.Interfaces;

public interface IPetService
{
    Task<IEnumerable<PetDto>> GetAllPetsAsync();
    Task<PetDto> GetPetByIdAsync(int id);
    Task<PetDto> CreatePetAsync(CreatePetDto dto);
    Task<PetDto> UpdatePetAsync(int id, UpdatePetDto dto);
    Task<bool> DeletePetAsync(int id);
    Task<PetDetailsDto> GetPetHistoryAsync(int id);
}
