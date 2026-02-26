using System.Text.Json;
using System.Text.Json.Serialization;

namespace VetClinicAPIProject.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var (statusCode, message) = MapException(ex);
            var traceId = context.TraceIdentifier;

            _logger.LogError(
                ex,
                "Unhandled exception for {Method} {Path}. StatusCode: {StatusCode}, TraceId: {TraceId}",
                context.Request.Method,
                context.Request.Path,
                statusCode,
                traceId);

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var payload = new ErrorResponse
            {
                StatusCode = statusCode,
                Message = message,
                TraceId = traceId,
                Details = _environment.IsDevelopment() ? ex.Message : null
            };

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(payload, options));
        }
    }

    private static (int StatusCode, string Message) MapException(Exception exception)
    {
        return exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            InvalidOperationException => (StatusCodes.Status400BadRequest, exception.Message),
            ArgumentException => (StatusCodes.Status400BadRequest, exception.Message),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
        };
    }

    private sealed class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string TraceId { get; set; } = string.Empty;
        public string? Details { get; set; }
    }
}
