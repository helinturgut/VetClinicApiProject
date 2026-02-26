using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.DTOs.Owner;

public class UpdateOwnerDto
{
    [StringLength(100)]
    public string? FullName { get; set; }

    [StringLength(20)]
    public string? Phone { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(250)]
    public string? Address { get; set; }
}
