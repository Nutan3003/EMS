
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Api.DTOs
{
    public class CreateEmployeeRequest
    {
        [Required]
        [NotWhitespace]
        [StringLength(50)]
        public string LoginName { get; set; } = string.Empty;


        [Required(ErrorMessage = "Password is required.")]
        [NotWhitespace]
        [StringLength(100, MinimumLength = 8,
            ErrorMessage = "Password must be between 8 and 100 characters.")]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])\S+$",
            ErrorMessage = "Password must contain uppercase, lowercase, a number, and a special character, with no spaces."
        )]
        public string Password { get; set; } = string.Empty;


        [Required]
        [NotWhitespace]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        [RegularExpression(@"^[0-9]{10}$",
            ErrorMessage = "Mobile number must contain exactly 10 digits.")]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        [EmailAddress]
        [StringLength(100)]
        public string EmailAddress { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        public string Department { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        public string Designation { get; set; } = string.Empty;

        [Required]
        [NotWhitespace] public string Status { get; set; } = "Active";

        [Required]
        [NotWhitespace]
        public string City { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        public string State { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        public string Country { get; set; } = string.Empty;

        [Required]
        [NotWhitespace]
        public string Skills { get; set; } = string.Empty;
    }
}
