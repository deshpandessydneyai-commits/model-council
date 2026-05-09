"use client";

import type { CouncilModel } from "@/lib/models";
import { Copy, Maximize2 } from "lucide-react";
import { useState } from "react";
import { MarkdownContent } from "./MarkdownContent";

type Props = {
  model: CouncilModel;
  text: string;
  variant: "a" | "b" | "c" | "d";
  round: number;
  done: boolean;
  previousRoundText?: string;
};

export function ModelCard({ model, text, variant, round, done, previousRoundText }: Props) {
  const [copied, setCopied] = useState(false);

  // Determine status indicator
  const getStatusIndicator = () => {
    if (round === 1) return { label: "New", color: "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100", symbol: "●" };
    if (!text || !previousRoundText) return { label: "New", color: "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100", symbol: "●" };

    const textLower = text.toLowerCase();
    const prevLower = (previousRoundText || "").toLowerCase();

    // Check for agreement/convergence signals
    const agreeSignals = ["agree", "valid point", "concur", "correct", "sound", "convincing", "you're right"];
    const agreedSignals = agreeSignals.filter(signal => textLower.includes(signal));

    // Check for revision signals
    const reviseSignals = ["revise", "update", "change my", "reconsider", "actually,", "upon reflection", "i was wrong"];
    const revisedSignals = reviseSignals.filter(signal => textLower.includes(signal));

    if (agreedSignals.length > 0) {
      return { label: "Agreed", color: "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100", symbol: "✓" };
    } else if (revisedSignals.length > 0) {
      return { label: "Revised", color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100", symbol: "!" };
    }

    return { label: "New", color: "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100", symbol: "●" };
  };

  const status = getStatusIndicator();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="border border-[#E2E0DA] dark:border-glass bg-white dark:bg-[#0F0F1A] rounded-lg overflow-hidden hover:bg-[#F0EFEB] dark:hover:bg-[#121220] transition-colors flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-[#E2E0DA] dark:border-glass px-4 py-3 flex items-center justify-between bg-[#F0EFEB] dark:bg-dark-overlay/50">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{model.displayName}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${status.color}`}>
                <span>{status.symbol}</span>
                <span>{status.label}</span>
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-500 mono-meta">{model.provider}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="mono-meta text-xs text-gray-500 dark:text-gray-400">
            R{round.toString().padStart(2, "0")}
          </div>
          {done ? (
            <span className="text-xs text-green-600 dark:text-green-400">●</span>
          ) : (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-500 dark:bg-violet-400 rounded-full animate-pulse" />
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[400px] scrollbar-theme">
        {text ? (
          <MarkdownContent content={text} />
        ) : (
          <span className="text-gray-600 dark:text-gray-500 italic">
            {done ? "No response" : "Awaiting tokens…"}
          </span>
        )}
      </div>

      {/* Footer Actions */}
      {done && text && (
        <div className="border-t border-[#E2E0DA] dark:border-glass px-4 py-2 flex items-center gap-2 bg-[#F0EFEB] dark:bg-dark-overlay/30">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded hover:bg-[#E2E0DA] dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Copy to clipboard"
          >
            <Copy size={14} />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded hover:bg-[#E2E0DA] dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Expand full response"
          >
            <Maximize2 size={14} />
            Full
          </button>
        </div>
      )}
    </article>
  );
}
