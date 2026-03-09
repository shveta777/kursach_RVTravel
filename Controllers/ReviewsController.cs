using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kursach_RvTravelll.Data;
using Kursach_RvTravelll.Models;

namespace Kursach_RVTravelll.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReviewsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Получить отзывы для конкретной POI
    [HttpGet("poi/{poiId}")]
    public async Task<IActionResult> GetReviewsForPOI(int poiId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.PoiId == poiId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.ReviewId,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                UserName = r.User.FirstName + " " + r.User.LastName
            })
            .ToListAsync();

        return Ok(reviews);
    }

    // Добавить отзыв (только авторизованные)
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userIdClaim = User.FindFirst("userId")?.Value 
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "Не авторизован" });
        }

        // Проверяем, не оставлял ли уже отзыв
        var existing = await _context.Reviews
            .FirstOrDefaultAsync(r => r.PoiId == request.PoiId && r.UserId == userId);
        
        if (existing != null)
        {
            return BadRequest(new { message = "Вы уже оставляли отзыв" });
        }

        var review = new Review
        {
            PoiId = request.PoiId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { 
            review.ReviewId, 
            review.Rating, 
            review.Comment,
            review.CreatedAt,
            message = "Отзыв добавлен" 
        });
    }

    // Удалить свой отзыв
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var userIdClaim = User.FindFirst("userId")?.Value 
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized();
        }

        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();
        
        if (review.UserId != userId)
        {
            return Forbid();
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateReviewRequest
{
    public int PoiId { get; set; }
    public int Rating { get; set; } // 1-5
    public string? Comment { get; set; }
}