using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
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
        var totalIncome = await _context.Incomes.SumAsync(x => (decimal?)x.Amount) ?? 0;
        var totalExpense = await _context.Expenses.SumAsync(x => (decimal?)x.Amount) ?? 0;

        var balance = totalIncome - totalExpense;

        return Ok(new
        {
            totalIncome,
            totalExpense,
            balance
        });
    }

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlySummary()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfNextMonth = startOfMonth.AddMonths(1);

        var totalIncome = await _context.Incomes
            .Where(x => x.Date >= startOfMonth && x.Date < startOfNextMonth)
            .SumAsync(x => (decimal?)x.Amount) ?? 0;

        var totalExpense = await _context.Expenses
            .Where(x => x.Date >= startOfMonth && x.Date < startOfNextMonth)
            .SumAsync(x => (decimal?)x.Amount) ?? 0;

        var balance = totalIncome - totalExpense;

        return Ok(new
        {
            year = now.Year,
            month = now.Month,
            totalIncome,
            totalExpense,
            balance
        });
    }
}
