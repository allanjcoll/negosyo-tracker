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

type PaymentHistoryItem = {
  id: number;
  amount: number;
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
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
  if (!id) return;
  fetchOrder();
  fetchPayments();
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
  
  async function fetchPayments() {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(`${API_BASE}/api/orders/${id}/payments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch payment history: ${res.status}`);
    }

    const data = await res.json();
    setPayments(data);
  } catch (err: any) {
    console.error(err);
  }
}

async function handlePayment() {
  if (!order) return;

  const amount = Number(paymentAmount);

  if (!amount || amount <= 0) {
    alert("Enter a valid amount");
    return;
  }

  if (amount > order.balanceAmount) {
    alert("Amount exceeds remaining balance");
    return;
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}/api/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      orderId: order.id,
      amount: amount,
      paymentMethod: "Cash",
    }),
  });

  if (!res.ok) {
    alert("Failed to add payment.");
    return;
  }

  setPaymentAmount("");
  await fetchOrder();
}

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6">Loading...</div>;

return (
  <main className="p-4 md:p-6 bg-gray-50 min-h-screen">
    <div className="mx-auto max-w-5xl">

      {/* ORDER HEADER */}
      <div className="mb-4 rounded-xl bg-white p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              {order.customerName || "Walk-in Customer"}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(order.orderDate).toLocaleString("en-PH")}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded text-sm font-semibold ${
              order.paymentStatus === "Paid"
                ? "bg-green-100 text-green-700"
                : order.paymentStatus === "Partial"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* AMOUNT CARDS */}
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-sm">Total Amount</p>
          <p className="font-bold text-gray-900">
            ₱ {Number(order.totalAmount).toFixed(2)}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-gray-500 text-sm">Paid Amount</p>
          <p className="font-bold text-green-600">
            ₱ {Number(order.paidAmount).toFixed(2)}
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-gray-500 text-sm">Remaining Balance</p>
          <p className="font-bold text-red-600">
            ₱ {Number(order.balanceAmount).toFixed(2)}
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-gray-500 text-sm">Status</p>
          <p className="font-bold text-yellow-700">
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="rounded-xl bg-white p-4 shadow mb-4">
        <h2 className="mb-3 font-semibold">Items</h2>

        {order.orderItems.length === 0 ? (
          <p className="text-gray-500">No items.</p>
        ) : (
          <div className="overflow-x-auto">
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
                    <td className="px-4 py-2">
                      ₱ {Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      ₱ {Number(item.lineTotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT HISTORY */}
      <div className="bg-white p-4 rounded-xl shadow mt-4">
        <h2 className="font-semibold mb-2">Payment History</h2>

        {!order.payments || order.payments.length === 0 ? (
          <p className="text-gray-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-900">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Method</th>
                </tr>
              </thead>
              <tbody>
                {order.payments
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.paymentDate).getTime() -
                      new Date(a.paymentDate).getTime()
                  )
                  .map((p: any, idx: number) => (
                    <tr
                      key={p.id ?? idx}
                      className={`border-t ${idx === 0 ? "bg-green-50" : ""}`}
                    >
                      <td className="px-4 py-2">
                        {new Date(p.paymentDate).toLocaleString("en-PH")}
                      </td>
                      <td className="px-4 py-2">
                        ₱ {Number(p.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">{p.paymentMethod}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD PAYMENT */}
      {order.balanceAmount > 0 && (
        <div className="rounded-xl bg-white p-4 shadow mt-4">
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
            disabled={!paymentAmount || order.balanceAmount <= 0}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Add Payment
          </button>
        </div>
      )}
    </div>
  </main>
);
}
