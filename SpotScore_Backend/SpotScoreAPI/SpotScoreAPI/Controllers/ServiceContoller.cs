using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpotScoreAPI.Context;
using SpotScoreAPI.Helpers;
using SpotScoreAPI.Models;
using SpotScoreAPI.ViewModels;
using System.Data.SqlTypes;
using System.Globalization;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SpotScoreAPI.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class ServiceContoller : ControllerBase
  {
    private readonly AppDbContext _db;
    private readonly UserHelperService _userHelper;
    public ServiceContoller(AppDbContext db, UserHelperService userHelper)
    {
      this._db = db;
      this._userHelper = userHelper;
    }

 

    [HttpGet("by-category/{categoryId}")]
    public async Task<IActionResult> GetServicesByCategory(int categoryId)
    {
      var services = await _db.Services
                                   .Where(s => s.CategoryId == categoryId)
                                   .Select(s => new
                                   {
                                     s.ServiceID,
                                     s.Name,
                                     s.Description,
                                     s.CategoryId,
                                     s.Picture,
                                     LocationID = s.LocationID,
                                     FormattedDate = s.DateAdded.HasValue
    ? s.DateAdded.Value.ToString("f", CultureInfo.CurrentCulture)
    : "No date available"
,
                                     AverageRating = s.AverageRating,
                                     GenreID = s.GenreID
                                   })
                                   .ToListAsync();

      return Ok(services);
    }


    //metoda za pretragu - search bar (po nazivu usluge - service)
    [HttpGet("search")]
    public async Task<IActionResult> SearchServices(string name)
    {
      if (string.IsNullOrWhiteSpace(name))
      {
        return BadRequest("Search term cannot be empty.");
      }

      var services = await _db.Services
          .Where(s => EF.Functions.Like(s.Name.ToLower(), $"%{name.ToLower()}%"))
          .Select(s => new
          {
            s.ServiceID,
            s.Name,
            s.Description,
            s.CategoryId,
            s.Picture,
            LocationID = s.LocationID,
            FormattedDate = s.DateAdded.HasValue
    ? s.DateAdded.Value.ToString("f", CultureInfo.CurrentCulture)
    : "No date available"
,
            AverageRating = s.AverageRating,
            GenreID = s.GenreID
          })
          .ToListAsync();

      if (services == null || services.Count == 0)
      {
        //return NotFound("There are no results.");
        return Ok(new { message = "There are no results." });
      }

      return Ok(services);
    }

    // click to preview details of  wanted service
    [HttpGet("{id}")]
    public async Task<IActionResult> GetServiceById(int id)
    {
      var service = await _db.Services
          .Where(s => s.ServiceID == id)
          .Select(s => new
          {
            s.ServiceID,
            s.Name,
            s.Description,
            s.Picture,
            s.AverageRating,
            s.CategoryId,
            FormattedDate = s.DateAdded.HasValue
    ? s.DateAdded.Value.ToString("f", CultureInfo.CurrentCulture)
    : "No date available"
,
            Latitude = (double?)s.Location.Latitude,
            Longitude = (double?)s.Location.Longitude,
            Address = s.Location != null ? s.Location.Address : "No Address Provided"
          })
          .FirstOrDefaultAsync();

      if (service == null)
        return NotFound(new { message = "Service not found." });

      return Ok(service);
    }

    private int? GetUserIdFromToken()
    {
      var userIdClaim = User?.Claims.FirstOrDefault(c => c.Type == "UserId");
      return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
    }

    private async Task<bool> HasRated(int serviceId, int userId)
    {
      return await _db.Ratings
                       .AnyAsync(r => r.ServiceId == serviceId && r.UserId == userId);
    }





    [HttpPost("rate")]
    [Authorize]
    public async Task<IActionResult> RateService([FromBody] RatingDto ratingDto)
    {
      if (ratingDto == null || ratingDto.ServiceId <= 0 || ratingDto.RatingValue < 1 || ratingDto.RatingValue > 5)
      {
        return BadRequest("Invalid data. Service ID and Rating Value are required. Rating Value must be between 1 and 5.");
      }

      var userId = GetUserIdFromToken();
      if (userId == null)
      {
        return Unauthorized("User is not authorized.");
      }

      
      var service = await _db.Services
          .FirstOrDefaultAsync(s => s.ServiceID == ratingDto.ServiceId);

      if (service == null)
      {
        return NotFound(new { message = "Service not found." });
      }

      
      var hasRated = await _db.Ratings
          .AnyAsync(r => r.ServiceId == ratingDto.ServiceId && r.UserId == userId);

      if (hasRated)
      {
        return BadRequest(new { message = "You have already rated this service." });
      }

     
      var newRating = new Rating
      {
        ServiceId = ratingDto.ServiceId,
        UserId = userId.Value,
        RatingValue = ratingDto.RatingValue
      };

      await _db.Ratings.AddAsync(newRating);


      service.RatingCount += 1;
      service.AverageRating = ((service.AverageRating * (service.RatingCount - 1)) + ratingDto.RatingValue) / service.RatingCount;

      _db.Services.Update(service);

      await _db.SaveChangesAsync();

      return Ok(new
      {
        message = "Thank you for your rating.",
        serviceId = service.ServiceID,
        newAverageRating = service.AverageRating,
        totalRatings = service.RatingCount
      });
    }

    // radio button filter za "Best"
    [HttpGet("best/{categoryId}")]
    public async Task<IActionResult> GetBestServicesByCategory(int categoryId)
    {
      var bestServices = await _db.Services
          .Where(s => s.CategoryId == categoryId && s.AverageRating > 4)
          .OrderByDescending(s => s.AverageRating)
          .Select(s => new
          {
            s.ServiceID,
            s.Name,
            s.Description,
            s.Picture,
            s.AverageRating,
            s.RatingCount,
            FormattedDate = s.DateAdded.HasValue
    ? s.DateAdded.Value.ToString("f", CultureInfo.CurrentCulture)
    : "No date available"

          })
          .ToListAsync();

      return Ok(bestServices);
    }

    // metoda za uslugu koja je najvise puta ocijenjena (RatingCount -> Services)
    [HttpGet("popular/{categoryId}")]
    public async Task<IActionResult> GetPopularServices(int categoryId)
    {
      var popularServices = await _db.Services
          .Where(s => s.CategoryId == categoryId)
          .OrderByDescending(s => s.RatingCount)
          .Take(10) 
          .Select(s => new
          {
            s.ServiceID,
            s.Name,
            s.Description,
            s.Picture,
            s.AverageRating,
            s.RatingCount,
            FormattedDate = s.DateAdded.HasValue
    ? s.DateAdded.Value.ToString("f", CultureInfo.CurrentCulture)
    : "No date available"

          })
          .ToListAsync();

      return Ok(popularServices);
    }


    //api za dodavanje nove drzave, ukoliko ne postoji u bazi :)
    [HttpPost("add-state")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddState([FromBody] State newState)
    {
      if (string.IsNullOrWhiteSpace(newState.StateName))
      {
        return BadRequest(new { message = "State name is required." });
      }

      var existingState = await _db.States.FirstOrDefaultAsync(s => s.StateName == newState.StateName);
      if (existingState != null)
      {
        return Conflict(new { message = "State already exists." });
      }

      await _db.States.AddAsync(newState);
      await _db.SaveChangesAsync();

      return Ok(new { message = "State added successfully!", stateId = newState.StateID });
    }



    [HttpGet("get-states")]
    public async Task<IActionResult> GetStates()
    {
      var states = await _db.States
          .Select(s => new { s.StateID, s.StateName })
          .ToListAsync();

      return Ok(states);
    }


    [HttpPost("add-city")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddCity([FromBody] NewCityDto cityDto)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var existingCity = await _db.Cities
          .FirstOrDefaultAsync(c => c.CityName.ToLower() == cityDto.CityName.ToLower() && c.StateID == cityDto.StateID);

      if (existingCity != null)
        return BadRequest(new { message = "This city already exists in the selected state." });

      
      var newCity = new City
      {
        CityName = cityDto.CityName,
        StateID = cityDto.StateID
      };

      await _db.Cities.AddAsync(newCity);
      await _db.SaveChangesAsync();

      return Ok(new { message = "City added successfully!", cityId = newCity.CityID });
    }
    //dohvati gradove
    [HttpGet("get-cities")]
    public async Task<IActionResult> GetCities()
    {
      var cities = await _db.Cities
          .Select(c => new
          {
            CityID = c.CityID,
            CityName = c.CityName,
            StateID = c.StateID
          })
          .ToListAsync();

      return Ok(cities);
    }


    //kreiraj novi zanr :
    [HttpPost("add-genre")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddGenre([FromBody] NewGenreDto genreDto)
    {
      if (string.IsNullOrWhiteSpace(genreDto.GenreName))
        return BadRequest(new { message = "Genre name is required." });

      var existingGenre = await _db.Genres.FirstOrDefaultAsync(g => g.GenreName.ToLower() == genreDto.GenreName.ToLower());

      if (existingGenre != null)
        return BadRequest(new { message = "This genre already exists." });

      var newGenre = new Genre
      {
        GenreName = genreDto.GenreName
      };

      await _db.Genres.AddAsync(newGenre);
      await _db.SaveChangesAsync();

      return Ok(new { message = "Genre added successfully!", genreId = newGenre.GenreID });
    }
    //dohvati sve zanrove iz bazee
    [HttpGet("get-genres")]
    public async Task<IActionResult> GetGenres()
    {
      var genres = await _db.Genres
          .Select(g => new
          {
            g.GenreID,
            g.GenreName
          })
          .ToListAsync();

      return Ok(genres);
    }


    //admin dodaje novu uslugu :
    [HttpPost("add-service")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddService([FromForm] NewServiceDto serviceDto)
    {
      if (string.IsNullOrWhiteSpace(serviceDto.Name) || string.IsNullOrWhiteSpace(serviceDto.Description))
      {
        return BadRequest(new { message = "Service name and description are required." });
      }

      if (serviceDto.CategoryId == 0)
      {
        return BadRequest(new { message = "Category is required." });
      }

      if (serviceDto.ImageFile == null || serviceDto.ImageFile.Length == 0)
      {
        return BadRequest(new { message = "Image is required." });
      }

      if ((serviceDto.CategoryId == 2 || serviceDto.CategoryId == 3) && serviceDto.GenreId != null)
      {
        return BadRequest(new { message = "For Hotels and Restaurants, Genre should not be provided." });
      }

      if ((serviceDto.CategoryId == 4 || serviceDto.CategoryId == 1) &&
          (serviceDto.CityId != null || serviceDto.Latitude != null || serviceDto.Longitude != null || !string.IsNullOrWhiteSpace(serviceDto.Address)))
      {
        return BadRequest(new { message = "For Books and Movies, City, Address, Latitude, and Longitude should not be provided." });
      }

      if ((serviceDto.CategoryId == 1 || serviceDto.CategoryId == 4))
      {
        if (serviceDto.GenreId == null || serviceDto.GenreId == 0)
        {
          return BadRequest(new { message = "Valid Genre is required for Movies and Books." });
        }
      }

      if ((serviceDto.CategoryId == 2 || serviceDto.CategoryId == 3))
      {
        if (serviceDto.CityId == null || serviceDto.CityId == 0)
        {
          return BadRequest(new { message = "Valid City is required for Hotels and Restaurants." });
        }
      }

      string imagePath = await SaveImage(serviceDto.ImageFile);

      var newService = new Service
      {
        Name = serviceDto.Name,
        Description = serviceDto.Description,
        CategoryId = serviceDto.CategoryId,
        Picture = imagePath,
        DateAdded = DateTime.UtcNow
      };

      if (serviceDto.CategoryId == 2 || serviceDto.CategoryId == 3)
      {
        if (serviceDto.CityId == null || serviceDto.CityId == 0 ||
            serviceDto.Latitude == null || serviceDto.Longitude == null ||
            string.IsNullOrWhiteSpace(serviceDto.Address))
        {
          return BadRequest(new { message = "For Hotels and Restaurants, City, Address, Latitude, and Longitude are required." });
        }

        var newLocation = new Location
        {
          CityID = serviceDto.CityId.Value,
          Latitude = serviceDto.Latitude.Value,
          Longitude = serviceDto.Longitude.Value,
          Address = serviceDto.Address
        };

        await _db.Locations.AddAsync(newLocation);
        await _db.SaveChangesAsync();

        newService.LocationID = newLocation.LocationID;
        newService.GenreID = 0;
      }
      else if (serviceDto.CategoryId == 4 || serviceDto.CategoryId == 1)
      {
        if (serviceDto.GenreId == null || serviceDto.GenreId == 0)
        {
          return BadRequest(new { message = "For Books and Movies, valid Genre is required." });
        }

        newService.GenreID = serviceDto.GenreId.Value;
        newService.LocationID = 0;
      }
      else
      {
        return BadRequest(new { message = "Invalid category selection." });
      }

      await _db.Services.AddAsync(newService);
      await _db.SaveChangesAsync();

      return Ok(new { message = "Service added successfully!", serviceId = newService.ServiceID });
    }


    private async Task<string> SaveImage(IFormFile imageFile)
    {
      var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
      if (!Directory.Exists(uploadsFolder))
      {
        Directory.CreateDirectory(uploadsFolder);
      }

      string uniqueFileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
      string filePath = Path.Combine(uploadsFolder, uniqueFileName);

      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await imageFile.CopyToAsync(stream);
      }

      return $"/images/{uniqueFileName}";
    }




  }
}
