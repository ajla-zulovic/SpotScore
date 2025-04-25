namespace SpotScoreAPI.ViewModels
{
  public class RequestDtoCreate
  {
    public int UserId { get; set; }
    public string ServiceName { get; set; }
    public int CategoryId { get; set; }  
    public string Description { get; set; }
    public string? ImageUrl { get; set; }  
  }
}
