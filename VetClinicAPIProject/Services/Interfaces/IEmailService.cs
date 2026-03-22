namespace VetClinicAPIProject.Services.Interfaces;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string fullName);
}
