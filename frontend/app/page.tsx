"use client";

import { useEffect, useState } from "react";

type Summary = {
  totalSales: number;
  totalExpense: number;
  balance: number;
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function fetchSummary() {
      try {
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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [token]);

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
      title: "Today Expenses",
      rawValue: summary?.todayExpenses ?? 0,
      value: formatCurrency(summary?.todayExpenses ?? 0),
    },
    {
      title: "Today Profit",
      rawValue: summary?.todayProfit ?? 0,
      value: formatCurrency(summary?.todayProfit ?? 0),
    },
    {
      title: "Total Sales",
      rawValue: summary?.totalSales ?? 0,
      value: formatCurrency(summary?.totalSales ?? 0),
    },
    {
      title: "Total Expenses",
      rawValue: summary?.totalExpense ?? 0,
      value: formatCurrency(summary?.totalExpense ?? 0),
    },
    {
      title: "Net Balance",
      rawValue: summary?.balance ?? 0,
      value: formatCurrency(summary?.balance ?? 0),
    },
  ];

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-500">
            Loading dashboard...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card) => {
              const valueColor =
                card.title.includes("Expense")
                  ? "text-red-400"
                  : card.title.includes("Profit") || card.title.includes("Balance")
                  ? card.rawValue >= 0
                    ? "text-green-400"
                    : "text-red-400"
                  : card.title.includes("Sales")
                  ? "text-green-400"
                  : "text-gray-900";

              return (
                <div
                  key={card.title}
                  className="bg-white rounded-xl shadow p-5"
                >
                  <p className="text-sm text-gray-500 mb-2">{card.title}</p>
                  <h2 className={`text-2xl font-bold ${valueColor}`}>
                    ₱ {card.value}
                  </h2>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
