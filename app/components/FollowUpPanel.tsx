"use client";

import { useState } from "react";
import { Send, ChevronDown, Loader } from "lucide-react";
import type { FollowUpQuestion } from "@/lib/history";

interface FollowUpPanelProps {
  followUps?: FollowUpQuestion[];
  onSubmit?: (question: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onClearHistory?: () => void;
}

export function FollowUpPanel({
  followUps = [],
  onSubmit,
  disabled = false,
  isLoading = false,
  onClearHistory,
}: FollowUpPanelProps) {
  const [question, setQuestion] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (question.trim()) {
      onSubmit?.(question);
      setQuestion("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && question.trim()) {
      handleSubmit();
    }
  };

  return (
    <div
      className="mt-8 rounded-lg border"
      style={{
        borderColor: "var(--bd)",
      }}
    >
      {/* History Section */}
      {followUps.length > 0 && (
        <div
          className="border-b p-6"
          style={{
            backgroundColor: "var(--bg-inset)",
            borderBottomColor: "var(--bd)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm uppercase tracking-widest font-medium"
              style={{ color: "var(--t3)" }}
            >
              Follow-Up History ({followUps.length})
            </h3>
            {followUps.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-red-600 hover:text-red-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-3">
            {followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--bd)",
                }}
              >
                {/* Question Header */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === followUp.id ? null : followUp.id)
                  }
                  className="w-full px-4 py-3 flex items-start gap-3 hover:opacity-75 transition-opacity text-left"
                >
                  <ChevronDown
                    size={16}
                    style={{
                      color: "var(--t3)",
                      transform:
                        expandedId === followUp.id ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium line-clamp-2"
                      style={{ color: "var(--t1)" }}
                    >
                      {followUp.question}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--t3)" }}
                    >
                      {new Date(followUp.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedId === followUp.id && (
                  <div
                    className="border-t p-4 space-y-4"
                    style={{
                      backgroundColor: "var(--bg)",
                      borderTopColor: "var(--bd)",
                    }}
                  >
                    {/* Model Responses */}
                    {Object.entries(followUp.responses).map(([modelId, response]) => (
                      <div key={modelId}>
                        <h4
                          className="text-xs uppercase tracking-widest font-semibold mb-2"
                          style={{ color: "var(--t3)" }}
                        >
                          {modelId}
                        </h4>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--t2)" }}
                        >
                          {response}
                        </p>
                      </div>
                    ))}

                    {/* Synthesis Response */}
                    {followUp.synthesisResponse && (
                      <div
                        className="mt-4 p-3 rounded-lg border-l-4"
                        style={{
                          backgroundColor: "var(--bg-inset)",
                          borderLeftColor: "var(--ac)",
                        }}
                      >
                        <h4
                          className="text-xs uppercase tracking-widest font-semibold mb-2"
                          style={{ color: "var(--t3)" }}
                        >
                          Synthesis
                        </h4>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--t2)" }}
                        >
                          {followUp.synthesisResponse}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Section */}
      <div
        className="p-6"
        style={{
          backgroundColor: "var(--bg-card)",
        }}
      >
        <h3
          className="text-sm uppercase tracking-widest font-medium mb-4"
          style={{ color: "var(--t3)" }}
        >
          {followUps.length > 0 ? "Ask Another Question" : "Ask a Follow-Up"}
        </h3>

        <div className="flex gap-3 items-end">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the council a clarification question... (Ctrl+Enter to submit)"
            disabled={disabled || isLoading}
            className="flex-1 p-3 rounded border resize-none focus:outline-none focus:ring-2"
            rows={2}
            style={{
              borderColor: "var(--bd)",
              backgroundColor: "var(--bg-inset)",
              color: "var(--t1)",
              "--tw-ring-color": "var(--ac)",
            } as React.CSSProperties}
          />

          <button
            onClick={handleSubmit}
            disabled={disabled || isLoading || !question.trim()}
            className="px-4 py-3 rounded-lg font-medium text-xs uppercase tracking-wide flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: "var(--ac)",
              color: "white",
            }}
          >
            {isLoading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Loading
              </>
            ) : (
              <>
                <Send size={14} />
                Submit
              </>
            )}
          </button>
        </div>

        <p
          className="text-xs mt-2"
          style={{ color: "var(--t3)" }}
        >
          Follow-up questions are answered without re-running the full debate, taking ~30 seconds
        </p>
      </div>
    </div>
  );
}
