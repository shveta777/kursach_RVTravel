using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kursach_RvTravelll.Models;  // Исправлено: три 'l'

public class POI
{
    public int PoiId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "decimal(9,6)")]
    public decimal Latitude { get; set; }

    [Required]
    [Column(TypeName = "decimal(9,6)")]
    public decimal Longitude { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? Website { get; set; }

    public int? AddedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? AddedByUser { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}