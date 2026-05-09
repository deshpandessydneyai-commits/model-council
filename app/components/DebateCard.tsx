"use client";

import { Copy, Maximize2 } from "lucide-react";
import { useState } from "react";

type DebateCardProps = {
  modelName: string;
  modelId: string;
  personaEmoji?: string;
  content: string;
  isComplete: boolean;
  onCopy?: () => void;
  onExpand?: () => void;
};

export function DebateCard({
  modelName,
  modelId,
  personaEmoji = "🤖",
  content,
  isComplete,
  onCopy,
  onExpand,
}: DebateCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className="border border-[#E2E0DA] dark:border-glass bg-white dark:bg-[#0F0F1A] rounded-lg overflow-hidden hover:bg-[#F0EFEB] dark:hover:bg-[#121220] transition-colors h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-[#E2E0DA] dark:border-glass px-4 py-3 flex items-center justify-between bg-[#F0EFEB] dark:bg-dark-overlay/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{personaEmoji}</span>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{modelName}</div>
            <div className="text-xs text-gray-600 dark:text-gray-500 mono-meta">{modelId}</div>
          </div>
        </div>
        {!isComplete && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-violet-500 dark:bg-violet-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-gray-400">responding...</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 max-h-[400px] scrollbar-theme">
        <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {content || (
            <span className="text-gray-600 dark:text-gray-500 italic">
              {isComplete ? "No response" : "Awaiting response..."}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      {isComplete && content && (
        <div className="border-t border-[#E2E0DA] dark:border-glass px-4 py-2 flex items-center gap-2 bg-[#F0EFEB] dark:bg-dark-overlay/30">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded hover:bg-[#E2E0DA] dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Copy to clipboard"
          >
            <Copy size={14} />
            {copied ? "Copied" : "Copy"}
          </button>
          {onExpand && (
            <button
              onClick={onExpand}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded hover:bg-[#E2E0DA] dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="Expand full response"
            >
              <Maximize2 size={14} />
              Full
            </button>
          )}
        </div>
      )}
    </div>
  );
}
