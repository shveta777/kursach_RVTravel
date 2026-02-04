using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Kursach_RvTravelll.Models;  // Исправлено: три 'l'

public class User
{
    public int UserId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;

    public ICollection<RV> RVs { get; set; } = new List<RV>();
    public ICollection<Route> Routes { get; set; } = new List<Route>();  // Исправлено: ICollection
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<POI> AddedPOIs { get; set; } = new List<POI>();
}