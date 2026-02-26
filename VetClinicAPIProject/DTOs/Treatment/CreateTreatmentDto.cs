using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.DTOs.Treatment;

public class CreateTreatmentDto
{
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
}
