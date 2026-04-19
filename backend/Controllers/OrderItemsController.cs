using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OrderItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/orderitems/order/5
    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<IEnumerable<OrderItem>>> GetByOrderId(int orderId)
    {
        var items = await _context.OrderItems
            .Include(x => x.Product)
            .Where(x => x.OrderId == orderId)
            .OrderBy(x => x.Id)
            .ToListAsync();

        return Ok(items);
    }

    // POST: api/orderitems
    [HttpPost]
    public async Task<ActionResult<OrderItem>> Create(OrderItem item)
    {
        if (item.OrderId <= 0)
        {
            return BadRequest(new { message = "Order is required." });
        }

        if (item.ProductId <= 0)
        {
            return BadRequest(new { message = "Product is required." });
        }

        if (item.Quantity <= 0)
        {
            return BadRequest(new { message = "Quantity must be greater than 0." });
        }

        if (item.UnitPrice <= 0)
        {
            return BadRequest(new { message = "Unit price must be greater than 0." });
        }

        var orderExists = await _context.Orders.AnyAsync(x => x.Id == item.OrderId);
        if (!orderExists)
        {
            return BadRequest(new { message = "Order not found." });
        }

        var productExists = await _context.Products.AnyAsync(x => x.Id == item.ProductId);
        if (!productExists)
        {
            return BadRequest(new { message = "Product not found." });
        }

        item.LineTotal = item.Quantity * item.UnitPrice;

        _context.OrderItems.Add(item);
        await _context.SaveChangesAsync();

        await RecalculateOrderTotals(item.OrderId);

        return Ok(new
{
    item.Id,
    item.OrderId,
    item.ProductId,
    item.Quantity,
    item.UnitPrice,
    item.LineTotal
});

    }

    private async Task RecalculateOrderTotals(int orderId)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(x => x.Id == orderId);
        if (order == null) return;

        var total = await _context.OrderItems
            .Where(x => x.OrderId == orderId)
            .SumAsync(x => (decimal?)x.LineTotal) ?? 0;

        order.TotalAmount = total;
        order.BalanceAmount = order.TotalAmount - order.PaidAmount;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
