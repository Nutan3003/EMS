
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
    //Creating access to database tables
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<UsedToken> UsedTokens { get; set; }
        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Designation> Designations => Set<Designation>();
        public DbSet<Country> Countries => Set<Country>();
        public DbSet<State> States => Set<State>();
        public DbSet<City> Cities => Set<City>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Employee configuration
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

            // UsedToken configuration
            modelBuilder.Entity<UsedToken>(entity =>
            {
                entity.HasKey(t => t.TokenId);

                entity.Property(t => t.TokenId)
                      .HasMaxLength(100)
                      .IsRequired();

                entity.Property(t => t.ExpiresAtUtc).IsRequired();
                entity.Property(t => t.ConsumedAtUtc).IsRequired();
            });

            // Department configuration
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).HasMaxLength(100).IsRequired();
                entity.HasIndex(d => d.Name).IsUnique();
            });

            // Designation configuration
            modelBuilder.Entity<Designation>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Name).HasMaxLength(100).IsRequired();
                entity.HasIndex(d => d.Name).IsUnique();
            });

            // Country configuration
            modelBuilder.Entity<Country>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).HasMaxLength(100).IsRequired();
                entity.HasIndex(c => c.Name).IsUnique();
            });

            // State configuration
            modelBuilder.Entity<State>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Name).HasMaxLength(100).IsRequired();

                entity.HasOne<Country>()
                      .WithMany()
                      .HasForeignKey(s => s.CountryId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(s => new { s.Name, s.CountryId }).IsUnique();
            });

            // City configuration
            modelBuilder.Entity<City>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).HasMaxLength(100).IsRequired();

                entity.HasOne<State>()
                      .WithMany()
                      .HasForeignKey(c => c.StateId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(c => new { c.Name, c.StateId }).IsUnique();
            });
        }
    }
}
