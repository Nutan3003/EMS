
using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace EmployeeManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmployeesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateEmployee(
            [FromBody] CreateEmployeeRequest request)
        {
            // Check duplicate login name
            bool loginExists = await _context.Employees
                .AnyAsync(e => e.LoginName == request.LoginName);

            if (loginExists)
            {
                return Conflict(new
                {
                    message = "Login name already exists."
                });
            }

            // Check duplicate email
            bool emailExists = await _context.Employees
                .AnyAsync(e => e.EmailAddress == request.EmailAddress);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Email address already exists."
                });
            }

            // Validate status
            if (request.Status != "Active" &&
                request.Status != "Inactive")
            {
                return BadRequest(new
                {
                    message = "Status must be Active or Inactive."
                });
            }

            // Hash the password before storing it
            string passwordHash =
                BCrypt.Net.BCrypt.HashPassword(request.Password);

            var employee = new Employee
            {
                LoginName = request.LoginName.Trim(),
                PasswordHash = passwordHash,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                MobileNumber = request.MobileNumber.Trim(),
                EmailAddress = request.EmailAddress.Trim(),
                Department = request.Department.Trim(),
                Designation = request.Designation.Trim(),
                Status = request.Status,
                City = request.City.Trim(),
                State = request.State.Trim(),
                Country = request.Country.Trim(),
                Skills = request.Skills.Trim()
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            // Never return the password or its hash
            return Created(
                $"/api/employees/{employee.Id}",
                new
                {
                    employee.Id,
                    employee.LoginName,
                    employee.FirstName,
                    employee.LastName,
                    employee.MobileNumber,
                    employee.EmailAddress,
                    employee.Department,
                    employee.Designation,
                    employee.Status,
                    employee.City,
                    employee.State,
                    employee.Country,
                    employee.Skills
                });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _context.Employees
                .AsNoTracking()
                .OrderBy(e => e.Id)
                .Select(e => new
                {
                    e.Id,
                    e.LoginName,
                    e.FirstName,
                    e.LastName,
                    e.MobileNumber,
                    e.EmailAddress,
                    e.Department,
                    e.Designation,
                    e.Status,
                    e.City,
                    e.State,
                    e.Country,
                    e.Skills
                })
                .ToListAsync();

            return Ok(employees);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetEmployeeById(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = "Employee ID must be greater than zero."
                });
            }

            var employee = await _context.Employees
                .AsNoTracking()
                .Where(e => e.Id == id)
                .Select(e => new
                {
                    e.Id,
                    e.LoginName,
                    e.FirstName,
                    e.LastName,
                    e.MobileNumber,
                    e.EmailAddress,
                    e.Department,
                    e.Designation,
                    e.Status,
                    e.City,
                    e.State,
                    e.Country,
                    e.Skills
                })
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return NotFound(new
                {
                    message = $"Employee with ID {id} was not found."
                });
            }

            return Ok(employee);
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateEmployee(
            int id,
            [FromBody] UpdateEmployeeRequest request)
        {
            if (id <= 0)
            {
                return BadRequest(new
                {
                    message = "Employee ID must be greater than zero."
                });
            }

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
            {
                return NotFound(new
                {
                    message = $"Employee with ID {id} was not found."
                });
            }

            var loginName = request.LoginName.Trim();
            var email = request.EmailAddress.Trim();

            bool loginExists = await _context.Employees
                .AnyAsync(e => e.Id != id && e.LoginName == loginName);

            if (loginExists)
            {
                return Conflict(new
                {
                    message = "Login name already exists."
                });
            }

            bool emailExists = await _context.Employees
                .AnyAsync(e => e.Id != id && e.EmailAddress == email);

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Email address already exists."
                });
            }

            if (request.Status != "Active" &&
                request.Status != "Inactive")
            {
                return BadRequest(new
                {
                    message = "Status must be Active or Inactive."
                });
            }

            employee.LoginName = loginName;
            employee.FirstName = request.FirstName.Trim();
            employee.LastName = request.LastName.Trim();
            employee.MobileNumber = request.MobileNumber.Trim();
            employee.EmailAddress = email;
            employee.Department = request.Department.Trim();
            employee.Designation = request.Designation.Trim();
            employee.Status = request.Status;
            employee.City = request.City.Trim();
            employee.State = request.State.Trim();
            employee.Country = request.Country.Trim();
            employee.Skills = request.Skills.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Employee updated successfully.",
                employee.Id,
                employee.LoginName,
                employee.FirstName,
                employee.LastName,
                employee.MobileNumber,
                employee.EmailAddress,
                employee.Department,
                employee.Designation,
                employee.Status,
                employee.City,
                employee.State,
                employee.Country,
                employee.Skills
            });
        }

        
[HttpDelete("{id:int}")]
public async Task<IActionResult> DeleteEmployee(int id)
{
    if (id <= 0)
    {
        return BadRequest(new
        {
            message = "Employee ID must be greater than zero."
        });
    }

    var employee = await _context.Employees
        .FirstOrDefaultAsync(e => e.Id == id);

    if (employee == null)
    {
        return NotFound(new
        {
            message = $"Employee with ID {id} was not found."
        });
    }

    _context.Employees.Remove(employee);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Employee deleted successfully.",
        employeeId = id
    });
}



    }



}
