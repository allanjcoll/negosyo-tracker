"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardData = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await res.json();
        setData(result);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-red-600">{error || "No data available"}</p>
        </div>
      </main>
    );
  }

return (
  <main className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Meridian Water Plus
        </h1>

        <div className="flex flex-wrap gap-3">
          <a
            href="/income"
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Income
          </a>
          <a
            href="/expenses"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Expenses
          </a>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow sm:p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Income</h2>
          <p className="mt-2 text-3xl font-bold text-green-600 sm:text-4xl">
            ₱{data.totalIncome}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow sm:p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Expense</h2>
          <p className="mt-2 text-3xl font-bold text-red-600 sm:text-4xl">
            ₱{data.totalExpense}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow sm:p-6">
          <h2 className="text-sm font-medium text-gray-500">Balance</h2>
          <p className="mt-2 text-3xl font-bold text-blue-600 sm:text-4xl">
            ₱{data.balance}
          </p>
        </div>
      </div>
    </div>
  </main>
);
}
