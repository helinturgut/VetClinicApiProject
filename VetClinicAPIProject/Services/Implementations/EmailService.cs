using System.Net;
using System.Net.Mail;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string fullName)
    {
        var smtpHost = _configuration["EmailSettings:SmtpHost"];

        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            _logger.LogWarning("Email service is not configured. Skipping welcome email to {Email}", toEmail);
            return;
        }

        var smtpPort = _configuration.GetValue<int>("EmailSettings:SmtpPort");
        var fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@vetclinic.com";
        var fromName = _configuration["EmailSettings:FromName"] ?? "VetClinic API";
        var username = _configuration["EmailSettings:Username"];
        var password = _configuration["EmailSettings:Password"];

        try
        {
            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = _configuration.GetValue<bool>("EmailSettings:EnableSsl"),
                Credentials = string.IsNullOrWhiteSpace(username)
                    ? null
                    : new NetworkCredential(username, password)
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = "Welcome to VetClinic — Registration Received",
                IsBodyHtml = true,
                Body = $"""
                    <h2>Welcome, {fullName}!</h2>
                    <p>Thank you for registering with VetClinic. Your account has been created successfully.</p>
                    <p>Your account is currently <strong>pending admin approval</strong>. You will be able to log in once an administrator approves your account.</p>
                    <p>If you have any questions, please contact the clinic administrator.</p>
                    <br/>
                    <p>Best regards,<br/>The VetClinic Team</p>
                    """
            };

            message.To.Add(new MailAddress(toEmail, fullName));

            await client.SendMailAsync(message);
            _logger.LogInformation("Welcome email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
        }
    }

    public async Task SendApprovalEmailAsync(string toEmail, string fullName)
    {
        var smtpHost = _configuration["EmailSettings:SmtpHost"];

        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            _logger.LogWarning("Email service is not configured. Skipping approval email to {Email}", toEmail);
            return;
        }

        var smtpPort = _configuration.GetValue<int>("EmailSettings:SmtpPort");
        var fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@vetclinic.com";
        var fromName = _configuration["EmailSettings:FromName"] ?? "VetClinic API";
        var username = _configuration["EmailSettings:Username"];
        var password = _configuration["EmailSettings:Password"];

        try
        {
            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = _configuration.GetValue<bool>("EmailSettings:EnableSsl"),
                Credentials = string.IsNullOrWhiteSpace(username)
                    ? null
                    : new NetworkCredential(username, password)
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = "VetClinic — Your Account Has Been Approved",
                IsBodyHtml = true,
                Body = $"""
                    <h2>Congratulations, {fullName}!</h2>
                    <p>Your veterinarian account has been <strong>approved</strong> by an administrator.</p>
                    <p>You can now log in to the VetClinic system and start managing appointments and patient records.</p>
                    <br/>
                    <p>Best regards,<br/>The VetClinic Team</p>
                    """
            };

            message.To.Add(new MailAddress(toEmail, fullName));

            await client.SendMailAsync(message);
            _logger.LogInformation("Approval email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send approval email to {Email}", toEmail);
        }
    }
}
