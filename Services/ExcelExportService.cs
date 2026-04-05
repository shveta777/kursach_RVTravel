using OfficeOpenXml;
using OfficeOpenXml.Style;
using Kursach_RvTravelll.Data;
using Microsoft.EntityFrameworkCore;
using System.Drawing;

namespace Kursach_RVTravelll.Services;

public class ExcelExportService
{
    private readonly ApplicationDbContext _context;

    public ExcelExportService(ApplicationDbContext context)
    {
        _context = context;
        // Для учебных проектов (некоммерческое использование)
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    public async Task<byte[]> GetExcelAsync()
    {
        using var package = new ExcelPackage();
        
        // Получаем данные из БД
        var users = await _context.Users.ToListAsync();
        var rvs = await _context.RVs.Include(r => r.User).ToListAsync();

        // ===== ЛИСТ 1: ПОЛЬЗОВАТЕЛИ =====
        var userSheet = package.Workbook.Worksheets.Add("Пользователи");
        
        string[] userHeaders = { "ID", "Имя", "Фамилия", "Email", "Телефон", "Дата регистрации" };
        
        // Заголовки
        for (int i = 0; i < userHeaders.Length; i++)
        {
            var cell = userSheet.Cells[1, i + 1];
            cell.Value = userHeaders[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(102, 126, 234)); // Синий
            cell.Style.Font.Color.SetColor(Color.White);
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }

        // Данные
        for (int i = 0; i < users.Count; i++)
        {
            var user = users[i];
            userSheet.Cells[i + 2, 1].Value = user.UserId;
            userSheet.Cells[i + 2, 2].Value = user.FirstName;
            userSheet.Cells[i + 2, 3].Value = user.LastName;
            userSheet.Cells[i + 2, 4].Value = user.Email;
            userSheet.Cells[i + 2, 5].Value = user.Phone ?? "-";
            userSheet.Cells[i + 2, 6].Value = user.CreatedAt.ToString("dd.MM.yyyy HH:mm");
            userSheet.Cells[i + 2, 6].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        
        userSheet.Cells.AutoFitColumns();

        // ===== ЛИСТ 2: АВТОДОМА =====
        var rvSheet = package.Workbook.Worksheets.Add("Автодома");
        
        string[] rvHeaders = { "ID", "Марка", "Модель", "Длина (м)", "Ширина (м)", 
                               "Высота (м)", "Вес (кг)", "Владелец", "Дата добавления" };
        
        // Заголовки
        for (int i = 0; i < rvHeaders.Length; i++)
        {
            var cell = rvSheet.Cells[1, i + 1];
            cell.Value = rvHeaders[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(118, 75, 162)); // Фиолетовый
            cell.Style.Font.Color.SetColor(Color.White);
            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }

        // Данные
        for (int i = 0; i < rvs.Count; i++)
        {
            var rv = rvs[i];
            rvSheet.Cells[i + 2, 1].Value = rv.RvId;
            rvSheet.Cells[i + 2, 2].Value = rv.Brand ?? "-";
            rvSheet.Cells[i + 2, 3].Value = rv.Model ?? "-";
            rvSheet.Cells[i + 2, 4].Value = rv.Length;
            rvSheet.Cells[i + 2, 5].Value = rv.Width;
            rvSheet.Cells[i + 2, 6].Value = rv.Height;
            rvSheet.Cells[i + 2, 7].Value = rv.Weight;
            rvSheet.Cells[i + 2, 8].Value = rv.User != null 
                ? $"{rv.User.FirstName} {rv.User.LastName}" 
                : "-";
            rvSheet.Cells[i + 2, 9].Value = rv.CreatedAt.ToString("dd.MM.yyyy");
            
            // Формат чисел
            rvSheet.Cells[i + 2, 4].Style.Numberformat.Format = "0.00";
            rvSheet.Cells[i + 2, 5].Style.Numberformat.Format = "0.00";
            rvSheet.Cells[i + 2, 6].Style.Numberformat.Format = "0.00";
        }
        
        rvSheet.Cells.AutoFitColumns();

        // Добавляем границы для всех ячеек с данными
        var userDataRange = userSheet.Cells[1, 1, users.Count + 1, userHeaders.Length];
        userDataRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
        userDataRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
        userDataRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
        userDataRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;

        var rvDataRange = rvSheet.Cells[1, 1, rvs.Count + 1, rvHeaders.Length];
        rvDataRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
        rvDataRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
        rvDataRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
        rvDataRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;

        return package.GetAsByteArray();
    }
}