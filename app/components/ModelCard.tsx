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
  personaEmoji?: string;
};

export function ModelCard({ model, text, variant, round, done, personaEmoji = "🤖" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="border border-glass bg-[#0F0F1A] rounded-lg overflow-hidden hover:bg-[#121220] transition-colors flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-glass px-4 py-3 flex items-center justify-between bg-dark-overlay/50">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{personaEmoji}</span>
          <div>
            <h3 className="text-sm font-medium text-white">{model.displayName}</h3>
            <div className="text-xs text-gray-500 mono-meta">{model.provider}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="mono-meta text-xs text-gray-400">
            R{round.toString().padStart(2, "0")}
          </div>
          {done ? (
            <span className="text-xs text-green-400">●</span>
          ) : (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
        {text ? (
          <MarkdownContent content={text} />
        ) : (
          <span className="text-gray-500 italic">
            {done ? "No response" : "Awaiting tokens…"}
          </span>
        )}
      </div>

      {/* Footer Actions */}
      {done && text && (
        <div className="border-t border-glass px-4 py-2 flex items-center gap-2 bg-dark-overlay/30">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="Copy to clipboard"
          >
            <Copy size={14} />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
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
