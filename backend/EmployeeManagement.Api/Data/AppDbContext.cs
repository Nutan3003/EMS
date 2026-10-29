
using EmployeeManagement.Api.Models;
using Microsoft.EntityFrameworkCore;


namespace EmployeeManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<UsedToken> UsedTokens { get; set; }

       protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Employee>(entity =>
    {
        entity.HasKey(e => e.Id);

        entity.Property(e => e.LoginName).HasMaxLength(50).IsRequired();
        entity.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
        entity.Property(e => e.LastName).HasMaxLength(50).IsRequired();
        entity.Property(e => e.MobileNumber).HasMaxLength(15).IsRequired();
        entity.Property(e => e.EmailAddress).HasMaxLength(100).IsRequired();
        entity.Property(e => e.Department).HasMaxLength(100).IsRequired();
        entity.Property(e => e.Designation).HasMaxLength(100).IsRequired();
        entity.Property(e => e.Status).HasMaxLength(20).IsRequired();
        entity.Property(e => e.City).HasMaxLength(100).IsRequired();
        entity.Property(e => e.State).HasMaxLength(100).IsRequired();
        entity.Property(e => e.Country).HasMaxLength(100).IsRequired();
        entity.Property(e => e.Skills).HasMaxLength(500).IsRequired();
    });

    modelBuilder.Entity<UsedToken>(entity =>
    {
        entity.HasKey(t => t.TokenId);

        entity.Property(t => t.TokenId)
              .HasMaxLength(100)
              .IsRequired();

        entity.Property(t => t.ExpiresAtUtc).IsRequired();
        entity.Property(t => t.ConsumedAtUtc).IsRequired();
    });
}
    }
}
