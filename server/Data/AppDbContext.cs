using Microsoft.EntityFrameworkCore;
using PortalEventos.Api.Models;

namespace PortalEventos.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Evento> Eventos { get; set; }
        public DbSet<Participante> Participantes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Garantir que o Hash do QR Code seja único no banco de dados
            modelBuilder.Entity<Participante>()
                .HasIndex(p => p.TicketHash)
                .IsUnique();
        }
    }
}