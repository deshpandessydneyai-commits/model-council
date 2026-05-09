/**
 * Pre-flight cost and time estimator for a council debate session.
 *
 * Estimates are intentionally shown as ranges — LLM costs and latencies
 * vary with model load, response length, and convergence behaviour.
 * We slightly over-estimate to avoid disappointment.
 */

// OpenRouter pricing per million tokens (input / output) — approximate
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "anthropic/claude-sonnet-4.6": { input: 3.0,  output: 15.0  },
  "openai/gpt-5":                 { input: 10.0, output: 30.0  },
  "google/gemini-3.1-pro-preview":{ input: 1.25, output: 5.0   },
  "x-ai/grok-4":                  { input: 3.0,  output: 15.0  },
  "anthropic/claude-opus-4.6":    { input: 15.0, output: 75.0  },
};

// Approximate token counts per component
const TOKENS = {
  systemBase:       400,  // base round system prompt
  personaPrefix:    200,  // domain persona injection
  userPromptBase:   50,   // minimum user prompt overhead
  outputPerModel:   450,  // average model response per round
  r2ContextPerModel: 450, // R1 output added as context in R2
  r3ContextPerModel: 900, // R1+R2 output added as context in R3
  synthesisInput:   6000, // all rounds fed to Opus
  synthesisOutput:  700,  // Opus verdict
};

import { COUNCIL_MODELS, SYNTHESIZER } from "@/lib/models";

function estimateRoundCost(
  round: number,
  promptTokens: number,
  hasDomain: boolean
): number {
  const systemTokens = TOKENS.systemBase + (hasDomain ? TOKENS.personaPrefix : 0);
  const contextTokens =
    round === 1 ? 0 :
    round === 2 ? TOKENS.r2ContextPerModel :
    TOKENS.r3ContextPerModel;

  let total = 0;
  for (const model of COUNCIL_MODELS) {
    const pricing = MODEL_PRICING[model.slug];
    if (!pricing) continue;
    const inputTokens = systemTokens + promptTokens + contextTokens;
    const outputTokens = TOKENS.outputPerModel;
    total += (inputTokens / 1_000_000) * pricing.input;
    total += (outputTokens / 1_000_000) * pricing.output;
  }
  return total;
}

function estimateSynthesisCost(rounds: number): number {
  const pricing = MODEL_PRICING[SYNTHESIZER.slug];
  if (!pricing) return 0;
  // Input grows with each round
  const inputTokens = TOKENS.synthesisInput + (rounds - 2) * 2000;
  return (
    (inputTokens / 1_000_000) * pricing.input +
    (TOKENS.synthesisOutput / 1_000_000) * pricing.output
  );
}

export type DebateEstimate = {
  minCost: number;
  maxCost: number;
  minMinutes: number;
  maxMinutes: number;
  likelyRounds: string;
  costLabel: string;
  timeLabel: string;
  roundsLabel: string;
};

export function estimateDebate(
  prompt: string,
  forceR3: boolean,
  hasDomain: boolean
): DebateEstimate {
  // Estimate prompt tokens (~4 chars per token)
  const promptTokens = Math.max(50, Math.ceil(prompt.length / 4)) + TOKENS.userPromptBase;

  // Min scenario: models converge after R1 (skip R2), no R3
  const r1Cost = estimateRoundCost(1, promptTokens, hasDomain);
  const r2Cost = estimateRoundCost(2, promptTokens, hasDomain);
  const r3Cost = estimateRoundCost(3, promptTokens, hasDomain);

  const synth2Cost = estimateSynthesisCost(2);
  const synth3Cost = estimateSynthesisCost(3);

  // Min: R1 + synthesis (converged early)
  const minCost = r1Cost + synth2Cost;

  // Max: R1 + R2 + R3 + synthesis (or forceR3 locks it in)
  const maxCost = forceR3
    ? r1Cost + r2Cost + r3Cost + synth3Cost
    : r1Cost + r2Cost + r3Cost + synth3Cost;

  // Typical: R1 + R2 + synthesis
  const typicalCost = r1Cost + r2Cost + synth2Cost;

  // Time estimates (seconds per round at typical model latency)
  // Each round runs 4 models in parallel ~45-90s depending on model load
  const minMinutes = forceR3 ? 3 : 1.5;
  const maxMinutes = forceR3 ? 6 : 5;

  // Rounds label
  const likelyRounds = forceR3 ? "3 rounds" : "2–3 rounds";

  // Format cost — show range
  const fmtCost = (n: number) => n < 0.01 ? "<$0.01" : `$${n.toFixed(2)}`;
  const costLabel = `${fmtCost(minCost)}–${fmtCost(maxCost)}`;

  // Format time
  const timeLabel = `${minMinutes}–${maxMinutes} min`;

  return {
    minCost,
    maxCost,
    minMinutes,
    maxMinutes,
    likelyRounds,
    costLabel,
    timeLabel,
    roundsLabel: likelyRounds,
  };
}
