using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class Customer
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(20)]
    public string PhoneNumber { get; set; } = "";

    [MaxLength(20)]
    public string AlternatePhoneNumber { get; set; } = "";

    [MaxLength(200)]
    public string AddressLine1 { get; set; } = "";

    [MaxLength(200)]
    public string AddressLine2 { get; set; } = "";

    [MaxLength(100)]
    public string Area { get; set; } = "";

    [MaxLength(100)]
    public string City { get; set; } = "";

    public string Notes { get; set; } = "";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
