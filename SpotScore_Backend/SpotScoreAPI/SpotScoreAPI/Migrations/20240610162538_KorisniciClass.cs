using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotScoreAPI.Migrations
{
    public partial class KorisniciClass : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
			migrationBuilder.CreateTable(
			   name: "Korisnici",
			   columns: table => new
			   {
				   Id = table.Column<int>(type: "int", nullable: false)
					   .Annotation("SqlServer:Identity", "1, 1"),
				   FirstName = table.Column<string>(type: "nvarchar(15)", nullable: false),
				   LastName = table.Column<string>(type: "nvarchar(15)", nullable: false),
				   Email = table.Column<string>(type: "nvarchar(40)", nullable: false),
				   Username = table.Column<string>(type: "nvarchar(15)", nullable: false),
				   Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
				   Token = table.Column<string>(type: "nvarchar(max)", nullable: true)
			   },
			   constraints: table =>
			   {
				   table.PrimaryKey("PK_Korisnici", x => x.Id);
			   });
		}

        protected override void Down(MigrationBuilder migrationBuilder)
        {
			migrationBuilder.DropTable(
			   name: "Korisnici");
		}
    }
}
