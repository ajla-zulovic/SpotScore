using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace SpotScoreAPI.Models
{
  [Table("Categories")]
  public class Category
  {
    [Key]
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
  }
}
