using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.Collections.Generic;

namespace Kursach_RvTravelll.Models;

public class RV
{
    [Key]
    public int RvId { get; set; }

    public int UserId { get; set; }



    [MaxLength(100)]
    public string? Brand { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Length { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Width { get; set; }

    public int? Weight { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? Height { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}