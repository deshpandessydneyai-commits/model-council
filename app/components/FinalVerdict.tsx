"use client";

import { useState } from "react";
import { ChevronDown, Download, Info, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { VerdictRow } from "@/lib/council";

type Props = {
  finalAnswer: string;
  consensusScore: number;
  rows: VerdictRow[];
  triggeredRound3: boolean;
  disagreementReason: string;
  roundsCompleted: number;
  onExport: () => void;
};

function ConsensusArc({ score }: { score: number }) {
  const radius = 54;
  const circumference = Math.PI * radius; // half circle
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Strong Consensus" : score >= 50 ? "Partial Consensus" : "Divided Council";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg width="128" height="72" viewBox="0 0 128 72">
          {/* Background arc */}
          <path
            d="M 12 68 A 52 52 0 0 1 116 68"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
            className="dark:stroke-gray-700"
          />
          {/* Progress arc */}
          <path
            d="M 12 68 A 52 52 0 0 1 116 68"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 163} 163`}
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-2xl font-bold tracking-tight" style={{ color }}>{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

function extractKeyTakeaways(text: string): string[] {
  // Extract first sentence of each of the first 3 meaningful paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 60 && !p.startsWith("#"));

  return paragraphs.slice(0, 3).map(p => {
    // Get first sentence
    const match = p.match(/^(.{40,200}?[.!?])\s/);
    return match ? match[1] : p.slice(0, 180).replace(/\*\*/g, "");
  });
}

function extractHeadline(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  // Look for a bold phrase or first sentence
  const boldMatch = text.match(/\*\*([^*]{10,80})\*\*/);
  if (boldMatch) return boldMatch[1];
  const firstPara = lines.find(l => l.length > 40 && !l.startsWith("#"));
  if (!firstPara) return "";
  const sentence = firstPara.match(/^(.{30,120}[.!?])/);
  return sentence ? sentence[1].replace(/\*\*/g, "") : firstPara.slice(0, 120).replace(/\*\*/g, "");
}

export function FinalVerdict({ finalAnswer, consensusScore, rows, triggeredRound3, disagreementReason, roundsCompleted, onExport }: Props) {
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const headline = extractHeadline(finalAnswer);
  const takeaways = extractKeyTakeaways(finalAnswer);

  const scoreColor = consensusScore >= 75 ? "#22c55e" : consensusScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreBg = consensusScore >= 75
    ? "from-green-50 to-[#F5F4F0] dark:from-green-950/20 dark:to-[#0F0F1A]"
    : consensusScore >= 50
    ? "from-amber-50 to-[#F5F4F0] dark:from-amber-950/20 dark:to-[#0F0F1A]"
    : "from-red-50 to-[#F5F4F0] dark:from-red-950/20 dark:to-[#0F0F1A]";

  return (
    <div className="w-full max-w-[800px] rounded-2xl overflow-hidden border border-[#E2E0DA] dark:border-glass shadow-lg dark:shadow-none">

      {/* ── Hero Section ── */}
      <div className={`bg-gradient-to-b ${scoreBg} px-8 pt-8 pb-6`}>

        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 relative">
              <div className="mono-meta text-xs text-gray-400 dark:text-gray-500">Final Verdict</div>
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="About this verdict"
              >
                <Info size={14} />
              </button>
              {infoOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-100 text-xs p-3 rounded-lg shadow-lg border border-gray-700 dark:border-gray-800 z-10">
                  <p className="leading-relaxed">This verdict was synthesized by Claude Opus 4.6 (made by Anthropic). Two of the four debating models (Sonnet and the synthesizer) are from Anthropic, which may introduce bias toward Anthropic's perspective.</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-white/10 border border-[#E2E0DA] dark:border-glass px-2.5 py-1 rounded-full">
                Claude Opus 4.6
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{roundsCompleted} rounds</span>
              {triggeredRound3 && (
                <>
                  <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">Round 3 triggered</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E0DA] dark:border-glass text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 transition-colors"
          >
            <Download size={12} />
            Export
          </button>
        </div>

        {/* Consensus Arc + Headline */}
        <div className="flex items-start gap-8">
          <div className="flex-shrink-0">
            <ConsensusArc score={consensusScore} />
          </div>
          <div className="flex-1 pt-1">
            {headline && (
              <p className="text-lg font-semibold text-gray-900 dark:text-white leading-snug tracking-tight">
                {headline}
              </p>
            )}
            {/* Model confidence pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {rows.map(r => (
                <div
                  key={r.modelId}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: r.positionAlignment >= 75 ? "#f0fdf4" : r.positionAlignment >= 50 ? "#fffbeb" : "#fef2f2",
                    borderColor: r.positionAlignment >= 75 ? "#bbf7d0" : r.positionAlignment >= 50 ? "#fde68a" : "#fecaca",
                    color: r.positionAlignment >= 75 ? "#15803d" : r.positionAlignment >= 50 ? "#b45309" : "#b91c1c",
                  }}
                >
                  <span className="font-bold">{r.confidence}/5</span>
                  <span className="opacity-60">·</span>
                  <span>{r.model.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Takeaways Strip ── */}
      <div className="bg-white dark:bg-[#0F0F1A] border-t border-gray-100 dark:border-glass px-8 py-5">
        <div className="mono-meta text-xs text-gray-400 dark:text-gray-500 mb-4">Key Takeaways</div>
        <div className="space-y-3">
          {takeaways.map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                style={{ backgroundColor: scoreColor }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full Analysis Accordion ── */}
      <div className="border-t border-gray-100 dark:border-glass">
        <button
          onClick={() => setAnalysisOpen(p => !p)}
          className="w-full flex items-center justify-between px-8 py-4 hover:bg-[#F0EFEB] dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Full Analysis</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-[#EEEDEA] dark:bg-white/10 px-2 py-0.5 rounded-full">
              Claude Opus synthesis
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-300 ${analysisOpen ? "rotate-180" : ""}`}
          />
        </button>

        {analysisOpen && (
          <div className="px-8 pb-8 bg-white dark:bg-[#0F0F1A]">
            <div className="w-full h-px bg-[#E2E0DA] dark:bg-glass mb-6" />
            <div className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-li:text-gray-700 dark:prose-li:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-a:text-indigo-600 dark:prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-indigo-300 dark:prose-blockquote:border-violet-600
              prose-code:text-indigo-700 dark:prose-code:text-violet-300 prose-code:bg-[#EEEDEA] dark:prose-code:bg-[#1A1A2E] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-[#EEEDEA] dark:prose-pre:bg-[#1A1A2E] prose-pre:border prose-pre:border-[#E2E0DA] dark:prose-pre:border-glass
              prose-table:text-sm prose-th:font-semibold prose-hr:border-[#E2E0DA] dark:prose-hr:border-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {finalAnswer}
              </ReactMarkdown>
            </div>
            {triggeredRound3 && (
              <p className="mt-6 text-xs text-amber-600 dark:text-amber-400 mono-meta">
                ↳ Round 3 auto-triggered — {disagreementReason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Methodology Section ── */}
      <div className="border-t border-gray-100 dark:border-glass">
        <button
          onClick={() => setMethodologyOpen(p => !p)}
          className="w-full flex items-center justify-between px-8 py-4 hover:bg-[#F0EFEB] dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Methodology</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-[#EEEDEA] dark:bg-white/10 px-2 py-0.5 rounded-full">
              Council composition & synthesis
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-300 ${methodologyOpen ? "rotate-180" : ""}`}
          />
        </button>

        {methodologyOpen && (
          <div className="px-8 pb-8 bg-white dark:bg-[#0F0F1A]">
            <div className="w-full h-px bg-[#E2E0DA] dark:bg-glass mb-6" />

            {/* Council Composition */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Council Members</h3>
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row.modelId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{row.model}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {row.positionAlignment >= 75 ? "✓ Strong alignment" : row.positionAlignment >= 50 ? "◐ Partial alignment" : "✗ Disagreed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthesizer Info */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Synthesizer</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Claude Opus 4.6 (made by Anthropic) analyzed all council member responses and produced this final verdict.
              </p>
            </div>

            {/* Verdict Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="border border-[#E2E0DA] dark:border-glass rounded-lg p-3 bg-[#F9F8F6] dark:bg-[#0A0A0F]">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rounds Completed</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{roundsCompleted}</div>
              </div>
              <div className="border border-[#E2E0DA] dark:border-glass rounded-lg p-3 bg-[#F9F8F6] dark:bg-[#0A0A0F]">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Consensus Score</div>
                <div className="text-lg font-semibold" style={{ color: scoreColor }}>
                  {consensusScore}%
                </div>
              </div>
            </div>

            {/* Bias Disclosure */}
            <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20">
              <div className="flex gap-3">
                <AlertCircle size={16} className="text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Potential Bias</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    2 of 4 council members are from Anthropic (Sonnet 4.6 and the synthesizer). If these models strongly agreed, results may favor Anthropic's perspective. Consider weighing OpenAI, Google, and xAI perspectives especially carefully if they disagreed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
