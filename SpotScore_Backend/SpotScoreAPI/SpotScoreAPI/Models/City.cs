using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace SpotScoreAPI.Models
{
  [Table("Cities")]
  public class City
  {
    [Key]
    public int CityID { get; set; }
    public string CityName { get; set; }
    [ForeignKey("State")]
    public int StateID { get; set; }
    public virtual State State { get; set; }
  }
}
