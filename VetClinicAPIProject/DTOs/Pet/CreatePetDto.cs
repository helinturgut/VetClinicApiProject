using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.DTOs.Pet;

public class CreatePetDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Species { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Breed { get; set; }

    [Range(0, 50)]
    public int Age { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    public decimal Weight { get; set; }

    [Required]
    public int OwnerId { get; set; }
}
