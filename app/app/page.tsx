"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Download, FileText, X, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { RoundSection } from "@/components/RoundSection";
import { VerdictTable } from "@/components/VerdictTable";
import { Toast, type Toast as ToastType } from "@/components/Toast";
import { ModelStatusDisplay } from "@/components/ModelStatusDisplay";
import { FollowUpPanel } from "@/components/FollowUpPanel";
import { DebateSetupModal, type DebateConfig } from "@/components/DebateSetupModal";
import { Header } from "@/components/Header";
import { HelpModal } from "@/components/HelpModal";
import { StageTabs } from "@/components/StageTabs";
import { QuestionBanner } from "@/components/QuestionBanner";
import { DebatePhasePanel } from "@/components/DebatePhasePanel";
import { useSession } from "@/lib/session-context";
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

  // Stage-based layout state
  const [currentStage, setCurrentStage] = useState<"pose" | "deliberate" | "verdict">("pose");
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [helpOpen, setHelpOpen] = useState(false);

  const [validation, setValidation] = useState<ValidationResult>({ isValid: false, message: "", severity: "error" });
  const prevRunningRef = useRef(false);

  // Generate session ID when verdict is created
  useEffect(() => {
    if (verdict && !currentSessionId) {
      const newSessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setCurrentSessionId(newSessionId);
    }
  }, [verdict, currentSessionId]);

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

  // Manage stage transitions based on running state and verdict
  useEffect(() => {
    if (verdict) {
      setCurrentStage("verdict");
    } else if (running) {
      setCurrentStage("deliberate");
    } else if (!running && !verdict) {
      setCurrentStage("pose");
    }
  }, [running, verdict]);

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
    setRunning(false);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast(`Restored session from ${new Date(session.timestamp).toLocaleString()}`, "success");
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
    setCurrentSessionId("");
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

  const orderedRounds = useMemo(
    () => Object.keys(rounds).map((k) => Number(k)).sort((a, b) => a - b),
    [rounds]
  );

  // Generate markdown for export
  const markdown = useMemo(() => {
    if (!verdict) return "";
    return buildMarkdown({
      prompt,
      rounds: orderedRounds.map((n) => ({
        label: rounds[n].label,
        outputs: rounds[n].outputs,
      })),
      verdict,
    });
  }, [verdict, prompt, rounds, orderedRounds]);

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
        // Convert rounds to the format expected by the API
        const previousRounds = orderedRounds.map((n) => ({
          label: rounds[n].label,
          outputs: rounds[n].outputs,
        }));

        const res = await fetch("/api/council/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            previousRounds,
            verdict: {
              finalAnswer: verdict.finalAnswer,
              consensusScore: verdict.consensusScore,
            },
            includeContext: true,
          }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed: ${res.status}`);
        }

        // Track responses as they come in
        const responses: Record<string, string> = {};
        let synthesisResponse: string | undefined;

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

              if (event.type === "token") {
                const modelId = event.model || event.modelId;
                responses[modelId] = (responses[modelId] || "") + event.text;
              } else if (event.type === "model_done") {
                const modelId = event.modelId;
                responses[modelId] = event.response;
              } else if (event.type === "synthesis_token") {
                synthesisResponse = (synthesisResponse || "") + event.text;
              } else if (event.type === "synthesis_done") {
                synthesisResponse = event.response;
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
          ...(synthesisResponse && { synthesisResponse }),
        };

        setFollowUps((prev) => [...prev, followUpRecord]);
        addToast("Follow-up responses received", "success");

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
      {/* Main content area */}
      <div>
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

      {/* NEW: Sticky Header - Always visible */}
      <Header onHistoryClick={() => setHistoryOpen(true)} onHelpClick={() => setHelpOpen(true)} />

      {/* NEW: Stage Tabs - Always visible */}
      <StageTabs
        currentStage={currentStage}
        onStageChange={setCurrentStage}
        roundInfo={{
          currentRound: currentRound,
          estimatedTimeRemaining:
            running && currentRound > 0 ? "~2 min remaining" : undefined,
        }}
      />

      <div className="max-w-[1600px] mx-auto px-8 pb-32 pt-8">
        {/* POSE STAGE: Input Form */}
        {currentStage === "pose" && (
          <>
            {/* Help Text */}
            <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-inset)", borderLeft: "3px solid var(--ac)" }}>
              <p className="text-sm" style={{ color: "var(--t2)" }}>
                🎯 <strong>Get diverse perspectives</strong> from frontier AI models through structured debate. Your question will be debated across 2-3 rounds with reasoning and real-time updates.
              </p>
            </div>

            {/* Input Panel */}
            <section className="mt-0">
          <div className="text-sm font-medium mb-3" style={{ color: "var(--t2)" }}>
            Debate with: <span style={{ color: "var(--t3)" }}>{COUNCIL_MODELS.map(m => m.displayName).join(", ")}</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
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
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Options</div>
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
                  <span className="text-sm text-gray-900 dark:text-white block font-medium">🔍 Web Search</span>
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
                  <span className="text-sm text-gray-900 dark:text-white block font-medium">⚡ Force Final Round</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Usually 2 rounds of debate. Check this to force a 3rd round of final statements even if models already agree</p>
                </div>
              </label>
            </div>
          </div>

          {/* Pre-flight Estimate — only when prompt is valid */}
          {validation.isValid && prompt.trim() && (() => {
            const est = estimateDebate(prompt, forceR3, detectedDomain !== "unknown");
            return (
              <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                <div className="flex items-center gap-6 px-6 py-3 rounded-lg border" style={{ backgroundColor: "var(--bg-inset)", borderColor: "var(--bd)" }}>
                  <span className="flex items-center gap-2">
                    <span className="text-lg">⏱</span>
                    <span className="font-semibold text-sm" style={{ color: "var(--t1)" }}>{est.timeLabel}</span>
                  </span>
                  <span style={{ width: "1px", height: "20px", backgroundColor: "var(--bd)" }} />
                  <span className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="font-semibold text-sm" style={{ color: "var(--t1)" }}>{est.costLabel}</span>
                  </span>
                  <span style={{ width: "1px", height: "20px", backgroundColor: "var(--bd)" }} />
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    <span className="font-semibold text-sm" style={{ color: "var(--t1)" }}>{est.roundsLabel}</span>
                  </span>
                  {detectedDomain !== "unknown" && (
                    <>
                      <span style={{ width: "1px", height: "20px", backgroundColor: "var(--bd)" }} />
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span className="font-semibold text-sm capitalize" style={{ color: "var(--ac)" }}>{detectedDomain} council</span>
                      </span>
                    </>
                  )}
                </div>
                <p className="w-full text-center text-xs" style={{ color: "var(--t3)" }}>
                  Estimates vary with model load
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
              gap: "12px",
              padding: "18px 40px",
              borderRadius: "12px",
              backgroundColor: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? "var(--t4)" : "var(--ac)",
              color: "#ffffff",
              border: "none",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? "not-allowed" : "pointer",
              boxShadow: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? "none" : "0 12px 32px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
              opacity: running || !prompt.trim() || (validation.severity === "error" && !validation.isValid) ? 0.6 : 1,
              flex: 1,
            }}
            onMouseEnter={(e) => {
              if (!running && prompt.trim() && !(validation.severity === "error" && !validation.isValid)) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!running && prompt.trim() && !(validation.severity === "error" && !validation.isValid)) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
              }
            }}
          >
            <span>{running ? "⏳" : "⚡"}</span>
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
          </>
        )}

        {/* DELIBERATE STAGE: Running Debate */}
        {currentStage === "deliberate" && (
          <>
            {/* Question Banner */}
            <section className="mb-8">
              <QuestionBanner
                question={prompt}
                stakeLevel={stakeLevel}
                domains={
                  [
                    detectedDomain !== "unknown" ? detectedDomain : null,
                    webSearch ? "web" : null,
                    forceR3 ? "round-3" : null,
                  ].filter(Boolean) as string[]
                }
              />
            </section>

            {/* Consolidated Debate Phase Panel */}
            <section className="mb-8">
              <DebatePhasePanel
                currentRound={currentRound}
                modelStatuses={modelStatuses}
              />
            </section>
          </>
        )}

        {/* VERDICT STAGE ONLY: Question & Progress at Top */}
        {currentStage === "verdict" && !running && (
          <>
            {/* Question Banner */}
            <section className="mb-8">
              <QuestionBanner
                question={prompt}
                stakeLevel={stakeLevel}
                domains={
                  [
                    detectedDomain !== "unknown" ? detectedDomain : null,
                    webSearch ? "web" : null,
                    forceR3 ? "round-3" : null,
                  ].filter(Boolean) as string[]
                }
              />
            </section>

            {/* Consolidated Debate Phase Panel */}
            <section className="mb-8">
              <DebatePhasePanel
                currentRound={currentRound}
                modelStatuses={{}}
              />
            </section>
          </>
        )}

        {/* DELIBERATE & VERDICT: Rounds - 2x2 Grid */}
        {(currentStage === "deliberate" || currentStage === "verdict") && orderedRounds.length > 0 && (
          <section>
            {orderedRounds.map((n) => {
              const roundData = rounds[n];
              if (!roundData) return null;
              const isRunningRound = running;
              const isExpanded = isRunningRound || (expandedRounds[n] ?? false);
              const allDone = COUNCIL_MODELS.every(m => roundData.doneSet.has(m.id));

              return (
                <div key={n} className="mb-8">
                  {/* Round Header */}
                  <div
                    className={`flex items-center justify-between mb-4 ${!isRunningRound ? "cursor-pointer group" : ""}`}
                    onClick={() => {
                      if (!isRunningRound) {
                        setExpandedRounds(prev => ({ ...prev, [n]: !prev[n] }));
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="mono-meta text-gray-500 dark:text-gray-400 text-sm">{roundData.label}</div>
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
                        const text = roundData.outputs[model.id] ?? "";
                        const done = roundData.doneSet.has(model.id);
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

        {/* DELIBERATE & VERDICT: Convergence Banner */}
        {(currentStage === "deliberate" || currentStage === "verdict") && convergenceInfo && (
          <section className="mt-16">
            <div
              className="border px-6 py-4 flex items-center gap-4"
              style={{
                backgroundColor: convergenceInfo.converged ? "#f0fdf4" : "var(--bg-inset)",
                borderColor: convergenceInfo.converged ? "#16a34a" : "var(--bd)",
              }}
            >
              <span className="text-lg" style={{ color: convergenceInfo.converged ? "#16a34a" : "var(--t2)" }}>
                {convergenceInfo.converged ? "✓" : "↔"}
              </span>
              <div>
                <div className="text-sm font-medium" style={{ color: convergenceInfo.converged ? "#16a34a" : "var(--t1)" }}>
                  {convergenceInfo.converged
                    ? "Models converged — Round 2 skipped"
                    : "Models diverge — proceeding to critique round"}
                </div>
                <div className="mono-meta text-xs mt-1" style={{ color: "var(--t3)" }}>
                  {convergenceInfo.reason}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VERDICT STAGE: Model Positions & Final Verdict */}
        {currentStage === "verdict" && (
          <>
            {/* Model Positions Table */}
            {verdict && (
              <section className="mt-16">
                <div className="mono-meta text-gray-500 dark:text-gray-400 mb-4 text-xs">Model Positions</div>
                <VerdictTable rows={verdict.rows} />
              </section>
            )}

            {/* Final Verdict — Hero + Takeaways + Full Analysis */}
            {verdict && (
              <section className="mt-12 mb-16 flex justify-center">
                <FinalVerdict
                  verdict={{
                    finalAnswer: verdict.finalAnswer,
                    consensusScore: verdict.consensusScore,
                    disagreementReason: verdict.disagreementReason,
                  }}
                  sessionId={currentSessionId}
                  markdown={markdown}
                  stakeLevel={stakeLevel}
                  detectedDomain={detectedDomain !== "unknown" ? detectedDomain : undefined}
                  roundsCompleted={verdict.roundsCompleted}
                />
              </section>
            )}

            {/* Follow-Up Questions */}
            <FollowUpPanel
              followUps={followUps}
              onSubmit={submitFollowUp}
              isLoading={followUpRunning}
              disabled={!verdict}
              onClearHistory={() => setFollowUps([])}
            />
          </>
        )}
      </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
