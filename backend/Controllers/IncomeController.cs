using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncomeController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public IncomeController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Income>>> GetAll()
    {
        var incomes = await _context.Incomes
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.Id)
            .ToListAsync();

        return Ok(incomes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Income>> GetById(int id)
    {
        var income = await _context.Incomes.FindAsync(id);

        if (income == null)
        {
            return NotFound(new { message = "Sale record not found" });
        }

        return Ok(income);
    }

    [HttpPost]
    public async Task<ActionResult<Income>> Create(Income income)
    {
        income.Amount = income.Quantity * income.UnitPrice;

	if (income.Date == default)
{
    income.Date = DateTime.UtcNow;
}
else
{
 
   income.Date = DateTime.SpecifyKind(income.Date, DateTimeKind.Utc);
}
        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = income.Id }, income);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Income updatedIncome)
    {
        var existingIncome = await _context.Incomes.FindAsync(id);

        if (existingIncome == null)
        {
            return NotFound(new { message = "Sale record not found" });
        }

        existingIncome.Product = updatedIncome.Product;
        existingIncome.Quantity = updatedIncome.Quantity;
        existingIncome.UnitPrice = updatedIncome.UnitPrice;
        existingIncome.Amount = updatedIncome.Quantity * updatedIncome.UnitPrice;
        existingIncome.Date = updatedIncome.Date == default ? existingIncome.Date : updatedIncome.Date;

        await _context.SaveChangesAsync();

        return Ok(existingIncome);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var income = await _context.Incomes.FindAsync(id);

        if (income == null)
        {
            return NotFound(new { message = "Sale record not found" });
        }

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sale record deleted successfully" });
    }
}

