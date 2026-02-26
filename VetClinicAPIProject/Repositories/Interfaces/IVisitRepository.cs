using VetClinicAPIProject.Models;

namespace VetClinicAPIProject.Repositories.Interfaces;

public interface IVisitRepository
{
    Task<IEnumerable<Visit>> GetAllAsync();
    Task<Visit?> GetByIdAsync(int id);
    Task<Visit?> GetVisitWithDetailsAsync(int id);
    Task<IEnumerable<Visit>> GetVisitsByPetIdAsync(int petId);
    Task<IEnumerable<Visit>> GetVisitsByVetIdAsync(string vetId);
    Task AddAsync(Visit visit);
    void Update(Visit visit);
    void Delete(Visit visit);
    Task<bool> SaveChangesAsync();
}
