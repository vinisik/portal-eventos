using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortalEventos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarIdades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Idade",
                table: "Usuarios",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdadeMinima",
                table: "Eventos",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Idade",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "IdadeMinima",
                table: "Eventos");
        }
    }
}
