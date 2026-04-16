using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
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
            .ToListAsync();

        return Ok(incomes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Income>> GetById(int id)
    {
        var income = await _context.Incomes.FindAsync(id);

        if (income == null)
        {
            return NotFound(new { message = "Income not found" });
        }

        return Ok(income);
    }

    [HttpPost]
    public async Task<ActionResult<Income>> Create(Income income)
    {
    income.Date = DateTime.SpecifyKind(income.Date, DateTimeKind.Utc);

    _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = income.Id }, income);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Income income)
    {
        if (id != income.Id)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        var existingIncome = await _context.Incomes.FindAsync(id);
        if (existingIncome == null)
        {
            return NotFound(new { message = "Income not found" });
        }

        existingIncome.Source = income.Source;
        existingIncome.Amount = income.Amount;
        existingIncome.Date = income.Date;
        existingIncome.Notes = income.Notes;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var income = await _context.Incomes.FindAsync(id);
        if (income == null)
        {
            return NotFound(new { message = "Income not found" });
        }

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();

        return NoContent();
    }

}
