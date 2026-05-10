import React from "react";

interface HeaderProps {
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHistoryClick, onSettingsClick }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--bd)] bg-[var(--bg)] px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span
              className="font-serif text-[18px] font-semibold tracking-tight"
              style={{ color: "var(--t1)" }}
            >
              Model Council
            </span>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--ac)" }}
            />
          </div>

          {/* Nav links */}
          <nav className="hidden gap-6 md:flex">
            {["Council", "History", "Settings", "Help"].map((label) => (
              <button
                key={label}
                onClick={() => {
                  if (label === "History") onHistoryClick?.();
                  if (label === "Settings") onSettingsClick?.();
                }}
                className="text-xs font-medium uppercase tracking-wide transition-colors"
                style={{
                  color: "var(--t3)",
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Credits + Avatar */}
        <div className="flex items-center gap-4">
          {/* Credits (placeholder) */}
          <div
            className="text-right text-xs font-mono"
            style={{
              color: "var(--t3)",
            }}
          >
            <div>Credits: $2.50</div>
            <div style={{ color: "var(--t4)" }}>Last updated today</div>
          </div>

          {/* Avatar circle */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
            style={{
              backgroundColor: "var(--ac)",
            }}
          >
            A
          </div>
        </div>
      </div>
    </header>
  );
};
