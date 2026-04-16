using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PortalEventos.Api.Data;
using PortalEventos.Api.Models;
using PortalEventos.Api.Services;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;

namespace PortalEventos.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly EmailService _emailService;

    public AuthController(AppDbContext context, IConfiguration config, EmailService emailService)
    {
        _context = context;
        _config = config;
        _emailService = emailService;
    }

    // Registo de novos usuários
    [AllowAnonymous]
    [HttpPost("registrar")]
    public async Task<IActionResult> Registrar(UsuarioDTO request)
    {
        // Verifica se o email já existe na base de dados
        if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Este e-mail já se encontra em uso.");

        var tokenConfirmacao = Guid.NewGuid().ToString();

        var usuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            // Criptografa a senha antes da persistência no SQLite
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Perfil = "Usuario",
            DataNascimento = request.DataNascimento,
            EmailConfirmado = false,
            TokenConfirmacaoEmail = tokenConfirmacao
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        // Disparo do e-mail de ativação 
        _ = _emailService.EnviarEmailAtivacaoAsync(usuario.Email, usuario.Nome, usuario.TokenConfirmacaoEmail);

        return Ok(new { mensagem = "Conta criada com sucesso! Verifique o seu e-mail para efetuar a ativação." });
    }

    // Login de usuários registados
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO request)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);

        // Verifica a existência do usuários e a integridade da credencial (Hash)
        if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            return Unauthorized("E-mail ou senha incorretos.");

        // Barreira de Autenticidade (Double Opt-in)
        if (!usuario.EmailConfirmado) 
            return BadRequest("Confirme seu e-mail para acessar o portal.");

        var token = GerarJwtToken(usuario);

        // Retorna o token e as informações para a interface 
        return Ok(new { 
            Token = token, 
            Nome = usuario.Nome, 
            Perfil = usuario.Perfil 
        });
    }

    // Rota dedicada à validação do Token de E-mail
    [AllowAnonymous]
    [HttpGet("confirmar-email")]
    public async Task<ActionResult> ConfirmarEmail([FromQuery] string token)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.TokenConfirmacaoEmail == token);

        if (usuario == null) 
            return BadRequest("Token inválido ou expirado.");

        usuario.EmailConfirmado = true;
        usuario.TokenConfirmacaoEmail = null; 

        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "E-mail confirmado com êxito! Você já pode efetuar o Login." });
    }

    // Listagem de usuários (Admin)
    [Authorize(Roles = "Admin")]
    [HttpGet("usuarios")]
    public async Task<ActionResult> GetUsuarios()
    {
        // Retorna exclusivamente dados não sensíveis
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

    [Authorize]
    [HttpGet("meus-ingressos")]
    public async Task<ActionResult> GetMeusIngressos()
    {
        // Extrai o ID do usuário a partir do Token JWT providenciado na requisição
        var userIdClaim = User.FindFirst("id")?.Value;
        if (userIdClaim == null) return Unauthorized();

        var usuario = await _context.Usuarios.FindAsync(int.Parse(userIdClaim));
        if (usuario == null) return NotFound("Usuário não encontrado.");

        // Pesquisa os eventos nos quais o usuário está inscrito
        var ingressos = await _context.Eventos
            .Include(e => e.Participantes)
            .Where(e => e.Participantes.Any(p => p.Email == usuario.Email))
            .Select(e => new
            {
                EventoId = e.Id,
                Titulo = e.Titulo,
                Data = e.Data,
                ImagemUrl = e.ImagemUrl,
                // Extrai o Hash do ingresso específico alocado ao usuário
                TicketHash = e.Participantes.First(p => p.Email == usuario.Email).TicketHash
            })
            .ToListAsync();

        return Ok(ingressos);
    }

    // Geração de Token
    private string GerarJwtToken(Usuario usuario)
    {
        // Utiliza a chave criptografada configurada no Program.cs
        var jwtKey = _config["Jwt:Key"] ?? "MinhaChaveSuperSecretaEParaOJWT123!";
        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("id", usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Role, usuario.Perfil) // Estabelece a distinção hierárquica 
            }),
            Expires = DateTime.UtcNow.AddHours(3), // Validade do token fixada em 3 horas
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

public record UsuarioDTO(string Nome, string Email, string Senha, DateTime DataNascimento);
public record LoginDTO(string Email, string Senha);