
using EmployeeManagement.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MasterDataController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MasterDataController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await _context.Departments
                .OrderBy(d => d.Name)
                .Select(d => new { d.Id, d.Name })
                .ToListAsync();

            return Ok(departments);
        }

        [HttpGet("designations")]
        public async Task<IActionResult> GetDesignations()
        {
            var designations = await _context.Designations
                .OrderBy(d => d.Name)
                .Select(d => new { d.Id, d.Name })
                .ToListAsync();

            return Ok(designations);
        }

        [HttpGet("countries")]
        public async Task<IActionResult> GetCountries()
        {
            var countries = await _context.Countries
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name })
                .ToListAsync();

            return Ok(countries);
        }

        [HttpGet("states")]
        public async Task<IActionResult> GetStates(int countryId)
        {
            var states = await _context.States
                .Where(s => s.CountryId == countryId)
                .OrderBy(s => s.Name)
                .Select(s => new { s.Id, s.Name })
                .ToListAsync();

            return Ok(states);
        }

        [HttpGet("cities")]
        public async Task<IActionResult> GetCities(int stateId)
        {
            var cities = await _context.Cities
                .Where(c => c.StateId == stateId)
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name })
                .ToListAsync();

            return Ok(cities);
        }
    }
}
