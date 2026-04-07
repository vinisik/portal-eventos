using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PortalEventos.Api.Data;
using PortalEventos.Api.Models;
using BCrypt.Net;

namespace PortalEventos.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar(UsuarioDTO request)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email já cadastrado.");

        var usuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            // Passa a senha pelo BCrypt para gerar um hash seguro
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Perfil = "Usuario" // Admins devem ser inseridos manualmente no DB por segurança
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return Ok("Usuário registrado com sucesso!");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO request)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            return Unauthorized("Credenciais inválidas.");

        var token = GerarJwtToken(usuario);
        return Ok(new { Token = token, Nome = usuario.Nome, Perfil = usuario.Perfil });
    }

    private string GerarJwtToken(Usuario usuario)
    {
        var jwtKey = _config["Jwt:Key"] ?? "MinhaChaveSuperSecretaECompridaParaOJWT123!";
        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Role, usuario.Perfil)
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public record UsuarioDTO(string Nome, string Email, string Senha);
public record LoginDTO(string Email, string Senha);