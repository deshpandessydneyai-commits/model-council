"use client";

import { useState } from "react";
import { ChevronDown, Check, AlertCircle, X } from "lucide-react";
import type { VerdictRow } from "@/lib/council";

// Helper to determine consensus level
function getConsensusLevel(alignment: number): { label: string; bgColor: string; textColor: string; icon: React.ReactNode } {
  if (alignment >= 80) {
    return {
      label: "Full Consensus",
      bgColor: "bg-green-100 dark:bg-green-950",
      textColor: "text-green-900 dark:text-green-100",
      icon: <Check size={14} className="text-green-700 dark:text-green-300" />,
    };
  } else if (alignment >= 50) {
    return {
      label: "Partial Consensus",
      bgColor: "bg-yellow-100 dark:bg-yellow-950",
      textColor: "text-yellow-900 dark:text-yellow-100",
      icon: <AlertCircle size={14} className="text-yellow-700 dark:text-yellow-300" />,
    };
  } else {
    return {
      label: "Disagreement",
      bgColor: "bg-red-100 dark:bg-red-950",
      textColor: "text-red-900 dark:text-red-100",
      icon: <X size={14} className="text-red-700 dark:text-red-300" />,
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
      <div className="mono-meta text-muted">
        verdict table unavailable — synthesizer parse failed
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10 bg-black/2 dark:bg-white/5">
            <th className="mono-meta text-left py-4 pr-4 text-gray-600 dark:text-gray-400">Model</th>
            <th className="mono-meta text-left py-4 pr-4 text-gray-600 dark:text-gray-400">Consensus</th>
            <th className="mono-meta text-left py-4 pr-4 text-gray-600 dark:text-gray-400">Agree</th>
            <th className="mono-meta text-left py-4 pr-4 text-gray-600 dark:text-gray-400">Disagree</th>
            <th className="mono-meta text-left py-4 pr-4 text-gray-600 dark:text-gray-400 text-center">Conf</th>
            <th className="mono-meta text-left py-4 pr-4 text-gray-600 dark:text-gray-400 text-center">Alignment</th>
            <th className="mono-meta text-left py-4 text-gray-600 dark:text-gray-400">Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const isWhiteRow = idx % 2 === 0;
            const textColor = isWhiteRow ? "text-gray-900 dark:text-white" : "text-gray-900 dark:text-white";
            const consensus = getConsensusLevel(r.positionAlignment);
            return (
            <tr
              key={r.modelId}
              className={`border-b border-gray-200 dark:border-white/10 align-top transition-colors hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer ${
                isWhiteRow ? "bg-white dark:bg-[#0A0A0A]" : "bg-gray-50 dark:bg-white/[0.02]"
              }`}
              onClick={() => toggleRow(r.modelId)}
            >
              <td className="py-6 pr-4 headline text-lg min-w-[180px] text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <ChevronDown
                    size={16}
                    className={`transition-transform text-gray-600 dark:text-gray-400 ${
                      expandedRows.has(r.modelId) ? "rotate-180" : ""
                    }`}
                  />
                  {r.model}
                </div>
              </td>
              <td className="py-6 pr-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${consensus.bgColor} ${consensus.textColor} text-xs font-semibold whitespace-nowrap`}>
                  {consensus.icon}
                  {consensus.label}
                </div>
              </td>
              <td className={`py-6 pr-4 text-sm leading-relaxed max-w-[260px] ${textColor}`}>
                {r.agree}
              </td>
              <td className={`py-6 pr-4 text-sm leading-relaxed max-w-[260px] ${textColor}`}>
                {r.disagree}
              </td>
              <td className="py-6 pr-4 text-center">
                <div className="inline-flex items-center gap-1">
                  <span className="headline text-xl text-gray-900 dark:text-white">{r.confidence}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-xs">/5</span>
                </div>
              </td>
              <td className="py-6 pr-4 text-center min-w-[100px]">
                <div className="inline-flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.positionAlignment}%</span>
                  <div className="w-16 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.positionAlignment}%`,
                        backgroundColor:
                          r.positionAlignment >= 80
                            ? "#10b981"
                            : r.positionAlignment >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-6 text-sm leading-relaxed max-w-[400px] text-gray-600 dark:text-gray-400">
                {expandedRows.has(r.modelId) ? (
                  <p className="text-gray-900 dark:text-white">{r.reasoningTrace}</p>
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
