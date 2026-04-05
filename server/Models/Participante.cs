namespace PortalEventos.Api.Models
{
    public class Participante
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Identificador para gerar o QR code
        public string TicketHash { get; set; } = Guid.NewGuid().ToString();

        // Chave estrangeira para o evento
        public int EventoId { get; set; }

        public Evento? Evento { get; set; }
    }
}