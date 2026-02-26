using Microsoft.EntityFrameworkCore;
using VetClinicAPIProject.Data;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;

namespace VetClinicAPIProject.Repositories.Implementations;

public class DiagnosisRepository : IDiagnosisRepository
{
    private readonly AppDbContext _context;

    public DiagnosisRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Diagnosis>> GetByVisitIdAsync(int visitId)
    {
        return await _context.Diagnoses
            .AsNoTracking()
            .Where(d => d.VisitId == visitId)
            .OrderBy(d => d.DiagnosisId)
            .ToListAsync();
    }

    public async Task<Diagnosis?> GetByIdAsync(int id)
    {
        return await _context.Diagnoses
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DiagnosisId == id);
    }

    public async Task AddAsync(Diagnosis diagnosis)
    {
        await _context.Diagnoses.AddAsync(diagnosis);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
