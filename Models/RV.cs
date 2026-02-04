using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Kursach_RvTravelll.Models;  // Исправлено: три 'l'

namespace Kursach_RvTravelll;  // Исправлено: три 'l'

public class RV
{
    public int RvId { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;  // Добавлено значение по умолчанию

    [MaxLength(100)]
    public string? Brand { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    public int? Year { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Length { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Height { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Width { get; set; }

    public int? Weight { get; set; }

    [MaxLength(20)]
    public string? FuelType { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}