export type CouncilModel = {
  id: string;
  slug: string;
  displayName: string;
  provider: string;
  shortLabel: string;
};

export const COUNCIL_MODELS: CouncilModel[] = [
  {
    id: "sonnet",
    slug: "anthropic/claude-sonnet-4.6",
    displayName: "Claude Sonnet 4.6",
    provider: "Anthropic",
    shortLabel: "sonnet",
  },
  {
    id: "gpt5",
    slug: "openai/gpt-5",
    displayName: "GPT-5",
    provider: "OpenAI",
    shortLabel: "gpt-5",
  },
  {
    id: "gemini",
    slug: "google/gemini-3.1-pro-preview",
    displayName: "Gemini 3.1 Pro",
    provider: "Google",
    shortLabel: "gemini",
  },
  {
    id: "grok",
    slug: "x-ai/grok-4",
    displayName: "Grok 4.20",
    provider: "xAI",
    shortLabel: "grok",
  },
];

export const SYNTHESIZER: CouncilModel = {
  id: "opus",
  slug: "anthropic/claude-opus-4.6",
  displayName: "Claude Opus 4.6",
  provider: "Anthropic",
  shortLabel: "opus",
};

export const MODEL_BY_ID = Object.fromEntries(
  [...COUNCIL_MODELS, SYNTHESIZER].map((m) => [m.id, m])
) as Record<string, CouncilModel>;

// ── Personas ───────────────────────────────────────────────

export type Persona = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  systemPrefix: string;
};

export const PERSONAS: Persona[] = [
  {
    id: "default",
    label: "Default",
    emoji: "💬",
    description: "No special role — answer naturally",
    systemPrefix: "",
  },
  {
    id: "skeptic",
    label: "Skeptic",
    emoji: "🔍",
    description: "Challenge assumptions, demand evidence",
    systemPrefix:
      "You are assigned the SKEPTIC role. Your job is to challenge assumptions, demand evidence for every claim, and point out logical gaps. Do not accept anything at face value. Ask: what could be wrong here?",
  },
  {
    id: "optimist",
    label: "Optimist",
    emoji: "☀️",
    description: "Focus on opportunities and best-case outcomes",
    systemPrefix:
      "You are assigned the OPTIMIST role. Your job is to highlight opportunities, best-case scenarios, and positive evidence. Look for reasons something will work. Counter pessimism with data.",
  },
  {
    id: "factchecker",
    label: "Fact-Checker",
    emoji: "✅",
    description: "Verify claims, cite sources, flag unsupported statements",
    systemPrefix:
      "You are assigned the FACT-CHECKER role. Your job is to verify every factual claim, cite sources where possible, and explicitly flag any statement that is unsupported, outdated, or misleading. Prioritize accuracy over opinion.",
  },
  {
    id: "devils_advocate",
    label: "Devil's Advocate",
    emoji: "😈",
    description: "Argue the opposing position regardless of personal view",
    systemPrefix:
      "You are assigned the DEVIL'S ADVOCATE role. Your job is to argue the strongest possible opposing position, even if you personally disagree with it. Find the best counterarguments. Make the other side's case as compelling as possible.",
  },
  {
    id: "pragmatist",
    label: "Pragmatist",
    emoji: "🔧",
    description: "Focus on practical implementation and real-world constraints",
    systemPrefix:
      "You are assigned the PRAGMATIST role. Your job is to focus on practical implementation, real-world constraints, cost, timeline, and feasibility. Theory is secondary — what actually works in practice?",
  },
  {
    id: "creative",
    label: "Creative",
    emoji: "💡",
    description: "Explore unconventional angles and novel solutions",
    systemPrefix:
      "You are assigned the CREATIVE role. Your job is to explore unconventional angles, novel solutions, and lateral thinking. Challenge the framing of the question itself. What has everyone else missed?",
  },
  {
    id: "risk_analyst",
    label: "Risk Analyst",
    emoji: "⚠️",
    description: "Identify risks, failure modes, and worst-case scenarios",
    systemPrefix:
      "You are assigned the RISK ANALYST role. Your job is to identify risks, failure modes, edge cases, and worst-case scenarios. What could go wrong? What are the hidden costs and second-order effects?",
  },
];

export const PERSONA_BY_ID = Object.fromEntries(
  PERSONAS.map((p) => [p.id, p])
) as Record<string, Persona>;
