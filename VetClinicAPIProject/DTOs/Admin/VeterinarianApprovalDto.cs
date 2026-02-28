namespace VetClinicAPIProject.DTOs.Admin;

public class VeterinarianApprovalDto
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
}
