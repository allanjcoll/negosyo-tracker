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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function DailySalesPage() {
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

      const res = await fetch(`${API_BASE}/api/orders/daily`, {
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




const todayOrders = orders;






  const totalSales = useMemo(
    () => todayOrders.reduce((sum, x) => sum + x.totalAmount, 0),
    [todayOrders]
  );

  const totalPaid = useMemo(
    () => todayOrders.reduce((sum, x) => sum + x.paidAmount, 0),
    [todayOrders]
  );

  const totalBalance = useMemo(
    () => todayOrders.reduce((sum, x) => sum + x.balanceAmount, 0),
    [todayOrders]
  );

  const collectionRate =
    totalSales > 0 ? (totalPaid / totalSales) * 100 : 0;

  const unpaidCount = useMemo(
    () => todayOrders.filter((x) => x.paymentStatus === "Unpaid").length,
    [todayOrders]
  );

  const partialCount = useMemo(
    () => todayOrders.filter((x) => x.paymentStatus === "Partial").length,
    [todayOrders]
  );

  const paidCount = useMemo(
    () => todayOrders.filter((x) => x.paymentStatus === "Paid").length,
    [todayOrders]
  );

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">Daily Sales Report</h1>

        <div className="mb-2 text-sm text-gray-500">
          Report Date: {new Date().toLocaleDateString()}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Today Sales</div>
            <div className="mt-2 text-2xl font-bold">
              ₱ {totalSales.toFixed(2)}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Today Paid</div>
            <div className="mt-2 text-2xl font-bold">
              ₱ {totalPaid.toFixed(2)}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Today Balance / Utang</div>
            <div className="mt-2 text-2xl font-bold">
              ₱ {totalBalance.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Unpaid Orders</div>
            <div className="mt-2 text-xl font-semibold">{unpaidCount}</div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Partial Orders</div>
            <div className="mt-2 text-xl font-semibold">{partialCount}</div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Paid Orders</div>
            <div className="mt-2 text-xl font-semibold">{paidCount}</div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-sm text-gray-500">Collection Rate</div>
            <div className="mt-2 text-2xl font-bold">
              {collectionRate.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-semibold">Today Orders</h2>

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
                  {todayOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No sales for today.
                      </td>
                    </tr>
                  ) : (
                    todayOrders.map((o, idx) => (
                      <tr
                        key={o.id}
                        className="cursor-pointer border-t hover:bg-gray-50"
                        onClick={() => router.push(`/orders/${o.id}`)}
                      >
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3">{o.orderNumber}</td>
                        <td className="px-4 py-3">{o.customerName || "-"}</td>
                        <td className="px-4 py-3">
                          ₱ {o.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          ₱ {o.paidAmount.toFixed(2)}
                        </td>
                        <td
                          className={`px-4 py-3 font-semibold ${
                            o.balanceAmount > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          ₱ {o.balanceAmount.toFixed(2)}
                        </td>
                        <td
                          className={`px-4 py-3 font-semibold ${
                            o.paymentStatus === "Unpaid"
                              ? "text-red-600"
                              : o.paymentStatus === "Partial"
                              ? "text-orange-500"
                              : "text-green-600"
                          }`}
                        >
                          {o.paymentStatus}
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
