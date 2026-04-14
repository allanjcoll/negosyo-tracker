import { revalidatePath } from "next/cache";

async function createExpense(formData: FormData) {
  "use server";

  const payload = {
    category: formData.get("category"),
    amount: Number(formData.get("amount")),
    date: formData.get("date"),
    notes: formData.get("notes"),
  };

  const res = await fetch("http://127.0.0.1/api/expense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create expense");
  }

  revalidatePath("/expenses");
  revalidatePath("/");
}

async function getExpenses() {
  const res = await fetch("http://127.0.0.1/api/expense", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch expense data");
  }

  return res.json();
}

type ExpenseItem = {
  id: number;
  category: string;
  amount: number;
  date: string;
  notes?: string;
};

export default async function ExpensesPage() {
  const expenses: ExpenseItem[] = await getExpenses();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and add expense entries
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Add Expense</h2>

          <form action={createExpense} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                name="category"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
                placeholder="e.g. Supplies"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
                placeholder="e.g. 100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <input
                type="text"
                name="notes"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
                placeholder="Optional notes"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-700">{item.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      ₱{item.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.notes || "-"}
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
