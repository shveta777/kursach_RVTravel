using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace Kursach_RvTravelll.Models;

public class Route
{
    [Key]
    public int RouteId { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsPublic { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<RoutePoint> RoutePoints { get; set; } = new List<RoutePoint>();
}