import React from "react";

interface StageTabsProps {
  currentStage: "pose" | "deliberate" | "verdict";
  onStageChange: (stage: "pose" | "deliberate" | "verdict") => void;
  roundInfo?: {
    currentRound?: number;
    totalRounds?: number;
    estimatedTimeRemaining?: string;
  };
}

const stages = [
  { id: "pose", label: "Pose", number: "①" },
  { id: "deliberate", label: "Deliberate", number: "②" },
  { id: "verdict", label: "Verdict", number: "③" },
] as const;

export const StageTabs: React.FC<StageTabsProps> = ({
  currentStage,
  onStageChange,
  roundInfo,
}) => {
  return (
    <div
      className="border-b"
      style={{
        borderColor: "var(--bd)",
        backgroundColor: "var(--bg)",
      }}
    >
      <div className="flex items-center justify-between px-8 py-0">
        {/* Left: Stage tabs */}
        <div className="flex">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => onStageChange(stage.id as "pose" | "deliberate" | "verdict")}
              className="border-b-2 px-6 py-3 text-xs font-medium uppercase tracking-widest transition-colors"
              style={{
                borderColor:
                  currentStage === stage.id
                    ? "var(--ac)"
                    : "transparent",
                color:
                  currentStage === stage.id
                    ? "var(--ac)"
                    : "var(--t3)",
              }}
            >
              {stage.number} {stage.label}
            </button>
          ))}
        </div>

        {/* Right: Metadata */}
        {roundInfo && (
          <div className="flex items-center gap-3">
            {/* Green dot */}
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: currentStage === "deliberate" ? "#22c55e" : "var(--t4)",
                }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "var(--t3)" }}
              >
                {currentStage === "deliberate"
                  ? `Round ${roundInfo.currentRound || 1}`
                  : "Ready"}
              </span>
            </div>

            {/* Divider */}
            <div
              className="h-3 w-px"
              style={{ backgroundColor: "var(--bd)" }}
            />

            {/* Time remaining */}
            <span
              className="text-xs font-mono"
              style={{ color: "var(--t4)" }}
            >
              {roundInfo.estimatedTimeRemaining || "—"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
