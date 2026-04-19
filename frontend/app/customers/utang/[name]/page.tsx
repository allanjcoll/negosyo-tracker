"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type OrderRow = {
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

export default function CustomerUtangDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerName = decodeURIComponent((params?.name as string) || "");

  const [orders, setOrders] = useState<OrderRow[]>([]);
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
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch orders.");
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders
      .filter((x) => (x.customerName || "Unknown Customer") === customerName)
      .sort((a, b) => b.balanceAmount - a.balanceAmount);
  }, [orders, customerName]);

  const totalBalance = useMemo(() => {
    return filteredOrders.reduce((sum, x) => sum + x.balanceAmount, 0);
  }, [filteredOrders]);

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customer Orders</h1>
          <button
            onClick={() => router.push("/customers/utang")}
            className="rounded bg-gray-200 px-4 py-2"
          >
            Back
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow">
          <div className="text-lg font-semibold">{customerName}</div>
          <div className="mt-2 text-sm text-gray-600">
            Total Balance / Utang
          </div>
          <div className="mt-1 text-2xl font-bold">₱ {totalBalance.toFixed(2)}</div>
        </div>

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
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="cursor-pointer border-t hover:bg-gray-50"
                        onClick={() => router.push(`/orders/${row.id}`)}
                      >
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{row.orderNumber}</td>
                        <td className="px-4 py-3">₱ {row.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3">₱ {row.paidAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 font-semibold">
                          ₱ {row.balanceAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">{row.paymentStatus}</td>
                        <td className="px-4 py-3">
                          {new Date(row.orderDate).toLocaleString()}
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
