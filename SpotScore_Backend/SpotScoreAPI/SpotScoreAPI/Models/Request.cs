using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SpotScoreAPI.Models
{
  [Table("Requests")]
  public class Request
  {
    [Key]
    public int RequestId { get; set; }

    [ForeignKey(nameof(Korisnik))]
    public int UserId { get; set; }
    public virtual Korisnik Korisnik { get; set; }
    [Required]
    public string ServiceName { get; set; }
    [ForeignKey("Category")]
    [Required]
    public int CategoryId { get; set; }
    public virtual Category Category { get; set; }
    [Required]
    public string Description { get; set; }

    [Column(TypeName = "varchar(20)")]
    public RequestStatus Status { get; set; } = RequestStatus.Unread;
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    public bool IsReviewed { get; set; } = false;
    public string? ImageUrl { get; set; } // opcionalno predloziti Korisniku 


  }
  public enum RequestStatus
  {
    Unread,
    Reviewed,
    Approved,
    Rejected
  }
}
