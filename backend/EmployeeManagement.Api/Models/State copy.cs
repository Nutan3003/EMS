namespace EmployeeManagement.Api.Models
{
    public class State
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public int CountryId { get; set; }
    }
}