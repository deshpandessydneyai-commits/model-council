import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { CreditsWidget } from "@/components/CreditsWidget";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Model Council",
  description:
    "Convene four frontier models. Watch them debate. Read the verdict.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex bg-[#0A0A0A] text-white dark-theme">
        {/* Sidebar */}
        <Sidebar currentPage="home" />

        {/* Main content area */}
        <div className="flex-1 ml-64 flex flex-col">
          <CreditsWidget />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
