"use client";

import { COUNCIL_MODELS } from "@/lib/models";

type ModelStatus = "idle" | "responding" | "done";

type Props = {
  round: number;
  modelStatus: Record<string, ModelStatus>;
};

const statusIcons = {
  idle: "⏳",
  responding: "✍️",
  done: "✓",
};

const statusColors = {
  idle: "text-muted",
  responding: "text-blue-600 animate-pulse",
  done: "text-green-600",
};

export function ModelStatusDisplay({ round, modelStatus }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {COUNCIL_MODELS.map((model) => {
        const status = modelStatus[model.id] ?? "idle";
        return (
          <div
            key={model.id}
            className={`border border-black/10 px-3 py-2 rounded text-sm ${
              status === "done" ? "bg-green-50" : status === "responding" ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={statusColors[status]}>{statusIcons[status]}</span>
              <span className="font-medium text-xs">{model.shortLabel}</span>
            </div>
            <div className="text-xs text-muted">
              {status === "idle" && "Waiting…"}
              {status === "responding" && "Responding…"}
              {status === "done" && "Complete"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
