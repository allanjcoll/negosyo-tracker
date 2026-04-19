"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type CustomerSummary = {
  customerName: string;
  totalSales: number;
  totalPaid: number;
  totalBalance: number;
  unpaidCount: number;
  partialCount: number;
  orderCount: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function CustomerUtangPage() {
  const router = useRouter();
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

  const summaries = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    for (const order of orders) {
      const name = order.customerName || "Unknown Customer";

      if (!map.has(name)) {
        map.set(name, {
          customerName: name,
          totalSales: 0,
          totalPaid: 0,
          totalBalance: 0,
          unpaidCount: 0,
          partialCount: 0,
          orderCount: 0,
        });
      }

      const item = map.get(name)!;
      item.totalSales += order.totalAmount;
      item.totalPaid += order.paidAmount;
      item.totalBalance += order.balanceAmount;
      item.orderCount += 1;

      if (order.paymentStatus === "Unpaid") item.unpaidCount += 1;
      if (order.paymentStatus === "Partial") item.partialCount += 1;
    }

    return Array.from(map.values()).sort(
      (a, b) => b.totalBalance - a.totalBalance
    );
  }, [orders]);

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">Customer Utang Summary</h1>

        <div className="rounded-xl bg-white p-4 shadow">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-900">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total Sales</th>
                    <th className="px-4 py-3">Total Paid</th>
                    <th className="px-4 py-3">Total Balance</th>
                    <th className="px-4 py-3">Unpaid Orders</th>
                    <th className="px-4 py-3">Partial Orders</th>
                    <th className="px-4 py-3">Total Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                        No customer balances found.
                      </td>
                    </tr>
                  ) : (
                    summaries.map((row, idx) => (
                      <tr key={row.customerName} className="border-t">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{row.customerName}</td>
                        <td className="px-4 py-3">₱ {row.totalSales.toFixed(2)}</td>
                        <td className="px-4 py-3">₱ {row.totalPaid.toFixed(2)}</td>
                        <td className="px-4 py-3 font-semibold">
                          ₱ {row.totalBalance.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">{row.unpaidCount}</td>
                        <td className="px-4 py-3">{row.partialCount}</td>
                        <td className="px-4 py-3">{row.orderCount}</td>
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
