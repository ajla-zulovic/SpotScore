using System.ComponentModel.DataAnnotations;

namespace SpotScoreAPI.ViewModels
{
  public class NewCityDto
  {
    [Required]
    public string CityName { get; set; }

    [Required]
    public int StateID { get; set; }
  }
}
