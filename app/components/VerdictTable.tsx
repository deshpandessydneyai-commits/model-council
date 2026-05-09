"use client";

import { Check, AlertCircle, X } from "lucide-react";
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
            const consensus = getConsensusLevel(r.positionAlignment);
            return (
              <tr
                key={r.modelId}
                className={`border-b border-[#E2E0DA] dark:border-white/10 align-top ${
                  isWhiteRow ? "bg-white dark:bg-[#0A0A0A]" : "bg-[#EEEDEA] dark:bg-white/[0.02]"
                }`}
              >
                <td className="py-5 pr-4 min-w-[160px]">
                  <span className="font-bold text-base text-gray-900 dark:text-white leading-snug">{r.model}</span>
                </td>
                <td className="py-5 pr-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${consensus.bgColor} ${consensus.textColor} text-xs font-semibold whitespace-nowrap`}>
                    {consensus.icon}
                    {consensus.label}
                  </div>
                </td>
                <td className="py-5 pr-4 text-sm leading-relaxed max-w-[220px] text-gray-700 dark:text-gray-300">
                  {r.agree}
                </td>
                <td className="py-5 pr-4 text-sm leading-relaxed max-w-[220px] text-gray-700 dark:text-gray-300">
                  {r.disagree}
                </td>
                <td className="py-5 pr-4 text-center">
                  <div className="inline-flex items-center gap-0.5">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{r.confidence}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">/5</span>
                  </div>
                </td>
                <td className="py-5 pr-4 text-center min-w-[90px]">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.positionAlignment}%</span>
                    <div className="w-14 h-1.5 bg-[#E2E0DA] dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${r.positionAlignment}%`,
                          backgroundColor:
                            r.positionAlignment >= 80 ? "#10b981"
                            : r.positionAlignment >= 50 ? "#f59e0b"
                            : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 max-w-[380px]">
                  {r.reasoningTrace}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
