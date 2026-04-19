using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

public class AddPaymentRequest
{
    public decimal Amount { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OrdersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpGet("daily")]
    public async Task<IActionResult> GetDailySales()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var orders = await _context.Orders
            .Include(x => x.Customer)
            .Where(o => o.OrderDate >= today && o.OrderDate < tomorrow)
            .OrderByDescending(o => o.OrderDate)
            .ThenByDescending(o => o.Id)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                customerName = o.Customer != null ? o.Customer.Name : null,
                o.TotalAmount,
                o.PaidAmount,
                o.BalanceAmount,
                o.PaymentStatus,
                o.OrderDate
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _context.Orders
            .Include(x => x.Customer)
            .OrderByDescending(x => x.OrderDate)
            .ThenByDescending(x => x.Id)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                customerName = o.Customer != null ? o.Customer.Name : null,
                o.TotalAmount,
                o.PaidAmount,
                o.BalanceAmount,
                o.PaymentStatus,
                o.OrderDate
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _context.Orders
            .Where(o => o.Id == id)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                customerName = o.Customer != null ? o.Customer.Name : null,
                o.PaymentStatus,
                o.TotalAmount,
                o.PaidAmount,
                o.BalanceAmount,
                o.OrderDate,
                orderItems = o.OrderItems.Select(i => new
                {
                    i.Id,
                    productName = i.Product != null ? i.Product.Name : null,
                    i.Quantity,
                    i.UnitPrice,
                    lineTotal = i.Quantity * i.UnitPrice
                }).ToList(),
                payments = o.Payments.Select(p => new
                {
                    p.Id,
                    p.Amount,
                    p.PaymentMethod,
                    p.PaymentDate
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
        {
            return NotFound();
        }

        return Ok(order);
    }

[HttpGet("{id}/payments")]
public async Task<IActionResult> GetOrderPayments(int id)
{
    var orderExists = await _context.Orders.AnyAsync(o => o.Id == id);

    if (!orderExists)
        return NotFound(new { message = "Order not found" });

    var payments = await _context.Payments
        .Where(p => p.OrderId == id)
        .OrderByDescending(p => p.PaymentDate)
        .Select(p => new
        {
            p.Id,
            p.Amount,
            p.PaymentDate
        })
        .ToListAsync();

    return Ok(payments);
}


[HttpPost]
public async Task<ActionResult<Order>> Create(Order order)
{
    if (order.CustomerId <= 0)
    {
        return BadRequest(new { message = "Customer is required." });
    }

    if (string.IsNullOrWhiteSpace(order.OrderNumber))
    {
        return BadRequest(new { message = "Order number is required." });
    }

    // ✅ Set default values
    if (order.OrderDate == default)
    {
        order.OrderDate = DateTime.UtcNow;
    }
    else
    {
        order.OrderDate = DateTime.SpecifyKind(order.OrderDate, DateTimeKind.Utc);
    }

    order.CreatedAt = DateTime.UtcNow;
    order.UpdatedAt = null;

    // ✅ IMPORTANT: calculate totals from backend
    order.TotalAmount = order.OrderItems.Sum(i => i.Quantity * i.UnitPrice);
    order.PaidAmount = order.Payments?.Sum(p => p.Amount) ?? 0;
    order.BalanceAmount = order.TotalAmount - order.PaidAmount;

    // ✅ Determine payment status
    if (order.BalanceAmount <= 0)
        order.PaymentStatus = "Paid";
    else if (order.PaidAmount > 0)
        order.PaymentStatus = "Partial";
    else
        order.PaymentStatus = "Unpaid";

    // ✅ TRANSACTION STARTS HERE
    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }

    return Ok(new
    {
        order.Id,
        order.OrderNumber
    });
}

[HttpPost("{id}/payments")]
public async Task<IActionResult> AddPayment(int id, [FromBody] AddPaymentRequest request)
{
    var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);

    if (order == null)
        return NotFound(new { message = "Order not found" });

    if (request.Amount <= 0)
        return BadRequest(new { message = "Payment amount must be greater than zero." });

    if (request.Amount > order.BalanceAmount)
        return BadRequest(new { message = "Payment amount cannot exceed remaining balance." });

    var payment = new Payment
    {
        OrderId = order.Id,
        Amount = request.Amount,
        PaymentDate = DateTime.UtcNow
    };

    _context.Payments.Add(payment);

    order.PaidAmount += request.Amount;
    order.BalanceAmount = order.TotalAmount - order.PaidAmount;

    if (order.PaidAmount <= 0)
        order.PaymentStatus = "Unpaid";
    else if (order.BalanceAmount > 0)
        order.PaymentStatus = "Partial";
    else
        order.PaymentStatus = "Paid";

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Payment added successfully",
        orderId = order.Id,
        paidAmount = order.PaidAmount,
        balanceAmount = order.BalanceAmount,
        paymentStatus = order.PaymentStatus
    });
}

}
