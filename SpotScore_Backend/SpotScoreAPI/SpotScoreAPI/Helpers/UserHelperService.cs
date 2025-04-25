using System.Security.Claims;

namespace SpotScoreAPI.Helpers
{
  public class UserHelperService
  {
    public int? GetUserIdFromToken(ClaimsPrincipal user)
    {
      
      var userIdClaim = user.Claims.FirstOrDefault(c => c.Type == "UserId");
      return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
    }
  }
}
