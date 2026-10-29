
using EmployeeManagement.Api.Data;
using EmployeeManagement.Api.Models;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace EmployeeManagement.Api.Services
{
    public class TokenUsageService
    {
        private readonly AppDbContext _db;

        public TokenUsageService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> TryConsumeAsync(
            string tokenId,
            DateTime expiresAtUtc,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(tokenId))
                return false;

            var usedToken = new UsedToken
            {
                TokenId = tokenId,
                ExpiresAtUtc = DateTime.SpecifyKind(
                    expiresAtUtc, DateTimeKind.Utc),
                ConsumedAtUtc = DateTime.UtcNow
            };

            _db.UsedTokens.Add(usedToken);

            try
            {
                await _db.SaveChangesAsync(cancellationToken);
                return true;
            }
            catch (DbUpdateException ex)
                when (ex.InnerException is MySqlException mysqlEx
                      && mysqlEx.Number == 1062)
            {
                _db.Entry(usedToken).State = EntityState.Detached;
                return false;
            }
        }
    }
}
