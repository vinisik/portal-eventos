using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortalEventos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoriaEventos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Eventos",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Eventos");
        }
    }
}
