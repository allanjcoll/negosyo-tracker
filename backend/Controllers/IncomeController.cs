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
            .Include(x => x.Customer)
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.Id)
            .ToListAsync();

        return Ok(incomes);
    }



    [HttpPost]
    public async Task<ActionResult<Income>> Create(Income income)
    {
        if (income.CustomerId == null || income.CustomerId <= 0)
        {
            return BadRequest(new { message = "Customer is required." });
        }

        if (income.ProductId == null || income.ProductId <= 0)
        {
            return BadRequest(new { message = "Product is required." });
        }

        if (income.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than 0." });
        }

        if (income.UnitPrice <= 0)
        {
            return BadRequest(new { message = "Unit price must be greater than 0." });
        }

        var product = await _context.Products.FirstOrDefaultAsync(x => x.Id == income.ProductId);
        if (product == null)
        {
            return BadRequest(new { message = "Selected product not found." });
        }

        income.Product = product.Name;
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

        return Ok(income);
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

