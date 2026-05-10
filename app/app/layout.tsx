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
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--t1)" }}>
        <ThemeProvider>
          <SetupModalProvider>
            <HistoryProvider>
              {/* Main content area - full width with header/tabs */}
              <div className="flex flex-col flex-1">
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
