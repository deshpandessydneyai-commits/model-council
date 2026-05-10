"use client";

import type { CouncilModel } from "@/lib/models";
import { Copy, Maximize2 } from "lucide-react";
import { useState, useMemo } from "react";
import { MarkdownContent } from "./MarkdownContent";
import { extractModelVersion } from "@/lib/utils";
import { getGPSPhaseInfo } from "@/lib/gps-framework";

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
  const gpsPhase = useMemo(() => getGPSPhaseInfo(round), [round]);

  const status = useMemo(() => {
    if (round === 1) {
      return { label: "Responding", symbol: "●", bgColor: "#8B5CF6", textColor: "text-purple-700" };
    }
    if (!text || !previousRoundText) {
      return { label: "Responding", symbol: "●", bgColor: "#8B5CF6", textColor: "text-purple-700" };
    }

    const textLower = text.toLowerCase();
    const agreeSignals = ["agree", "valid point", "concur", "correct", "sound", "convincing", "you're right"];
    const agreedSignals = agreeSignals.filter(signal => textLower.includes(signal));
    const reviseSignals = ["revise", "update", "change my", "reconsider", "actually,", "upon reflection", "i was wrong"];
    const revisedSignals = reviseSignals.filter(signal => textLower.includes(signal));

    if (agreedSignals.length > 0) {
      return { label: "Agreed", symbol: "✓", bgColor: "#22c55e", textColor: "text-green-700" };
    } else if (revisedSignals.length > 0) {
      return { label: "Revised", symbol: "✎", bgColor: "#f59e0b", textColor: "text-amber-700" };
    }

    return { label: "Responded", symbol: "○", bgColor: "#e5e7eb", textColor: "text-gray-700" };
  }, [text, round, previousRoundText]);

  const wordCount = useMemo(() => {
    return text?.split(/\s+/).length || 0;
  }, [text]);

  const confidence = useMemo(() => {
    const words = wordCount;
    if (words < 50) return 1;
    if (words < 150) return 2;
    if (words < 300) return 3;
    if (words < 500) return 4;
    return 5;
  }, [wordCount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.8);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>

      <article
        className="rounded-lg overflow-hidden flex flex-col h-[400px] transition-all"
        style={{
          backgroundColor: "var(--bg-card)",
          border: `1px solid var(--bd)`,
          ...(done ? { boxShadow: `0 0 0 2px rgba(34, 197, 94, 0.1)` } : {}),
        }}
      >
        {/* Header */}
        <header
          className="border-b px-5 py-4 flex items-center justify-between relative"
          style={{
            borderColor: "var(--bd)",
            backgroundColor: "var(--bg-inset)",
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Status dot */}
            <div className="relative">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.bgColor }}
              />
              {!done && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid ${status.bgColor}`,
                    animation: "pulse-ring 1s ease-out infinite",
                  }}
                />
              )}
            </div>

            {/* Model info */}
            <div className="flex-1">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--t1)" }}
              >
                {model.displayName}
              </h3>
              <p
                className="text-xs mono-meta"
                style={{ color: "var(--t3)" }}
              >
                {model.provider}
              </p>
            </div>
          </div>

          {/* GPS Phase Badge + Round indicator */}
          <div className="flex items-center gap-2">
            {gpsPhase && (
              <div
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  color: "#8B5CF6",
                  border: "1px solid rgba(139, 92, 246, 0.3)"
                }}
                title={gpsPhase.description}
              >
                {gpsPhase.emoji} {gpsPhase.phase}
              </div>
            )}
            <div
              className="text-xs font-medium mono-meta"
              style={{ color: "var(--t3)" }}
            >
              R{round.toString().padStart(2, "0")}
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-5 text-sm"
          style={{ color: "var(--t1)" }}
        >
          {text ? (
            <MarkdownContent content={text} />
          ) : (
            <span style={{ color: "var(--t3)" }} className="italic">
              {done ? "No response" : "Awaiting response…"}
            </span>
          )}
        </div>

        {/* Footer */}
        <div
          className="border-t px-5 py-3 flex items-center justify-between"
          style={{
            borderColor: "var(--bd)",
            backgroundColor: "var(--bg-inset)",
          }}
        >
          {/* Left: Word count + Confidence bar + Version */}
          <div className="flex items-center gap-4 flex-1">
            <div
              className="text-xs mono-meta"
              style={{ color: "var(--t3)" }}
            >
              {wordCount} words
            </div>

            {/* Confidence bar */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: i <= confidence ? "var(--ac)" : "var(--t4)",
                  }}
                />
              ))}
            </div>

            {/* Version */}
            <div
              className="text-xs"
              style={{ color: "var(--t3)" }}
            >
              v{extractModelVersion(model.slug).split(" ").pop()}
            </div>
          </div>

          {/* Right: Timestamp or Copy button */}
          {done && text && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition-colors"
              style={{
                color: "var(--t3)",
              }}
              title="Copy to clipboard"
            >
              <Copy size={14} />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      </article>
    </>
  );
}
