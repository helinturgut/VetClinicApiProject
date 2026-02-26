namespace VetClinicAPIProject.DTOs.Treatment;

public class TreatmentDto
{
    public int TreatmentId { get; set; }
    public int VisitId { get; set; }
    public string TreatmentName { get; set; } = string.Empty;
    public string? Medication { get; set; }
    public string? Dosage { get; set; }
    public string? Instructions { get; set; }
    public decimal Cost { get; set; }
}
