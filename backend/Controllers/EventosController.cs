using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortalEventos.Api.Data;
using PortalEventos.Api.Models;

namespace PortalEventos.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventosController(AppDbContext context)
        {
            _context = context;
        }

        // Lista os eventos disponíveis
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Evento>>> GetEventos()
        {
            return await _context.Eventos
                                 .Include(e => e.Participantes)
                                 .ToListAsync();
        }

        // Cadastro de evento pelo admin
        [HttpPost]
        public async Task<ActionResult<Evento>> PostEvento(Evento evento)
        {
            _context.Eventos.Add(evento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventos), new { id = evento.Id }, evento);
        }

        // Lista os participantes de um evento específico
        [HttpGet("{id}/participantes")]
        public async Task<ActionResult<IEnumerable<Participante>>> GetParticipantes(int id)
        {
            // Busca o evento e inclui a lista de participantes vinculados a ele
            var evento = await _context.Eventos
                .Include(e => e.Participantes)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evento == null) return NotFound("Evento não encontrado.");

            return evento.Participantes;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutEvento(int id, Evento eventoAtualizado)
        {
            // Verifica se o ID do URL corresponde ao ID do objeto enviado
            if (id != eventoAtualizado.Id) return BadRequest("IDs não correspondem.");

            // Informa o Entity Framework que este objeto foi modificado
            _context.Entry(eventoAtualizado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Verifica se o evento ainda existe no banco
                if (!_context.Eventos.Any(e => e.Id == id)) return NotFound("Evento não encontrado.");
                else throw;
            }

            return NoContent(); 
        }

        // Excluir evento
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvento(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound("Evento não encontrado.");

            _context.Eventos.Remove(evento);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}