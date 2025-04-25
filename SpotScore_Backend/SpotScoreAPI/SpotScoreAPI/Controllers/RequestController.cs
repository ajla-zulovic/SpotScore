using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpotScoreAPI.Context;
using SpotScoreAPI.Helpers;
using SpotScoreAPI.Models;
using SpotScoreAPI.ViewModels;
using System.Globalization;

namespace SpotScoreAPI.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class RequestController : ControllerBase
  {
    private readonly AppDbContext _db;
    private readonly UserHelperService _userHelper;

    public RequestController(AppDbContext db, UserHelperService userHelper)
    {
      _db = db;
      _userHelper = userHelper;
    }


    [HttpGet("request/categories")]
    [Authorize]
    public async Task<IActionResult> GetCategories()
    {
      var categories = await _db.Categories.ToListAsync();
      return Ok(categories);
    }

    // logovani user kreira zahtjev koji salje adminu :
    [HttpPost("create/request")]
    [Authorize]
    public async Task<IActionResult> CreateRequest([FromBody] RequestDtoCreate requestDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var userId = _userHelper.GetUserIdFromToken(User);  

      if (userId == null)
        return Unauthorized(new { Message = "User is not authorized." });

      var request = new Request
      {
        UserId = userId.Value,  
        ServiceName = requestDto.ServiceName,
        CategoryId = requestDto.CategoryId,
        Description = requestDto.Description,
        ImageUrl = requestDto.ImageUrl,
        Status = RequestStatus.Unread,
        DateCreated = DateTime.UtcNow
      };

      _db.Requests.Add(request);
      await _db.SaveChangesAsync();

      return Ok(new { Message = "Request created successfully", RequestId = request.RequestId });
    }


    [HttpGet("all/request")]
    [Authorize]
    public async Task<IActionResult> GetAllRequests(int pageNumber = 1, int pageSize = 10)
    {
      if (pageNumber < 1 || pageSize < 1)
      {
        return BadRequest(new { Message = "Invalid pagination parameters." });
      }

      var totalRequests = await _db.Requests.CountAsync();

      var requests = await _db.Requests
          .Include(r => r.Korisnik)
          .Include(r => r.Category)
          .OrderByDescending(r => r.DateCreated) // Opcionalno sortiranje najnovijih zahtjeva
          .Skip((pageNumber - 1) * pageSize) // Preskačemo prethodne stranice
          .Take(pageSize) // Uzimamo samo željeni broj rezultata
          .ToListAsync();

      var requestDtos = requests.Select(r => new
      {
        RequestId = r.RequestId,
        UserId = r.UserId,
        Username = r.Korisnik != null ? r.Korisnik.Username : "Unknown User",
        ProfilePhotoUrl = !string.IsNullOrEmpty(r.Korisnik?.ProfilePhotoFileName)
              ? $"{Request.Scheme}://{Request.Host}/profilePhotos/{r.Korisnik.ProfilePhotoFileName}"
              : $"{Request.Scheme}://{Request.Host}/assets/default-user.png",
        ServiceName = r.ServiceName,
        CategoryId = r.CategoryId,
        CategoryName = r.Category?.CategoryName ?? "Unknown Category",
        Description = r.Description,
        ImageUrl = r.ImageUrl,
        Status = r.Status.ToString(),
        DateCreated = r.DateCreated,
        FormattedDate = r.DateCreated.ToString("f", CultureInfo.CurrentCulture)
      }).ToList();

      return Ok(new
      {
        TotalRequests = totalRequests,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalPages = (int)Math.Ceiling((double)totalRequests / pageSize),
        Data = requestDtos
      });
    }



    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetRequestById(int id)
    {
      var request = await _db.Requests
          .Include(r => r.Category)  
          .FirstOrDefaultAsync(r => r.RequestId == id);

      if (request == null)
      {
        return NotFound(new { Message = "Request not found" });
      }

      var requestDto = new RequestDto
      {
        RequestId = request.RequestId,
        UserId = request.UserId,
        ServiceName = request.ServiceName,
        CategoryId = request.CategoryId,
        CategoryName = request.Category.CategoryName, 
        Description = request.Description,
        ImageUrl = request.ImageUrl,
        Status = request.Status.ToString(),
        DateCreated = request.DateCreated
      };

      return Ok(requestDto);
    }


    [HttpGet("filter")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetFilteredRequests(
    [FromQuery] string filter,
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10)
    {
      if (pageNumber < 1 || pageSize < 1)
        return BadRequest(new { Message = "Invalid pagination parameters." });

      var query = _db.Requests
          .Include(r => r.Korisnik)
          .Include(r => r.Category)
          .AsQueryable();

      if (filter == "Unread")
      {
        query = query.Where(r => r.Status == RequestStatus.Unread);
      }
      else if (filter == "Read")
      {
        query = query.Where(r => r.Status != RequestStatus.Unread);
      }
      else if (filter != "All")
      {
        return BadRequest(new { Message = "Invalid filter value" });
      }

      var totalRequests = await query.CountAsync();

      var requests = await query
          .OrderByDescending(r => r.DateCreated)
          .Skip((pageNumber - 1) * pageSize)
          .Take(pageSize)
          .ToListAsync();

      var requestDtos = requests.Select(r => new
      {
        RequestId = r.RequestId,
        Username = r.Korisnik != null ? r.Korisnik.Username : "Unknown User",
        ProfilePhotoUrl = !string.IsNullOrEmpty(r.Korisnik?.ProfilePhotoFileName)
                ? $"{Request.Scheme}://{Request.Host}/profilePhotos/{r.Korisnik.ProfilePhotoFileName}"
                : $"{Request.Scheme}://{Request.Host}/assets/default-user.png",
        ServiceName = r.ServiceName,
        CategoryName = r.Category?.CategoryName ?? "Unknown Category",
        Description = r.Description,
        ImageUrl = r.ImageUrl,
        Status = r.Status.ToString(),
        FormattedDate = r.DateCreated.ToString("f", CultureInfo.CurrentCulture),
        DateCreated = r.DateCreated
      }).ToList();

      return Ok(new
      {
        TotalRequests = totalRequests,
        PageNumber = pageNumber,
        PageSize = pageSize,
        TotalPages = (int)Math.Ceiling(totalRequests / (double)pageSize),
        Data = requestDtos
      });
    }


    //konvertovanje neprocitanogu u procitano :
    [HttpPut("update-status/{requestId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRequestStatus(int requestId, [FromBody] string newStatus)
    {
      var request = await _db.Requests.FindAsync(requestId);

      if (request == null)
      {
        return NotFound(new { Message = "Request not found" });
      }


      if (!Enum.TryParse<RequestStatus>(newStatus, true, out var parsedStatus))
      {
        return BadRequest(new { Message = $"Invalid status value: {newStatus}" });
      }

      request.Status = parsedStatus;
      await _db.SaveChangesAsync();

      return Ok(new { Message = "Request status updated successfully!", UpdatedStatus = request.Status });
    }



  }
}

