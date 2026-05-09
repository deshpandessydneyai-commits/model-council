"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Download, FileText, X, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { RoundSection } from "@/components/RoundSection";
import { VerdictTable } from "@/components/VerdictTable";
import { Toast, type Toast as ToastType } from "@/components/Toast";
import { ModelStatusDisplay } from "@/components/ModelStatusDisplay";
import { DebateProgress } from "@/components/DebateProgress";
import { FollowUpPanel } from "@/components/FollowUpPanel";
import { DebateSetupModal, type DebateConfig } from "@/components/DebateSetupModal";
import { useSetupModal } from "@/lib/setup-modal-context";
import { useHistory } from "@/lib/history-context";
import type { CouncilEvent, VerdictRow } from "@/lib/council";
import { buildMarkdown } from "@/lib/export";
import { saveSession, listSessions, deleteSession, hasQuotaWarning, clearQuotaWarning, updateSession } from "@/lib/history";
import type { SavedSession, FollowUpQuestion } from "@/lib/history";
import { estimateTokens, checkContextWarning } from "@/lib/tokens";
import { getStakeContext, getAllStakeContexts } from "@/lib/stakes-config";
import type { StakeLevel, DomainType } from "@/lib/types/stakes";
import { COUNCIL_MODELS } from "@/lib/models";
import { detectDomain, getDomainDescription } from "@/lib/domain-detection";
import { MarkdownContent } from "@/components/MarkdownContent";
import { estimateDebate } from "@/lib/estimate";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FinalVerdict } from "@/components/FinalVerdict";

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

type ValidationResult = {
  isValid: boolean;
  message: string;
  severity: "error" | "warning";
};

