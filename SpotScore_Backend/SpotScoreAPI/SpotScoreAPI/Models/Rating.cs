using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpotScoreAPI.Models
{
  [Table("Ratings")]
  public class Rating
  {
    [Key]
    public int RatingId { get; set; }

    [Required]
    [ForeignKey(nameof(Korisnik))]
    public int UserId { get; set; } 

    [Required]
    [ForeignKey(nameof(Service))]
    public int ServiceId { get; set; } 

    public virtual Service Service { get; set; }
    public virtual Korisnik Korisnik { get; set; }

    [Required]
    [Range(1, 5)]
    public int RatingValue { get; set; }
  }
}
