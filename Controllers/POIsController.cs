using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kursach_RvTravelll.Data;
using Kursach_RvTravelll.Models;

namespace Kursach_RVTravelll.Controllers;

[ApiController]
[Route("api/[controller]")]
public class POIsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public POIsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPOIs()
    {
        var pois = await _context.POIs.ToListAsync();
        return Ok(pois);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPOI(int id)
    {
        var poi = await _context.POIs.FindAsync(id);
        if (poi == null) return NotFound();
        return Ok(poi);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePOI([FromBody] POI poi)
    {
        poi.CreatedAt = DateTime.UtcNow;
        _context.POIs.Add(poi);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPOI), new { id = poi.PoiId }, poi);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePOI(int id)
    {
        var poi = await _context.POIs.FindAsync(id);
        if (poi == null) return NotFound();
        
        _context.POIs.Remove(poi);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}