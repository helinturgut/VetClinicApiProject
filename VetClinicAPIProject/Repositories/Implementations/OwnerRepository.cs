using Microsoft.EntityFrameworkCore;
using VetClinicAPIProject.Data;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;

namespace VetClinicAPIProject.Repositories.Implementations;

public class OwnerRepository : IOwnerRepository
{
    private readonly AppDbContext _context;

    public OwnerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Owner>> GetAllAsync()
    {
        return await _context.Owners
            .AsNoTracking()
            .OrderBy(o => o.OwnerId)
            .ToListAsync();
    }

    public async Task<Owner?> GetByIdAsync(int id)
    {
        return await _context.Owners
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OwnerId == id);
    }

    public async Task<Owner?> GetOwnerWithPetsAsync(int id)
    {
        return await _context.Owners
            .AsNoTracking()
            .Include(o => o.Pets)
            .FirstOrDefaultAsync(o => o.OwnerId == id);
    }

    public async Task<bool> OwnerExistsAsync(int id)
    {
        return await _context.Owners.AnyAsync(o => o.OwnerId == id);
    }

    public async Task AddAsync(Owner owner)
    {
        await _context.Owners.AddAsync(owner);
    }

    public void Update(Owner owner)
    {
        _context.Owners.Update(owner);
    }

    public void Delete(Owner owner)
    {
        _context.Owners.Remove(owner);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}
