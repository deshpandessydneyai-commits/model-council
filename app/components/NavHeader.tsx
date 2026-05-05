"use client";

import { Clock, Plus } from "lucide-react";

type Props = {
  onHistoryClick?: () => void;
};

export function NavHeader({ onHistoryClick }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 bg-white border-b border-black/10">
      <a
        href="/"
        className="text-black text-2xl font-bold tracking-tighter lowercase"
      >
        mc
      </a>
      <div className="flex items-center gap-2">
        <button
          onClick={onHistoryClick}
          aria-label="History"
          className="text-black h-10 w-10 flex items-center justify-center hover:opacity-60 transition-opacity"
        >
          <Clock size={18} strokeWidth={1.5} />
        </button>
        <button
          aria-label="Menu"
          className="text-black h-10 w-10 flex items-center justify-center hover:opacity-60 transition-opacity"
        >
          <Plus size={24} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
