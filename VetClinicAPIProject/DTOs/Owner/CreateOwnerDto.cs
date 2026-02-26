using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.DTOs.Owner;

public class CreateOwnerDto
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [StringLength(250)]
    public string? Address { get; set; }
}
