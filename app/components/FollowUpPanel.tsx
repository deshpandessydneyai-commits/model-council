"use client";

import { COUNCIL_MODELS } from "@/lib/models";
import type { FollowUpQuestion } from "@/lib/history";
import { X, ChevronDown, Send } from "lucide-react";
import { useState } from "react";

type Props = {
  followUps: FollowUpQuestion[];
  onSubmitFollowUp: (question: string) => void;
  isLoading?: boolean;
  hasVerdict?: boolean;
};

export function FollowUpPanel({
  followUps,
  onSubmitFollowUp,
  isLoading = false,
  hasVerdict = false,
}: Props) {
  const [newQuestion, setNewQuestion] = useState("");
  const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!newQuestion.trim() || isLoading || !hasVerdict) return;
    onSubmitFollowUp(newQuestion);
    setNewQuestion("");
  };

  if (!hasVerdict && followUps.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-[#E2E0DA] dark:border-gray-700 pt-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Follow-Up Questions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ask about the verdict without re-running the council (~30 seconds)
        </p>
      </div>

      {/* New Follow-Up Input */}
      {hasVerdict && (
        <div className="mb-6 space-y-3">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a follow-up question about the verdict..."
            rows={3}
            disabled={isLoading}
            className="w-full border border-[#E2E0DA] dark:border-glass bg-[#EEEDEA] dark:bg-[#1A1A2E] p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!newQuestion.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium transition-colors disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {isLoading ? "Waiting for responses..." : "Ask"}
          </button>
        </div>
      )}

      {/* Follow-Up History */}
      {followUps.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Previous Follow-Ups
          </div>
          {followUps.map((followUp) => {
            const isExpanded = expandedFollowUp === followUp.id;
            return (
              <div
                key={followUp.id}
                className="border border-[#E2E0DA] dark:border-glass rounded-lg bg-white dark:bg-[#0F0F1A] overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedFollowUp(isExpanded ? null : followUp.id)
                  }
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#F0EFEB] dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {followUp.question}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(followUp.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-[#E2E0DA] dark:border-glass px-4 py-4 space-y-4 bg-[#F9F8F6] dark:bg-[#0A0A0F]">
                    {/* Model Responses */}
                    <div className="space-y-3">
                      {COUNCIL_MODELS.map((model) => {
                        const response = followUp.responses[model.id];
                        if (!response) return null;

                        return (
                          <div
                            key={model.id}
                            className="border border-[#E2E0DA] dark:border-glass rounded-lg bg-white dark:bg-[#0F0F1A] p-3"
                          >
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                              {model.displayName}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                              {response}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Synthesis Response (if available) */}
                    {followUp.synthesisResponse && (
                      <div className="border border-violet-200 dark:border-violet-800 rounded-lg bg-violet-50 dark:bg-violet-950/30 p-3">
                        <div className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">
                          Opus Synthesis
                        </div>
                        <p className="text-sm text-violet-900 dark:text-violet-100 leading-relaxed">
                          {followUp.synthesisResponse}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
