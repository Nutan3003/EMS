
using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EmployeeManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request)
        {
            var loginName = request.LoginName.Trim();

            var employee = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.LoginName == loginName);

            if (employee == null ||
                !BCrypt.Net.BCrypt.Verify(
                    request.Password, employee.PasswordHash))
            {
                return Unauthorized(new
                {
                    message = "Invalid login name or password."
                });
            }

            var key = _configuration["Jwt:Key"]!;
            var issuer = _configuration["Jwt:Issuer"]!;
            var audience = _configuration["Jwt:Audience"]!;
            var expiryMinutes =
                _configuration.GetValue<int>("Jwt:ExpiryMinutes", 15);

            var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    employee.Id.ToString()),

                new Claim(ClaimTypes.Name, employee.LoginName),

                new Claim(
                    JwtRegisteredClaimNames.Jti,
                    Guid.NewGuid().ToString())
            };

            var signingKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key));

            var credentials = new SigningCredentials(
                signingKey,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            var accessToken = new JwtSecurityTokenHandler()
                .WriteToken(token);

            return Ok(new
            {
                message = "Login successful.",
                accessToken,
                tokenType = "Bearer",
                expiresAt,
                employee = new
                {
                    employee.Id,
                    employee.LoginName,
                    employee.FirstName,
                    employee.LastName,
                    employee.EmailAddress
                }
            });
        }
    }
}
