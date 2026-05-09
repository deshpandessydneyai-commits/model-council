"use client";

import { Clock, Settings, HelpCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSetupModal } from "@/lib/setup-modal-context";
import { useHistory } from "@/lib/history-context";
import { COUNCIL_MODELS, SYNTHESIZER } from "@/lib/models";

type SidebarProps = {
  onNewCouncil?: () => void;
  currentPage?: "home" | "history" | "settings";
};

export function Sidebar({ onNewCouncil, currentPage = "home" }: SidebarProps) {
  const { setIsOpen } = useSetupModal();
  const { openHistory } = useHistory();
  const [credits, setCredits] = useState<string>("—");
  const [creditsColor, setCreditsColor] = useState<string>("#9CA3AF");

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          const remaining = data.remaining ?? 0;
          const color = remaining < 1 ? "#dc2626" : remaining < 3 ? "#d97706" : "#16a34a";
          setCredits(`$${remaining.toFixed(2)}`);
          setCreditsColor(color);
        } else {
          setCredits("—");
        }
      } catch {
        setCredits("—");
      }
    };
    fetchCredits();
  }, []);

  const navItems = [
    { id: "new", label: "New Council", icon: Plus, onClick: () => setIsOpen(true) },
    { id: "history", label: "History", icon: Clock, onClick: () => openHistory() },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "help", label: "Help", icon: HelpCircle, href: "/help" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-300 dark:border-glass bg-white dark:bg-dark-bg flex flex-col z-40">
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === currentPage;
          const content = (
            <div
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-indigo-100 dark:bg-dark-overlay text-indigo-700 dark:text-violet-400 border border-indigo-300 dark:border-violet-500/50"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-overlay"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="w-full text-left"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={item.id} href={item.href || "/"}>
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-300 dark:border-glass px-3 py-4 space-y-4 overflow-y-auto">
        {/* Credits */}
        <div className="glass-card px-4 py-3 space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-500">Credits</div>
          <div className="text-sm font-bold" style={{ color: creditsColor }}>
            {credits}
          </div>
        </div>

        {/* Council Models */}
        <div className="px-2 space-y-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Council</div>
          <ul className="space-y-1">
            {COUNCIL_MODELS.map((m) => (
              <li key={m.id} className="text-xs text-gray-600 dark:text-gray-400">
                {m.displayName}
              </li>
            ))}
            <li className="text-xs text-gray-500 dark:text-gray-500 pt-1">
              synth — {SYNTHESIZER.displayName}
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
