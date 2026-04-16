using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Income
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Product { get; set; } = string.Empty;

    [Range(1, 100000)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Quantity { get; set; }

    [Range(0, 1000000)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
}

