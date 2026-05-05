"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Download, FileText, X, ChevronDown } from "lucide-react";
import { NavHeader } from "@/components/NavHeader";
import { HistoryPanel } from "@/components/HistoryPanel";
import { RoundSection } from "@/components/RoundSection";
import { VerdictTable } from "@/components/VerdictTable";
import { Toast, type Toast as ToastType } from "@/components/Toast";
import { ModelStatusDisplay } from "@/components/ModelStatusDisplay";
import { PersonaSelector } from "@/components/PersonaSelector";
import type { CouncilEvent, VerdictRow } from "@/lib/council";
import { buildMarkdown } from "@/lib/export";
import { saveSession, listSessions, deleteSession, hasQuotaWarning, clearQuotaWarning } from "@/lib/history";
import type { SavedSession } from "@/lib/history";
import { estimateTokens, checkContextWarning } from "@/lib/tokens";

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

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [modelStatuses, setModelStatuses] = useState<Record<string, "idle" | "responding" | "done">>({});
  const [convergenceInfo, setConvergenceInfo] = useState<{ converged: boolean; reason: string; skippedRound2: boolean } | null>(null);
  const [quotaWarning, setQuotaWarning] = useState("");
  const [personaMap, setPersonaMap] = useState<Record<string, string>>({});
  const [personaExpanded, setPersonaExpanded] = useState(false);
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

  const convene = async () => {
    if (!prompt.trim() || running) return;
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
        const res = await fetch("/api/council", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, forceRound3: forceR3, webSearch, documentContext, personaMap }),
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
  };

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

  return (
    <>
      {/* Remove NavHeader since we now have sidebar */}

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

      <div className="max-w-[1600px] mx-auto px-6 pt-24 pb-32">
        {/* Hero */}
        <section style={{ padding: "48px 0 32px", textAlign: "center" }}>
          <div className="mono-meta text-gray-400" style={{ marginBottom: "20px" }}>
            A Debate Chamber For Frontier Models
          </div>
          <h1 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: "#FFFFFF" }}>
            Model Council.
          </h1>
          <p style={{ marginTop: "16px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto", fontSize: "15px", lineHeight: 1.65, color: "#9CA3AF" }}>
            One prompt. Four models. A structured debate. One final verdict,
            synthesized by Claude Opus 4.6.
          </p>
        </section>

        {/* Document Context */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-3">
            <div className="mono-meta text-gray-400">
              Document Context <span className="opacity-50">(optional)</span>
            </div>
            {documentContext && (
              <div className="flex items-center gap-4">
                {(() => {
                  const tokens = estimateTokens(documentContext);
                  const { warning } = checkContextWarning(prompt.length, documentContext.length);
                  let statusColor = "text-green-600";
                  let statusBg = "bg-green-50";
                  if (tokens > 180000) { statusColor = "text-red-600"; statusBg = "bg-red-50"; }
                  else if (tokens > 100000) { statusColor = "text-amber-600"; statusBg = "bg-amber-50"; }
                  return (
                    <div className={`px-3 py-1 rounded border border-black/10 ${statusBg}`}>
                      <span className={`mono-meta text-xs ${statusColor} font-medium`}>
                        ~{tokens.toLocaleString()} tokens
                      </span>
                      {warning && <span className={`mono-meta text-xs ml-2 ${statusColor}`}>{warning}</span>}
                    </div>
                  );
                })()}
                <button onClick={clearDocument} className="flex items-center gap-1 mono-meta text-xs text-muted hover:text-black transition-colors">
                  <X size={12} /> Clear
                </button>
              </div>
            )}
          </div>

          {!documentContext && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className="border-2 border-dashed px-8 py-10 flex flex-col items-center gap-4 transition-colors duration-300"
              style={{ borderColor: dragOver ? "rgba(139, 92, 246, 0.5)" : "rgba(255,255,255,0.1)", background: dragOver ? "rgba(139, 92, 246, 0.05)" : "transparent" }}
            >
              <FileText size={28} strokeWidth={1} className="text-gray-500" />
              <div className="text-center">
                <div className="mono-meta text-sm text-white">Drop a file here</div>
                <div className="mono-meta text-xs text-gray-500 mt-1">PDF, DOCX, TXT, MD</div>
              </div>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.docx" onChange={handleFileInput} className="hidden" id="doc-upload" />
                <label htmlFor="doc-upload" className="border border-violet-500 px-4 py-2 mono-meta text-xs cursor-pointer hover:bg-violet-500/10 hover:text-violet-400 transition-colors duration-300 text-violet-400">
                  Browse file
                </label>
                <span className="mono-meta text-xs text-gray-500">or paste text below</span>
              </div>
              {docParsing && <div className="mono-meta text-xs text-gray-500">Parsing...</div>}
              {docError && <div className="mono-meta text-xs text-red-600">{docError}</div>}
            </div>
          )}

          {documentContext && (
            <div className="border border-glass overflow-hidden glass-card">
              <div className="bg-dark-overlay border-b border-glass px-4 py-2 flex items-center gap-2">
                <FileText size={13} className="text-gray-400" />
                <span className="mono-meta text-xs text-gray-400">{docFileName ?? "pasted text"}</span>
              </div>
              <textarea
                value={documentContext}
                onChange={(e) => setDocumentContext(e.target.value)}
                rows={8}
                disabled={running}
                className="w-full bg-[#1A1A2E] p-4 text-sm focus:outline-none focus:border-violet-500 resize-y font-mono text-white placeholder-gray-500"
              />
            </div>
          )}
        </section>

        {/* Prompt bar */}
        <section className="mt-16">
          <div className="mono-meta text-gray-400 mb-3">Prompt</div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the council anything..."
            rows={4}
            disabled={running}
            className="w-full border border-glass bg-[#1A1A2E] p-6 text-xl focus:outline-none focus:border-violet-500 focus:bg-[#222235] resize-none text-white placeholder-gray-500 rounded-lg transition-colors"
          />
          {error && (
            <div className="mt-6 border border-red-500/30 bg-red-500/5 p-6 text-sm rounded-lg">
              <div className="mono-meta text-red-400 mb-2">Error</div>
              <div className="whitespace-pre-wrap text-red-300">{error}</div>
            </div>
          )}
        </section>

        {/* Model Personas Configuration */}
        {!running && prompt.trim() && (
          <section className="mt-16 border border-black/10 bg-white">
            <button
              onClick={() => setPersonaExpanded(!personaExpanded)}
              className="w-full flex items-center justify-between p-6 hover:bg-black/[0.02] transition-colors"
            >
              <span className="mono-meta text-sm font-medium">Configure Model Personas</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${personaExpanded ? "rotate-180" : ""}`} />
            </button>
            {personaExpanded && (
              <div className="border-t border-black/10 p-6">
                <PersonaSelector personaMap={personaMap} onChange={setPersonaMap} disabled={running} />
              </div>
            )}
          </section>
        )}

        {/* Progress Indicator */}
        {running && (
          <section className="mt-16">
            <div className="border border-black/10 p-6 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="animate-spin">
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full" />
                </div>
                <span className="mono-meta text-sm font-medium">
                  {currentRound === 0
                    ? "Starting debate..."
                    : `Round ${currentRound} — ${currentRound === 1 ? "Independent answers" : currentRound === 2 ? "Critique & update" : "Final statements"}`}
                </span>
              </div>
              <ModelStatusDisplay round={currentRound} modelStatus={modelStatuses} />
              <div className="mt-6 flex items-center justify-between">
                <div className="mono-meta text-xs text-muted">
                  Typically 1-2 minutes per round.
                </div>
                <button onClick={() => abortRef.current?.abort()} className="mono-meta text-xs text-red-600 hover:text-red-700 underline">
                  Cancel debate
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Rounds */}
        {orderedRounds.map((n) => (
          <RoundSection key={n} round={n} label={rounds[n].label} outputs={rounds[n].outputs} doneSet={rounds[n].doneSet} />
        ))}

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
                  className="group flex items-center gap-2 mono-meta text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
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

      {/* Sticky Submit Button Bar — Desktop (Dark Mode) */}
      <div className="fixed bottom-0 left-64 right-0 bg-[#121212] border-t border-glass z-40 hidden md:block">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 px-3 py-2 rounded transition-colors" style={{ backgroundColor: webSearch ? "rgba(139, 92, 246, 0.1)" : "transparent" }}>
              <input type="checkbox" checked={webSearch} onChange={(e) => setWebSearch(e.target.checked)} disabled={running} className="h-4 w-4 accent-violet-500" />
              <span className="text-sm font-medium text-white cursor-pointer">
                Web Search {webSearch && <span className="text-xs text-violet-400 ml-1">Active</span>}
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={forceR3} onChange={(e) => setForceR3(e.target.checked)} disabled={running} className="h-4 w-4 accent-violet-500" />
              <span className="text-sm font-medium text-white cursor-pointer">Force Round 3</span>
            </label>
          </div>
          <button
            onClick={convene}
            disabled={running || !prompt.trim()}
            className="group flex items-center gap-3 border border-violet-500 px-8 py-4 mono-meta text-violet-400 disabled:opacity-30 hover:bg-violet-500/10 transition-all disabled:hover:bg-transparent disabled:border-gray-600 disabled:text-gray-500"
          >
            {running ? (
              <>
                <div className="animate-spin"><div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full" /></div>
                convening...
              </>
            ) : (
              <>
                Convene Council
                <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sticky Submit Button Bar — Mobile (Dark Mode) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-glass z-40 md:hidden">
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={webSearch} onChange={(e) => setWebSearch(e.target.checked)} disabled={running} className="h-4 w-4 accent-violet-500" />
              <span className="text-xs font-medium text-white">Web Search</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={forceR3} onChange={(e) => setForceR3(e.target.checked)} disabled={running} className="h-4 w-4 accent-violet-500" />
              <span className="text-xs font-medium text-white">Round 3</span>
            </label>
          </div>
          <button
            onClick={convene}
            disabled={running || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 border border-violet-500 px-4 py-3 mono-meta text-sm text-violet-400 disabled:opacity-30 hover:bg-violet-500/10 transition-all disabled:hover:bg-transparent disabled:border-gray-600 disabled:text-gray-500"
          >
            {running ? "convening..." : "Convene Council"}
          </button>
        </div>
      </div>
    </>
  );
}
