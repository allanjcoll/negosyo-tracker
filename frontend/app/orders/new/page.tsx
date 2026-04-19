"use client";

import { useEffect, useState, useRef } from "react";


type Customer = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  defaultPrice: number;
};

type OrderItemLine = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function NewOrderPage() {

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItemLine[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [selectedUnitPrice, setSelectedUnitPrice] = useState("");

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerArea, setNewCustomerArea] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("");
  const customerRef = useRef<HTMLInputElement>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchCustomers() {
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setCustomers([]);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  }

//async function handleCreateCustomer
async function handleCreateCustomer() {
  if (!newCustomerName.trim()) {
    alert("Customer name required");
    return;
  }

  if (!newCustomerPhone.trim()) {
    alert("Phone number required");
    return;
  }

  if (!newCustomerArea.trim()) {
    alert("Area required");
    return;
  }

  if (!newCustomerCity.trim()) {
    alert("City required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newCustomerName.trim(),
        phoneNumber: newCustomerPhone.trim(),
        area: newCustomerArea.trim(),
        city: newCustomerCity.trim(),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(text || "Failed to create customer");
      return;
    }

    const newCustomer = await res.json();

    await fetchCustomers();

    setCustomerId(String(newCustomer.id));
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerArea("");
    setNewCustomerCity("");
    setShowCustomerModal(false);
  } catch (error) {
    console.error(error);
    alert("Error creating customer");
  }
}

  useEffect(() => {
  fetchCustomers();
  fetchProducts();

  setTimeout(() => {
    customerRef.current?.focus();
  }, 100);
}, []);

  
function handleAddItem() {
  if (!selectedProductId) {
    alert("Please select a product.");
    return;
  }

  if (Number(selectedQuantity) <= 0) {
    alert("Quantity must be greater than 0.");
    return;
  }

  if (Number(selectedUnitPrice) <= 0) {
    alert("Unit price must be greater than 0.");
    return;
  }

  const selectedProduct = products.find(
    (p) => p.id === Number(selectedProductId)
  );

  if (!selectedProduct) {
    alert("Selected product not found.");
    return;
  }

  const newItem: OrderItemLine = {
    productId: selectedProduct.id,
    productName: selectedProduct.name,
    quantity: Number(selectedQuantity),
    unitPrice: Number(selectedUnitPrice),
    lineTotal: Number(selectedQuantity) * Number(selectedUnitPrice),
  };

  setItems((prev) => {
    const existingIndex = prev.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.unitPrice === newItem.unitPrice
    );

    if (existingIndex !== -1) {
      const updated = [...prev];
      const existing = updated[existingIndex];

      const newQty = existing.quantity + newItem.quantity;
      const newTotal = newQty * existing.unitPrice;

      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        lineTotal: newTotal,
      };

      return updated;
    }

    return [...prev, newItem];
  });

  setSelectedProductId("");
  setSelectedQuantity("");
  setSelectedUnitPrice("");
}


  function handleRemoveItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const paid = Number(paidAmount || 0);
  const balance = Math.max(subtotal - paid, 0);
 
  const filteredCustomers = customers.filter((customer) =>
  customer.name.toLowerCase().includes(customerSearch.toLowerCase())
);

  async function handleSaveOrder() {
    if (!customerId) {
      alert("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        orderNumber: `ORD-${Date.now()}`,
        customerId: Number(customerId),
        orderDate: new Date().toISOString(),
        remarks,

        orderItems: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),

        payments:
          paid > 0
            ? [
                {
                  amount: paid,
                  paymentMethod: "Cash",
                },
              ]
            : [],
      };

      const orderRes = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        alert(errorText || "Failed to create order.");
        return;
      }

      await orderRes.json();

      alert("Order saved successfully.");

      // Reset form
      setCustomerId("");
      setRemarks("");
      setPaidAmount("");
      setSelectedProductId("");
      setSelectedQuantity("");
      setSelectedUnitPrice("");
      setItems([]);
    } catch (error) {
      console.error(error);
      alert("Failed to save order.");
    } finally {
      setLoading(false);
    }
  }

