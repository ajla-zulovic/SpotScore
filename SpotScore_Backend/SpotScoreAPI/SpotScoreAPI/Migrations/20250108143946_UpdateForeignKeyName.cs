using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotScoreAPI.Migrations
{
    public partial class UpdateForeignKeyName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
              migrationBuilder.RenameColumn(
                name: "ServiceId",
                table: "Ratings",
                newName: "ServiceID");
      migrationBuilder.DropForeignKey(
                name: "FK_Ratings_Korisnici_UserId",
                table: "Ratings");

            migrationBuilder.DropIndex(
                name: "IX_Ratings_UserId",
                table: "Ratings");

            migrationBuilder.AddColumn<int>(
                name: "KorisnikId",
                table: "Ratings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_KorisnikId",
                table: "Ratings",
                column: "KorisnikId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ratings_Korisnici_KorisnikId",
                table: "Ratings",
                column: "KorisnikId",
                principalTable: "Korisnici",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
                migrationBuilder.RenameColumn(
                 name: "ServiceID",
                 table: "Ratings",
                 newName: "ServiceId");
      migrationBuilder.DropForeignKey(
                name: "FK_Ratings_Korisnici_KorisnikId",
                table: "Ratings");

            migrationBuilder.DropIndex(
                name: "IX_Ratings_KorisnikId",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "KorisnikId",
                table: "Ratings");

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_UserId",
                table: "Ratings",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ratings_Korisnici_UserId",
                table: "Ratings",
                column: "UserId",
                principalTable: "Korisnici",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