function validateDebatablePrompt(prompt: string): ValidationResult {
  const trimmed = prompt.trim();

  if (trimmed.length < 10) {
    return {
      isValid: false,
      message: "Question is too short. Please provide more detail.",
      severity: "error",
    };
  }

  const generationPatterns = /^(write|generate|create|make|compose|draw|design|build|code|develop)\s/i;
  if (generationPatterns.test(trimmed)) {
    return {
      isValid: false,
      message: "Model Council is for debating perspectives, not generating content. Try rephrasing as a question.",
      severity: "error",
    };
  }

  const factualPatterns = /^(what (is|are)|how many|how much|when (was|is)|where (is|are|was|were))\s.+\?$/i;
  if (factualPatterns.test(trimmed) && !trimmed.toLowerCase().includes("best") && !trimmed.toLowerCase().includes("should")) {
    return {
      isValid: false,
      message: "This looks like a factual question with one answer. Try asking 'which is best?' or 'should we?' instead.",
      severity: "error",
    };
  }

  if (/^\d+\s*[\+\-\*\/]\s*\d+/.test(trimmed)) {
    return {
      isValid: false,
      message: "Mathematical calculations aren't suited for debate. Ask something with multiple valid perspectives instead.",
      severity: "error",
    };
  }

  return {
    isValid: true,
    message: "Good debate question! Models will provide diverse perspectives.",
    severity: "warning",
  };
}

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
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({});
  const [quotaWarning, setQuotaWarning] = useState("");
  const { isOpen: setupModalOpen, setIsOpen: setSetupModalOpen } = useSetupModal();
  const [docContextExpanded, setDocContextExpanded] = useState(false);
  const [stakeLevel, setStakeLevel] = useState<StakeLevel>("exploratory");
  const [detectedDomain, setDetectedDomain] = useState<DomainType>("unknown");

  // Follow-up conversation state
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([]);
  const [followUpRunning, setFollowUpRunning] = useState(false);
  const followUpAbortRef = useRef<AbortController | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: false, message: "", severity: "error" });
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
    setFollowUps(session.followUps || []);
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
    setExpandedRounds({});
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

  const submitFollowUp = useCallback(async (question: string) => {
    if (!question.trim() || !verdict) return;

    setFollowUpRunning(true);
    setError(null);

    // Build round summaries for context
    const roundSummaries = orderedRounds.map((n) => {
      const round = rounds[n];
      const summaries = COUNCIL_MODELS.map((m) => {
        const text = round.outputs[m.id] || "(no response)";
        const preview = text.substring(0, 200) + (text.length > 200 ? "..." : "");
        return `- ${m.displayName}: ${preview}`;
      }).join("\n");
      return `**${round.label}:**\n${summaries}`;
    });

    const ctrl = new AbortController();
    followUpAbortRef.current = ctrl;

    try {
      const timeoutId = setTimeout(() => ctrl.abort(), 5 * 60 * 1000);

      try {
        const res = await fetch("/api/council/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            previousContext: {
              originalPrompt: prompt,
              finalAnswer: verdict.finalAnswer,
              consensusScore: verdict.consensusScore,
              roundSummaries,
            },
            includeSynthesis: false,
          }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed: ${res.status}`);
        }

        // Track responses as they come in
        const responses: Record<string, string> = {};
        const currentModels = new Set<string>();

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
              const event = JSON.parse(jsonString) as any;

              if (event.type === "model_start") {
                currentModels.add(event.modelId);
              } else if (event.type === "token") {
                responses[event.modelId] = (responses[event.modelId] || "") + event.delta;
              } else if (event.type === "model_done") {
                responses[event.modelId] = event.text;
              } else if (event.type === "error") {
                console.error("Follow-up error:", event.message);
              }
            } catch (err) {
              console.error("Failed to parse SSE event:", { raw: jsonString, error: err instanceof Error ? err.message : String(err) });
            }
          }
        }

        // Create follow-up record
        const followUpRecord: FollowUpQuestion = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          question,
          timestamp: Date.now(),
          responses,
        };

        setFollowUps((prev) => [...prev, followUpRecord]);

        // Update session with new follow-up
        const savedSessions = listSessions();
        const currentSession = savedSessions.find((s) => s.id === history[0]?.id);
        if (currentSession) {
          updateSession(currentSession.id, {
            followUps: [...(currentSession.followUps || []), followUpRecord],
          });
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setFollowUpRunning(false);
      followUpAbortRef.current = null;
    }
  }, [verdict, prompt, orderedRounds, rounds, history]);

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
        <div className="fixed top-0 left-64 right-0 z-30 bg-[#F5F4F0]/95 dark:bg-[#0A0A0A]/95 border-b border-[#E2E0DA] dark:border-glass px-6 py-4 backdrop-blur-sm shadow-sm">
          <div className="max-w-[1600px] mx-auto">
            {/* Label row */}
            <div className="flex items-center justify-between mb-2">
              <div className="mono-meta text-xs text-gray-400 dark:text-gray-500">Debating</div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {detectedDomain !== "unknown" && (
                  <span className="text-xs bg-indigo-50 dark:bg-violet-900/20 text-indigo-600 dark:text-violet-400 border border-indigo-100 dark:border-violet-800 px-2 py-0.5 rounded-full capitalize">
                    🎯 {detectedDomain}
                  </span>
                )}
                {webSearch && <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-full">🔍 Web</span>}
                {forceR3 && <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 px-2 py-0.5 rounded-full">⚡ Round 3</span>}
              </div>
            </div>
            {/* Prominent question */}
            <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">{prompt}</p>
          </div>
        </div>
      )}

      <div className={`max-w-[1600px] mx-auto px-6 pb-32 ${running ? "pt-28" : "pt-6"}`}>
        {/* Hero - Hide when running */}
        {!running && (
          <section className="flex items-center justify-between pt-6 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Model Council.</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">One prompt. Four models. A structured debate. One final verdict.</p>
            </div>
            <div className="mono-meta text-xs text-gray-400 dark:text-gray-500 hidden md:block">A Debate Chamber For Frontier Models</div>
          </section>
        )}

        {/* Input Panel - Prominent when idle, compact when running */}
        <section className={running ? "hidden" : "mt-8"}>
          <div className="mono-meta text-gray-500 dark:text-gray-400 mb-3 text-sm">Ask the Council</div>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              // Auto-expand: reset height then set to scrollHeight, capped at 8 rows (~192px)
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 192) + "px";
            }}
            placeholder="Ask the council anything. Be specific for better insights..."
            rows={3}
            disabled={running}
            className="w-full resize-none text-base leading-relaxed text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-[#EEEDEA] dark:bg-[#1A1A2E] rounded-xl px-5 py-4 focus:outline-none transition-all duration-300"
            style={{
              border: "1.5px solid transparent",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)",
              minHeight: "80px",
              maxHeight: "192px",
              overflowY: "auto",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1.5px solid #6366f1";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.12), 0 4px 16px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1.5px solid transparent";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)";
            }}
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

          {/* Domain Detection Display - Only show if validation passes */}
          {detectedDomain !== "unknown" && validation.isValid && (
            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-semibold">✓ {getDomainDescription(detectedDomain)}</span>
              </p>
            </div>
          )}

          {/* Decision Context (Stakes) - Only show if validation passes */}
          {validation.isValid && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Decision Context</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">How much is at stake?</span>
              </div>
              {/* Pill toggle row */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(getAllStakeContexts()).map(([key, context]) => {
                  const isSelected = stakeLevel === key;
                  const impactColors: Record<string, string> = {
                    low:      isSelected ? "bg-green-600 border-green-600 text-white" : "border-[#E2E0DA] dark:border-glass text-gray-600 dark:text-gray-400 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400",
                    medium:   isSelected ? "bg-blue-600 border-blue-600 text-white"   : "border-[#E2E0DA] dark:border-glass text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400",
                    high:     isSelected ? "bg-amber-500 border-amber-500 text-white" : "border-[#E2E0DA] dark:border-glass text-gray-600 dark:text-gray-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400",
                    critical: isSelected ? "bg-red-600 border-red-600 text-white"     : "border-[#E2E0DA] dark:border-glass text-gray-600 dark:text-gray-400 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400",
                  };
                  const level = context.estimatedImpactLevel as string;
                  const colorClass = impactColors[level] ?? impactColors.medium;

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={running}
                      onClick={() => setStakeLevel(key as StakeLevel)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 ${colorClass}`}
                    >
                      {context.label}
                    </button>
                  );
                })}
              </div>
              {/* Selected description — single line hint */}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {getAllStakeContexts()[stakeLevel]?.description}
              </p>
            </div>
          )}

          {/* Config Options */}
          <div className="mt-6 space-y-4">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Options</div>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webSearch}
                  onChange={(e) => setWebSearch(e.target.checked)}
                  disabled={running}
                  className="w-4 h-4 mt-1"
                />
                <div className="flex-1">
                  <span className="text-base text-gray-900 dark:text-white block">🔍 Web Search</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Search the web for current information (adds ~30 seconds per round)</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceR3}
                  onChange={(e) => setForceR3(e.target.checked)}
                  disabled={running}
                  className="w-4 h-4 mt-1"
                />
                <div className="flex-1">
                  <span className="text-base text-gray-900 dark:text-white block">⚡ Force Round 3</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Trigger final statements even if models agree</p>
                </div>
              </label>
            </div>
          </div>

          {/* Pre-flight Estimate — only when prompt is valid */}
          {validation.isValid && prompt.trim() && (() => {
            const est = estimateDebate(prompt, forceR3, detectedDomain !== "unknown");
            return (
              <div className="mt-5 flex items-center justify-center gap-1.5 flex-wrap">
                <div className="flex items-center gap-4 px-5 py-2.5 rounded-full bg-[#EEEDEA] dark:bg-white/5 border border-[#E2E0DA] dark:border-glass text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-400">⏱</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{est.timeLabel}</span>
                  </span>
                  <span className="w-px h-3 bg-[#D4D2CB] dark:bg-gray-600" />
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-400">💰</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{est.costLabel}</span>
                  </span>
                  <span className="w-px h-3 bg-[#D4D2CB] dark:bg-gray-600" />
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-400">🔄</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{est.roundsLabel}</span>
                  </span>
                  {detectedDomain !== "unknown" && (
                    <>
                      <span className="w-px h-3 bg-[#D4D2CB] dark:bg-gray-600" />
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-400">🎯</span>
                        <span className="font-medium text-indigo-600 dark:text-violet-400 capitalize">{detectedDomain} council</span>
                      </span>
                    </>
                  )}
                </div>
                <p className="w-full text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Estimates vary with model load and response length
                </p>
              </div>
            );
          })()}

          {/* Start Button */}
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
          <button
            onClick={() => convene()}
            disabled={running || !prompt.trim() || (validation.severity === "error" && !validation.isValid)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 32px",
              borderRadius: "8px",
              backgroundColor: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? "#9ca3af" : "#4338ca",
              color: "#ffffff",
              border: "none",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? "not-allowed" : "pointer",
              boxShadow: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? "none" : "0 10px 25px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              opacity: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? 0.6 : 1,
              flex: 1,
            }}
            onMouseEnter={(e) => {
              if (!running && prompt.trim() && !(validation.severity === "error" && !validation.isValid)) {
                e.currentTarget.style.backgroundColor = "#3730a3";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!running && prompt.trim() && !(validation.severity === "error" && !validation.isValid)) {
                e.currentTarget.style.backgroundColor = "#4338ca";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
              }
            }}
          >
            {running ? "Convening..." : "Start Council"}
          </button>
          </div>

          {prompt.trim() && validation.severity === "error" && !validation.isValid && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-3 font-medium">
              ⚠️ Fix the issue above to start the debate
            </p>
          )}

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
            <DebateProgress
              currentRound={currentRound}
              modelStatus={modelStatuses}
              roundOutputs={rounds[currentRound]?.outputs ?? {}}
              domain={detectedDomain}
              onCancel={() => abortRef.current?.abort()}
            />
          </section>
        )}

        {/* Rounds - 2x2 Grid, shown while running and collapsed after verdict */}
        {orderedRounds.length > 0 && (
          <section>
            {orderedRounds.map((n) => {
              const isRunningRound = running;
              // After verdict: collapsed by default, expand on demand
              const isExpanded = isRunningRound || (expandedRounds[n] ?? false);
              const allDone = COUNCIL_MODELS.every(m => rounds[n].doneSet.has(m.id));

              return (
                <div key={n} className="mb-8">
                  {/* Round Header — clickable to collapse/expand after verdict */}
                  <div
                    className={`flex items-center justify-between mb-4 ${!isRunningRound ? "cursor-pointer group" : ""}`}
                    onClick={() => {
                      if (!isRunningRound) {
                        setExpandedRounds(prev => ({ ...prev, [n]: !prev[n] }));
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="mono-meta text-gray-500 dark:text-gray-400 text-sm">{rounds[n].label}</div>
                      {allDone && !isRunningRound && (
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
                          {COUNCIL_MODELS.length} responses
                        </span>
                      )}
                    </div>
                    {!isRunningRound && (
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#F0EFEB] dark:hover:bg-white/5">
                        <ChevronDown
                          size={14}
                          className="transition-transform duration-200"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                        {isExpanded ? "Collapse" : "View responses"}
                      </button>
                    )}
                  </div>

                  {/* Collapsed summary pill row */}
                  {!isRunningRound && !isExpanded && (
                    <div className="flex flex-wrap gap-2">
                      {COUNCIL_MODELS.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center gap-2 px-3 py-1.5 border border-[#E2E0DA] dark:border-glass bg-[#EEEDEA] dark:bg-[#0F0F1A] rounded-full text-xs text-gray-600 dark:text-gray-400"
                        >
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {model.displayName}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expanded grid */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COUNCIL_MODELS.map((model) => {
                        const text = rounds[n].outputs[model.id] ?? "";
                        const done = rounds[n].doneSet.has(model.id);
                        return (
                          <div key={`${n}-${model.id}`}>
                            <div className="border border-[#E2E0DA] dark:border-glass bg-white dark:bg-[#0F0F1A] rounded-lg overflow-hidden hover:bg-[#F0EFEB] dark:hover:bg-[#121220] transition-colors flex flex-col h-full">
                              {/* Header */}
                              <div className="border-b border-[#E2E0DA] dark:border-glass px-4 py-3 flex items-center justify-between bg-[#F0EFEB] dark:bg-dark-overlay/50">
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
                                    <span className="w-1.5 h-1.5 bg-violet-500 dark:bg-violet-400 rounded-full animate-pulse inline-block" />
                                  )}
                                </div>
                              </div>
                              {/* Content */}
                              <div className="flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[400px] scrollbar-theme">
                                {text ? (
                                  <MarkdownContent content={text} />
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
                  )}
                </div>
              );
            })}
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
            {/* Model Positions Table */}
            <section className="mt-16">
              <div className="mono-meta text-gray-500 dark:text-gray-400 mb-4 text-xs">Model Positions</div>
              <VerdictTable rows={verdict.rows} />
            </section>

            {/* Final Verdict — Hero + Takeaways + Full Analysis */}
            <section className="mt-12 mb-16 flex justify-center">
              <FinalVerdict
                finalAnswer={verdict.finalAnswer}
                consensusScore={verdict.consensusScore}
                rows={verdict.rows}
                triggeredRound3={verdict.triggeredRound3}
                disagreementReason={verdict.disagreementReason}
                roundsCompleted={verdict.roundsCompleted}
                onExport={exportMd}
              />
            </section>

            {/* Follow-Up Questions */}
            <FollowUpPanel
              followUps={followUps}
              onSubmitFollowUp={submitFollowUp}
              isLoading={followUpRunning}
              hasVerdict={!!verdict}
            />
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
