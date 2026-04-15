namespace backend.Models;

public class Income
{
    public int Id { get; set; }
    public string Source { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
}
