"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  productCode: string;
  name: string;
  category: string;
  unit: string;
  defaultPrice: number;
  allowManualPriceOverride: boolean;
  isActive: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productCode, setProductCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [allowManualPriceOverride, setAllowManualPriceOverride] = useState(false);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  let role: string | null = null;
  try {
    role =
      typeof window !== "undefined" && token
        ? JSON.parse(atob(token.split(".")[1])).role ?? null
        : null;
  } catch {
    role = null;
  }

  async function fetchProducts() {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setProducts([]);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!productCode.trim()) {
      alert("Product code is required.");
      return;
    }

    if (!name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (Number(defaultPrice) < 0) {
      alert("Default price cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productCode,
          name,
          category,
          unit,
          defaultPrice: Number(defaultPrice || 0),
          allowManualPriceOverride,
          isActive: true,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(errorText || "Failed to save product");
        return;
      }

      setProductCode("");
      setName("");
      setCategory("");
      setUnit("");
      setDefaultPrice("");
      setAllowManualPriceOverride(false);

      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-6">Products</h1>

        {role === "Admin" && (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white text-gray-900 rounded-xl shadow p-4 mb-6"
          >
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Product Code</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                placeholder="e.g. P001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                placeholder="Product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                placeholder="Category"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                placeholder="Unit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Default Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                placeholder="Default price"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-7">
              <input
                id="allowManualPriceOverride"
                type="checkbox"
                checked={allowManualPriceOverride}
                onChange={(e) => setAllowManualPriceOverride(e.target.checked)}
              />
              <label htmlFor="allowManualPriceOverride" className="text-sm text-gray-700">
                Allow Manual Price Override
              </label>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Add Product"}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white text-gray-900 rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm text-gray-900">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Default Price</th>
                <th className="px-4 py-3">Override</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-700">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((item, index) => (
                  <tr key={item.id} className="border-t text-gray-900">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{item.productCode}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{Number(item.defaultPrice).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {item.allowManualPriceOverride ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">{item.isActive ? "Active" : "Inactive"}</td>
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
