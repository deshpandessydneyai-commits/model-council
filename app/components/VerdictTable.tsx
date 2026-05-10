"use client";

import { useState } from "react";
import { ChevronDown, Check, AlertCircle, X } from "lucide-react";
import type { VerdictRow } from "@/lib/council";
import { COUNCIL_MODELS } from "@/lib/models";
import { extractModelVersion } from "@/lib/utils";

function getConsensusLevel(alignment: number): { label: string; bgColor: string; textColor: string; borderColor: string; icon: React.ReactNode } {
  if (alignment >= 80) {
    return {
      label: "Full Consensus",
      bgColor: "#f0fdf4",
      textColor: "#166534",
      borderColor: "#dcfce7",
      icon: <Check size={14} />,
    };
  } else if (alignment >= 50) {
    return {
      label: "Partial Consensus",
      bgColor: "#fefce8",
      textColor: "#854d0e",
      borderColor: "#fef3c7",
      icon: <AlertCircle size={14} />,
    };
  } else {
    return {
      label: "Disagreement",
      bgColor: "#fef2f2",
      textColor: "#991b1b",
      borderColor: "#fee2e2",
      icon: <X size={14} />,
    };
  }
}

export function VerdictTable({ rows }: { rows: VerdictRow[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (modelId: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(modelId)) {
      newSet.delete(modelId);
    } else {
      newSet.add(modelId);
    }
    setExpandedRows(newSet);
  };

  if (rows.length === 0) {
    return (
      <div className="mono-meta" style={{ color: "var(--t3)" }}>
        verdict table unavailable — synthesizer parse failed
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--bd)" }}>
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: "var(--bg-inset)", borderBottomColor: "var(--bd)" }} className="border-b">
            <th className="mono-meta text-left py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Model
            </th>
            <th className="mono-meta text-left py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)", width: "150px" }}>
              Version
            </th>
            <th className="mono-meta text-left py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Consensus
            </th>
            <th className="mono-meta text-left py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Agree
            </th>
            <th className="mono-meta text-left py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Disagree
            </th>
            <th className="mono-meta text-center py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Confidence
            </th>
            <th className="mono-meta text-center py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Alignment
            </th>
            <th className="mono-meta text-left py-4 px-5 text-xs uppercase tracking-wide" style={{ color: "var(--t3)" }}>
              Reasoning
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const consensus = getConsensusLevel(r.positionAlignment);
            const isEven = idx % 2 === 0;

            return (
              <tr
                key={r.modelId}
                className="align-top transition-colors cursor-pointer border-b hover:opacity-75"
                style={{
                  backgroundColor: isEven ? "var(--bg-card)" : "var(--bg-inset)",
                  borderBottomColor: "var(--bd)",
                }}
                onClick={() => toggleRow(r.modelId)}
              >
                {/* Model Name */}
                <td className="py-6 px-5 font-semibold" style={{ color: "var(--t1)" }}>
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      size={16}
                      className="transition-transform"
                      style={{
                        color: "var(--t3)",
                        transform: expandedRows.has(r.modelId) ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                    {r.model}
                  </div>
                </td>

                {/* Version */}
                <td className="py-6 px-5 text-sm" style={{ color: "var(--t2)", width: "150px" }}>
                  {extractModelVersion(COUNCIL_MODELS.find(m => m.id === r.modelId)?.slug || "")}
                </td>

                {/* Consensus Badge */}
                <td className="py-6 px-5">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border"
                    style={{
                      backgroundColor: consensus.bgColor,
                      color: consensus.textColor,
                      borderColor: consensus.borderColor,
                    }}
                  >
                    {consensus.icon}
                    {consensus.label}
                  </div>
                </td>

                {/* Agree */}
                <td className="py-6 px-5 text-sm leading-relaxed max-w-xs" style={{ color: "var(--t2)" }}>
                  {r.agree}
                </td>

                {/* Disagree */}
                <td className="py-6 px-5 text-sm leading-relaxed max-w-xs" style={{ color: "var(--t2)" }}>
                  {r.disagree}
                </td>

                {/* Confidence */}
                <td className="py-6 px-5 text-center">
                  <div className="inline-flex items-center gap-1">
                    <span className="text-lg font-semibold" style={{ color: "var(--t1)" }}>
                      {r.confidence}
                    </span>
                    <span className="text-xs" style={{ color: "var(--t3)" }}>
                      /5
                    </span>
                  </div>
                </td>

                {/* Alignment Bar */}
                <td className="py-6 px-5 text-center">
                  <div className="inline-flex flex-col items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--t1)" }}>
                      {r.positionAlignment}%
                    </span>
                    <div
                      className="w-16 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--bg-inset)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${r.positionAlignment}%`,
                          backgroundColor:
                            r.positionAlignment >= 80
                              ? "#22c55e"
                              : r.positionAlignment >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Reasoning */}
                <td className="py-6 px-5 text-sm leading-relaxed max-w-md" style={{ color: "var(--t2)" }}>
                  {expandedRows.has(r.modelId) ? (
                    <p style={{ color: "var(--t1)" }}>{r.reasoningTrace}</p>
                  ) : (
                    <p className="line-clamp-1">{r.reasoningTrace}</p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
