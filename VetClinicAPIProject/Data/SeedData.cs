using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;
using VetClinicAPIProject.Models;

namespace VetClinicAPIProject.Data;

public static class SeedData
{
    public static async Task SeedRolesAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var hasMigrations = dbContext.Database.GetMigrations().Any();
        if (hasMigrations)
        {
            await dbContext.Database.MigrateAsync();
        }
        else
        {
            await dbContext.Database.EnsureCreatedAsync();

            if (!await TableExistsAsync(dbContext, "AspNetRoles"))
            {
                await dbContext.Database.EnsureDeletedAsync();
                await dbContext.Database.EnsureCreatedAsync();
            }
        }

        string[] roles = ["Admin", "Veterinarian", "Receptionist"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                var createRoleResult = await roleManager.CreateAsync(new IdentityRole(role));
                if (!createRoleResult.Succeeded)
                {
                    var errors = string.Join("; ", createRoleResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to seed role '{role}'. Errors: {errors}");
                }
            }
        }

        await EnsureIsApprovedColumnAsync(dbContext);
        await SeedAdminUserAsync(userManager);
    }

    private static async Task<bool> TableExistsAsync(DbContext dbContext, string tableName)
    {
        await using var connection = dbContext.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = $name;";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "$name";
        parameter.Value = tableName;
        command.Parameters.Add(parameter);

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result) > 0;
    }

    private static async Task<bool> ColumnExistsAsync(DbContext dbContext, string tableName, string columnName)
    {
        await using var connection = dbContext.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT COUNT(*) FROM pragma_table_info('{tableName}') WHERE name = $columnName;";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "$columnName";
        parameter.Value = columnName;
        command.Parameters.Add(parameter);

        var result = await command.ExecuteScalarAsync();
        return Convert.ToInt32(result) > 0;
    }

    private static async Task EnsureIsApprovedColumnAsync(AppDbContext dbContext)
    {
        const string usersTable = "AspNetUsers";
        const string approvalColumn = "IsApproved";

        var usersTableExists = await TableExistsAsync(dbContext, usersTable);
        if (!usersTableExists)
        {
            return;
        }

        var columnExists = await ColumnExistsAsync(dbContext, usersTable, approvalColumn);
        if (columnExists)
        {
            return;
        }

        await dbContext.Database.ExecuteSqlRawAsync(
            $"ALTER TABLE {usersTable} ADD COLUMN {approvalColumn} INTEGER NOT NULL DEFAULT 1;");
    }

    private static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager)
    {
        const string adminRole = "Admin";
        const string adminEmail = "admin@admin.com";
        const string adminPassword = "Password123";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Administrator",
                IsApproved = true
            };

            var createUserResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (!createUserResult.Succeeded)
            {
                var errors = string.Join("; ", createUserResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to seed admin user. Errors: {errors}");
            }
        }
        else if (!adminUser.IsApproved)
        {
            adminUser.IsApproved = true;
            var updateResult = await userManager.UpdateAsync(adminUser);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join("; ", updateResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to approve seeded admin user. Errors: {errors}");
            }
        }

        var inAdminRole = await userManager.IsInRoleAsync(adminUser, adminRole);
        if (!inAdminRole)
        {
            var roleResult = await userManager.AddToRoleAsync(adminUser, adminRole);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join("; ", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to assign Admin role to seeded user. Errors: {errors}");
            }
        }
    }
}
