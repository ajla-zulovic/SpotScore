using System.ComponentModel.DataAnnotations;

namespace SpotScoreAPI.ViewModels
{
  public class NewServiceDto
  {
    [Required]
    public string Name { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public int? GenreId { get; set; }

    public int? CityId { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? Address { get; set; }

    [Required]
    public IFormFile ImageFile { get; set; }
  }
}

