using VetClinicAPIProject.Models;

namespace VetClinicAPIProject.Repositories.Interfaces;

public interface ITreatmentRepository
{
    Task<IEnumerable<Treatment>> GetByVisitIdAsync(int visitId);
    Task<Treatment?> GetByIdAsync(int id);
    Task AddAsync(Treatment treatment);
    Task<bool> SaveChangesAsync();
}