return (
  <>
    <main className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">New Order</h1>

        <div className="bg-white text-gray-900 rounded-xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Customer
              </label>

              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="text-blue-600 text-sm"
              >
                + New
              </button>
            </div>

          <div className="relative">
  <input
    ref={customerRef}
    type="text"
    value={customerSearch}
    onChange={(e) => {
      setCustomerSearch(e.target.value);
      setShowCustomerResults(true);
      setCustomerId("");
    }}
    onFocus={() => setShowCustomerResults(true)}
    placeholder="Search customer"
    className="w-full border border-gray-300 rounded-lg px-3 py-2"
  />

  {showCustomerResults && customerSearch.trim() !== "" && (
    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-60 overflow-y-auto">
      {filteredCustomers.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-500">
          No customer found
        </div>
      ) : (
        filteredCustomers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => {
              setCustomerId(String(customer.id));
              setCustomerSearch(customer.name);
              setShowCustomerResults(false);
            }}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
          >
            {customer.name}
          </button>
        ))
      )}
    </div>
  )}
</div>

    </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Optional remarks"
            />
          </div>
        </div>

        <div className="bg-white text-gray-900 rounded-xl shadow p-4 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Quick Add</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setItems((prev) => {
                      const existingIndex = prev.findIndex(
                        (item) => item.productId === product.id
                      );

                      if (existingIndex !== -1) {
                        const updated = [...prev];
                        const existing = updated[existingIndex];

                        const newQty = existing.quantity + 1;
                        const newTotal = newQty * existing.unitPrice;

                        updated[existingIndex] = {
                          ...existing,
                          quantity: newQty,
                          lineTotal: newTotal,
                        };

                        return updated;
                      }

                      return [
                        ...prev,
                        {
                          productId: product.id,
                          productName: product.name,
                          quantity: 1,
                          unitPrice: product.defaultPrice,
                          lineTotal: product.defaultPrice,
                        },
                      ];
                    });
                  }}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg p-3 text-left"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    ₱ {product.defaultPrice.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Order Items</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              value={selectedProductId}
              onChange={(e) => {
                const value = e.target.value;
                const selected = products.find((p) => p.id === Number(value));
                setSelectedProductId(value);
                setSelectedUnitPrice(String(selected?.defaultPrice ?? ""));
              }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Qty"
            />

            <input
              type="number"
              value={selectedUnitPrice}
              onChange={(e) => setSelectedUnitPrice(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Price"
            />

            <button
              type="button"
              onClick={handleAddItem}
              className="bg-green-600 text-white rounded-lg px-4 py-2"
            >
              Add
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th>No</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.productName}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setItems((prev) =>
                            prev
                              .map((it, i) => {
                                if (i !== idx) return it;

                                const newQty = it.quantity - 1;
                                if (newQty <= 0) return null;

                                return {
                                  ...it,
                                  quantity: newQty,
                                  lineTotal: newQty * it.unitPrice,
                                };
                              })
                              .filter(Boolean) as typeof items
                          );
                        }}
                        className="px-2 bg-gray-200 rounded"
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => {
                          setItems((prev) =>
                            prev.map((it, i) => {
                              if (i !== idx) return it;

                              const newQty = it.quantity + 1;
                              return {
                                ...it,
                                quantity: newQty,
                                lineTotal: newQty * it.unitPrice,
                              };
                            })
                          );
                        }}
                        className="px-2 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item.unitPrice}</td>
                  <td>{item.lineTotal}</td>
                  <td>
                    <button type="button" onClick={() => handleRemoveItem(idx)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div>Subtotal: ₱ {subtotal.toFixed(2)}</div>

          <input
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="Paid amount"
            className="border px-3 py-2 mt-2"
          />

          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => setPaidAmount(String(subtotal))}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Exact
            </button>

            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setPaidAmount(String(amt))}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                ₱ {amt}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPaidAmount("0")}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Utang
            </button>
          </div>

          <div>Balance: ₱ {balance.toFixed(2)}</div>

          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>
    </main>

{showCustomerModal && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">New Customer</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Customer Name
          </label>
          <input
            type="text"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
            placeholder="Enter phone number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Area
          </label>
          <input
            type="text"
            value={newCustomerArea}
            onChange={(e) => setNewCustomerArea(e.target.value)}
            placeholder="Enter area"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            City
          </label>
          <input
            type="text"
            value={newCustomerCity}
            onChange={(e) => setNewCustomerCity(e.target.value)}
            placeholder="Enter city"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button
          type="button"
          onClick={() => {
            setShowCustomerModal(false);
            setNewCustomerName("");
            setNewCustomerPhone("");
            setNewCustomerArea("");
            setNewCustomerCity("");
          }}
          className="px-3 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreateCustomer}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}





  </>
);
}
