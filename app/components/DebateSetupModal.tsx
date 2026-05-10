"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Modal } from "./Modal";
import { detectDomain, getDomainDescription } from "@/lib/domain-detection";
import { getAllStakeContexts } from "@/lib/stakes-config";
import { DomainType, StakeLevel } from "@/lib/types/stakes";

type DebateSetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: DebateConfig) => void;
  isLoading?: boolean;
};

export type DebateConfig = {
  prompt: string;
  webSearch: boolean;
  forceRound3: boolean;
  stakeLevel: StakeLevel;
  detectedDomain: DomainType;
};

type ValidationResult = {
  isValid: boolean;
  message: string;
  severity: "error" | "warning";
};

// Validate if prompt is a debatable question
function validateDebatablePrompt(prompt: string): ValidationResult {
  const trimmed = prompt.trim();

  // Check minimum length
  if (trimmed.length < 10) {
    return {
      isValid: false,
      message: "Question is too short. Please provide more detail.",
      severity: "error",
    };
  }

  // Check for generation/creation requests (non-debate)
  const generationPatterns = /^(write|generate|create|make|compose|draw|design|build|code|develop)\s/i;
  if (generationPatterns.test(trimmed)) {
    return {
      isValid: false,
      message: "Model Council is for debating perspectives, not generating content. Try rephrasing as a question.",
      severity: "error",
    };
  }

  // Check for pure factual questions (single answer)
  const factualPatterns = /^(what (is|are)|how many|how much|when (was|is)|where (is|are|was|were))\s.+\?$/i;
  if (factualPatterns.test(trimmed) && !trimmed.toLowerCase().includes("best") && !trimmed.toLowerCase().includes("should")) {
    return {
      isValid: false,
      message: "This looks like a factual question with one answer. Try asking 'which is best?' or 'should we?' instead.",
      severity: "error",
    };
  }

  // Check for math/simple arithmetic
  if (/^\d+\s*[\+\-\*\/]\s*\d+/.test(trimmed)) {
    return {
      isValid: false,
      message: "Mathematical calculations aren't suited for debate. Ask something with multiple valid perspectives instead.",
      severity: "error",
    };
  }

  // Check if it looks like a debatable question (ends with ?)
  if (!trimmed.endsWith("?")) {
    return {
      isValid: true,
      message: "Tip: Frame as a question (end with '?') for better analysis",
      severity: "warning",
    };
  }

  // Valid debatable prompt
  return {
    isValid: true,
    message: "Good debate question! Models will provide diverse perspectives.",
    severity: "warning", // Use warning severity for positive message styling
  };
}

