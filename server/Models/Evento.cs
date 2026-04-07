namespace PortalEventos.Api.Models
{
    public class Evento
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public DateTime Data { get; set; }
        public int CapacidadeMaxima { get; set; }
        public int IdadeMinima { get; set; }

        // Propriedade de navegação um evento tem vários participantes
        public List<Participante> Participantes { get; set; } = new();
    }
}