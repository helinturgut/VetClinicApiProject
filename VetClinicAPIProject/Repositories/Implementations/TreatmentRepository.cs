using Microsoft.EntityFrameworkCore;
using VetClinicAPIProject.Data;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;

namespace VetClinicAPIProject.Repositories.Implementations;

public class TreatmentRepository : ITreatmentRepository
{
    private readonly AppDbContext _context;

    public TreatmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Treatment>> GetByVisitIdAsync(int visitId)
    {
        return await _context.Treatments
            .AsNoTracking()
            .Where(t => t.VisitId == visitId)
            .OrderBy(t => t.TreatmentId)
            .ToListAsync();
    }

    public async Task<Treatment?> GetByIdAsync(int id)
    {
        return await _context.Treatments
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.TreatmentId == id);
    }

    public async Task AddAsync(Treatment treatment)
    {
        await _context.Treatments.AddAsync(treatment);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
