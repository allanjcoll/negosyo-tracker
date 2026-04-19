using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Product
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string ProductCode { get; set; } = "";

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(50)]
    public string Category { get; set; } = "";

    [MaxLength(20)]
    public string Unit { get; set; } = "";

    [Column(TypeName = "decimal(18,2)")]
    public decimal DefaultPrice { get; set; }

    public bool AllowManualPriceOverride { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
