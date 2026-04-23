"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type JwtPayload = {
  role?: string;
  ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?: string;
};

function getRoleFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload)) as JwtPayload;

    return (
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      decoded.role ??
      null
    );
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setRole(getRoleFromToken());
  }, []);

  return (
    <nav className="bg-gray-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold">Meridian Water Plus</div>

        <button
          type="button"
          className="rounded-md border border-gray-700 px-3 py-2 text-sm md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/customers" className="hover:underline">
            Customers
          </Link>
          <Link href="/orders/new" className="hover:underline">
            New Order
          </Link>
          <Link href="/sales" className="hover:underline">
            Sales
          </Link>

{(role === "Admin" || role === "User") && (
  <Link href="/expenses" className="hover:underline">
    Expenses
  </Link>
)}

          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <Link href="/login" className="ml-2 hover:underline">
            Logout
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="space-y-2 border-t border-gray-800 px-4 py-3 md:hidden">
          <Link href="/" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/customers" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            Customers
          </Link>
          <Link href="/orders/new" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            New Order
          </Link>
          <Link href="/sales" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            Sales
          </Link>
         
{(role === "Admin" || role === "User") && (
  <Link href="/expenses" className="block hover:underline" onClick={() => setMenuOpen(false)}>
    Expenses
  </Link>
)}

          <Link href="/products" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            Products
          </Link>
          <Link href="/login" className="block hover:underline" onClick={() => setMenuOpen(false)}>
            Logout
          </Link>
        </div>
      )}
    </nav>
  );
}
