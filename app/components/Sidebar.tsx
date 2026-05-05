"use client";

import { Clock, Settings, HelpCircle, Plus, MoreVertical } from "lucide-react";
import Link from "next/link";

type SidebarProps = {
  onNewCouncil?: () => void;
  currentPage?: "home" | "history" | "settings";
};

export function Sidebar({ onNewCouncil, currentPage = "home" }: SidebarProps) {
  const navItems = [
    { id: "new", label: "New Council", icon: Plus, onClick: onNewCouncil },
    { id: "home", label: "Recent", icon: Clock, href: "/" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "help", label: "Help", icon: HelpCircle, href: "/help" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-glass bg-dark-bg pt-6 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 pb-8 border-b border-glass">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">mc</span>
          </div>
          <span className="font-bold text-white group-hover:text-violet-400 transition-colors">
            Council
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === currentPage;
          const content = (
            <div
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-dark-overlay text-violet-400 border border-violet-500/50"
                  : "text-gray-400 hover:text-white hover:bg-dark-overlay"
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
      <div className="border-t border-glass px-3 py-4">
        <div className="glass-card px-4 py-3">
          <div className="text-xs text-gray-500 mb-2">Credits</div>
          <div className="text-lg font-bold text-green-400">$9.19</div>
        </div>
      </div>
    </aside>
  );
}
