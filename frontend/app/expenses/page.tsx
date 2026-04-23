"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ExpenseItem = {
  id: number;
  category: string;
  amount: number;
  date: string;
  notes?: string;
};

export default function ExpensesPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "",
    amount: "",
    date: "",
    notes: "",
  });

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    setRole(userRole);

    if (userRole === "Admin") {
      loadExpenses(); // full list
    } else {
      loadTodayExpenses(); // only today
    }
  } catch {
    setLoading(false);
  }
}, []);



  async function loadExpenses() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      setExpenses(data);
    } catch {
      setError("Failed to load expense data");
    } finally {
      setLoading(false);
    }
  }

async function loadTodayExpenses() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/expense/today`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setExpenses(data);
  } catch {
    setError("Failed to load today's expenses");
  } finally {
    setLoading(false);
  }
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: form.category,
          amount: Number(form.amount),
          date: form.date,
          notes: form.notes,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error();
      }

      setForm({ category: "", amount: "", date: "", notes: "" });

if (role === "Admin") {
  loadExpenses();
} else {
  loadTodayExpenses();
}

    } catch {
      alert("Failed to save expense");
    }
  }

async function handleDelete(id: number) {
  const confirmDelete = confirm("Delete this expense record?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      throw new Error();
    }

    loadExpenses();
  } catch {
    alert("Failed to delete expense");
  }
}

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (loading) {
    return <p className="p-4 sm:p-6">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-[#0f172a] p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 bg-white/95 p-4 rounded-2xl shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Expenses
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and add expense entries
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/"
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Dashboard
            </a>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        <form
  onSubmit={handleSubmit}
  className="grid gap-4 rounded-2xl bg-white p-4 sm:p-6 shadow-md md:grid-cols-2"
>

          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"

            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
            required
          />
          <input
            type="text"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
          />
          <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 md:col-span-2">
            Save Expense
          </button>
        </form>

           {error && role === "Admin" && <p className="text-red-500">{error}</p>}

                 <div className="overflow-x-auto rounded-2xl bg-white shadow-md border">
        <table className="min-w-[700px] w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                  No expense records found.
                </td>
              </tr>
            ) : (
              expenses.map((item, index) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.category}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-red-600">₱{item.amount}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{item.notes || "-"}</td>
                  <td className="px-4 py-4">
                    {role === "Admin" && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </main>
);
}

