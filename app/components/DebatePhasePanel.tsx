"use client";

import { useMemo } from "react";
import { getGPSPhaseInfo } from "@/lib/gps-framework";

interface DebatePhasePanelProps {
  currentRound: number;
  modelStatuses?: Record<string, "done" | "responding" | "waiting">;
}

export function DebatePhasePanel({
  currentRound,
  modelStatuses = {},
}: DebatePhasePanelProps) {
  const gpsPhase = useMemo(() => getGPSPhaseInfo(currentRound), [currentRound]);

  const models = Object.entries(modelStatuses);
  const responding = models.filter(([, status]) => status === "responding").length;
  const done = models.filter(([, status]) => status === "done").length;
  const total = models.length;

  // All three phases for reference
  const allPhases = [
    { round: 1, emoji: "🎯", phase: "GATHER", label: "Round 1 - Independent", description: "Each model forms an independent view without seeing others' responses. This reveals initial perspectives." },
    { round: 2, emoji: "⚔️", phase: "PROBE", label: "Round 2 - Critique", description: "Models challenge and refine each other's arguments. They probe assumptions and identify weaknesses." },
    { round: 3, emoji: "✨", phase: "SYNTHESIZE", label: "Round 3 - Final", description: "Models synthesize reasoning, check for cognitive biases, and finalize their positions." },
  ];

  return (
    <div
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: "var(--bg-inset)",
        borderColor: "var(--bd)",
      }}
    >
      {/* Header */}
      <h3
        className="text-xs uppercase tracking-widest font-semibold mb-2"
        style={{ color: "var(--t3)" }}
      >
        Debate Progress: Round {currentRound} — {gpsPhase?.phase} Phase
      </h3>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(done / total) * 100}%` }}
              />
            </div>
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: "var(--t3)" }}
            >
              {done}/{total} complete{responding > 0 && ` · ${responding} responding`}
            </span>
          </div>
        </div>
      )}

      {/* Current Phase Explanation */}
      {gpsPhase && (
        <div className="mb-3 p-2.5 rounded border-l-4" style={{ borderLeftColor: "#8B5CF6", backgroundColor: "rgba(139, 92, 246, 0.05)" }}>
          <p
            className="text-xs font-semibold mb-0.5"
            style={{ color: "var(--t1)" }}
          >
            {gpsPhase.emoji} {gpsPhase.phase} — {gpsPhase.phase === "Gather" ? "Round 1 - Independent" : gpsPhase.phase === "Probe" ? "Round 2 - Critique" : "Round 3 - Final"}
          </p>
          <p
            className="text-xs leading-snug"
            style={{ color: "var(--t2)" }}
          >
            {gpsPhase.phase === "Gather"
              ? "Each model forms an independent view without seeing others' responses. This reveals initial perspectives."
              : gpsPhase.phase === "Probe"
              ? "Models challenge and refine each other's arguments. They probe assumptions and identify weaknesses."
              : "Models synthesize reasoning, check for cognitive biases, and finalize their positions."}
          </p>
        </div>
      )}

      {/* All Phases Timeline */}
      <div className="space-y-1.5">
        {allPhases.map((phaseInfo, idx) => (
          <div
            key={phaseInfo.round}
            className="flex items-start gap-2 p-2 rounded"
            style={{
              backgroundColor:
                currentRound === phaseInfo.round
                  ? "rgba(139, 92, 246, 0.1)"
                  : currentRound > phaseInfo.round
                  ? "rgba(34, 197, 94, 0.05)"
                  : "transparent",
            }}
          >
            {/* Phase dot */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-xs text-white"
              style={{
                backgroundColor:
                  currentRound > phaseInfo.round
                    ? "#22c55e"
                    : currentRound === phaseInfo.round
                    ? "#8B5CF6"
                    : "#d1d5db",
              }}
            >
              {currentRound > phaseInfo.round ? "✓" : phaseInfo.round}
            </div>

            {/* Phase info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold" style={{ color: "var(--t1)" }}>
                  {phaseInfo.emoji} {phaseInfo.phase}
                </span>
                {currentRound > phaseInfo.round && (
                  <span className="text-2xs" style={{ color: "#22c55e" }}>
                    Complete
                  </span>
                )}
                {currentRound === phaseInfo.round && (
                  <span className="text-2xs" style={{ color: "#8B5CF6" }}>
                    In Progress
                  </span>
                )}
                {currentRound < phaseInfo.round && (
                  <span className="text-2xs" style={{ color: "var(--t3)" }}>
                    Coming Next
                  </span>
                )}
              </div>
              <p className="text-2xs mt-1" style={{ color: "var(--t3)" }}>
                {phaseInfo.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
