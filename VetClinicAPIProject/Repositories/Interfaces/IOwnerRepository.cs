using VetClinicAPIProject.Models;

namespace VetClinicAPIProject.Repositories.Interfaces;

public interface IOwnerRepository
{
    Task<IEnumerable<Owner>> GetAllAsync();
    Task<Owner?> GetByIdAsync(int id);
    Task<Owner?> GetOwnerWithPetsAsync(int id);
    Task<bool> OwnerExistsAsync(int id);
    Task AddAsync(Owner owner);
    void Update(Owner owner);
    void Delete(Owner owner);
    Task<bool> SaveChangesAsync();
}
