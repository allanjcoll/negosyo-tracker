"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type OrderItem = {
  id: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Payment = {
  id: number;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
};


type OrderDetails = {
  id: number;
  orderNumber: string;
  customerName?: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  orderDate: string;
  orderItems: OrderItem[];
  payments: Payment[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch order: ${res.status}`);
      }

      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load order.");
    }
  }

  async function handlePayment() {
    if (!order) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(`${API_BASE}/api/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
  orderId: order!.id,
  amount: Number(paymentAmount),
  paymentMethod: "Cash"
})


    });

    if (!res.ok) {
      alert("Failed to add payment.");
      return;
    }

    setPaymentAmount("");
    fetchOrder();
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Order Details</h1>

      <div className="mb-4 rounded-xl bg-white p-4 shadow">
        <p><b>Order #:</b> {order.orderNumber}</p>
        <p><b>Customer:</b> {order.customerName || "-"}</p>
        <p><b>Status:</b> {order.paymentStatus}</p>
        <p><b>Date:</b> {new Date(order.orderDate).toLocaleString()}</p>
      </div>

      <div className="mb-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">Amounts</h2>
        <p>Total: ₱ {order.totalAmount.toFixed(2)}</p>
        <p>Paid: ₱ {order.paidAmount.toFixed(2)}</p>
        <p>Balance: ₱ {order.balanceAmount.toFixed(2)}</p>
      </div>

      <div className="mb-4 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">Items</h2>

        {order.orderItems.length === 0 ? (
          <p className="text-gray-500">No items.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-900">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.productName || "-"}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">₱ {item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-2">₱ {item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow mt-4">
  <h2 className="font-semibold mb-2">Payment History</h2>

  {!order.payments || order.payments.length === 0 ? (
    <p className="text-gray-500">No payments yet.</p>
  ) : (
    <table className="min-w-full text-sm text-gray-900">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="px-4 py-2">Date</th>
          <th className="px-4 py-2">Amount</th>
          <th className="px-4 py-2">Method</th>
        </tr>
      </thead>
      <tbody>
        {order.payments.map((p: any, idx: number) => (
          <tr key={idx} className="border-t">
            <td className="px-4 py-2">
              {new Date(p.paymentDate).toLocaleString()}
            </td>
            <td className="px-4 py-2">
              ₱ {p.amount.toFixed(2)}
            </td>
            <td className="px-4 py-2">
              {p.paymentMethod}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>


      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">Add Payment</h2>

        <input
          type="number"
          placeholder="Enter amount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          className="mb-2 w-full rounded border px-3 py-2"
        />

        <button
          onClick={handlePayment}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Add Payment
        </button>
      </div>
    </main>
  );
}
