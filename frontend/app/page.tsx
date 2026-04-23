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
  const [role, setRole] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");  
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

useEffect(() => {
   if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    setRole(userRole);
  } catch {}
}

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
    <main className="min-h-screen bg-slate-950 px-4 py-5 md:px-6 md:py-6">
  <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Meridian Water Plus operations overview
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/orders/new"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
        >
          New Order
        </a>
        <a
          href="/customers"
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          Customers
        </a>
      </div>
    </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-500">
            Loading dashboard...
          </div>
        ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">           

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
                <div
  key={card.title}
  className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg hover:shadow-xl transition"
>
                  <p className="text-sm text-gray-500 mb-2">{card.title}</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {card.title.includes("Orders")
                     ? card.value
                     : `₱ ${card.value}`}
                  </h2>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">

  {role === "Admin" && (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Quick Date Access</h2>
        <p className="text-sm text-slate-400">
          Jump quickly to daily sales by date
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="font-semibold text-slate-500">
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
              className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 font-semibold text-white hover:bg-blue-600 hover:text-white transition"
            >
              {day}
            </a>
          );
        })}
      </div>
    </>
  )}

</div>

      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
  <div className="mb-4 flex items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold text-white">Pending Payments</h2>
      <p className="text-sm text-slate-400">Orders that still need collection</p>
    </div>

    <a
      href="/customers/utang"
      className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
    >
      View all
    </a>
  </div>

  <div className="space-y-3">
    {pendingPayments.length === 0 ? (
      <p className="text-sm text-slate-400">No pending payments.</p>
    ) : (
      pendingPayments.map((item) => (
        <div
          key={item.orderId}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-base font-semibold text-white">
                {item.customerName}
              </p>
              <p className="text-xs text-slate-400">Order #{item.orderId}</p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                item.paymentStatus === "Partial"
                  ? "bg-yellow-400/20 text-yellow-300"
                  : "bg-red-400/20 text-red-300"
              }`}
            >
              {item.paymentStatus}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Remaining Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-red-400">
              ₱{" "}
              {Number(item.balanceAmount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={`/orders/${item.orderId}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              View Order
            </a>

            <button
              onClick={() => handleCollectPayment(item)}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Collect Payment</h2>
          <p className="text-sm text-slate-400">
            Receive payment for this order
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPayment(null);
            setPaymentAmount("");
          }}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          disabled={submittingPayment}
        >
          Close
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="text-slate-400">Customer</p>
          <p className="font-semibold text-white">{selectedPayment.customerName}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="text-slate-400">Order</p>
          <p className="font-semibold text-white">#{selectedPayment.orderId}</p>
        </div>

        <div className="rounded-xl border border-red-900/40 bg-red-500/10 p-3">
          <p className="text-slate-300">Remaining Balance</p>
          <p className="text-2xl font-bold text-red-400">
            ₱{" "}
            {Number(selectedPayment.balanceAmount).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Payment Amount
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-green-500 focus:outline-none"
          placeholder="Enter payment amount"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[100, 200, 500, 1000].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setPaymentAmount(String(amt))}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            ₱ {amt}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setPaymentAmount(String(selectedPayment.balanceAmount))}
          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Pay Full
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          onClick={() => {
            setSelectedPayment(null);
            setPaymentAmount("");
          }}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 sm:w-auto"
          disabled={submittingPayment}
        >
          Cancel
        </button>

        <button
          onClick={submitPayment}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:w-auto"
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
