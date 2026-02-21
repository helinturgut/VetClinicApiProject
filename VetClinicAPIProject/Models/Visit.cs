using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VetClinicAPIProject.Models;

public class Visit
{
    [Key]
    public int VisitId { get; set; }

    [Required]
    public int PetId { get; set; }

    [Required]
    public string VeterinarianId { get; set; } = string.Empty;

    [Required]
    public DateTime VisitDate { get; set; }

    [StringLength(500)]
    public string? Complaint { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public decimal? Temperature { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(PetId))]
    public Pet Pet { get; set; } = null!;

    [ForeignKey(nameof(VeterinarianId))]
    //storing the vet link 
    public ApplicationUser Veterinarian { get; set; } = null!;

    //letting one visit own multiple diagnoses and treatments 
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    public ICollection<Treatment> Treatments { get; set; } = new List<Treatment>();
}
