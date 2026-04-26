namespace VetClinicAPIProject.Services.Interfaces;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string fullName);
    Task SendApprovalEmailAsync(string toEmail, string fullName);
    Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetLink);
    Task SendRejectionEmailAsync(string toEmail, string fullName);
}
