using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace SpotScoreAPI.Models
{
  [Table("States")]
  public class State
  {
    [Key]
    public int StateID { get; set; }
    public string StateName { get; set; }
  }
}
