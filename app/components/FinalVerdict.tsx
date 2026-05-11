"use client";

import { useState } from "react";
import { COUNCIL_MODELS } from "@/lib/models";
import { ChevronDown } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import { getGPSPhaseInfo, getStakeImpact } from "@/lib/gps-framework";
import type { StakeLevel } from "@/lib/types/stakes";

interface FinalVerdictProps {
  verdict: {
    finalAnswer: string;
    consensusScore: number;
    disagreementReason?: string;
  };
  showExport?: boolean;
  onExport?: () => void;
  sessionId?: string;
  markdown?: string;
  stakeLevel?: StakeLevel;
  detectedDomain?: string;
  roundsCompleted?: number;
}

export function FinalVerdict({
  verdict,
  showExport = false,
  onExport,
  sessionId = "",
  markdown = "",
  stakeLevel,
  detectedDomain,
  roundsCompleted = 3,
}: FinalVerdictProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["composition"]));

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedSections(newSet);
  };
  const consensusColor =
    verdict.consensusScore > 0.7
      ? "#22c55e"
      : verdict.consensusScore > 0.4
      ? "#f59e0b"
      : "#ef4444";

  const consensusLabel =
    verdict.consensusScore > 0.7
      ? `High Agreement (${Math.round(verdict.consensusScore)}%+)`
      : verdict.consensusScore > 0.4
      ? `Partial Consensus (${Math.round(verdict.consensusScore)}%)`
      : `Disagreement (${Math.round(verdict.consensusScore)}%)`;

  // Arc gauge SVG
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (verdict.consensusScore * circumference);

  return (
    <div
      className="mt-8 p-8 rounded-lg border"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--bd)",
      }}
    >
      {/* Header */}
      <h2
        className="text-xs uppercase tracking-widest font-medium mb-8"
        style={{ color: "var(--t3)" }}
      >
        Final Verdict
      </h2>

      {/* Consensus Score & Executive Summary Section */}
      <div className="mb-8">
        <div className="flex items-start gap-8 mb-8">
          {/* Arc Gauge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="var(--bd)"
                strokeWidth="8"
                style={{ stroke: "var(--bg-inset)" }}
              />
              {/* Progress arc */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={consensusColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{
                  transition: "stroke-dashoffset 0.5s ease",
                }}
              />
              {/* Center text */}
              <text
                x="60"
                y="60"
                textAnchor="middle"
                dy="0.3em"
                fontSize="28"
                fontWeight="bold"
                fill={consensusColor}
              >
                {Math.round(verdict.consensusScore)}%
              </text>
            </svg>
            <div
              className="text-xs uppercase tracking-wide font-medium mt-3 text-center"
              style={{ color: consensusColor }}
            >
              {consensusLabel}
            </div>
            <div
              className="text-xs mt-2 text-center"
              style={{ color: "var(--t3)" }}
            >
              {relativeTime(new Date())}
            </div>
          </div>

          {/* Executive Summary Box */}
          <div className="flex-1 p-6 rounded-lg border-2" style={{ backgroundColor: "var(--bg-inset)", borderColor: "var(--ac)" }}>
            <h3
              className="text-xs uppercase tracking-widest font-semibold mb-4"
              style={{ color: "var(--t3)" }}
            >
              Executive Summary
            </h3>
            <div className="prose prose-sm max-w-none" style={{ color: "var(--t1)" }}>
              {verdict.finalAnswer.split('\n\n').map((paragraph, idx) => {
                // Check if paragraph starts with markdown heading syntax
                const isHeading = paragraph.match(/^#+\s/);
                const isBulletList = paragraph.match(/^[\s]*[-•*]/m);

                if (isHeading) {
                  const headingLevel = paragraph.match(/^(#+)/)[1].length;
                  const headingText = paragraph.replace(/^#+\s/, '');
                  const headingClass = headingLevel === 1 ? 'text-lg font-bold mb-3 mt-4' :
                                      headingLevel === 2 ? 'text-base font-bold mb-2 mt-3' :
                                      'text-sm font-semibold mb-2 mt-2';
                  return (
                    <h4 key={idx} className={headingClass} style={{ color: "var(--t1)" }}>
                      {headingText}
                    </h4>
                  );
                } else if (isBulletList) {
                  const items = paragraph.split('\n').filter(line => line.trim());
                  return (
                    <ul key={idx} className="list-disc list-inside mb-3 space-y-1" style={{ color: "var(--t2)" }}>
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm leading-relaxed">
                          {item.replace(/^[\s]*[-•*]\s?/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                } else {
                  return (
                    <p key={idx} className="text-sm leading-relaxed mb-3" style={{ color: "var(--t2)" }}>
                      {paragraph}
                    </p>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Disagreement Section */}
      {verdict.disagreementReason && (
        <div
          className="mb-8 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: "var(--bg-inset)",
            borderLeftColor: "var(--ac)",
            color: "var(--t2)",
          }}
        >
          <h4
            className="text-xs uppercase tracking-widest font-semibold mb-2"
            style={{ color: "var(--t3)" }}
          >
            Areas of Disagreement
          </h4>
          <p className="text-sm leading-relaxed">{verdict.disagreementReason}</p>
        </div>
      )}

      {/* How Stakes Shaped This Verdict Section */}
      {stakeLevel && (
        <div
          className="mb-8 p-6 rounded-lg border"
          style={{
            backgroundColor: "var(--bg-inset)",
            borderColor: "var(--bd)",
          }}
        >
          <h3
            className="text-xs uppercase tracking-widest font-semibold mb-4"
            style={{ color: "var(--t3)" }}
          >
            How Stakes Shaped This Verdict
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--t1)" }}>
                Stakes Level: {getStakeImpact(stakeLevel)?.label}
              </p>
              <p className="text-xs" style={{ color: "var(--t2)" }}>
                {getStakeImpact(stakeLevel)?.intensity} rigor applied to model responses
              </p>
            </div>

            {roundsCompleted >= 2 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--t1)" }}>
                  Round 2 — Adversarial Challenge
                </p>
                <p className="text-xs" style={{ color: "var(--t2)" }}>
                  Models applied {getStakeImpact(stakeLevel)?.intensity.toLowerCase()} challenge to each other's positions. This revealed weaknesses and assumptions not visible in Round 1.
                </p>
              </div>
            )}

            {roundsCompleted >= 3 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--t1)" }}>
                  Round 3 — Bias Check & Accountability
                </p>
                <p className="text-xs" style={{ color: "var(--t2)" }}>
                  Models reviewed their own reasoning for cognitive biases and blind spots before finalizing positions. Final statements incorporate all challenges.
                </p>
              </div>
            )}

            <div className="pt-2 border-t" style={{ borderColor: "var(--bd)" }}>
              <p className="text-xs" style={{ color: "var(--t3)" }}>
                <strong>Impact:</strong> The {getStakeImpact(stakeLevel)?.label.toLowerCase()} stakes level determined the depth of questioning and rigor of analysis throughout the debate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Methodology & Disclosure Section */}
      <div
        className="mb-8 p-6 rounded-lg border"
        style={{
          backgroundColor: "var(--bg-inset)",
          borderColor: "var(--bd)",
        }}
      >
        {/* Header with Info Icon */}
        <div className="flex items-center gap-2 mb-6">
          <h3
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: "var(--t3)" }}
          >
            Methodology & Disclosure
          </h3>
          <button
            onClick={() => toggleSection("biases")}
            title="Learn about model biases and limitations"
            className="transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
            style={{
              cursor: "pointer",
              fontSize: "16px",
              background: "none",
              border: "none",
              padding: "2px",
              color: "var(--t3)",
            }}
          >
            ⓘ
          </button>
        </div>

        {/* Council Composition - Always visible */}
        <div className="mb-6">
          <h4
            className="text-xs font-semibold mb-3"
            style={{ color: "var(--t1)" }}
          >
            Council Composition
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {COUNCIL_MODELS.map((model) => (
              <div
                key={model.id}
                className="text-xs"
                style={{ color: "var(--t2)" }}
              >
                • <span className="font-medium">{model.displayName}</span> ({model.provider})
              </div>
            ))}
          </div>
          <div className="text-xs mt-3" style={{ color: "var(--t2)" }}>
            <strong>Synthesizer:</strong> Claude Opus 4.6 (Anthropic)
          </div>
        </div>

        {/* Synthesis Process - Expandable */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("process")}
            className="flex items-center gap-2 w-full text-left transition-colors hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1"
            style={{
              background: "none",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            <ChevronDown
              size={14}
              style={{
                color: "var(--t3)",
                transform: expandedSections.has("process") ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
            <h4
              className="text-xs font-semibold"
              style={{ color: "var(--t1)" }}
            >
              Synthesis Process
            </h4>
          </button>
          {expandedSections.has("process") && (
            <div className="mt-3 ml-6 text-xs leading-relaxed" style={{ color: "var(--t2)" }}>
              <p className="mb-2">Claude Opus 4.6 synthesized the verdict using:</p>
              <ul className="space-y-1.5">
                <li>• <strong>Consensus Detection</strong> — Identifying agreement and assigning alignment scores</li>
                <li>• <strong>Deliberation Analysis</strong> — Synthesizing disagreements into nuanced positions</li>
                <li>• <strong>Final Answer Generation</strong> — Structured reasoning from debate outcomes</li>
              </ul>
            </div>
          )}
        </div>

        {/* Known Biases & Limitations - Expandable, starts expanded if info icon clicked */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("biases")}
            className="flex items-center gap-2 w-full text-left transition-colors hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 rounded px-2 py-1"
            style={{
              background: "none",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            <ChevronDown
              size={14}
              style={{
                color: "var(--t3)",
                transform: expandedSections.has("biases") ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
            <h4
              className="text-xs font-semibold"
              style={{ color: "var(--t1)" }}
            >
              Known Biases & Limitations
            </h4>
          </button>
          {expandedSections.has("biases") && (
            <div className="mt-3 ml-6 text-xs leading-relaxed space-y-3" style={{ color: "var(--t2)" }}>
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--t1)" }}>1. LLM Limitations</p>
                <p>All council members are large language models with inherent risks of hallucination, confident-sounding incorrect answers, and potential fabrication of facts.</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--t1)" }}>2. Training Data Cutoffs</p>
                <p>Models trained on text up to specific dates. They lack knowledge of events after their cutoff and cannot access real-time information unless web search is enabled.</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--t1)" }}>3. Anthropic Bias</p>
                <p>Claude models reflect Anthropic's constitutional AI alignment preferences, which prioritize helpfulness, harmlessness, and honesty as defined by Anthropic.</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--t1)" }}>4. Limited Real-Time Access</p>
                <p>Models operate without real-time data streams or live market information. Verdicts on recent or rapidly evolving situations may lack crucial context.</p>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--t1)" }}>5. Consensus ≠ Correctness</p>
                <p>Agreement among models does not guarantee accuracy. High consensus scores may reflect shared training biases rather than ground truth.</p>
              </div>
            </div>
          )}
        </div>

        {/* Citation - Always visible */}
        <div
          className="pt-4 border-t text-xs"
          style={{ borderColor: "var(--bd)", color: "var(--t3)" }}
        >
          <p className="mb-2">
            <strong>Generated:</strong> {new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
          <p>For reproducibility, all model responses and reasoning traces are available in the transcript above.</p>
        </div>
      </div>

    </div>
  );
}
