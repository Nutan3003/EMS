using EmployeeManagement.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EmployeeManagement.Api.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    )
);

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is missing.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT issuer is missing.");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT audience is missing.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
 {
     Console.WriteLine(
         "JWT AUTHENTICATION FAILED: " +
         context.Exception.GetType().Name + " - " +
         context.Exception.Message);

     return Task.CompletedTask;
 },
            OnTokenValidated = async context =>
            {
                Console.WriteLine("JWT: TokenValidated event reached.");
                Console.WriteLine("JWT DEBUG: Authentication event is running.");

                var tokenId = context.Principal?
    .FindFirst("jti")?.Value;

                Console.WriteLine($"JWT: jti present = {!string.IsNullOrWhiteSpace(tokenId)}");

                var expiresAt = context.SecurityToken.ValidTo;

                if (string.IsNullOrWhiteSpace(tokenId) ||
                    expiresAt == DateTime.MinValue)
                {
                    Console.WriteLine("JWT: Missing jti or expiration.");
                    context.Fail("Token is missing required claims.");
                    return;
                }

                var tokenUsage = context.HttpContext.RequestServices
                    .GetRequiredService<TokenUsageService>();

                var consumed = await tokenUsage.TryConsumeAsync(
                    tokenId,
                    DateTime.SpecifyKind(expiresAt, DateTimeKind.Utc),
                    context.HttpContext.RequestAborted);

                Console.WriteLine($"JWT: Token consumed = {consumed}");

                if (!consumed)
                {
                    Console.WriteLine("JWT: Token consumption rejected.");
                    context.Fail("This access token has already been used.");
                }
            }
        };
    });

builder.Services.AddScoped<TokenUsageService>();
var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("ReactApp");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

