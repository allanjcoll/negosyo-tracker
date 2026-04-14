async function getIncome() {
  const res = await fetch("http://127.0.0.1:5000/api/income", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch income data");
  }

  return res.json();
}

type IncomeItem = {
  id: number;
  source: string;
  amount: number;
  date: string;
  notes?: string;
};

export default async function IncomePage() {
  const incomes: IncomeItem[] = await getIncome();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income</h1>
            <p className="mt-1 text-sm text-gray-500">
              View all recorded income entries
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Source
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
              {incomes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No income records found.
                  </td>
                </tr>
              ) : (
                incomes.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-700">{item.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.source}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
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
