namespace VetClinicAPIProject.Services.Interfaces;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string fullName);
    Task SendApprovalEmailAsync(string toEmail, string fullName);
}
