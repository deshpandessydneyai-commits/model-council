"use client";

import { getGPSPhaseInfo } from "@/lib/gps-framework";

interface DebateProgressProps {
  modelStatuses?: Record<string, "done" | "responding" | "waiting">;
  currentRound?: number;
}

export function DebateProgress({
  modelStatuses = {},
  currentRound = 1,
}: DebateProgressProps) {
  const models = Object.entries(modelStatuses);
  const responding = models.filter(([, status]) => status === "responding").length;
  const done = models.filter(([, status]) => status === "done").length;
  const gpsPhase = getGPSPhaseInfo(currentRound);

  return (
    <div
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: "var(--bg-inset)",
        borderColor: "var(--bd)",
      }}
    >
      <div className="mb-3">
        <div
          className="text-xs uppercase tracking-widest font-medium"
          style={{ color: "var(--t3)" }}
        >
          Round {currentRound} — {gpsPhase ? `${gpsPhase.phase} Phase` : "Progress"}
        </div>
        {gpsPhase && (
          <p
            className="text-xs mt-1"
            style={{ color: "var(--t2)" }}
          >
            {gpsPhase.emoji} {gpsPhase.description}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {models.map(([modelId, status]) => (
          <div key={modelId} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  status === "done"
                    ? "#22c55e"
                    : status === "responding"
                    ? "#8B5CF6"
                    : "#e5e7eb",
              }}
            />
            <span
              className="text-sm capitalize"
              style={{ color: "var(--t2)" }}
            >
              {modelId}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--t3)" }}
            >
              {status === "done" ? "✓ Complete" : status === "responding" ? "○ Responding..." : "○ Waiting"}
            </span>
          </div>
        ))}
      </div>

      <div
        className="mt-4 text-xs"
        style={{ color: "var(--t3)" }}
      >
        {done}/{models.length} models complete
      </div>
    </div>
  );
}
