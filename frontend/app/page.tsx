async function getDashboard() {
  const res = await fetch("http://127.0.0.1:5000/api/dashboard/summary", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return res.json();
}

export default async function Home() {
  const data = await getDashboard();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Negosyo Tracker Dashboard
          </h1>

          <div className="flex gap-3">
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
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Income</h2>
            <p className="mt-2 text-3xl font-bold text-green-600">
              ₱{data.totalIncome}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Expense</h2>
            <p className="mt-2 text-3xl font-bold text-red-600">
              ₱{data.totalExpense}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-sm font-medium text-gray-500">Balance</h2>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              ₱{data.balance}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
