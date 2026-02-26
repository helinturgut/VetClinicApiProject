using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.DTOs.Visit;

public class CreateVisitDto
{
    [Required]
    public int PetId { get; set; }

    [Required]
    public DateTime VisitDate { get; set; }

    [StringLength(500)]
    public string? Complaint { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    public decimal? Temperature { get; set; }

    [StringLength(20)]
    public string? Status { get; set; }
}
