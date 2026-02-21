using System.ComponentModel.DataAnnotations;

namespace VetClinicAPIProject.Models;

public class Owner
{
    [Key]
    public int OwnerId { get; set; }

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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //pets are loaded for an owner 
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
}
