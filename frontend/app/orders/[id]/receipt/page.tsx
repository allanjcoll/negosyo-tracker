"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ReceiptPage() {
  const formatPhilippineDate = (value: string | null | undefined) => {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // fallback for values like 19/04/2026, 8:46:24 pm
  const match = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{1,2}):(\d{2}):(\d{2})\s*(am|pm)$/i
  );

  if (match) {
    const [, day, month, year, hourStr, minute, second, ampm] = match;
    let hour = parseInt(hourStr, 10);

    if (ampm.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;

    const manualDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      hour,
      Number(minute),
      Number(second)
    );

    return manualDate.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return value;
};
  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setOrder(data);
  };

  if (!order) return <div className="p-6">Loading receipt...</div>;

return (
  <main className="bg-gray-100 min-h-screen p-6">
    <div className="max-w-2xl mx-auto bg-white text-black p-6 print:p-0">

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Meridian Water Plus</h1>
          <p className="text-sm text-gray-600">Water Refilling Station</p>
          <p className="text-sm text-gray-600">Tanza, Cavite</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold">OFFICIAL RECEIPT</p>
          <p className="text-sm">
            OR-{new Date().getFullYear()}-{order.id.toString().padStart(5, "0")}
          </p>
        </div>
      </div>

      {/* INFO */}
      <div className="mb-6 text-sm space-y-1">
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date().toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
        <p><strong>Status:</strong> {order.paymentStatus}</p>
      </div>

      {/* ITEMS */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Items</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-2">{item.productName}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">₱ {item.price.toFixed(2)}</td>
                <td className="p-2 text-right">
                  ₱ {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div className="text-right mb-6 space-y-1">
        <p>Total: ₱ {order.totalAmount.toFixed(2)}</p>
        <p className="text-green-600">Paid: ₱ {order.paidAmount.toFixed(2)}</p>
        <p className="text-red-600 font-semibold">
          Balance: ₱ {order.balanceAmount.toFixed(2)}
        </p>
      </div>

      {/* PAYMENTS */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Payments</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-left">Method</th>
            </tr>
          </thead>
          <tbody>
            {order.payments?.map((p: any) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">
                  {new Date(p.paymentDate).toLocaleString("en-PH", {
                    timeZone: "Asia/Manila",
                    hour12: true,
                  })}
                </td>
                <td className="p-2 text-right">₱ {p.amount.toFixed(2)}</td>
                <td className="p-2">{p.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="text-center text-sm text-gray-600 mt-10">
        <p>Thank you for your business!</p>
        <p>Meridian Water Plus</p>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between print:hidden mt-6">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Back
        </button>

        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded print:hidden"
        >
          Print Receipt
        </button>
      </div>

    </div>
  </main>
);
}

