using Microsoft.EntityFrameworkCore;
using VetClinicAPIProject.Data;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;

namespace VetClinicAPIProject.Repositories.Implementations;

public class VisitRepository : IVisitRepository
{
    private readonly AppDbContext _context;

    public VisitRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Visit>> GetAllAsync()
    {
        return await _context.Visits
            .AsNoTracking()
            .OrderBy(v => v.VisitId)
            .ToListAsync();
    }

    public async Task<Visit?> GetByIdAsync(int id)
    {
        return await _context.Visits
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.VisitId == id);
    }

    public async Task<Visit?> GetVisitWithDetailsAsync(int id)
    {
        return await _context.Visits
            .AsNoTracking()
            .Include(v => v.Pet)
            .Include(v => v.Diagnoses)
            .Include(v => v.Treatments)
            .FirstOrDefaultAsync(v => v.VisitId == id);
    }

    public async Task<IEnumerable<Visit>> GetVisitsByPetIdAsync(int petId)
    {
        return await _context.Visits
            .AsNoTracking()
            .Where(v => v.PetId == petId)
            .OrderBy(v => v.VisitId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Visit>> GetVisitsByVetIdAsync(string vetId)
    {
        return await _context.Visits
            .AsNoTracking()
            .Where(v => v.VeterinarianId == vetId)
            .OrderBy(v => v.VisitId)
            .ToListAsync();
    }

    public async Task AddAsync(Visit visit)
    {
        await _context.Visits.AddAsync(visit);
    }

    public void Update(Visit visit)
    {
        _context.Visits.Update(visit);
    }

    public void Delete(Visit visit)
    {
        _context.Visits.Remove(visit);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
