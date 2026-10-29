
namespace EmployeeManagement.Api.Models
{
    public class UsedToken
    {
        public string TokenId { get; set; } = string.Empty;

        public DateTime ExpiresAtUtc { get; set; }

        public DateTime ConsumedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
