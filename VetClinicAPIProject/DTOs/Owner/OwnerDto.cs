namespace VetClinicAPIProject.DTOs.Owner;

public class OwnerDto
{
    public int OwnerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PetCount { get; set; }
}
