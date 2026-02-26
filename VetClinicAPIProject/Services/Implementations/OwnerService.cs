using VetClinicAPIProject.DTOs.Owner;
using VetClinicAPIProject.Models;
using VetClinicAPIProject.Repositories.Interfaces;
using VetClinicAPIProject.Services.Interfaces;

namespace VetClinicAPIProject.Services.Implementations;

public class OwnerService : IOwnerService
{
    private readonly IOwnerRepository _ownerRepository;
    private readonly ILogger<OwnerService> _logger;

    public OwnerService(IOwnerRepository ownerRepository, ILogger<OwnerService> logger)
    {
        _ownerRepository = ownerRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<OwnerDto>> GetAllOwnersAsync()
    {
        var owners = await _ownerRepository.GetAllAsync();
        var ownerDtos = new List<OwnerDto>();

        foreach (var owner in owners)
        {
            var ownerWithPets = await _ownerRepository.GetOwnerWithPetsAsync(owner.OwnerId);
            ownerDtos.Add(MapOwnerToDto(ownerWithPets ?? owner));
        }

        _logger.LogInformation("Retrieved {Count} owners", ownerDtos.Count);
        return ownerDtos;
    }

    public async Task<OwnerDto> GetOwnerByIdAsync(int id)
    {
        var owner = await _ownerRepository.GetOwnerWithPetsAsync(id);
        if (owner is null)
        {
            _logger.LogWarning("Owner not found with ID {OwnerId}", id);
            throw new KeyNotFoundException($"Owner not found with ID: {id}");
        }

        _logger.LogInformation("Retrieved owner with ID {OwnerId}", id);
        return MapOwnerToDto(owner);
    }

    public async Task<OwnerDto> CreateOwnerAsync(CreateOwnerDto dto)
    {
        var owner = new Owner
        {
            FullName = dto.FullName,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address
        };

        await _ownerRepository.AddAsync(owner);
        var saved = await _ownerRepository.SaveChangesAsync();
        if (!saved)
        {
            _logger.LogError("Owner creation failed for email {Email}", dto.Email);
            throw new InvalidOperationException("Failed to create owner.");
        }

        _logger.LogInformation("Created owner with ID {OwnerId}", owner.OwnerId);
        return MapOwnerToDto(owner);
    }

    public async Task<OwnerDto> UpdateOwnerAsync(int id, UpdateOwnerDto dto)
    {
        var owner = await _ownerRepository.GetByIdAsync(id);
        if (owner is null)
        {
            _logger.LogWarning("Owner not found with ID {OwnerId}", id);
            throw new KeyNotFoundException($"Owner not found with ID: {id}");
        }

        var hasChanges = false;

        if (dto.FullName is not null && dto.FullName != owner.FullName)
        {
            owner.FullName = dto.FullName;
            hasChanges = true;
        }

        if (dto.Phone is not null && dto.Phone != owner.Phone)
        {
            owner.Phone = dto.Phone;
            hasChanges = true;
        }

        if (dto.Email is not null && dto.Email != owner.Email)
        {
            owner.Email = dto.Email;
            hasChanges = true;
        }

        if (dto.Address != owner.Address)
        {
            owner.Address = dto.Address;
            hasChanges = true;
        }

        if (hasChanges)
        {
            _ownerRepository.Update(owner);
            var saved = await _ownerRepository.SaveChangesAsync();
            if (!saved)
            {
                _logger.LogError("Owner update failed for ID {OwnerId}", id);
                throw new InvalidOperationException("Failed to update owner.");
            }
        }

        var updatedOwner = await _ownerRepository.GetOwnerWithPetsAsync(id) ?? owner;
        _logger.LogInformation("Updated owner with ID {OwnerId}", id);
        return MapOwnerToDto(updatedOwner);
    }

    public async Task<bool> DeleteOwnerAsync(int id)
    {
        var owner = await _ownerRepository.GetByIdAsync(id);
        if (owner is null)
        {
            _logger.LogWarning("Owner not found with ID {OwnerId}", id);
            throw new KeyNotFoundException($"Owner not found with ID: {id}");
        }

        _ownerRepository.Delete(owner);
        var deleted = await _ownerRepository.SaveChangesAsync();
        _logger.LogInformation("Delete owner operation for ID {OwnerId} completed with status {Deleted}", id, deleted);
        return deleted;
    }

    private static OwnerDto MapOwnerToDto(Owner owner)
    {
        return new OwnerDto
        {
            OwnerId = owner.OwnerId,
            FullName = owner.FullName,
            Phone = owner.Phone,
            Email = owner.Email,
            Address = owner.Address,
            CreatedAt = owner.CreatedAt,
            PetCount = owner.Pets.Count
        };
    }
}
