using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
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
}
