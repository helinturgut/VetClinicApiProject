using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
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
        var message = BuildMessage(
            toEmail, fullName,
            subject: "Welcome to VetClinic — Registration Received",
            body: $"""
                <h2>Welcome, {fullName}!</h2>
                <p>Thank you for registering with VetClinic. Your account has been created successfully.</p>
                <p>Your account is currently <strong>pending admin approval</strong>. You will be able to log in once an administrator approves your account.</p>
                <p>If you have any questions, please contact the clinic administrator.</p>
                <br/>
                <p>Best regards,<br/>The VetClinic Team</p>
                """);

        await SendAsync(message, toEmail, "welcome");
    }

    public async Task SendApprovalEmailAsync(string toEmail, string fullName)
    {
        var message = BuildMessage(
            toEmail, fullName,
            subject: "VetClinic — Your Account Has Been Approved",
            body: $"""
                <h2>Congratulations, {fullName}!</h2>
                <p>Your veterinarian account has been <strong>approved</strong> by an administrator.</p>
                <p>You can now log in to the VetClinic system and start managing your appointments and patient records.</p>
                <br/>
                <p>Best regards,<br/>The VetClinic Team</p>
                """);

        await SendAsync(message, toEmail, "approval");
    }

    public async Task SendRejectionEmailAsync(string toEmail, string fullName)
    {
        var message = BuildMessage(
            toEmail, fullName,
            subject: "VetClinic — Registration Not Approved",
            body: $"""
                <h2>Hi {fullName},</h2>
                <p>We regret to inform you that your veterinarian registration with VetClinic has <strong>not been approved</strong> by an administrator.</p>
                <p>If you believe this was a mistake or would like more information, please contact the clinic administrator.</p>
                <br/>
                <p>Best regards,<br/>The VetClinic Team</p>
                """);

        await SendAsync(message, toEmail, "rejection");
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string fullName, string resetLink)
    {
        var message = BuildMessage(
            toEmail, fullName,
            subject: "VetClinic — Reset Your Password",
            body: $"""
                <h2>Password Reset Request</h2>
                <p>Hi {fullName},</p>
                <p>We received a request to reset your VetClinic password. Click the button below to choose a new password:</p>
                <p style="margin:24px 0;">
                  <a href="{resetLink}"
                     style="background:#0d6efd;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
                    Reset Password
                  </a>
                </p>
                <p>This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                <br/>
                <p>Best regards,<br/>The VetClinic Team</p>
                """);

        await SendAsync(message, toEmail, "password-reset");
    }

    private MimeMessage? BuildMessage(string toEmail, string toName, string subject, string body)
    {
        var fromEmail = _configuration["EmailSettings:FromEmail"];
        var fromName  = _configuration["EmailSettings:FromName"] ?? "VetClinic";

        if (string.IsNullOrWhiteSpace(fromEmail))
        {
            _logger.LogWarning("EmailSettings:FromEmail is not configured — skipping email to {Email}", toEmail);
            return null;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = body };
        return message;
    }

    private async Task SendAsync(MimeMessage? message, string toEmail, string kind)
    {
        if (message is null) return;

        var host     = _configuration["EmailSettings:SmtpHost"];
        var username = _configuration["EmailSettings:Username"];
        var password = _configuration["EmailSettings:Password"];
        var port     = _configuration.GetValue<int>("EmailSettings:SmtpPort");

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("SMTP credentials are not configured — skipping {Kind} email to {Email}", kind, toEmail);
            return;
        }

        try
        {
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(username, password);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("{Kind} email sent successfully to {Email}", kind, toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send {Kind} email to {Email}", kind, toEmail);
        }
    }
}
