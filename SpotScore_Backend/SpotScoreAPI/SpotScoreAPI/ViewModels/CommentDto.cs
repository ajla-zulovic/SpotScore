using System.ComponentModel.DataAnnotations;

namespace SpotScoreAPI.ViewModels
{
	public class CommentDto
	{
		[Required(ErrorMessage = "Content is required")]
		public string Content { get; set; }

		[Required(ErrorMessage = "UserId is required")]
		public int UserId { get; set; }

		[Required(ErrorMessage = "ServiceId is required")]
		public int ServiceId { get; set; }

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}
