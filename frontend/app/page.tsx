async function getDashboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary`, {
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
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Negosyo Tracker Dashboard
        </h1>

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
