using System.ComponentModel.DataAnnotations;

namespace SpotScoreAPI.ViewModels
{
  public class RatingDto
  {
    [Required]
    public int ServiceId { get; set; }

    [Required]
    [Range(1, 5, ErrorMessage = "Rating value must be between 1 and 5.")]
    public int RatingValue { get; set; }
  }
}
