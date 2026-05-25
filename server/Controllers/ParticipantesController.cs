using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortalEventos.Api.Data;
using PortalEventos.Api.Models;
using PortalEventos.Api.Services;
using System.Security.Claims;

namespace PortalEventos.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParticipantesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public ParticipantesController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // Inscrição online
        [Authorize] 
        [HttpPost]
        public async Task<IActionResult> PostParticipante([FromBody] InscricaoRequest request)
        {
            // Extrai a identificação do Usuário do Token 
            var identificacaoUsuario = User.FindFirst(ClaimTypes.Email)?.Value 
                                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                                       ?? User.FindFirst("email")?.Value 
                                       ?? User.Identity?.Name;

            if (string.IsNullOrEmpty(identificacaoUsuario))
            {
                return Unauthorized("Usuário não autenticado ou token inválido.");
            }

            // Busca o Usuário
            var usuarioConta = await _context.Usuarios.FirstOrDefaultAsync(u => 
                u.Email == identificacaoUsuario || 
                u.Nome == identificacaoUsuario);

            if (usuarioConta == null && int.TryParse(identificacaoUsuario, out int userId))
            {
                usuarioConta = await _context.Usuarios.FindAsync(userId);
            }

            // Se mesmo após as duas tentativas não encontrar, retorna o erro detalhado
            if (usuarioConta == null) 
            {
                return NotFound($"Usuário '{identificacaoUsuario}' não foi encontrado na base de dados.");
            }

            var evento = await _context.Eventos.FindAsync(request.EventoId);
            if (evento == null) return NotFound("Evento não encontrado.");

            if (DateTime.Now < evento.DataAberturaInscricoes)
            {
                return BadRequest($"As inscrições para este evento só abrem a: {evento.DataAberturaInscricoes:dd/MM/yyyy às HH:mm}.");
            }

            // Verifica se ainda há vagas
            var totalInscritos = await _context.Participantes.CountAsync(p => p.EventoId == request.EventoId);
            if (totalInscritos >= evento.CapacidadeMaxima) return BadRequest("As vagas para este evento estão esgotadas.");

            // Validação de Idade 
            if (evento.IdadeMinima > 0) 
            {
                // Cálculo dinâmico da idade baseado na DataNascimento do Usuário logado
                var hoje = DateTime.Today;
                var idadeCalculada = hoje.Year - usuarioConta.DataNascimento.Year;
                
                if (usuarioConta.DataNascimento.Date > hoje.AddYears(-idadeCalculada)) 
                    idadeCalculada--;

                if (idadeCalculada < evento.IdadeMinima)
                    return BadRequest($"Evento disponível apenas para maiores de {evento.IdadeMinima} anos.");
            }

            // Trava de Inscrição Duplicada
            bool jaInscrito = await _context.Participantes
                .AnyAsync(p => p.EventoId == request.EventoId && p.Email == usuarioConta.Email);

            if (jaInscrito)
            {
                return BadRequest("Já se encontra inscrito neste evento! Aceda à aba 'Meus Ingressos' no seu perfil para ver o seu ingresso.");
            }

            var participante = new Participante
            {
                EventoId = evento.Id,
                Nome = usuarioConta.Nome,
                Email = usuarioConta.Email,
                TicketHash = Guid.NewGuid().ToString() 
            };

            // Salva a inscrição na base de dados
            _context.Participantes.Add(participante);
            await _context.SaveChangesAsync();

            // Disparo do e-mail de confirmação
            try
            {
                await _emailService.EnviarIngressoAsync(
                    usuarioConta.Email,
                    usuarioConta.Nome,
                    evento.Titulo,
                    participante.TicketHash, 
                    evento.ValorIngresso 
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao enviar e-mail: {ex.Message}");
            }

            // Retorna os dados do ingresso gerado
            return Ok(participante);
        }

        [AllowAnonymous] 
        [HttpGet("ingresso/{hash}")]
        public async Task<IActionResult> GetIngressoPorHash(string hash)
        {
            var participante = await _context.Participantes
                .Include(p => p.Evento) 
                .FirstOrDefaultAsync(p => p.TicketHash == hash);

            if (participante == null) 
                return NotFound("Ingresso não encontrado.");

            return Ok(new {
                nome = participante.Nome,
                email = participante.Email,
                ticketHash = participante.TicketHash,
                nomeEvento = participante.Evento.Titulo,
                dataEvento = participante.Evento.Data,
                valorIngresso = participante.Evento.ValorIngresso
            });
        }
    }

    public record InscricaoRequest(int EventoId);
}