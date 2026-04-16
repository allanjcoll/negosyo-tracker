using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalSales = await _context.Incomes.SumAsync(x => (decimal?)x.Amount) ?? 0;
        var totalExpense = await _context.Expenses.SumAsync(x => (decimal?)x.Amount) ?? 0;
        var balance = totalSales - totalExpense;

        var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");
        var today = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz).Date;

        var todaySales = await _context.Incomes
            .Where(x => TimeZoneInfo.ConvertTimeFromUtc(x.Date, tz).Date == today)
            .SumAsync(x => (decimal?)x.Amount) ?? 0;

        var todayExpenses = await _context.Expenses
            .Where(x => x.Date.Date == today)
            .SumAsync(x => (decimal?)x.Amount) ?? 0;

        var todayProfit = todaySales - todayExpenses;

        return Ok(new
        {
            totalSales,
            totalExpense,
            balance,
            todaySales,
            todayExpenses,
            todayProfit
        });
    }
}
