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
  }, []);

	const formatCurrency = (value: number) =>
  value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const cards = [
  {
    title: "Today Sales",
    value: formatCurrency(summary?.todaySales ?? 0),
    color: "text-green-400",
  },
  {
    title: "Today Expenses",
    value: formatCurrency(summary?.todayExpenses ?? 0),
    color: "text-red-400",
  },
  {
    title: "Today Profit",
    value: formatCurrency(summary?.todayProfit ?? 0),
    color:
      (summary?.todayProfit ?? 0) >= 0
        ? "text-green-400"
        : "text-red-400",
  },
  {
    title: "Total Sales",
    value: formatCurrency(summary?.totalSales ?? 0),
    color: "text-green-400",
  },
  {
    title: "Total Expenses",
    value: formatCurrency(summary?.totalExpense ?? 0),
    color: "text-red-400",
  },
  {
    title: "Net Balance",
    value: formatCurrency(summary?.balance ?? 0),
    color:
      (summary?.balance ?? 0) >= 0
        ? "text-green-400"
        : "text-red-400",
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
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl shadow p-5"
              >
                <p className="text-sm text-gray-500 mb-2">{card.title}</p>
			<h2 className={`text-2xl font-bold ${card.color}`}>
  ₱ {card.value}
</h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
