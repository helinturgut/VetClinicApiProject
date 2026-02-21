using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VetClinicAPIProject.Models;

public class Treatment
{
    [Key]
    public int TreatmentId { get; set; }

    [Required]
    public int VisitId { get; set; }

    [Required]
    [StringLength(200)]
    public string TreatmentName { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Medication { get; set; }

    [StringLength(100)]
    public string? Dosage { get; set; }

    [StringLength(500)]
    public string? Instructions { get; set; }

    public decimal Cost { get; set; }

    [ForeignKey(nameof(VisitId))]
    public Visit Visit { get; set; } = null!;
}
