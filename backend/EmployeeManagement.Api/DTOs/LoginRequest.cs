
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Api.DTOs
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Login name is required.")]
        [NotWhitespace]
        public string LoginName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;
    }
}
