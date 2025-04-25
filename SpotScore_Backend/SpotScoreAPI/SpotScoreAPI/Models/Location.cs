using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace SpotScoreAPI.Models
{
  [Table("Locations")]
  public class Location
  {
    [Key]
    public int LocationID { get; set; }
    [ForeignKey("City")]
    public int CityID { get; set; }
    public virtual City City { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string ? Address { get; set; }
    public string ? Description { get; set; }
  }
}
