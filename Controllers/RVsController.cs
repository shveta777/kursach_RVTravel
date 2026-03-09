using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kursach_RvTravelll.Data;
using Kursach_RvTravelll.Models;

namespace Kursach_RVTravelll.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RVsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RVsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRVs()
    {
        // Получаем UserId из токена JWT
        var userIdClaim = User.FindFirst("userId")?.Value 
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "Не авторизован" });
        }

        // Показываем только автодомы текущего пользователя
        var rvs = await _context.RVs
            .Where(r => r.UserId == userId)
            .ToListAsync();
    
        return Ok(rvs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRV(int id)
    {
        var rv = await _context.RVs.FindAsync(id);
        if (rv == null) return NotFound();
        return Ok(rv);
    }

    
    [HttpPost]
    public async Task<IActionResult> CreateRV([FromBody] RV rv)
    {
        // Получаем UserId из токена
        var userIdClaim = User.FindFirst("userId")?.Value 
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "Не авторизован" });
        }

        rv.UserId = userId;
        rv.User = null;  
        rv.CreatedAt = DateTime.UtcNow;
    
        _context.RVs.Add(rv);
        await _context.SaveChangesAsync();
    
        return CreatedAtAction(nameof(GetRV), new { id = rv.RvId }, rv);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRV(int id)
    {
        var rv = await _context.RVs.FindAsync(id);
        if (rv == null) return NotFound();
        
        _context.RVs.Remove(rv);
        await _context.SaveChangesAsync();
        return NoContent();
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRV(int id, [FromBody] RV rvData)
    {
        // Получаем UserId из токена
        var userIdClaim = User.FindFirst("userId")?.Value 
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "Не авторизован" });
        }

        var rv = await _context.RVs.FindAsync(id);
        if (rv == null) return NotFound();
    
        // Проверяем, что это RV текущего пользователя
        if (rv.UserId != userId)
        {
            return Forbid();
        }

        // Обновляем поля
        rv.Brand = rvData.Brand;
        rv.Model = rvData.Model;
        rv.Length = rvData.Length;
        rv.Width = rvData.Width;
        rv.Height = rvData.Height;
        rv.Weight = rvData.Weight;
    
        await _context.SaveChangesAsync();
        return Ok(rv);
    }
}
