"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Download, FileText, X, ChevronDown } from "lucide-react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { RoundSection } from "@/components/RoundSection";
import { VerdictTable } from "@/components/VerdictTable";
import { Toast, type Toast as ToastType } from "@/components/Toast";
import { ModelStatusDisplay } from "@/components/ModelStatusDisplay";
import { DebateSetupModal, type DebateConfig } from "@/components/DebateSetupModal";
import { useSetupModal } from "@/lib/setup-modal-context";
import { useHistory } from "@/lib/history-context";
import type { CouncilEvent, VerdictRow } from "@/lib/council";
import { buildMarkdown } from "@/lib/export";
import { saveSession, listSessions, deleteSession, hasQuotaWarning, clearQuotaWarning } from "@/lib/history";
import type { SavedSession } from "@/lib/history";
import { estimateTokens, checkContextWarning } from "@/lib/tokens";
import { getStakeContext } from "@/lib/stakes-config";
import type { StakeLevel, DomainType } from "@/lib/types/stakes";
import { COUNCIL_MODELS } from "@/lib/models";

type RoundState = {
  label: string;
  outputs: Record<string, string>;
  doneSet: Set<string>;
};

type Verdict = {
  rows: VerdictRow[];
  finalAnswer: string;
  triggeredRound3: boolean;
  disagreementReason: string;
  consensusScore: number;
  roundsCompleted: number;
};

