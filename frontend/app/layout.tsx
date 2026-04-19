import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionGuard from "./session-guard";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Meridian Water Plus",
  description: "Meridian Water Plus System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
	<body className="bg-black text-white">
<nav className="bg-gray-900 px-4 py-3 flex gap-4 text-white">
  <Link href="/" className="hover:underline text-white">Dashboard</Link>
  <Link href="/customers" className="hover:underline">Customers</Link>
  <Link href="/orders/new" className="hover:underline">New Order</Link>
  <Link href="/sales" className="hover:underline text-white">Sales</Link>
  <Link href="/expenses" className="hover:underline text-white">Expenses</Link>
  <Link href="/products" className="hover:underline">Products</Link>
  <Link href="/login" className="ml-auto hover:underline text-white">Logout</Link>
</nav>

  {children}
</body>
    </html>
  );
}
