using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace VetClinicAPIProject.Models;

public class ApplicationUser : IdentityUser
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [StringLength(200)]
    public string? ClinicName { get; set; }

    public bool IsApproved { get; set; } = true;

    //links users to performed visits for auditing 
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
