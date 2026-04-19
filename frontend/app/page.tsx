"use client";

import { useEffect, useState } from "react";

type Summary = {
  totalSales: number;
  totalPaid: number;
  totalBalance: number;
  todaySales: number;
  todayCollections: number;
  unpaidOrders: number;
  partialOrders: number;
  paidOrders: number;
};

type PendingPayment = {
  orderId: number;
  customerName: string;
  balanceAmount: number;
  paymentStatus: string;
  orderDate: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");  
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

useEffect(() => {
  async function fetchData() {
    try {
      // 🔹 Fetch summary
      const res = await fetch(`${API_BASE}/api/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard summary");
      }

      const data = await res.json();
      setSummary(data);

      // 🔹 Fetch pending payments
      const pendingRes = await fetch(
        `${API_BASE}/api/dashboard/pending-payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingPayments(pendingData);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [token]);

const handleCollectPayment = (item: PendingPayment) => {
  setSelectedPayment(item);
  setPaymentAmount("");
};

const submitPayment = async () => {
  if (!selectedPayment) return;

  const amount = parseFloat(paymentAmount);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid payment amount.");
    return;
  }

  if (amount > selectedPayment.balanceAmount) {
    alert("Payment amount cannot exceed remaining balance.");
    return;
  }

  try {
    setSubmittingPayment(true);

    const res = await fetch(
      `${API_BASE}/api/orders/${selectedPayment.orderId}/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      }
    );

    if (!res.ok) {
      alert("Payment failed");
      return;
    }

    alert("Payment successful");
    setSelectedPayment(null);
    setPaymentAmount("");
    setPendingPayments((prev) =>
  prev
    .map((p) => {
      if (p.orderId !== selectedPayment.orderId) return p;

      const newBalance = p.balanceAmount - amount;

      return {
        ...p,
        balanceAmount: newBalance,
        paymentStatus:
          newBalance <= 0 ? "Paid" : newBalance < p.balanceAmount ? "Partial" : p.paymentStatus,
      };
    })
    .filter((p) => p.balanceAmount > 0) // remove fully paid
);
  } catch (err) {
    console.error(err);
    alert("Payment failed");
  } finally {
    setSubmittingPayment(false);
  }
};







   const formatCurrency = (value: number) =>
    value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

   const cards = [
  {
    title: "Today Sales",
    rawValue: summary?.todaySales ?? 0,
    value: formatCurrency(summary?.todaySales ?? 0),
  },
  {
    title: "Today Collections",
    rawValue: summary?.todayCollections ?? 0,
    value: formatCurrency(summary?.todayCollections ?? 0),
  },
  {
    title: "Total Sales",
    rawValue: summary?.totalSales ?? 0,
    value: formatCurrency(summary?.totalSales ?? 0),
  },
  {
    title: "Total Paid",
    rawValue: summary?.totalPaid ?? 0,
    value: formatCurrency(summary?.totalPaid ?? 0),
  },
  {
    title: "Total Balance / Utang",
    rawValue: summary?.totalBalance ?? 0,
    value: formatCurrency(summary?.totalBalance ?? 0),
  },
  {
    title: "Unpaid Orders",
    rawValue: summary?.unpaidOrders ?? 0,
    value: String(summary?.unpaidOrders ?? 0),
  },
  {
    title: "Partial Orders",
    rawValue: summary?.partialOrders ?? 0,
    value: String(summary?.partialOrders ?? 0),
  },
  {
    title: "Paid Orders",
    rawValue: summary?.paidOrders ?? 0,
    value: String(summary?.paidOrders ?? 0),
  },
];

  return (
    <main className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-500">
            Loading dashboard...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card) => {
       
           const valueColor =
              card.title.includes("Balance") || card.title.includes("Utang")
                ? "text-red-500"
                : card.title.includes("Unpaid")
                ? "text-red-500"
                : card.title.includes("Partial")
                ? "text-yellow-500"
                : card.title.includes("Paid")
                ? "text-green-500"
                : "text-green-500";
            
              return (
                <div key={card.title} className="bg-white rounded-xl shadow p-5">
                  <p className="text-sm text-gray-500 mb-2">{card.title}</p>
                  <h2 className={`text-2xl font-bold ${valueColor}`}>
                    {card.title.includes("Orders")
                     ? card.value
                     : `₱ ${card.value}`}
                  </h2>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Quick Date Access</h2>

          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="font-semibold text-gray-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}
              </div>
            ))}

            {[...Array(30)].map((_, i) => {
              const day = i + 1;
              const date = `2026-04-${String(day).padStart(2, "0")}`;

              return (
                <a
                  key={i}
                  href={`/sales/daily?date=${date}`}
                  className="border rounded p-2 hover:bg-blue-50 text-sm"
                >
                  {day}
                </a>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Payments</h2>
            <a href="/customers/utang" className="text-blue-600 text-sm">
              View all
            </a>
          </div>

          <div className="space-y-3">
  {pendingPayments.length === 0 ? (
    <p className="text-sm text-gray-500">No pending payments.</p>
  ) : (
    pendingPayments.map((item) => (
      <div key={item.orderId} className="border rounded-lg p-3">
        <div className="flex justify-between items-start gap-3">
          <div>
            <p className="font-semibold text-gray-900">{item.customerName}</p>
            <p className="text-xs text-gray-500">Order #{item.orderId}</p>
          </div>

          <span
            className={`text-xs px-2 py-1 rounded ${
              item.paymentStatus === "Partial"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {item.paymentStatus}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">Remaining Balance</p>
        <p className="text-lg font-bold text-red-600">
          ₱{" "}
          {Number(item.balanceAmount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

       <div className="mt-3 flex gap-3">
          <a
           href={`/orders/${item.orderId}`}
            className="text-sm text-blue-600 hover:underline"
          >
         View Order
         </a>

       <button
         onClick={() => handleCollectPayment(item)}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
         >
      Collect Payment
       </button>
      </div>        


      </div>
    ))
  )}
</div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <a href="/orders/list" className="text-blue-600 text-sm">
              View all
            </a>
          </div>

          <p className="text-sm text-gray-500">
            (Next step: connect this to API)
          </p>
        </div>
   {selectedPayment && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Collect Payment</h2>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold">Customer:</span>{" "}
          {selectedPayment.customerName}
        </p>
        <p>
          <span className="font-semibold">Order #:</span>{" "}
          {selectedPayment.orderId}
        </p>
        <p>
          <span className="font-semibold">Remaining Balance:</span>{" "}
          <span className="text-red-600 font-bold">
            ₱{" "}
            {Number(selectedPayment.balanceAmount).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </p>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Amount
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter payment amount"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            setSelectedPayment(null);
            setPaymentAmount("");
          }}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          disabled={submittingPayment}
        >
          Cancel
        </button>

        <button
          onClick={submitPayment}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          disabled={submittingPayment}
        >
          {submittingPayment ? "Submitting..." : "Submit Payment"}
        </button>
      </div>
    </div>
  </div>
)}

    </div> 
    </main>
  );
}
