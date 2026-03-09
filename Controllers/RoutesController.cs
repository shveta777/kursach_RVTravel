using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Kursach_RvTravelll.Data;
using Kursach_RvTravelll.Models;
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
        var routes = await _context.Routes
            .Select(r => new
            {
                r.RouteId,
                r.Title,
                r.Description,
                r.CreatedAt,
                r.UserId,
                UserName = r.User.FirstName + " " + r.User.LastName
            })
            .ToListAsync();

        return Ok(routes);
    }


    [HttpGet("public")]
    public async Task<IActionResult> GetPublicRoutes()
    {
        var routes = await _context.Routes
            .Select(r => new
            {
                r.RouteId,
                r.Title,
                r.Description,
                r.CreatedAt,
                r.UserId,
                UserName = r.User.FirstName + " " + r.User.LastName
            })
            .ToListAsync();

        return Ok(routes);
    }


    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetRoute(int id)
    {
        var route = await _context.Routes
            .Where(r => r.RouteId == id)
            .Select(r => new
            {
                r.RouteId,
                r.Title,
                r.Description,
                r.CreatedAt,
                r.UserId,
                UserName = r.User.FirstName + " " + r.User.LastName,
                Points = r.RoutePoints
                    .OrderBy(p => p.Sequence)
                    .Select(p => new
                    {
                        p.PointId,
                        p.Sequence,
                        p.Latitude,
                        p.Longitude,
                        p.Address,
                        p.IsStopover
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (route == null) return NotFound();
        return Ok(route);
    }
}