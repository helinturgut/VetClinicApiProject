using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VetClinicAPIProject.Models;

public class Pet
{
    [Key]
    public int PetId { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Species { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Breed { get; set; }

    public DateTime? BirthDate { get; set; }

    public int? Age { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    public decimal? Weight { get; set; }

    [Required]
    public int OwnerId { get; set; }

    public DateTime? LastCheckInDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(OwnerId))]
    public Owner Owner { get; set; } = null!;

    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
