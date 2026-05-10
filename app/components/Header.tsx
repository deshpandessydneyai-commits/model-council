"use client";

import { HelpCircle } from "lucide-react";
import { COUNCIL_MODELS } from "@/lib/models";
import { useState, useEffect } from "react";

interface HeaderProps {
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
}

export function Header({ onHistoryClick, onSettingsClick, onHelpClick }: HeaderProps) {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/credits");
        const data = await res.json();
        setCredits(data.remaining ?? 0);
      } catch (err) {
        console.error("Failed to fetch credits:", err);
      }
    };
    fetchCredits();
    const interval = setInterval(fetchCredits, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--bd)",
      }}
    >
      <div className="flex items-center justify-between h-auto px-8 py-3">
        {/* Left: Logo and Tagline */}
        <div className="flex-1">
          <div className="text-2xl font-bold leading-tight" style={{ color: "var(--t1)" }}>
            Model Council
          </div>
          <p className="text-xs mt-1 leading-relaxed max-w-lg" style={{ color: "var(--t3)" }}>
            One prompt. Four models. A structured debate. One final verdict.
          </p>
        </div>

        {/* Right: Help, Session History, Credits and Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onHelpClick}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center gap-2"
            style={{ color: "var(--t2)" }}
            title="Help & Guidance"
          >
            <HelpCircle size={20} />
            <span className="text-xs font-medium hidden sm:inline">Help</span>
          </button>

          <button
            onClick={onHistoryClick}
            className="px-3 py-2 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: "var(--t2)" }}
            title="View session history"
          >
            📋 History
          </button>

          {credits !== null && (
            <div className="px-3 py-2 text-xs rounded-lg flex items-center gap-2 font-medium" style={{
              backgroundColor: "var(--bg-inset)",
              color: "var(--t1)",
              border: "1px solid var(--bd)"
            }}>
              <span>💰</span>
              <span>${credits.toFixed(2)}</span>
            </div>
          )}

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-sm"
            style={{ backgroundColor: "var(--ac)" }}
          >
            A
          </div>
        </div>
      </div>
    </header>
  );
}
