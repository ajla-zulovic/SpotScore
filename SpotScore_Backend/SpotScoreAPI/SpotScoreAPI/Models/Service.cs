using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace SpotScoreAPI.Models
{
  [Table("Services")]
  public class Service
  {
    [Key]
    public int ServiceID { get; set; }
    [Required]
    public string Name { get; set; }
    public string Description { get; set; }
    [ForeignKey("Category")]
    public int CategoryId { get; set; }
    public virtual Category Category { get; set;}
    public string Picture { get; set; }
    [ForeignKey("Genre")]
    public int GenreID { get; set; }
    public virtual Genre Genre { get; set; }
    [ForeignKey("Location")] 
    public int  LocationID { get; set;}
    public virtual Location Location { get; set; }
    public DateTime? DateAdded { get; set; }

    public float AverageRating { get; set; } = 0;
    public int RatingCount { get; set; } = 0;



  }
}
