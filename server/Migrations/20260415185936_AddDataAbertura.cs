using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortalEventos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDataAbertura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataAberturaInscricoes",
                table: "Eventos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataAberturaInscricoes",
                table: "Eventos");
        }
    }
}
