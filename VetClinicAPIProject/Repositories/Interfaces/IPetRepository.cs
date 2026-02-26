using VetClinicAPIProject.Models;

namespace VetClinicAPIProject.Repositories.Interfaces;

public interface IPetRepository
{
    Task<IEnumerable<Pet>> GetAllAsync();
    Task<Pet?> GetByIdAsync(int id);
    Task<Pet?> GetPetWithOwnerAsync(int id);
    Task<Pet?> GetPetWithFullHistoryAsync(int id);
    Task<IEnumerable<Pet>> GetPetsByOwnerIdAsync(int ownerId);
    Task AddAsync(Pet pet);
    void Update(Pet pet);
    void Delete(Pet pet);
    Task<bool> SaveChangesAsync();
}
