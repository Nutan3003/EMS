
namespace EmployeeManagement.Api.Models
{
    public class Employee
    {
        public int Id { get; set; }

        public string LoginName { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string MobileNumber { get; set; } = string.Empty;

        public string EmailAddress { get; set; } = string.Empty;

        public string Department { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string Status { get; set; } = "Active";

        public string City { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string Skills { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;



        

    }
}
