"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { VerdictRow } from "@/lib/council";

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
          <tr className="border-b border-black/10 bg-black/2">
            <th className="mono-meta text-left py-4 pr-4 text-muted">Model</th>
            <th className="mono-meta text-left py-4 pr-4 text-muted">Agree</th>
            <th className="mono-meta text-left py-4 pr-4 text-muted">Disagree</th>
            <th className="mono-meta text-left py-4 pr-4 text-muted text-center">Conf</th>
            <th className="mono-meta text-left py-4 pr-4 text-muted text-center">Alignment</th>
            <th className="mono-meta text-left py-4 text-muted">Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={r.modelId}
              className={`border-b border-black/10 align-top transition-colors hover:bg-black/3 cursor-pointer ${
                idx % 2 === 0 ? "bg-white" : "bg-black/[0.02]"
              }`}
              onClick={() => toggleRow(r.modelId)}
            >
              <td className="py-6 pr-4 headline text-lg min-w-[180px]">
                <div className="flex items-center gap-2">
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedRows.has(r.modelId) ? "rotate-180" : ""
                    }`}
                  />
                  {r.model}
                </div>
              </td>
              <td className="py-6 pr-4 text-sm leading-relaxed max-w-[260px]">
                {r.agree}
              </td>
              <td className="py-6 pr-4 text-sm leading-relaxed max-w-[260px]">
                {r.disagree}
              </td>
              <td className="py-6 pr-4 text-center">
                <div className="inline-flex items-center gap-1">
                  <span className="headline text-xl">{r.confidence}</span>
                  <span className="text-muted text-xs">/5</span>
                </div>
              </td>
              <td className="py-6 pr-4 text-center min-w-[100px]">
                <div className="inline-flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold">{r.positionAlignment}%</span>
                  <div className="w-16 h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.positionAlignment}%`,
                        backgroundColor:
                          r.positionAlignment >= 80
                            ? "#16a34a"
                            : r.positionAlignment >= 50
                              ? "#d97706"
                              : "#dc2626",
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-6 text-sm leading-relaxed max-w-[400px] text-muted">
                {expandedRows.has(r.modelId) ? (
                  <p className="text-black">{r.reasoningTrace}</p>
                ) : (
                  <p className="line-clamp-1">{r.reasoningTrace}</p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
