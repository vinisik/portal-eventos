using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortalEventos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDestaqueEventos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Destaque",
                table: "Eventos",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Destaque",
                table: "Eventos");
        }
    }
}
