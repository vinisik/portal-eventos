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

            // Verifica se ainda há vagas
            var totalInscritos = await _context.Participantes.CountAsync(p => p.EventoId == participante.EventoId);
            if (totalInscritos >= evento.CapacidadeMaxima) return BadRequest("As vagas para este evento estão esgotadas.");

            // Salva a inscrição no banco
            _context.Participantes.Add(participante);
            await _context.SaveChangesAsync();

            // Retorna os dados do participante 
            return Ok(participante);
        }
    }
}