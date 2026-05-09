import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { SetupModalProvider } from "@/lib/setup-modal-context";
import { ThemeProvider } from "@/lib/theme-context";
import { HistoryProvider } from "@/lib/history-context";

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
  // Determine current page - this is a client-side wrapper, so we'll use "home" as default
  // The actual page will override this via context if needed
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white dark-theme">
        <ThemeProvider>
          <SetupModalProvider>
            <HistoryProvider>
              {/* Sidebar */}
              <Sidebar currentPage="home" />

              {/* Main content area */}
              <div className="flex-1 ml-64 flex flex-col">
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </HistoryProvider>
          </SetupModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
