using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VetClinicAPIProject.Models;

namespace VetClinicAPIProject.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Owner> Owners { get; set; }
    public DbSet<Pet> Pets { get; set; }
    public DbSet<Visit> Visits { get; set; }
    public DbSet<Diagnosis> Diagnoses { get; set; }
    public DbSet<Treatment> Treatments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Owner>()
            .HasMany(o => o.Pets)
            .WithOne(p => p.Owner)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

       
        modelBuilder.Entity<Pet>()
            .HasMany(p => p.Visits)
            .WithOne(v => v.Pet)
            .HasForeignKey(v => v.PetId)
            .OnDelete(DeleteBehavior.Cascade);

       
        modelBuilder.Entity<ApplicationUser>()
            .HasMany(u => u.Visits)
            .WithOne(v => v.Veterinarian)
            .HasForeignKey(v => v.VeterinarianId)
            .OnDelete(DeleteBehavior.Restrict);

       
        modelBuilder.Entity<Visit>()
            .HasMany(v => v.Diagnoses)
            .WithOne(d => d.Visit)
            .HasForeignKey(d => d.VisitId)
            .OnDelete(DeleteBehavior.Cascade);

        
        modelBuilder.Entity<Visit>()
            .HasMany(v => v.Treatments)
            .WithOne(t => t.Visit)
            .HasForeignKey(t => t.VisitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
