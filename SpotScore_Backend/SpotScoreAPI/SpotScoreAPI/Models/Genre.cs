using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace SpotScoreAPI.Models
{
  [Table("Genres")]
  public class Genre
  {
    [Key]
    public int GenreID { get; set; }
    public string GenreName { get; set; }
  }
}
