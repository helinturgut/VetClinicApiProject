using VetClinicAPIProject.DTOs.Owner;
using VetClinicAPIProject.DTOs.Visit;

namespace VetClinicAPIProject.DTOs.Pet;

public class PetDetailsDto
{
    public int PetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public string? Breed { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public DateTime? LastCheckInDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public OwnerDto? Owner { get; set; }
    public List<VisitDto> Visits { get; set; } = new();
}
