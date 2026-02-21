using Microsoft.EntityFrameworkCore;
using Kursach_RvTravelll.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// API контроллеры
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Статические файлы (wwwroot)
app.UseStaticFiles();

app.UseRouting();

// API маршруты
app.MapControllers();

// Главная страница по умолчанию
app.MapFallbackToFile("index.html");

app.Run();