"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: number;
  name: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  area: string;
  city: string;
  notes: string;
  isActive: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const role =
    typeof window !== "undefined" && token
      ? JSON.parse(atob(token.split(".")[1])).role
      : null;

  async function fetchCustomers() {
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phoneNumber,
          alternatePhoneNumber,
          addressLine1,
          addressLine2,
          area,
          city,
          notes,
          isActive: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save customer");
      }

      setName("");
      setPhoneNumber("");
      setAlternatePhoneNumber("");
      setAddressLine1("");
      setAddressLine2("");
      setArea("");
      setCity("");
      setNotes("");

      await fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Failed to save customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">Customers</h1>

        {role === "Admin" && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white text-gray-900 rounded-xl shadow p-4 mb-6"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Customer name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Alternate Phone</label>
              <input
                type="text"
                value={alternatePhoneNumber}
                onChange={(e) => setAlternatePhoneNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Alternate phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Address Line 1</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Address line 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Address line 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Area"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="City"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Notes"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Add Customer"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white text-gray-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm text-gray-900">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-700">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((item, index) => (
                  <tr key={item.id} className="border-t text-gray-900">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.phoneNumber}</td>
                    <td className="px-4 py-3">{item.area}</td>
                    <td className="px-4 py-3">{item.city}</td>
                    <td className="px-4 py-3">
                      {item.isActive ? "Active" : "Inactive"}
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
