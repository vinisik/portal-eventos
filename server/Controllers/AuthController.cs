using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PortalEventos.Api.Data;
using PortalEventos.Api.Models;
using Microsoft.AspNetCore.Authorization;
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

    // Registro de novos usuários
    [AllowAnonymous]
    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar(UsuarioDTO request)
    {
        // Verifica se o email já existe no banco
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Este e-mail já está em uso.");

        var usuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            // Criptografa a senha antes de salvar no SQLite
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Perfil = "Comum" 
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return Ok("Usuário criado com sucesso!");
    }

    // Login de usuarios cadastrados
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO request)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);

        // Verifica se o usuário existe e se a senha bate com o Hash
        if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            return Unauthorized("E-mail ou senha incorretos.");

        var token = GerarJwtToken(usuario);

        // Retorna o token e informações básicas para o React
        return Ok(new { 
            Token = token, 
            Nome = usuario.Nome, 
            Perfil = usuario.Perfil 
        });
    }

    // Listagem de users (apenas Admins)
    [Authorize(Roles = "Admin")]
    [HttpGet("usuarios")]
    public async Task<ActionResult> GetUsuarios()
    {
        // Retorna apenas dados não sensíveis
        var lista = await _context.Usuarios
            .Select(u => new { 
                u.Id, 
                u.Nome, 
                u.Email, 
                u.Perfil 
            })
            .ToListAsync();
            
        return Ok(lista);
    }

    // MÉTODO PRIVADO PARA CRIAR O TOKEN
    private string GerarJwtToken(Usuario usuario)
    {
        // Usa a mesma chave configurada no Program.cs
        var jwtKey = _config["Jwt:Key"] ?? "MinhaChaveSuperSecretaEParaOJWT123!";
        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Role, usuario.Perfil) // Define se é Admin ou Comum
            }),
            Expires = DateTime.UtcNow.AddHours(3), // Token expira em 3 horas
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public record UsuarioDTO(string Nome, string Email, string Senha);
public record LoginDTO(string Email, string Senha);