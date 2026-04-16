"use client";

import { useEffect, useState } from "react";

type Sale = {
  id: number;
  product: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  date: string;
  customerId?: number | null;
  customer?: {
    id: number;
    name: string;
  } | null;
};

type Customer = {
  id: number;
  name: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function IncomePage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [product, setProduct] = useState("5 Gallon Refill");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");

const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

let role: string | null = null;

try {
  role =
    typeof window !== "undefined" && token
      ? JSON.parse(atob(token.split(".")[1])).role ?? null
      : null;
} catch {
  role = null;
}

const handleDeleterole =
  typeof window !== "undefined" && token
    ? JSON.parse(atob(token.split(".")[1])).role
    : null;

  const total = (Number(quantity || 0) * Number(unitPrice || 0)).toFixed(2);

  async function fetchSales() {
    try {
      const res = await fetch(`${API_BASE}/api/income`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch sales");
      }

      const data = await res.json();
      setSales(data);
    } catch (error) {
      console.error(error);
    }
  }

async function fetchCustomers() {
  try {
    const res = await fetch(`${API_BASE}/api/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch customers");
    }

    const data = await res.json();
    setCustomers(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error(error);
    setCustomers([]);
  }
}

  useEffect(() => {
    fetchSales();
    fetchCustomers();
  }, []);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/income`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

   body: JSON.stringify({
     product,
     quantity: Number(quantity),
     unitPrice: Number(unitPrice),
     customerId: Number(customerId),
     date: date || new Date().toISOString(),
  })
      });

      if (!res.ok) {
        throw new Error("Failed to save sale");
      }

      setProduct("5 Gallon Refill");
      setQuantity("");
      setUnitPrice("");
      setDate("");

      await fetchSales();
    } catch (error) {
      console.error(error);
      alert("Failed to save sale");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = confirm("Delete this sale record?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/income/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete sale");
      }

      await fetchSales();
    } catch (error) {
      console.error(error);
      alert("Failed to delete sale");
    }
  }

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Sales</h1>

<form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white text-gray-900 rounded-xl shadow p-4 mb-6"
>

<div>
  <label className="block text-sm font-medium mb-1 text-gray-700">
    Customer
  </label>
  <select
    value={customerId}
    onChange={(e) => setCustomerId(e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
    required
  >
    <option value="">Select customer</option>
    {(customers ?? []).map((customer) => (
      <option key={customer.id} value={customer.id}>
        {customer.name}
      </option>
    ))}
  </select>
</div>

  {/* Product */}
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">
      Product
    </label>
    <select
      value={product}
      onChange={(e) => setProduct(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
    >
      <option value="5 Gallon Refill">5 Gallon Refill</option>
      <option value="1 Gallon Refill">1 Gallon Refill</option>
      <option value="Container Sale">Container Sale</option>
      <option value="Bottle Water">Bottle Water</option>
      <option value="Delivery Fee">Delivery Fee</option>
    </select>
  </div>

  {/* Quantity */}
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">
      Quantity
    </label>
    <input
      type="number"
      step="0.01"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
      placeholder="Enter quantity"
      required
    />
  </div>

  {/* Unit Price */}
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">
      Unit Price
    </label>
    <input
      type="number"
      step="0.01"
      value={unitPrice}
      onChange={(e) => setUnitPrice(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400"
      placeholder="Enter unit price"
      required
    />
  </div>

  {/* Date */}
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">
      Date
    </label>
    <input
      type="datetime-local"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
    />
  </div>

  {/* Submit */}
  <div className="flex flex-col justify-end">
    <div className="text-sm mb-2 text-gray-700">
      Total: <span className="font-semibold text-gray-900">{total}</span>
    </div>
    <button
      type="submit"
      disabled={loading}
      className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Saving..." : "Add Sale"}
    </button>
  </div>
</form>

<div className="bg-white text-gray-900 rounded-xl shadow overflow-x-auto">
  <table className="min-w-full text-sm text-gray-900">
    <thead className="bg-gray-100 text-left text-gray-700">
      <tr>
        <th className="px-4 py-3">No.</th>
        <th className="px-4 py-3">Customer</th>
	<th className="px-4 py-3">Product</th>
	<th className="px-4 py-3">Qty</th>
	<th className="px-4 py-3">Unit Price</th>
	<th className="px-4 py-3">Total</th>
	<th className="px-4 py-3">Date</th>
	<th className="px-4 py-3">Action</th>
      </tr>
    </thead>
    <tbody>
      {sales.length === 0 ? (
        <tr>
          <td colSpan={8} className="px-4 py-6 text-center text-gray-700">
            No sales records found.
          </td>
        </tr>
      ) : (
        sales.map((item, index) => (

<tr key={item.id} className="border-t text-gray-900">
  <td className="px-4 py-3">{index + 1}</td>
  <td className="px-4 py-3">{item.customer?.name || "-"}</td>
  <td className="px-4 py-3">{item.product}</td>
  <td className="px-4 py-3">{item.quantity}</td>
  <td className="px-4 py-3">{Number(item.unitPrice).toFixed(2)}</td>
  <td className="px-4 py-3 font-medium">{Number(item.amount).toFixed(2)}</td>
  <td className="px-4 py-3">{new Date(item.date).toLocaleString()}</td>
  <td className="px-4 py-3">
    {role === "Admin" && (
      <button
        onClick={() => handleDelete(item.id)}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Delete
      </button>
    )}
  </td>
</tr>

        ))
      )}
    </tbody>
  </table>
</div>

      </div>
    </main>
  );
}
	
