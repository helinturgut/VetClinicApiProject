namespace VetClinicAPIProject.DTOs.Diagnosis;

public class DiagnosisDto
{
    public int DiagnosisId { get; set; }
    public int VisitId { get; set; }
    public string DiseaseName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Severity { get; set; }
    public DateTime DiagnosedAt { get; set; }
}
