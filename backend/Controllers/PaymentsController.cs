using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/payments/order/5
    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetByOrderId(int orderId)
    {
        var payments = await _context.Payments
            .Where(x => x.OrderId == orderId)
            .OrderByDescending(x => x.PaymentDate)
            .ThenByDescending(x => x.Id)
            .ToListAsync();

        return Ok(payments);
    }

    // POST: api/payments
    [HttpPost]
    public async Task<ActionResult<Payment>> Create(Payment payment)
    {
        if (payment.OrderId <= 0)
        {
            return BadRequest(new { message = "Order is required." });
        }

        if (payment.Amount <= 0)
        {
            return BadRequest(new { message = "Payment amount must be greater than 0." });
        }

        if (string.IsNullOrWhiteSpace(payment.PaymentMethod))
        {
            payment.PaymentMethod = "Cash";
        }

        var order = await _context.Orders.FirstOrDefaultAsync(x => x.Id == payment.OrderId);
        if (order == null)
        {
            return BadRequest(new { message = "Order not found." });
        }

        if (payment.PaymentDate == default)
        {
            payment.PaymentDate = DateTime.UtcNow;
        }
        else
        {
            payment.PaymentDate = DateTime.SpecifyKind(payment.PaymentDate, DateTimeKind.Utc);
        }

        payment.CreatedAt = DateTime.UtcNow;

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        await RecalculateOrderPayment(order.Id);

        return Ok(new
{
    payment.Id,
    payment.OrderId,
    payment.Amount,
    payment.PaymentMethod,
    payment.PaymentDate
});


    }

    private async Task RecalculateOrderPayment(int orderId)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(x => x.Id == orderId);
        if (order == null) return;

        var totalPaid = await _context.Payments
            .Where(x => x.OrderId == orderId)
            .SumAsync(x => (decimal?)x.Amount) ?? 0;

        order.PaidAmount = totalPaid;
        order.BalanceAmount = Math.Max(order.TotalAmount - order.PaidAmount, 0);

        if (order.PaidAmount <= 0)
        {
            order.PaymentStatus = "Unpaid";
        }
        else if (order.PaidAmount < order.TotalAmount)
        {
            order.PaymentStatus = "Partial";
        }
        else
        {
            order.PaymentStatus = "Paid";
        }

        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
