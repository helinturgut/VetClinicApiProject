# VetClinic API Project

ASP.NET Core 8 Web API for managing a veterinary clinic workflow with JWT authentication, role-based access control, layered architecture, SQLite persistence, Swagger documentation, unit tests, Docker support, and CI/CD via GitHub Actions.

## Overview

This project provides backend APIs for:

- user authentication (`register`, `login`)
- veterinarian approval workflow (admin-managed)
- owner and pet management
- visit tracking
- diagnosis and treatment records per visit

The API follows a layered structure:

- `Controllers` -> HTTP endpoints
- `Services` -> business logic
- `Repositories` -> data access abstraction
- `Data` -> EF Core DbContext and startup seed logic
- `Models` and `DTOs` -> persistence and API contracts

## Tech Stack

- .NET 8 / ASP.NET Core Web API
- Entity Framework Core 8
- ASP.NET Core Identity
- JWT Bearer Authentication
- SQLite
- Swagger (Swashbuckle)
- xUnit + Moq (unit tests)
- Docker (multi-stage build)
- GitHub Actions (build, test, image push, Azure deploy)

## Architecture Snapshot

- `Program.cs` configures:
- SQLite DbContext
- Identity + password policy
- JWT validation
- role policies (`Admin`, `Veterinarian`, `Receptionist`)
- CORS policy from configuration/env
- Swagger with Bearer auth scheme
- global exception middleware
- health checks (`/health`)
- `SeedData` runs at startup:
- applies migrations if available, otherwise ensures DB creation
- seeds roles (`Admin`, `Veterinarian`, `Receptionist`)
- seeds admin user if missing

## Domain Model

Core entities:

- `ApplicationUser` (Identity user with `FullName`, `ClinicName`, `IsApproved`)
- `Owner`
- `Pet`
- `Visit`
- `Diagnosis`
- `Treatment`

Key relationships:

- Owner `1 -> many` Pets
- Pet `1 -> many` Visits
- ApplicationUser (Veterinarian) `1 -> many` Visits
- Visit `1 -> many` Diagnoses
- Visit `1 -> many` Treatments

## Authentication And Roles

- JWT token authentication is required for protected endpoints.
- Registration creates users in `Veterinarian` role with `IsApproved = false`.
- Admin approves pending veterinarians via admin endpoint.
- Role-based access is enforced with `[Authorize]` and role-specific restrictions.

Seeded default admin (from `SeedData`):

- Email: `admin@admin.com`
- Password: `Password123`

Change this credential for any non-local environment.

## API Endpoints

Base URL (local): `https://localhost:7071` or `http://localhost:5002`

Auth:

- `POST /api/auth/register` (public)
- `POST /api/auth/login` (public)

Admin (Admin only):

- `GET /api/admin/veterinarians/pending`
- `PUT /api/admin/veterinarians/{userId}/approve`

Owners (authenticated):

- `GET /api/owners`
- `GET /api/owners/{id}`
- `POST /api/owners`
- `PUT /api/owners/{id}`
- `DELETE /api/owners/{id}` (Admin only)

Pets (authenticated):

- `GET /api/pets`
- `GET /api/pets/{id}`
- `GET /api/pets/{id}/history`
- `POST /api/pets`
- `PUT /api/pets/{id}`
- `DELETE /api/pets/{id}` (Admin, Veterinarian)

Visits (Admin, Veterinarian):

- `GET /api/visits`
- `GET /api/visits/{id}`
- `POST /api/visits`
- `PUT /api/visits/{id}`
- `DELETE /api/visits/{id}` (Admin only)

Diagnoses (Admin, Veterinarian):

- `GET /api/visits/{visitId}/diagnoses`
- `POST /api/visits/{visitId}/diagnoses`

Treatments (Admin, Veterinarian):

- `GET /api/visits/{visitId}/treatments`
- `POST /api/visits/{visitId}/treatments`

Health:

- `GET /health` (liveness endpoint)

## Local Setup

### Prerequisites

- .NET SDK 8.x
- Git
- (Optional) Docker Desktop

### 1. Clone and enter project

```bash
git clone <your-repo-url>
cd Project
```

### 2. Configure environment

From `VetClinicAPIProject` directory, create `.env` from the example:

PowerShell:

```powershell
Copy-Item .env.example .env
```

Bash:

```bash
cp .env.example .env
```

Set a strong JWT secret in `.env`:

```dotenv
JwtSettings__Secret=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

### 3. Run the API

From repository root:

```bash
dotnet restore Project.sln
dotnet run --project VetClinicAPIProject
```

Then open:

- Swagger UI: `https://localhost:7071/swagger`
- Health: `https://localhost:7071/health`

## Database Notes

- Local connection string defaults to `Data Source=vetclinic.db`.
- The DB file is created under `VetClinicAPIProject/`.
- Startup logic will:
- run EF migrations if they exist
- otherwise call `EnsureCreated` and seed required Identity data

## Running Tests

From repository root:

```bash
dotnet test Project.sln --configuration Release --no-build
```

Current test project covers service-layer behavior across auth, admin, owner, pet, visit, diagnosis, and treatment services.

## Docker

Build image:

```bash
docker build -t vetclinic-api:local ./VetClinicAPIProject
```

Run container:

```bash
docker run --rm -p 8080:8080 \
  -e JwtSettings__Secret=REPLACE_WITH_A_LONG_RANDOM_SECRET \
  -v vetclinic_data:/app/data \
  vetclinic-api:local
```

Container defaults:

- port: `8080`
- DB path: `/app/data/vetclinic.db`

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`) includes:

1. CI job:
- restore
- build
- test
2. Build and push Docker image to Azure Container Registry (on `main`)
3. Deploy container image to Azure Web App (on `main`)

Required GitHub variables/secrets are validated in workflow steps before deployment.

## Error Handling And Logging

- Global exception middleware returns consistent JSON error payloads with trace IDs.
- Services and middleware use structured `ILogger` logging (`Information`, `Warning`, `Error`).

## Repository Structure

```text
Project/
  .github/workflows/
  VetClinicAPIProject/
    Controllers/
    Data/
    DTOs/
    Middleware/
    Models/
    Repositories/
    Services/
    Program.cs
    Dockerfile
    appsettings.json
    .env.example
  VetClinicAPIProject.Tests/
    Services/
  Project.sln
```

