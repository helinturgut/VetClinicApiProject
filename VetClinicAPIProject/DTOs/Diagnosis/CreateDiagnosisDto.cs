using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.DTOs.Diagnosis;

public class CreateDiagnosisDto
{
    [Required]
    [StringLength(200)]
    public string DiseaseName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(20)]
    public string? Severity { get; set; }
}
