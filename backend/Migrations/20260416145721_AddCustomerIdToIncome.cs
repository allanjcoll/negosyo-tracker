using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerIdToIncome : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CustomerId",
                table: "Incomes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_CustomerId",
                table: "Incomes",
                column: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_Customers_CustomerId",
                table: "Incomes",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_Customers_CustomerId",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_CustomerId",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "Incomes");
        }
    }
}
