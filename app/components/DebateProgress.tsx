"use client";

import { X } from "lucide-react";
import { COUNCIL_MODELS } from "@/lib/models";
import { getDomainPersonaSet } from "@/lib/domain-personas";
import type { DomainType } from "@/lib/types/stakes";

type ModelStatus = "idle" | "responding" | "done";

type Props = {
  currentRound: number;
  modelStatus: Record<string, ModelStatus>;
  roundOutputs: Record<string, string>; // modelId → streamed text so far
  domain?: DomainType;
  onCancel: () => void;
};

const ROUND_CONFIG = {
  0: {
    label: "Initialising",
    description: "Preparing the council chamber…",
    color: "text-gray-500 dark:text-gray-400",
    accent: "#6b7280",
    accentLight: "bg-[#F0EFEB] dark:bg-gray-800",
    border: "border-[#E2E0DA] dark:border-gray-700",
    progress: "bg-gray-400",
    badge: "bg-[#F0EFEB] dark:bg-gray-800 text-gray-600 dark:text-gray-300",
  },
  1: {
    label: "Round 1 — Independent",
    description: "Each model is forming an independent view without seeing the others' responses.",
    color: "text-blue-600 dark:text-blue-400",
    accent: "#3b82f6",
    accentLight: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    progress: "bg-blue-500",
    badge: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  },
  2: {
    label: "Round 2 — Critique",
    description: "Models are reading and challenging each other's positions.",
    color: "text-amber-600 dark:text-amber-400",
    accent: "#f59e0b",
    accentLight: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    progress: "bg-amber-500",
    badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  },
  3: {
    label: "Round 3 — Final Verdict",
    description: "Models are locking in their final positions and delivering verdicts.",
    color: "text-violet-600 dark:text-violet-400",
    accent: "#8b5cf6",
    accentLight: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    progress: "bg-violet-500",
    badge: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
  },
};

const TOTAL_ROUNDS = 3;

function wordCount(text: string): number {
  return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

export function DebateProgress({ currentRound, modelStatus, roundOutputs, domain, onCancel }: Props) {
  const config = ROUND_CONFIG[currentRound as keyof typeof ROUND_CONFIG] ?? ROUND_CONFIG[0];
  const personas = domain ? getDomainPersonaSet(domain) : undefined;

  const doneCount = COUNCIL_MODELS.filter(m => modelStatus[m.id] === "done").length;
  const respondingCount = COUNCIL_MODELS.filter(m => modelStatus[m.id] === "responding").length;

  return (
    <div className={`rounded-xl border ${config.border} ${config.accentLight} overflow-hidden transition-all duration-500`}>

      {/* Round Journey Stepper */}
      <div className="px-6 pt-5 pb-4 border-b border-inherit">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => {
            const isDone = currentRound > step;
            const isActive = currentRound === step;
            const stepConfig = ROUND_CONFIG[step as keyof typeof ROUND_CONFIG];

            return (
              <div key={step} className="flex items-center gap-2 flex-1">
                {/* Step circle */}
                <div className={`
                  relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                  ${isDone
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "text-white shadow-lg"
                    : "bg-[#E2E0DA] dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }
                `}
                style={isActive ? { backgroundColor: stepConfig.accent, boxShadow: `0 0 0 4px ${stepConfig.accent}30` } : {}}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span>{isActive && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: stepConfig.accent }} />
                    )}{step}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate transition-colors duration-300 ${
                    isDone ? "text-green-600 dark:text-green-400"
                    : isActive ? stepConfig.color
                    : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {step === 1 ? "Independent" : step === 2 ? "Critique" : "Final"}
                  </div>
                </div>

                {/* Connector line */}
                {step < 3 && (
                  <div className="w-8 h-px flex-shrink-0 mx-1 rounded-full transition-all duration-500"
                    style={{ backgroundColor: currentRound > step ? "#22c55e" : "#e5e7eb" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Round description */}
        {currentRound > 0 && (
          <p className={`mt-3 text-xs leading-relaxed ${config.color} opacity-90`}>
            {config.description}
          </p>
        )}
      </div>

      {/* Model Status Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COUNCIL_MODELS.map((model) => {
            const status = modelStatus[model.id] ?? "idle";
            const words = wordCount(roundOutputs[model.id] ?? "");

            return (
              <div
                key={model.id}
                className={`
                  relative rounded-lg border px-3 py-2.5 transition-all duration-300 overflow-hidden
                  ${status === "done"
                    ? "border-green-200 dark:border-green-800 bg-white dark:bg-green-950/20"
                    : status === "responding"
                    ? `border-current bg-white dark:bg-[#0F0F1A]`
                    : "border-[#E2E0DA] dark:border-gray-700 bg-white/60 dark:bg-white/5"
                  }
                `}
                style={status === "responding" ? { borderColor: config.accent + "60" } : {}}
              >
                {/* Animated shimmer bar at bottom when responding */}
                {status === "responding" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b">
                    <div
                      className="h-full w-1/2 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)`,
                        animation: "shimmer 1.5s ease-in-out infinite",
                      }}
                    />
                  </div>
                )}

                {/* Model name row */}
                <div className="flex items-center gap-1.5 mb-1">
                  {status === "done" ? (
                    <span className="text-green-500 text-xs">✓</span>
                  ) : status === "responding" ? (
                    <span className="flex gap-0.5 items-end h-3">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-0.5 rounded-full"
                          style={{
                            height: "8px",
                            backgroundColor: config.accent,
                            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                            display: "inline-block",
                          }}
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
                  )}
                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {model.shortLabel}
                  </span>
                </div>

                {/* Persona role badge */}
                {personas && personas[model.id as keyof typeof personas] && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate mb-1" style={{ fontSize: "10px" }}>
                    {personas[model.id as keyof typeof personas].role}
                  </div>
                )}

                {/* Status + word count */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    status === "done" ? "text-green-600 dark:text-green-400"
                    : status === "responding" ? config.color
                    : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {status === "idle" && "Waiting"}
                    {status === "responding" && "Writing…"}
                    {status === "done" && "Complete"}
                  </span>
                  {words > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                      {words}w
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-inherit flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {COUNCIL_MODELS.map((m) => {
              const s = modelStatus[m.id] ?? "idle";
              return (
                <div
                  key={m.id}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: s === "done" ? "#22c55e"
                      : s === "responding" ? config.accent
                      : "#d1d5db"
                  }}
                />
              );
            })}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {doneCount} of {COUNCIL_MODELS.length} complete
            {respondingCount > 0 && ` · ${respondingCount} responding`}
          </span>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <X size={12} />
          Cancel
        </button>
      </div>
    </div>
  );
}
