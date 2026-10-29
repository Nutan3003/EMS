
using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Api.DTOs
{
    public class NotWhitespaceAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            return value is string text &&
                   !string.IsNullOrWhiteSpace(text);
        }
    }
}
