using Microsoft.EntityFrameworkCore;
using Kursach_RvTravelll.Models;

// Псевдонимы для разрешения конфликтов имён
using RouteModel = Kursach_RvTravelll.Models.Route;

namespace Kursach_RvTravelll.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options) 
    { 
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RV> RVs => Set<RV>();
    public DbSet<RouteModel> Routes => Set<RouteModel>();
    public DbSet<RoutePoint> RoutePoints => Set<RoutePoint>();
    public DbSet<POI> POIs => Set<POI>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User - Email unique
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // RV - Foreign Key
        modelBuilder.Entity<RV>()
            .HasOne(r => r.User)
            .WithMany(u => u.RVs)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Route - Foreign Key + Index
        modelBuilder.Entity<RouteModel>()
            .HasOne(r => r.User)
            .WithMany(u => u.Routes)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RouteModel>()
            .HasIndex(r => r.IsPublic);

        // RoutePoint - Foreign Key + Unique Sequence
        modelBuilder.Entity<RoutePoint>()
            .HasOne(p => p.Route)
            .WithMany(r => r.RoutePoints)
            .HasForeignKey(p => p.RouteId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RoutePoint>()
            .HasIndex(p => new { p.RouteId, p.Sequence })
            .IsUnique();

        // POI - Foreign Key + Indexes
        modelBuilder.Entity<POI>()
            .HasOne(p => p.AddedByUser)
            .WithMany(u => u.AddedPOIs)
            .HasForeignKey(p => p.AddedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<POI>()
            .HasIndex(p => p.Type);

        modelBuilder.Entity<POI>()
            .HasIndex(p => new { p.Latitude, p.Longitude });

        // Review - Foreign Keys + Unique
        modelBuilder.Entity<Review>()
            .HasOne(r => r.POI)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.PoiId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.PoiId, r.UserId })
            .IsUnique();
    }
}