export function DebateSetupModal({ isOpen, onClose, onStart, isLoading = false }: DebateSetupModalProps) {
  const [prompt, setPrompt] = useState("");
  const [webSearch, setWebSearch] = useState(true);
  const [forceRound3, setForceRound3] = useState(false);
  const [stakeLevel, setStakeLevel] = useState<StakeLevel>("exploratory");
  const [detectedDomain, setDetectedDomain] = useState<DomainType>("unknown");
  const [validation, setValidation] = useState<ValidationResult>({ isValid: false, message: "", severity: "error" });

  const stakeContexts = getAllStakeContexts();

  // Auto-detect domain and validate when prompt changes
  useEffect(() => {
    if (prompt.trim()) {
      const domain = detectDomain(prompt);
      setDetectedDomain(domain);
      const validationResult = validateDebatablePrompt(prompt);
      setValidation(validationResult);
    } else {
      setValidation({ isValid: false, message: "", severity: "error" });
    }
  }, [prompt]);

  const handleStart = () => {
    if (!prompt.trim()) return;
    onStart({
      prompt,
      webSearch,
      forceRound3,
      stakeLevel,
      detectedDomain,
    });
  };

  const currentStakeContext = stakeContexts[stakeLevel];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a New Council" size="lg">
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Your Question
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the council anything. Be specific for better insights..."
            rows={4}
            disabled={isLoading}
            className="w-full border border-gray-300 dark:border-glass bg-white dark:bg-[#1A1A2E] p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500 focus:bg-gray-50 dark:focus:bg-[#222235] transition-colors disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Include context, constraints, and what matters to you for better analysis.
          </p>

          {/* Validation Message */}
          {prompt.trim() && (
            <div
              className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                validation.severity === "error"
                  ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              }`}
            >
              {validation.severity === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-xs ${
                  validation.severity === "error"
                    ? "text-red-700 dark:text-red-300"
                    : "text-green-700 dark:text-green-300"
                }`}
              >
                {validation.message}
              </p>
            </div>
          )}
        </div>

        {/* Domain Detection Display - Only show if validation passes */}
        {detectedDomain !== "unknown" && validation.isValid && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">✓ {getDomainDescription(detectedDomain)}</span>
            </p>
          </div>
        )}

        {/* Decision Context (Stakes) - Only show if validation passes */}
        {validation.isValid && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Decision Context
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 block mt-1">
                How much is at stake? This helps tailor analysis depth.
              </span>
            </label>
            <div className="space-y-2">
              {Object.entries(stakeContexts).map(([key, context]) => (
                <label
                  key={key}
                  className="flex items-start gap-3 p-3 border border-gray-300 dark:border-glass rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-overlay transition-colors"
                >
                  <input
                    type="radio"
                    name="stakeLevel"
                    value={key}
                    checked={stakeLevel === key}
                    onChange={(e) => setStakeLevel(e.target.value as StakeLevel)}
                    className="mt-1 accent-indigo-600 dark:accent-violet-500"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {context.label}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {context.description}
                    </p>
                    {key === stakeLevel && (
                      <p className="text-xs text-indigo-600 dark:text-violet-400 mt-2 italic">
                        Impact level: <span className="font-semibold">{context.estimatedImpactLevel.toUpperCase()}</span>
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Context Preview - Only show if validation passes */}
        {stakeLevel && currentStakeContext && validation.isValid && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-2">
              Analysis approach:
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              {currentStakeContext.mainPrompt.split("\n").slice(0, 2).join(" ")}...
            </p>
          </div>
        )}

        {/* Settings Section */}
        <div className="border-t border-gray-300 dark:border-glass pt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            ⚙️ Council Settings
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={webSearch}
                onChange={(e) => setWebSearch(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 accent-indigo-500 dark:accent-violet-500 rounded cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Web Search
              </span>
              {webSearch && <span className="text-xs text-indigo-600 dark:text-violet-400 ml-auto">Active</span>}
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={forceRound3}
                onChange={(e) => setForceRound3(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 accent-indigo-500 dark:accent-violet-500 rounded cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Force Round 3 (skip convergence check)
              </span>
            </label>
          </div>
        </div>

        {/* Start Button */}
        <div className="border-t border-gray-300 dark:border-glass pt-6">
          <button
            onClick={handleStart}
            disabled={!prompt.trim() || isLoading || (validation.severity === "error" && !validation.isValid)}
            style={{
              width: "100%",
              backgroundColor: !prompt.trim() || isLoading || (validation.severity === "error" && !validation.isValid)
                ? "#d1d5db"
                : "#4f46e5",
              color: "#ffffff",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "500",
              fontSize: "16px",
              cursor: !prompt.trim() || isLoading || (validation.severity === "error" && !validation.isValid) ? "not-allowed" : "pointer",
              opacity: !prompt.trim() || isLoading || (validation.severity === "error" && !validation.isValid) ? 0.6 : 1,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!(!prompt.trim() || isLoading || (validation.severity === "error" && !validation.isValid))) {
                e.currentTarget.style.backgroundColor = "#4338ca";
              }
            }}
            onMouseLeave={(e) => {
              if (!(!prompt.trim() || isLoading || (validation.severity === "error" && !validation.isValid))) {
                e.currentTarget.style.backgroundColor = "#4f46e5";
              }
            }}
          >
            {isLoading ? "Starting debate..." : "Start Council"}
          </button>
          {validation.severity === "error" && !validation.isValid && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center mt-3 font-medium">
              ⚠️ Fix the issue above to start the debate
            </p>
          )}
          {validation.isValid && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center mt-3">
              ✓ Ready to start debate
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
