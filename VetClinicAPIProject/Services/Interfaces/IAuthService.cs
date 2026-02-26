using VetClinicAPIProject.DTOs.Auth;

namespace VetClinicAPIProject.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
