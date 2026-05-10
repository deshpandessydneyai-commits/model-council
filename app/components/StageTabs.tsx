"use client";

import { Dot } from "lucide-react";

interface StageTabsProps {
  currentStage: "pose" | "deliberate" | "verdict";
  onStageChange?: (stage: "pose" | "deliberate" | "verdict") => void;
  roundInfo?: {
    currentRound?: number;
    totalRounds?: number;
    estimatedTimeRemaining?: string;
  };
}

const stages = [
  { id: "pose", label: "Your Question", description: "Ask", number: 1 },
  { id: "deliberate", label: "Watch Debate", description: "Models thinking", number: 2 },
  { id: "verdict", label: "See Verdict", description: "Final consensus", number: 3 },
];

export function StageTabs({
  currentStage,
  onStageChange,
  roundInfo,
}: StageTabsProps) {
  return (
    <div
      className="border-b"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--bd)",
      }}
    >
      <div className="flex items-center justify-between h-[52px] px-8">
        {/* Left: Stage tabs */}
        <div className="flex items-center gap-1">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => onStageChange?.(stage.id as any)}
              className="px-8 py-4 text-sm uppercase tracking-wider font-medium transition-all relative hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center gap-3"
              style={{
                color:
                  currentStage === stage.id
                    ? "var(--t1)"
                    : "var(--t3)",
              }}
              tabIndex={0}
              title={stage.label}
            >
              <span className="inline-block text-lg">{["①", "②", "③"][stage.number - 1]}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold uppercase">{stage.label}</span>
                <span className="text-xs opacity-60" style={{ fontWeight: "normal" }}>{stage.description}</span>
              </div>
              {currentStage === stage.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: "var(--ac)" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: Round info */}
        {roundInfo && (
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "var(--t3)" }}
          >
            <Dot size={12} className="fill-current" />
            {roundInfo.currentRound && (
              <span>Round {roundInfo.currentRound}</span>
            )}
            {roundInfo.estimatedTimeRemaining && (
              <span>~{roundInfo.estimatedTimeRemaining}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
