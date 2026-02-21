using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VetClinicAPIProject.Models;

public class Diagnosis
{
    [Key]
    public int DiagnosisId { get; set; }

    [Required]
    public int VisitId { get; set; }

    [Required]
    [StringLength(200)]
    public string DiseaseName { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(20)]
    public string? Severity { get; set; }

    //timestamping 
    public DateTime DiagnosedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(VisitId))]
    public Visit Visit { get; set; } = null!;
}
