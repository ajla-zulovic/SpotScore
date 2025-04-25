using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotScoreAPI.Migrations
{
    public partial class DeleteColumnProfilePhotoKorisnik : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePhoto",
                table: "Korisnici");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "ProfilePhoto",
                table: "Korisnici",
                type: "varbinary(max)",
                nullable: true);
        }
    }
}
