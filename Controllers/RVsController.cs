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
        var rvs = await _context.RVs.ToListAsync();
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
}