const ROUND_DEFAULT_LABELS: Record<number, string> = {
  1: "Round 01 — Independent",
  2: "Round 02 — Critique & Update",
  3: "Round 03 — Final Statements",
};

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function VerdictText({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={key} style={{ margin: "12px 0 16px 0", paddingLeft: "20px" }}>
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith("### ")) {
      flushList(`ul-${i}`);
      nodes.push(
        <p key={i} style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#525252", marginTop: "24px", marginBottom: "6px" }}>
          {line.slice(4)}
        </p>
      );
    } else if (line.startsWith("## ")) {
      flushList(`ul-${i}`);
      nodes.push(
        <p key={i} style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", marginTop: "28px", marginBottom: "8px", color: "#000000" }}>
          {line.slice(3)}
        </p>
      );
    } else if (line.startsWith("# ")) {
      flushList(`ul-${i}`);
      nodes.push(
        <p key={i} style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", marginTop: "28px", marginBottom: "10px", color: "#000000" }}>
          {line.slice(2)}
        </p>
      );
    } else if (line.match(/^[-*] /)) {
      listItems.push(
        <li key={i} style={{ lineHeight: "1.75", color: "#000000", marginBottom: "4px" }}>
          {formatInline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === "") {
      flushList(`ul-${i}`);
      nodes.push(<div key={i} style={{ height: "10px" }} />);
    } else {
      flushList(`ul-${i}`);
      nodes.push(
        <p key={i} style={{ lineHeight: "1.75", color: "#000000", marginBottom: "6px" }}>
          {formatInline(line)}
        </p>
      );
    }
  });
  flushList("ul-end");

  return <div style={{ fontSize: "15px" }}>{nodes}</div>;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [documentContext, setDocumentContext] = useState("");
  const [docFileName, setDocFileName] = useState<string | null>(null);
  const [docParsing, setDocParsing] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [forceR3, setForceR3] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Record<number, RoundState>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { isOpen: historyOpen, setIsOpen: setHistoryOpen } = useHistory();
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [modelStatuses, setModelStatuses] = useState<Record<string, "idle" | "responding" | "done">>({});
  const [convergenceInfo, setConvergenceInfo] = useState<{ converged: boolean; reason: string; skippedRound2: boolean } | null>(null);
  const [quotaWarning, setQuotaWarning] = useState("");
  const { isOpen: setupModalOpen, setIsOpen: setSetupModalOpen } = useSetupModal();
  const [docContextExpanded, setDocContextExpanded] = useState(false);
  const [stakeLevel, setStakeLevel] = useState<StakeLevel>("exploratory");
  const [detectedDomain, setDetectedDomain] = useState<DomainType>("unknown");
  const prevRunningRef = useRef(false);

  const addToast = (message: string, type: "success" | "error" | "info" = "info", duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };


  useEffect(() => {
    setHistory(listSessions());
    if (hasQuotaWarning()) {
      setQuotaWarning("Storage quota was exceeded. Some older sessions were deleted to make room.");
      clearQuotaWarning();
    }
  }, []);

  useEffect(() => {
    if (prevRunningRef.current && !running) {
      if (verdict && Object.keys(rounds).length > 0) {
        const orderedRounds = Object.keys(rounds)
          .map(Number)
          .sort((a, b) => a - b)
          .map((n) => ({ label: rounds[n].label, outputs: rounds[n].outputs }));
        saveSession({ timestamp: Date.now(), prompt, rounds: orderedRounds, verdict });
        setHistory(listSessions());
      }
    }
    prevRunningRef.current = running;
  }, [running, verdict, rounds, prompt]);

  const restoreSession = useCallback((session: SavedSession) => {
    setPrompt(session.prompt);
    setVerdict(session.verdict as Verdict | null);
    const restored: Record<number, RoundState> = {};
    session.rounds.forEach((r, i) => {
      const n = i + 1;
      restored[n] = { label: r.label, outputs: r.outputs, doneSet: new Set(Object.keys(r.outputs)) };
    });
    setRounds(restored);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    deleteSession(id);
    setHistory(listSessions());
  }, []);

  const parseFile = useCallback(async (file: File) => {
    setDocError(null);
    setDocParsing(true);
    setDocFileName(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-file", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Parse failed");
      setDocumentContext(data.text);
      const tokens = estimateTokens(data.text);
      addToast(`Document loaded — ${data.chars.toLocaleString()} characters (~${tokens.toLocaleString()} tokens)`, "success", 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDocError(msg);
      setDocFileName(null);
      addToast(msg, "error", 5000);
    } finally {
      setDocParsing(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const clearDocument = () => {
    setDocumentContext("");
    setDocFileName(null);
    setDocError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEvent = useCallback((e: CouncilEvent) => {
    switch (e.type) {
      case "round_start": {
        setCurrentRound(e.round);
        setModelStatuses({});
        setRounds((prev) => ({ ...prev, [e.round]: { label: e.label, outputs: {}, doneSet: new Set() } }));
        break;
      }
      case "token": {
        setModelStatuses((prev) => ({ ...prev, [e.modelId]: "responding" }));
        setRounds((prev) => {
          const r = prev[e.round] ?? { label: ROUND_DEFAULT_LABELS[e.round] ?? `Round ${e.round}`, outputs: {}, doneSet: new Set() };
          return { ...prev, [e.round]: { ...r, outputs: { ...r.outputs, [e.modelId]: (r.outputs[e.modelId] ?? "") + e.delta } } };
        });
        break;
      }
      case "model_done": {
        setModelStatuses((prev) => ({ ...prev, [e.modelId]: "done" }));
        setRounds((prev) => {
          const r = prev[e.round];
          if (!r) return prev;
          const next = new Set(r.doneSet);
          next.add(e.modelId);
          return { ...prev, [e.round]: { ...r, outputs: { ...r.outputs, [e.modelId]: e.text }, doneSet: next } };
        });
        break;
      }
      case "convergence": {
        setConvergenceInfo({ converged: e.converged, reason: e.reason, skippedRound2: e.skippedRound2 });
        break;
      }
      case "verdict": {
        setVerdict({ rows: e.rows, finalAnswer: e.finalAnswer, triggeredRound3: e.triggeredRound3, disagreementReason: e.disagreementReason, consensusScore: e.consensusScore, roundsCompleted: e.roundsCompleted });
        break;
      }
      case "error": {
        setError(e.message);
        break;
      }
      case "done": {
        setRunning(false);
        break;
      }
    }
  }, []);

  const convene = useCallback(async (overrideConfig?: Partial<DebateConfig>) => {
    const finalPrompt = overrideConfig?.prompt ?? prompt;
    const finalForceR3 = overrideConfig?.forceRound3 ?? forceR3;
    const finalWebSearch = overrideConfig?.webSearch ?? webSearch;
    const finalStakeLevel = (overrideConfig?.stakeLevel ?? stakeLevel) as StakeLevel;
    const finalDetectedDomain = (overrideConfig?.detectedDomain ?? detectedDomain) as DomainType;

    if (!finalPrompt.trim() || (running && !overrideConfig)) return;

    // Update state with new config values
    if (overrideConfig) {
      setStakeLevel(finalStakeLevel);
      setDetectedDomain(finalDetectedDomain);
    }

    setError(null);
    setRounds({});
    setVerdict(null);
    setModelStatuses({});
    setConvergenceInfo(null);
    setCurrentRound(0);
    setRunning(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const timeoutId = setTimeout(() => ctrl.abort(), 10 * 60 * 1000);

      try {
        // Get the stakes context and build enhanced prompt
        const stakeContext = getStakeContext(finalStakeLevel);
        const enhancedPrompt = `${stakeContext.mainPrompt}\n\n[USER QUESTION]\n${finalPrompt}`;

        const res = await fetch("/api/council", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            forceRound3: finalForceR3,
            webSearch: finalWebSearch,
            documentContext,
            metadata: {
              stakeLevel: finalStakeLevel,
              domain: finalDetectedDomain,
              userQuestion: finalPrompt,
            }
          }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const messages = buffer.split("\n\n");
          buffer = messages.pop() || "";

          for (const message of messages) {
            if (!message.trim()) continue;

            const lines = message.split("\n");
            const dataLines = lines
              .filter((l) => l.startsWith("data: "))
              .map((l) => l.slice(6));

            if (dataLines.length === 0) continue;

            const jsonString = dataLines.join("\n");
            try {
              handleEvent(JSON.parse(jsonString) as CouncilEvent);
            } catch (err) {
              console.error("Failed to parse SSE event:", { raw: jsonString, error: err instanceof Error ? err.message : String(err) });
            }
          }
        }

        if (buffer.trim()) {
          console.warn("Incomplete SSE message at stream end:", buffer);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setRunning(false);
    }
  }, [prompt, forceR3, webSearch, documentContext, running, stakeLevel, detectedDomain]);

  const orderedRounds = useMemo(
    () => Object.keys(rounds).map((k) => Number(k)).sort((a, b) => a - b),
    [rounds]
  );

  const exportMd = () => {
    const md = buildMarkdown({ prompt, rounds: orderedRounds.map((n) => ({ label: rounds[n].label, outputs: rounds[n].outputs })), verdict });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `council-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDebateStart = useCallback((config: DebateConfig) => {
    setSetupModalOpen(false);
    // Update state with config values for display
    setPrompt(config.prompt);
    setWebSearch(config.webSearch);
    setForceR3(config.forceRound3);
    // Clear previous results
    setError(null);
    setRounds({});
    setVerdict(null);
    setModelStatuses({});
    setConvergenceInfo(null);
    setCurrentRound(0);
    // Start the debate with this config via convene
    // We pass the config as override so convene uses these exact values
    convene(config);
  }, [convene]);

  return (
    <>
      <DebateSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onStart={handleDebateStart}
        isLoading={running}
      />

      <HistoryPanel
        open={historyOpen}
        sessions={history}
        onClose={() => setHistoryOpen(false)}
        onRestore={restoreSession}
        onDelete={handleDeleteSession}
      />

      {quotaWarning && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <span className="text-sm text-amber-900">{quotaWarning}</span>
            <button onClick={() => setQuotaWarning("")} className="text-amber-600 hover:text-amber-900 font-medium text-sm">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Sticky Header - Shows when council is running */}
      {running && (
        <div className="fixed top-0 left-64 right-0 z-30 bg-white dark:bg-[#0A0A0A] border-b border-gray-300 dark:border-glass px-6 py-4 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mono-meta text-gray-500 dark:text-gray-400 text-xs mb-1">Current Debate</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{prompt}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {webSearch && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">🔍 Web Search</span>}
              {forceR3 && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">⚡ Round 3</span>}
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-[1600px] mx-auto px-6 pb-32 ${running ? "pt-24" : "pt-16"}`}>
        {/* Hero - Hide when running */}
        {!running && (
          <section style={{ padding: "24px 0 20px", textAlign: "center" }}>
            <div className="mono-meta text-gray-500 dark:text-gray-400" style={{ marginBottom: "12px", fontSize: "12px" }}>
              A Debate Chamber For Frontier Models
            </div>
            <h1 className="text-gray-900 dark:text-white" style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "12px" }}>
              Model Council.
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ marginBottom: "16px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto", fontSize: "14px", lineHeight: 1.6 }}>
              One prompt. Four models. A structured debate. One final verdict.
            </p>
          </section>
        )}

        {/* Input Panel - Prominent when idle, compact when running */}
        <section className={running ? "hidden" : "mt-8"}>
          <div className="mono-meta text-gray-500 dark:text-gray-400 mb-3 text-sm">Ask the Council</div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the council anything..."
            rows={6}
            disabled={running}
            className="w-full border border-gray-300 dark:border-glass bg-white dark:bg-[#1A1A2E] p-6 text-base focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500 focus:bg-gray-50 dark:focus:bg-[#222235] resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg transition-colors text-lg leading-relaxed"
          />

          {/* Config Quick Actions */}
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={webSearch}
                onChange={(e) => setWebSearch(e.target.checked)}
                disabled={running}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">🔍 Web Search</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={forceR3}
                onChange={(e) => setForceR3(e.target.checked)}
                disabled={running}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">⚡ Force Round 3</span>
            </label>
          </div>

          {/* Start Button */}
          <button
            onClick={() => convene()}
            disabled={running || !prompt.trim()}
            style={{
              marginTop: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 32px",
              borderRadius: "8px",
              backgroundColor: running || !prompt.trim() ? "#9ca3af" : "#4338ca",
              color: "#ffffff",
              border: "none",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: running || !prompt.trim() ? "not-allowed" : "pointer",
              boxShadow: running || !prompt.trim() ? "none" : "0 10px 25px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              opacity: running || !prompt.trim() ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!running && prompt.trim()) {
                e.currentTarget.style.backgroundColor = "#3730a3";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!running && prompt.trim()) {
                e.currentTarget.style.backgroundColor = "#4338ca";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
              }
            }}
          >
            {running ? "Convening..." : "Start Council"}
          </button>

          {error && (
            <div className="mt-6 border border-red-500/30 bg-red-500/5 p-6 text-sm rounded-lg">
              <div className="mono-meta text-red-400 mb-2">Error</div>
              <div className="whitespace-pre-wrap text-red-300">{error}</div>
            </div>
          )}
        </section>


        {/* Progress Indicator */}
        {running && (
          <section className="mb-8">
            <div className="border border-gray-300 dark:border-glass p-6 bg-gray-50 dark:bg-[#0F0F1A] rounded-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="animate-spin">
                  <div className="h-5 w-5 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full" />
                </div>
                <span className="mono-meta text-sm font-medium text-gray-900 dark:text-white">
                  {currentRound === 0
                    ? "Starting debate..."
                    : `Round ${currentRound} — ${currentRound === 1 ? "Independent answers" : currentRound === 2 ? "Critique & update" : "Final statements"}`}
                </span>
              </div>
              <ModelStatusDisplay round={currentRound} modelStatus={modelStatuses} />
              <div className="mt-6 flex items-center justify-between">
                <div className="mono-meta text-xs text-gray-600 dark:text-gray-400">
                  Typically 1-2 minutes per round.
                </div>
                <button onClick={() => abortRef.current?.abort()} className="mono-meta text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline">
                  Cancel debate
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Rounds - 2x2 Grid when running */}
        {running && orderedRounds.length > 0 && (
          <section>
            {orderedRounds.map((n) => (
              <div key={n} className="mb-8">
                <div className="mono-meta text-gray-500 dark:text-gray-400 mb-4 text-sm">{rounds[n].label}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {COUNCIL_MODELS.map((model) => {
                    const text = rounds[n].outputs[model.id] ?? "";
                    const done = rounds[n].doneSet.has(model.id);
                    const previousText = n > 1 ? rounds[n - 1].outputs[model.id] : undefined;
                    return (
                      <div key={`${n}-${model.id}`}>
                        <div
                          className="border border-gray-300 dark:border-glass bg-white dark:bg-[#0F0F1A] rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-[#121220] transition-colors flex flex-col h-full"
                        >
                          {/* Header */}
                          <div className="border-b border-gray-300 dark:border-glass px-4 py-3 flex items-center justify-between bg-gray-100 dark:bg-dark-overlay/50">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{model.displayName}</h3>
                              <div className="text-xs text-gray-600 dark:text-gray-500 mono-meta">{model.provider}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="mono-meta text-xs text-gray-500 dark:text-gray-400">
                                R{n.toString().padStart(2, "0")}
                              </div>
                              {done ? (
                                <span className="text-xs text-green-600 dark:text-green-400">●</span>
                              ) : (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-violet-500 dark:bg-violet-400 rounded-full animate-pulse" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[400px] scrollbar-theme">
                            {text ? (
                              <div className="prose-sm max-w-none">
                                {text.split("\n").map((line, idx) => (
                                  <p key={idx} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-2">
                                    {line}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-500 italic">
                                {done ? "No response" : "Awaiting tokens…"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Convergence Banner */}
        {convergenceInfo && (
          <section className="mt-16">
            <div
              className={`border px-6 py-4 flex items-center gap-4 ${
                convergenceInfo.converged
                  ? "bg-green-50 border-green-200"
                  : "bg-black/[0.02] border-black/10"
              }`}
            >
              <span className="text-lg">{convergenceInfo.converged ? "✓" : "↔"}</span>
              <div>
                <div className={`text-sm font-medium ${convergenceInfo.converged ? "text-green-800" : "text-black"}`}>
                  {convergenceInfo.converged
                    ? "Models converged — Round 2 skipped"
                    : "Models diverge — proceeding to critique round"}
                </div>
                <div className="mono-meta text-xs text-muted mt-1">
                  {convergenceInfo.reason}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Verdict */}
        {verdict && (
          <>
            <section className="mt-32">
              <div className="flex items-center justify-between mb-6">
                <div className="mono-meta text-muted">Verdict</div>
                <button
                  onClick={exportMd}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #000000",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#000000";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.color = "#000000";
                  }}
                >
                  <Download size={14} />
                  Export
                </button>
              </div>

              {/* Consensus Score Gauge */}
              <div className="mb-8 border border-black/10 p-6 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="mono-meta text-xs text-muted">Council Consensus</div>
                  <div className="text-2xl font-bold tracking-tight">
                    {verdict.consensusScore}%
                  </div>
                </div>
                <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${verdict.consensusScore}%`,
                      backgroundColor:
                        verdict.consensusScore >= 80 ? "#16a34a"
                          : verdict.consensusScore >= 50 ? "#d97706"
                            : "#dc2626",
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-between mono-meta text-xs text-muted">
                  <span>Split</span>
                  <span>Majority</span>
                  <span>Consensus</span>
                </div>
              </div>

              <VerdictTable rows={verdict.rows} />
              {verdict.triggeredRound3 && (
                <div className="mono-meta text-muted mt-6">
                  &#8627; Round 3 auto-triggered — {verdict.disagreementReason}
                </div>
              )}
            </section>

            <section className="mt-32">
              <div className="mono-meta text-muted mb-6">Final Verdict — Claude Opus 4.6</div>
              <div style={{ maxWidth: "720px", border: "1px solid rgba(0,0,0,0.1)", padding: "32px", backgroundColor: "#ffffff", color: "#000000" }}>
                <VerdictText content={verdict.finalAnswer} />
              </div>
            </section>
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
