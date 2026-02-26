using VetClinicAPIProject.Models;

namespace VetClinicAPIProject.Repositories.Interfaces;

public interface IDiagnosisRepository
{
    Task<IEnumerable<Diagnosis>> GetByVisitIdAsync(int visitId);
    Task<Diagnosis?> GetByIdAsync(int id);
    Task AddAsync(Diagnosis diagnosis);
    Task<bool> SaveChangesAsync();
}
