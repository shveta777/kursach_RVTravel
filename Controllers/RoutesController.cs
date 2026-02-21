using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kursach_RvTravelll.Data;
using RouteModel = Kursach_RvTravelll.Models.Route;

namespace Kursach_RVTravelll.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RoutesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoutes()
    {
        var routes = await _context.Routes.Include(r => r.User).ToListAsync();
        return Ok(routes);
    }

    [HttpGet("public")]
    public async Task<IActionResult> GetPublicRoutes()
    {
        var routes = await _context.Routes
            .Where(r => r.IsPublic)
            .Include(r => r.User)
            .ToListAsync();
        return Ok(routes);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoute([FromBody] RouteModel route)
    {
        _context.Routes.Add(route);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRoutes), new { id = route.RouteId }, route);
    }
}