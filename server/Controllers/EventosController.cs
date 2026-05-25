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
        public async Task<ActionResult> GetEventos()
        {
            var eventos = await _context.Eventos
                .Select(e => new 
                {
                    e.Id,
                    e.Titulo,
                    e.Descricao,
                    e.Data,
                    e.ImagemUrl,
                    e.CapacidadeMaxima,
                    e.IdadeMinima,
                    e.DataAberturaInscricoes,
                    VagasOcupadas = e.Participantes.Count(),
                    Categoria = e.Categoria ?? "Outros",
                    ValorIngresso = e.ValorIngresso,
                    Destaque = e.Destaque
                })
                .ToListAsync();

            return Ok(eventos);
        }


        // Cadastro de evento pelo admin
        [HttpPost]
        public async Task<ActionResult<Evento>> PostEvento(Evento evento)
        {

            if (evento.Destaque)
            {
                // Busca todos os eventos que atualmente estão em destaque 
                var destaquesAtuais = await _context.Eventos.Where(e => e.Destaque).ToListAsync();
                foreach (var d in destaquesAtuais)
                {
                    d.Destaque = false; 
                    _context.Entry(d).State = EntityState.Modified;
                }
            }

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

        [HttpGet("gerar-teste")]
        public async Task<IActionResult> GerarEventosTeste()
        {
            var random = new Random();
            var categorias = new[] { "Tecnologia", "Negócios", "Música", "Educação", "Esportes", "Cultura" };
            var eventos = new List<Evento>();

            for (int i = 1; i <= 12; i++) 
            {
                bool isGratuito = random.Next(100) < 30; 
                
                decimal valorAleatorio = isGratuito ? 0 : (decimal)(random.Next(20, 150) + random.NextDouble());

                var evento = new Evento
                {
                    Titulo = $"Evento de Teste #{random.Next(1000, 9999)}",
                    Descricao = "Esta é uma descrição gerada automaticamente pelo script de testes. O evento abordará temas fantásticos com palestrantes de renome internacional.\n\nContamos com a sua presença!",
                    Data = DateTime.Now.AddDays(random.Next(5, 60)), 
                    DataAberturaInscricoes = DateTime.Now.AddDays(-random.Next(1, 10)), 
                    CapacidadeMaxima = random.Next(20, 500), 
                    IdadeMinima = random.Next(100) < 40 ? 18 : 0, 
                    Categoria = categorias[random.Next(categorias.Length)],
                    ValorIngresso = Math.Round(valorAleatorio, 2), 
                    
                    ImagemUrl = $"https://picsum.photos/seed/{random.Next(1, 99999)}/800/400"
                };

                eventos.Add(evento);
            }

            _context.Eventos.AddRange(eventos);
            await _context.SaveChangesAsync();

            return Ok(new { 
                mensagem = "Sucesso! 12 eventos aleatórios foram criados.", 
                quantidade = eventos.Count 
            });
        }

    }
}