# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["VetClinicAPIProject.csproj", "./"]
RUN dotnet restore "VetClinicAPIProject.csproj"

COPY . .
RUN dotnet publish "VetClinicAPIProject.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV ConnectionStrings__DefaultConnection=Data Source=/app/data/vetclinic.db

RUN mkdir -p /app/data && chown -R app:app /app

COPY --from=build /app/publish .

VOLUME ["/app/data"]

EXPOSE 8080

USER app

ENTRYPOINT ["dotnet", "VetClinicAPIProject.dll"]
