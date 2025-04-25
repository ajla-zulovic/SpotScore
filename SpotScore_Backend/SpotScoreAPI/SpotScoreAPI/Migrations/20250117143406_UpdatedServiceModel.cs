using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotScoreAPI.Migrations
{
    public partial class UpdatedServiceModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
          migrationBuilder.AlterColumn<int>(
            name: "GenreID",
            table: "Services",
            nullable: false,
            oldClrType: typeof(int),
            oldNullable: true);

          migrationBuilder.AlterColumn<int>(
              name: "LocationID",
              table: "Services",
              nullable: false,
              oldClrType: typeof(int),
              oldNullable: true);
    }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
          migrationBuilder.AlterColumn<int>(
           name: "GenreID",
           table: "Services",
           nullable: true,
           oldClrType: typeof(int));

          migrationBuilder.AlterColumn<int>(
              name: "LocationID",
              table: "Services",
              nullable: true,
              oldClrType: typeof(int));
    }
    }
}
