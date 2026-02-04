using System;
using System.ComponentModel.DataAnnotations;

namespace Kursach_RvTravelll.Models;  // Исправлено: три 'l'

public class Review
{
    public int ReviewId { get; set; }

    public int PoiId { get; set; }

    public int UserId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public POI POI { get; set; } = null!;
    public User User { get; set; } = null!;
}