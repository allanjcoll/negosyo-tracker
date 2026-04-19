using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ExpenseController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ExpenseController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetAll()
    {
        var expenses = await _context.Expenses
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetById(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);

        if (expense == null)
        {
            return NotFound(new { message = "Expense not found" });
        }

        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> Create(Expense expense)
    {
        expense.Date = DateTime.SpecifyKind(expense.Date, DateTimeKind.Utc);

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Expense expense)
    {
        if (id != expense.Id)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        var existingExpense = await _context.Expenses.FindAsync(id);
        if (existingExpense == null)
        {
            return NotFound(new { message = "Expense not found" });
        }

        existingExpense.Category = expense.Category;
        existingExpense.Amount = expense.Amount;
        existingExpense.Date = expense.Date;
        existingExpense.Notes = expense.Notes;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound(new { message = "Expense not found" });
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return NoContent();
    }


}
