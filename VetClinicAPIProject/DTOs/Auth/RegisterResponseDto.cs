namespace VetClinicAPIProject.DTOs.Auth;

public class RegisterResponseDto
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; }
    public string Message { get; set; } = string.Empty;
}
