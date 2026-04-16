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

  const cards = [
    {
      title: "Today Sales",
      value: summary?.todaySales ?? 0,
    },
    {
      title: "Today Expenses",
      value: summary?.todayExpenses ?? 0,
    },
    {
      title: "Today Profit",
      value: summary?.todayProfit ?? 0,
    },
    {
      title: "Total Sales",
      value: summary?.totalSales ?? 0,
    },
    {
      title: "Total Expenses",
      value: summary?.totalExpense ?? 0,
    },
    {
      title: "Net Balance",
      value: summary?.balance ?? 0,
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
                <h2 className="text-2xl font-bold">
                  {Number(card.value).toFixed(2)}
                </h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
