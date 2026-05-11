"use client";

import { useMemo } from "react";
import { getGPSPhaseInfo } from "@/lib/gps-framework";

interface DebateProgressBarProps {
  currentRound: number;
  modelStatuses?: Record<string, "done" | "responding" | "waiting">;
  isRunning?: boolean;
}

export function DebateProgressBar({
  currentRound,
  modelStatuses = {},
  isRunning = false,
}: DebateProgressBarProps) {
  const gpsPhase = useMemo(() => getGPSPhaseInfo(currentRound), [currentRound]);

  const models = Object.entries(modelStatuses);
  const responding = models.filter(([, status]) => status === "responding").length;
  const done = models.filter(([, status]) => status === "done").length;
  const total = models.length;

  if (!isRunning) return null;

  const allPhases = [
    { round: 1, emoji: "🎯", phase: "GATHER", label: "Round 1 - Independent" },
    { round: 2, emoji: "⚔️", phase: "PROBE", label: "Round 2 - Critique" },
    { round: 3, emoji: "✨", phase: "SYNTHESIZE", label: "Round 3 - Final" },
  ];

  return (
    <div
      className="px-8 py-3 border-b"
      style={{
        backgroundColor: "var(--bg)",
        borderBottomColor: "var(--bd)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Phase and progress info */}
        <div className="flex items-center gap-4 flex-1">
          <div>
            <h4 className="mono-meta text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Debate Progress: Round {currentRound} — {gpsPhase?.phase}
            </h4>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(done / total) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--t3)" }}>
                {done}/{total} {responding > 0 && `· ${responding} responding`}
              </span>
            </div>
          )}
        </div>

        {/* Right: Phase timeline (compact) */}
        <div className="flex items-center gap-3">
          {allPhases.map((phase, idx) => (
            <div key={phase.round} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{
                  backgroundColor:
                    currentRound > phase.round
                      ? "#22c55e"
                      : currentRound === phase.round
                      ? "#8B5CF6"
                      : "#d1d5db",
                  fontSize: "10px",
                }}
              >
                {currentRound > phase.round ? "✓" : phase.round}
              </div>
              {idx < allPhases.length - 1 && (
                <div
                  className="w-6 h-px"
                  style={{
                    backgroundColor:
                      currentRound > phase.round ? "#22c55e" : "var(--bd)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
