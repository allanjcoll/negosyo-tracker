"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type IncomeItem = {
  id: number;
  source: string;
  amount: number;
  date: string;
  notes?: string;
};

export default function IncomePage() {
  const router = useRouter();
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    source: "",
    amount: "",
    date: "",
    notes: "",
  });

  useEffect(() => {
    loadIncome();
  }, []);

  async function loadIncome() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
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

      const data = await res.json();
      setIncomes(data);
    } catch {
      setError("Failed to load income");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          source: form.source,
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

      setForm({ source: "", amount: "", date: "", notes: "" });
      loadIncome();
    } catch {
      alert("Failed to save income");
    }
  }

async function handleDelete(id: number) {
  const confirmDelete = confirm("Delete this income record?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income/${id}`, {
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

    loadIncome();
  } catch {
    alert("Failed to delete income");
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
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Income
          </h1>

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
          className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow sm:p-6 md:mb-8 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500"
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500"
            required
          />
          <input
            type="text"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-500"
          />
          <button className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 md:col-span-2">
            Save Income
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto rounded-2xl bg-white shadow">
          <table className="min-w-[700px] w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    No income records found.
                  </td>
                </tr>
              ) : (
                incomes.map((item, index) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-4 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.source}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">₱{item.amount}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{item.notes || "-"}</td>
		    <td className="px-4 py-4">
    <button
      onClick={() => handleDelete(item.id)}
      className="rounded-lg bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
    >
      Delete
    </button>
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

	
