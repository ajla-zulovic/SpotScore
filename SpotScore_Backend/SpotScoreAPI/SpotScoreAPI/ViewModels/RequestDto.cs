using SpotScoreAPI.Models;
using System.Globalization;

namespace SpotScoreAPI.ViewModels
{
  public class RequestDto
  {
    public int RequestId { get; set; }
    public int UserId { get; set; }
    public string ServiceName { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public string Description { get; set; }
    public string? ImageUrl { get; set; } // Opcionalna slika
    public string Status { get; set; } = RequestStatus.Unread.ToString();
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    public string FormattedDate => DateCreated.ToString("f", CultureInfo.CurrentCulture);
  }

}
