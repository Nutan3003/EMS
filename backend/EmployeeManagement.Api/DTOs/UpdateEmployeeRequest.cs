
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Api.DTOs
{
    public class UpdateEmployeeRequest
    {
        [Required]
        [StringLength(50)]
        public string LoginName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^[0-9]{10}$",
            ErrorMessage = "Mobile number must contain exactly 10 digits.")]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string EmailAddress { get; set; } = string.Empty;

        public string? Department { get; set; }

        public string? Designation { get; set; }

        public string? Status { get; set; } = "Active";

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Country { get; set; }

        public string? Skills { get; set; }
    }
}
