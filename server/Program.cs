using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PortalEventos.Api.Data;
using System.Text;
using System.Text.Json.Serialization;
using PortalEventos.Api.Models;

var builder = WebApplication.CreateBuilder(args);

var jwtKey = builder.Configuration["Jwt:Key"] ?? "MinhaChaveSuperSecretaEParaOJWT123!"; // Chave é apenas para desenvolvimento.

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Configuração do Banco de Dados
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configuração do CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); 

app.UseCors("PermitirTudo");

app.UseAuthentication(); // Descobre quem é o usuário
app.UseAuthorization();  // Verifica se ele tem permissão

app.UseAuthorization();
app.MapControllers();


using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();

    // Verifica se já existe algum usuário Admin
    if (!context.Usuarios.Any(u => u.Perfil == "Admin"))
    {
        var admin = new Usuario
        {
            // Cria um superusuário admin com email e senha padrão para desenvolvimento
            Nome = "Administrador",
            Email = "admin@portal.com",
            // Gera o hash seguro da senha 'admin123'
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Perfil = "Admin"
        };

        context.Usuarios.Add(admin);
        context.SaveChanges();
        Console.WriteLine("--> Superuser criado com sucesso: admin@portal.com / admin123");
    }
}

app.Run();