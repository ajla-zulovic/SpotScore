using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SpotScoreAPI.Context;
using SpotScoreAPI.Helpers;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.FileProviders;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.WebHost.ConfigureKestrel(options =>
{
  options.Limits.MaxRequestHeadersTotalSize = 16384; // Maksimalna veličina header-a (16KB)
  options.Limits.MaxRequestBodySize = 52428800; // Maksimalna veličina tela zahteva (50MB, dovoljno za slike)
  options.Limits.MaxRequestLineSize = 8192; // Maksimalna veličina prve linije zahteva (po potrebi)
});


builder.Services.AddControllers().AddJsonOptions(options =>
{
  options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

builder.Services.AddSwaggerGen(c =>
{
  c.SwaggerDoc("v1", new OpenApiInfo { Title = "SpotScore API", Version = "v1" });

  // Dodavanje JWT autentifikacije u Swagger
  c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
  {
    Name = "Authorization",
    Type = SecuritySchemeType.Http,
    Scheme = "Bearer",
    BearerFormat = "JWT",
    In = ParameterLocation.Header,
    Description = "Unesi 'Bearer' [razmak] i tvoj JWT token. Na primer: 'Bearer eyJhbGciOiJIUzI1Ni...'",
    
  });

  // Dodavanje pravila za autentifikaciju
  c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddScoped<UserHelperService>();

builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowAll", builder =>
  {
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
  });
});





var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddDbContext<AppDbContext>(option => option.UseSqlServer(builder.Configuration.GetConnectionString("db1")));
builder.Services.AddAuthentication(x =>
{
	x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x =>
{
  //	x.RequireHttpsMetadata = true;
  //	x.SaveToken = true;
  //	x.TokenValidationParameters = new TokenValidationParameters
  //	{
  //		ValidateIssuerSigningKey = true,
  //		IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("spotscoreprojectrs1supersecretkey.....")),
  //		ValidateAudience = false,
  //		ValidateIssuer = false,
  //		ClockSkew = TimeSpan.Zero,
  x.RequireHttpsMetadata = false;
  x.SaveToken = true;
  x.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"])),
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidIssuer = jwtSettings["Issuer"],
    ValidAudience = jwtSettings["Audience"],
    ClockSkew = TimeSpan.Zero,
  };

  x.Events = new JwtBearerEvents
  {
    //OnAuthenticationFailed = context =>
    //{
    //  Console.WriteLine("Authentication failed: " + context.Exception.Message);
    //  return Task.CompletedTask;
    //},
    //OnTokenValidated = context =>
    //{
    //  Console.WriteLine("Token validated successfully!");
    //  return Task.CompletedTask;
    //}
    OnMessageReceived = context =>
    {
      Console.WriteLine($"Authorization Header: {context.Request.Headers["Authorization"]}");
      return Task.CompletedTask;
    },
    OnAuthenticationFailed = context =>
    {
      Console.WriteLine($"Authentication failed: {context.Exception.Message}");
      return Task.CompletedTask;
    },
    OnTokenValidated = context =>
    {
      Console.WriteLine("Token validated successfully!");
      return Task.CompletedTask;
    }
  };
});

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
var supportedCultures = new[]
{
    new CultureInfo("en-US"),
    new CultureInfo("de-DE"),
    new CultureInfo("fr-FR"),
    new CultureInfo("bs-BA")
};

var localizationOptions = new RequestLocalizationOptions
{
  DefaultRequestCulture = new Microsoft.AspNetCore.Localization.RequestCulture("en-US"),
  SupportedCultures = supportedCultures,
  SupportedUICultures = supportedCultures
};

app.UseRequestLocalization(localizationOptions);
app.UseFileServer(new FileServerOptions
{
  FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
  RequestPath = "",
  EnableDirectoryBrowsing = true
});



app.UseStaticFiles(new StaticFileOptions
{
  FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profilePhotos")),
  RequestPath = "/profilePhotos"
});


app.UseStaticFiles(new StaticFileOptions
{
  FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images")),
  RequestPath = "/images"
});



app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
