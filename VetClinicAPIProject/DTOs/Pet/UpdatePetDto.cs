using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.DTOs.Pet;

public class UpdatePetDto
{
    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(50)]
    public string? Species { get; set; }

    [StringLength(100)]
    public string? Breed { get; set; }

    public DateTime? BirthDate { get; set; }

    public int? Age { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    public decimal? Weight { get; set; }

    public int? OwnerId { get; set; }
}
