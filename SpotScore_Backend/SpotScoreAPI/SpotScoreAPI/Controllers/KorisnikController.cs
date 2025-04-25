using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SpotScoreAPI.Context;
using SpotScoreAPI.Helpers;
using SpotScoreAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace SpotScoreAPI.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class KorisnikController : ControllerBase
	{
        private readonly AppDbContext _db;
        private readonly UserHelperService _userHelper;
    private readonly IConfiguration _configuration;
    public KorisnikController(AppDbContext db, UserHelperService userHelper, IConfiguration configuration)
        {
            _db = db;
            _userHelper = userHelper;
            _configuration = configuration;
        }


        //Login
        [HttpPost("Login")]
        public async Task<IActionResult> Authenticate([FromBody] Korisnik korisnikObj)
        {
            if(korisnikObj == null)
            {
                return BadRequest();
            }

            var korisnik = await _db.Korisnici.FirstOrDefaultAsync(x => x.Username == korisnikObj.Username);

            if(korisnik == null)
                return NotFound(new {Message = "User not found!"});

            if(!PasswordHasher.VerifyPassword(korisnikObj.Password, korisnik.Password))
            {
                return BadRequest(new { Message = "Wrong password!" });
            }

            korisnik.Token = CreateJwt(korisnik);

            return Ok(new 
            {   
                Id = korisnik.Id,
                Token = korisnik.Token,
                Message = "Login successful!"
			});


        }

        //Register
        [HttpPost("Register")]
        public async Task<IActionResult> RegisterUser([FromBody] Korisnik korisnikObj)
        {
            if (korisnikObj == null)
                return BadRequest();

            //Check username
            if(await CheckUsernameAsync(korisnikObj.Username))
            {
                return BadRequest(new { Message = "Username already exists!" });
            }


			//Check email
			if (await CheckEmailAsync(korisnikObj.Email))
			{
				return BadRequest(new { Message = "User with that email already exists!" });
			}



            //Check password
            var pass = CheckPasswordStrength(korisnikObj.Password);
            if (!string.IsNullOrEmpty(pass))
                return BadRequest(new { Message = pass.ToString() });


			korisnikObj.Password = PasswordHasher.HashedPassword(korisnikObj.Password);
            korisnikObj.Token = "";
            korisnikObj.Role = korisnikObj.Role.IsNullOrEmpty() ? "User" : korisnikObj.Role;
            await _db.Korisnici.AddAsync(korisnikObj);
            await _db.SaveChangesAsync();
            return Ok(new { Message = "Registration successful!" });
        }

		private string CheckPasswordStrength(string password)
		{
            StringBuilder sb = new StringBuilder();
            if(password.Length < 8)
                sb.Append("Password has to be 8 or more characters."+Environment.NewLine);
            if (!(Regex.IsMatch(password, "[a-z]") && Regex.IsMatch(password, "[A-Z]") && Regex.IsMatch(password, "[0-9]")))
                sb.Append("Password should contain a mix of upper case and lower case letters and numbers."+Environment.NewLine);

            return sb.ToString();

		}

		private async Task<bool> CheckUsernameAsync(string username)
        {
            return await _db.Korisnici.AnyAsync(x => x.Username == username);
        }

		private async Task<bool> CheckEmailAsync(string email)
		{
			return await _db.Korisnici.AnyAsync(x => x.Email == email);
		}

    private string CreateJwt(Korisnik korisnik)
    {
      var jwtHandler = new JwtSecurityTokenHandler();
      var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]);

      var claims = new List<Claim>
    {
        new Claim("UserId", korisnik.Id.ToString()),
        new Claim(ClaimTypes.Role, korisnik.Role),
        new Claim(ClaimTypes.Name, $"{korisnik.FirstName} {korisnik.LastName}"),

    };

      var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:TokenExpirationInMinutes"])),
        Issuer = _configuration["JwtSettings:Issuer"],
        Audience = _configuration["JwtSettings:Audience"],
        SigningCredentials = credentials
      };

      var token = jwtHandler.CreateToken(tokenDescriptor);
      var writtenToken = jwtHandler.WriteToken(token);

      Console.WriteLine("Generated Token: " + writtenToken); // Debugging log

      return writtenToken;
    }


    [Authorize]
        [HttpGet("GetAllUsers")]
        public async Task<ActionResult<Korisnik>> GetAllUsers()
        {
            return Ok(await _db.Korisnici.ToListAsync());
        }

    [Authorize]
    [HttpGet("GetUserProfile")]
    public async Task<IActionResult> GetUserProfile()
    {
      Console.WriteLine("Entering GetUserProfile method.");
      var userId = _userHelper.GetUserIdFromToken(User);
      if (userId == null)
      {
        Console.WriteLine("UserId is null. Token might be invalid.");
        return Unauthorized();
      }

      Console.WriteLine($"UserId from token: {userId}");
      var korisnik = await _db.Korisnici.FindAsync(userId);
      if (korisnik == null)
      {
        Console.WriteLine($"User with ID {userId} not found in database.");
        return NotFound(new { Message = "User not found!" });
      }

      Console.WriteLine($"User with ID {userId} found: {korisnik.Username}");
      return Ok(korisnik);
    }


    // omoguci postavljanje slike na Dashboard -> Profile sekciji 
    [Authorize]
    [HttpPost("UploadProfilePhoto")]
    public async Task<IActionResult> UploadProfilePhoto([FromForm] IFormFile profilePhoto)
    {
      var userId = _userHelper.GetUserIdFromToken(User);
      if (userId == null)
        return Unauthorized();

      var user = await _db.Korisnici.FindAsync(userId);
      if (user == null)
        return NotFound(new { Message = "User not found!" });

      if (profilePhoto == null || profilePhoto.Length == 0)
        return BadRequest(new { Message = "Invalid file." });

      var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
      var extension = Path.GetExtension(profilePhoto.FileName).ToLower();
      if (!allowedExtensions.Contains(extension))
        return BadRequest(new { Message = "Only .jpg, .jpeg, and .png files are allowed." });

      if (profilePhoto.Length > 5 * 1024 * 1024) // 5 MB limit
        return BadRequest(new { Message = "File size exceeds the limit of 5MB." });

      var fileName = $"{Guid.NewGuid()}{extension}";
      var directory = Path.Combine("wwwroot", "profilePhotos");
      if (!Directory.Exists(directory))
        Directory.CreateDirectory(directory);

      var filePath = Path.Combine(directory, fileName);
      using (var stream = new FileStream(filePath, FileMode.Create))
      {
        await profilePhoto.CopyToAsync(stream);
      }

      user.ProfilePhotoFileName = fileName;
      _db.Korisnici.Update(user);
      await _db.SaveChangesAsync();

      return Ok(new { Message = "Profile photo uploaded successfully!", PhotoUrl = $"/profilePhotos/{fileName}" });
    }

    // omoguci dohvatanje slike za prikaz na Dashboard -> profile sekciji
    [Authorize]
    [HttpGet("GetProfilePhoto")]
    public IActionResult GetProfilePhoto([FromQuery] int id)
    {
      var user = _db.Korisnici.Find(id);
      if (user == null)
        return NotFound(new { Message = "User not found!" });

      if (string.IsNullOrEmpty(user.ProfilePhotoFileName))
      {
        // Ako korisnik nema postavljenu sliku, vrati podrazumijevanu
        var defaultPhotoPath = Path.Combine("wwwroot", "profilePhotos", "default.png");
        if (System.IO.File.Exists(defaultPhotoPath))
        {
          var defaultPhotoBytes = System.IO.File.ReadAllBytes(defaultPhotoPath);
          return File(defaultPhotoBytes, "image/png");
        }
        return NotFound(new { Message = "Default photo not found!" });
      }

      var filePath = Path.Combine("wwwroot", "profilePhotos", user.ProfilePhotoFileName);
      if (!System.IO.File.Exists(filePath))
        return NotFound(new { Message = "Profile photo not found on the server!" });

      var fileBytes = System.IO.File.ReadAllBytes(filePath);
      return File(fileBytes, "image/jpeg");
    }


   


  }
}
