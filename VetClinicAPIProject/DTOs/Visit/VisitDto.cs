using VetClinicAPIProject.DTOs.Diagnosis;
using VetClinicAPIProject.DTOs.Treatment;

namespace VetClinicAPIProject.DTOs.Visit;

public class VisitDto
{
    public int VisitId { get; set; }
    public int PetId { get; set; }
    public string PetName { get; set; } = string.Empty;
    public string VeterinarianName { get; set; } = string.Empty;
    public DateTime VisitDate { get; set; }
    public string? Complaint { get; set; }
    public string? Notes { get; set; }
    public decimal? Temperature { get; set; }
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<DiagnosisDto> Diagnoses { get; set; } = new();
    public List<TreatmentDto> Treatments { get; set; } = new();
}
