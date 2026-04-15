namespace PortalEventos.Api.Models
{
    public class Evento
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public DateTime Data { get; set; }
        public DateTime DataAberturaInscricoes { get; set; } = DateTime.Now;
        public int CapacidadeMaxima { get; set; }
        public int IdadeMinima { get; set; }
        public string Categoria { get; set; } = "Outros";

        // URL da imagem (temporario durante desenvolvimento)
        public string ImagemUrl { get; set; } = string.Empty;

        // Propriedade de navegação um evento tem vários participantes
        public List<Participante> Participantes { get; set; } = new();
    }
}