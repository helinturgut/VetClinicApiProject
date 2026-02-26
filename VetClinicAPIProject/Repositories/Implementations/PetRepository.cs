using Microsoft.EntityFrameworkCore;
using VetClinicAPIProject.Data;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;

namespace VetClinicAPIProject.Repositories.Implementations;

public class PetRepository : IPetRepository
{
    private readonly AppDbContext _context;

    public PetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Pet>> GetAllAsync()
    {
        return await _context.Pets
            .AsNoTracking()
            .OrderBy(p => p.PetId)
            .ToListAsync();
    }

    public async Task<Pet?> GetByIdAsync(int id)
    {
        return await _context.Pets
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PetId == id);
    }

    public async Task<Pet?> GetPetWithOwnerAsync(int id)
    {
        return await _context.Pets
            .AsNoTracking()
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.PetId == id);
    }

    public async Task<Pet?> GetPetWithFullHistoryAsync(int id)
    {
        return await _context.Pets
            .AsNoTracking()
            .Include(p => p.Owner)
            .Include(p => p.Visits)
                .ThenInclude(v => v.Diagnoses)
            .Include(p => p.Visits)
                .ThenInclude(v => v.Treatments)
            .FirstOrDefaultAsync(p => p.PetId == id);
    }

    public async Task<IEnumerable<Pet>> GetPetsByOwnerIdAsync(int ownerId)
    {
        return await _context.Pets
            .AsNoTracking()
            .Where(p => p.OwnerId == ownerId)
            .OrderBy(p => p.PetId)
            .ToListAsync();
    }

    public async Task AddAsync(Pet pet)
    {
        await _context.Pets.AddAsync(pet);
    }

    public void Update(Pet pet)
    {
        _context.Pets.Update(pet);
    }

    public void Delete(Pet pet)
    {
        _context.Pets.Remove(pet);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
