using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortalEventos.Api.Data;
using PortalEventos.Api.Models;

namespace PortalEventos.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParticipantesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParticipantesController(AppDbContext context)
        {
            _context = context;
        }

        // Inscrição online
        [HttpPost]
        public async Task<ActionResult<Participante>> PostParticipante(Participante participante)
        {
            // Verifica se o evento realmente existe
            var evento = await _context.Eventos.FindAsync(participante.EventoId);
            if (evento == null) return NotFound("Evento não encontrado.");

            if (DateTime.Now < evento.DataAberturaInscricoes)
            {
                return BadRequest($"As inscrições para este evento só abrem em: {evento.DataAberturaInscricoes:dd/MM/yyyy às HH:mm}.");
            }

            // Verifica se ainda há vagas
            var totalInscritos = await _context.Participantes.CountAsync(p => p.EventoId == participante.EventoId);
            if (totalInscritos >= evento.CapacidadeMaxima) return BadRequest("As vagas para este evento estão esgotadas.");

            // Validação de Idade 
            if (evento.IdadeMinima > 0) 
            {
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == participante.Email);
                
                if (usuario == null) 
                    return BadRequest($"A idade mínima para este evento é de {evento.IdadeMinima} anos. Crie uma conta no portal.");

                // Cálculo dinâmico da idade baseado na DataNascimento
                var hoje = DateTime.Today;
                var idadeCalculada = hoje.Year - usuario.DataNascimento.Year;
                
                if (usuario.DataNascimento.Date > hoje.AddYears(-idadeCalculada)) 
                    idadeCalculada--;

                if (idadeCalculada < evento.IdadeMinima)
                    return BadRequest($"Evento disponível apenas para maiores de {evento.IdadeMinima} anos.");
            }

            // Trava de Inscrição Duplicada
            bool jaInscrito = await _context.Participantes
                .AnyAsync(p => p.EventoId == participante.EventoId && p.Email == participante.Email);

            if (jaInscrito)
            {
                return BadRequest("Você já está inscrito neste evento! Acesse a aba 'Meus Ingressos' no seu perfil para ver o seu ingresso.");
            }

            // Salva a inscrição no banco
            _context.Participantes.Add(participante);
            await _context.SaveChangesAsync();

            // Retorna os dados do participante 
            return Ok(participante);
        }
    }
}