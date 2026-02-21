using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kursach_RvTravelll.Models;

public class RoutePoint
{
    [Key]
    public int PointId { get; set; }

    public int RouteId { get; set; }

    public int Sequence { get; set; }

    [Required]
    [Column(TypeName = "decimal(9,6)")]
    public decimal Latitude { get; set; }

    [Required]
    [Column(TypeName = "decimal(9,6)")]
    public decimal Longitude { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    public bool IsStopover { get; set; }

    public Route Route { get; set; } = null!;
}