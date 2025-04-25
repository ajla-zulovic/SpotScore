using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpotScoreAPI.Models
{
	[Table("Comments")]
	public class Comment
	{
		[Key]
		public int Id { get; set; }
		public string Content { get; set; }
		public int UserId { get; set; }
		public int ServiceId { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


		[ForeignKey("UserId")]
		public virtual Korisnik Korisnik { get; set; }


		[ForeignKey("ServiceId")]
		public virtual Service Service { get; set; }
	}
}
