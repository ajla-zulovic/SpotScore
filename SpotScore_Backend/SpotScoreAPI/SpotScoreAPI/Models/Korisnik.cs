using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpotScoreAPI.Models
{
	[Table("Korisnici")]
	public class Korisnik
	{
		[Key]
		public int Id { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		[EmailAddress]
		public string? Email { get; set; }
		public string Username { get; set; } 
		public string Password { get; set; }
		public string? Token { get; set; }
        public string? Role { get; set; }
 
    public string? ProfilePhotoFileName { get; set; }


  }
}
