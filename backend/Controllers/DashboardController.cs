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
    var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");
    var nowManila = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);

    var startOfTodayManila = new DateTime(
        nowManila.Year,
        nowManila.Month,
        nowManila.Day,
        0, 0, 0,
        DateTimeKind.Unspecified);

    var startOfTomorrowManila = startOfTodayManila.AddDays(1);

    var startUtc = TimeZoneInfo.ConvertTimeToUtc(startOfTodayManila, tz);
    var endUtc = TimeZoneInfo.ConvertTimeToUtc(startOfTomorrowManila, tz);

    var totalSales = await _context.Orders
        .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

    var totalPaid = await _context.Orders
        .SumAsync(x => (decimal?)x.PaidAmount) ?? 0;

    var totalBalance = await _context.Orders
        .SumAsync(x => (decimal?)x.BalanceAmount) ?? 0;

    var todaySales = await _context.Orders
        .Where(x => x.OrderDate >= startUtc && x.OrderDate < endUtc)
        .SumAsync(x => (decimal?)x.TotalAmount) ?? 0;

    var todayCollections = await _context.Payments
        .Where(x => x.PaymentDate >= startUtc && x.PaymentDate < endUtc)
        .SumAsync(x => (decimal?)x.Amount) ?? 0;

    var unpaidOrders = await _context.Orders
        .CountAsync(x => x.PaymentStatus == "Unpaid");

    var partialOrders = await _context.Orders
        .CountAsync(x => x.PaymentStatus == "Partial");

    var paidOrders = await _context.Orders
        .CountAsync(x => x.PaymentStatus == "Paid");

    return Ok(new
    {
        totalSales,
        totalPaid,
        totalBalance,
        todaySales,
        todayCollections,
        unpaidOrders,
        partialOrders,
        paidOrders
    });
}



[HttpGet("pending-payments")]
public async Task<IActionResult> GetPendingPayments()
{
    var data = await _context.Orders
        .Include(o => o.Customer)
        .Where(o => o.BalanceAmount > 0)
        .OrderByDescending(o => o.Id)
        .Take(10)
        .Select(o => new
        {
            orderId = o.Id,
            customerName = o.Customer != null ? o.Customer.Name : "Walk-in Customer",
            balanceAmount = o.BalanceAmount,
            paymentStatus = o.PaymentStatus,
            orderDate = o.CreatedAt
        })
        .ToListAsync();

    return Ok(data);
}
}
