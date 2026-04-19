"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  orderNumber: string;
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  orderDate: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function OrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">Orders</h1>

        <div className="rounded-xl bg-white p-4 shadow">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-900">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o, idx) => (
                      <tr
                        key={o.id}
                        className="cursor-pointer border-t hover:bg-gray-50"
                        onClick={() => router.push(`/orders/${o.id}`)}
                      >
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{o.orderNumber}</td>
                        <td className="px-4 py-3">{o.customerName || "-"}</td>
                        <td className="px-4 py-3">₱ {o.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3">₱ {o.paidAmount.toFixed(2)}</td>
                        <td className="px-4 py-3">₱ {o.balanceAmount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">{o.paymentStatus}</span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(o.orderDate).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
