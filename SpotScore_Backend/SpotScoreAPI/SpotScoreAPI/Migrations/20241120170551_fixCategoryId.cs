using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotScoreAPI.Migrations
{
    public partial class fixCategoryId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Categories_CategoryID",
                table: "Services");

            migrationBuilder.RenameColumn(
                name: "CategoryID",
                table: "Services",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Services_CategoryID",
                table: "Services",
                newName: "IX_Services_CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Categories_CategoryId",
                table: "Services",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Categories_CategoryId",
                table: "Services");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Services",
                newName: "CategoryID");

            migrationBuilder.RenameIndex(
                name: "IX_Services_CategoryId",
                table: "Services",
                newName: "IX_Services_CategoryID");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Categories_CategoryID",
                table: "Services",
                column: "CategoryID",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
