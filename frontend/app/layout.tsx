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
      <body className="min-h-full flex flex-col">
        <SessionGuard />
        {children}
      </body>
    </html>
  );
}
