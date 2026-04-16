import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionGuard from "./session-guard";

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
  <a href="/" className="hover:underline text-white">Dashboard</a>
  <a href="/customers" className="hover:underline">Customers</a>
  <a href="/income" className="hover:underline text-white">Sales</a>
  <a href="/expenses" className="hover:underline text-white">Expenses</a>
  <a href="/login" className="ml-auto hover:underline text-white">Logout</a>
</nav>
  {children}
</body>
    </html>
  );
}
