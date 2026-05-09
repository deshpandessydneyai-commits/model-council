import OpenAI from "openai";
import { COUNCIL_MODELS, CouncilModel, SYNTHESIZER } from "./models";
import { getStakeContext } from "./stakes-config";
import type { StakeLevel, DomainType } from "./types/stakes";
import { buildPersonaSystemPrompt } from "./domain-personas";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "sk-or-v1-REPLACE_ME") {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to app/.env.local and restart `npm run dev`."
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_APP_URL ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "Model Council",
    },
  });
}

export type RoundOutput = {
  modelId: string;
  text: string;
};

export type CouncilEvent =
  | { type: "round_start"; round: number; label: string }
  | { type: "token"; round: number; modelId: string; delta: string }
  | { type: "model_done"; round: number; modelId: string; text: string }
  | { type: "round_end"; round: number }
  | { type: "convergence"; converged: boolean; reason: string; skippedRound2: boolean }
  | {
      type: "verdict";
      rows: VerdictRow[];
      finalAnswer: string;
      triggeredRound3: boolean;
      disagreementReason: string;
      consensusScore: number;
      roundsCompleted: number;
    }
  | { type: "error"; message: string }
  | { type: "done" };

export type VerdictRow = {
  modelId: string;
  model: string;
  agree: string;
  disagree: string;
  confidence: number;
  reasoningTrace: string;
  positionAlignment: number;
};

const ROUND_1_SYSTEM = `You are a participant in a structured debate among four frontier AI models. This is Round 1: INDEPENDENT ANSWERS. You have not yet seen any other model's response.

Answer the user's prompt directly, clearly, and with your own reasoning. Be specific. State your confidence at the end on a scale of 1-5 (1 = guessing, 5 = near-certain).`;

const ROUND_2_SYSTEM = `You are a participant in a structured debate among four frontier AI models. This is Round 2: CRITIQUE & UPDATE.

You have seen the other three models' Round 1 answers. Your task:
1. Briefly note where you AGREE with the others.
2. Clearly identify where you DISAGREE and why.
3. Update your own answer if the others have made valid points — but only if you actually find them convincing. Do not capitulate for politeness.

Finish with your updated confidence (1-5).`;

const ROUND_3_SYSTEM = `You are a participant in a structured debate among four frontier AI models. This is Round 3: FINAL STATEMENT. Round 3 was auto-triggered because significant disagreement remained after Round 2.

Write your FINAL position. Be concise. Include:
1. Your final answer.
2. The one disagreement you still hold, and why you hold it.
3. Your final confidence (1-5).`;

const ROUND_4_SYSTEM = `You are a participant in a structured debate among four frontier AI models. This is Round 4: FINAL RESOLUTION. Round 4 was auto-triggered because significant disagreement persisted even after Round 3.

This is the LAST round. Write your absolute final position. Be maximally concise. Include:
1. Your final answer — no hedging.
2. If you still disagree with the majority, state the single strongest reason.
3. Your final confidence (1-5).

Do NOT repeat arguments from earlier rounds. Only state what has changed or solidified.`;

const SYNTHESIZER_SYSTEM = `You are the synthesizer judge for a multi-model debate (Claude Opus 4.6). You have seen every model's contribution across all rounds.

Your task: produce a verdict. Respond ONLY with a single JSON object (no prose, no markdown fences) matching this schema:

{
  "consensusScore": 0-100,
  "rows": [
    {
      "modelId": "sonnet" | "gpt5" | "gemini" | "grok",
      "model": "display name",
      "agree": "1-2 sentence summary of what this model agreed with",
      "disagree": "1-2 sentence summary of where this model held its ground",
      "confidence": 1-5,
      "positionAlignment": 0-100,
      "reasoningTrace": "2-3 sentences describing the arc of this model's argument across rounds"
    }
  ],
  "finalAnswer": "The synthesized final answer in 1-3 paragraphs. Pick sides where the evidence is clear. Call out remaining open questions honestly."
}

Field definitions:
- "consensusScore": How much the models agree on the final answer (0 = total disagreement, 100 = full consensus). Consider both the substance and the confidence levels.
- "positionAlignment": How closely this model's final position aligns with the synthesized verdict (0 = completely opposed, 100 = fully aligned).

Be fair. Do not favor Claude Sonnet just because Anthropic also made you. If you disagree with the majority, say so in finalAnswer.`;

const DISAGREEMENT_CHECK_SYSTEM = `You are a brief debate referee. You will see four models' answers to the same prompt from the latest debate round. Decide whether unresolved substantive disagreement remains.

Respond ONLY with a single JSON object:
{ "disagree": true | false, "reason": "one short sentence" }

Rule: return true only if at least two pairs of models substantively disagree on the answer (not stylistic, not hedging). Otherwise false.`;


function formatOthers(round1: RoundOutput[], selfId: string): string {
  return round1
    .filter((r) => r.modelId !== selfId)
    .map((r) => {
      const m = COUNCIL_MODELS.find((c) => c.id === r.modelId)!;
      return `### ${m.displayName} (${m.provider})\n\n${r.text}`;
    })
    .join("\n\n---\n\n");
}

function formatAllRounds(
  prompt: string,
  rounds: { label: string; outputs: RoundOutput[] }[]
): string {
  const section = (title: string, outs: RoundOutput[]) =>
    `## ${title}\n\n` +
    outs
      .map((r) => {
        const m = COUNCIL_MODELS.find((c) => c.id === r.modelId)!;
        return `### ${m.displayName}\n\n${r.text}`;
      })
      .join("\n\n");

  let out = `# Original Prompt\n\n${prompt}`;
  for (const round of rounds) {
    out += "\n\n" + section(round.label, round.outputs);
  }
  return out;
}

function isTransient(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /5\d\d|timeout|rate.?limit|overload|unavailable/i.test(msg);
}

async function streamOne(
  client: OpenAI,
  model: CouncilModel,
  systemPrompt: string,
  userPrompt: string,
  round: number,
  webSearch: boolean,
  onEvent: (e: CouncilEvent) => void,
  attempt = 0
): Promise<RoundOutput> {
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAYS = [2000, 5000];

  try {
    const stream = await client.chat.completions.create({
      model: webSearch ? `${model.slug}:online` : model.slug,
      stream: true,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let full = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content ?? "";
      if (delta) {
        full += delta;
        onEvent({ type: "token", round, modelId: model.id, delta });
      }
    }

    // Validate response is not empty or whitespace-only
    const trimmed = full.trim();
    if (!trimmed) {
      const msg = `${model.displayName} returned empty response`;
      onEvent({ type: "token", round, modelId: model.id, delta: `\n\n[${msg}]` });
      const failText = `[${msg}]`;
      onEvent({ type: "model_done", round, modelId: model.id, text: failText });
      return { modelId: model.id, text: failText };
    }

    onEvent({ type: "model_done", round, modelId: model.id, text: full });
    return { modelId: model.id, text: full };
  } catch (err: unknown) {
    if (isTransient(err) && attempt < MAX_ATTEMPTS - 1) {
      // Clear any partial tokens already streamed before retrying
      onEvent({ type: "token", round, modelId: model.id, delta: ` [retrying…]` });
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      return streamOne(client, model, systemPrompt, userPrompt, round, webSearch, onEvent, attempt + 1);
    }
    const msg = err instanceof Error ? err.message : String(err);
    const failText = `[${model.displayName} failed: ${msg}]`;
    onEvent({ type: "model_done", round, modelId: model.id, text: failText });
    return { modelId: model.id, text: failText };
  }
}

async function runRound(
  client: OpenAI,
  round: number,
  label: string,
  systemFor: (m: CouncilModel) => string,
  userFor: (m: CouncilModel) => string,
  webSearch: boolean,
  onEvent: (e: CouncilEvent) => void
): Promise<RoundOutput[]> {
  onEvent({ type: "round_start", round, label });
  const results = await Promise.all(
    COUNCIL_MODELS.map((m) => {
      const finalSystem = systemFor(m);
      return streamOne(client, m, finalSystem, userFor(m), round, webSearch, onEvent);
    })
  );

  // Track failures and warn if too many models failed
  const failures = results.filter((r) => r.text.includes("[") && r.text.includes("failed"));
  if (failures.length >= 2) {
    onEvent({
      type: "error",
      message: `Warning: ${failures.length} models failed in Round ${round}. Results may be incomplete.`,
    });
  }

  onEvent({ type: "round_end", round });
  return results;
}

const CONVERGENCE_CHECK_SYSTEM = `You are a brief debate referee. You will see four models' independent Round 1 answers to the same prompt. Decide whether the models have already converged on substantially the same answer.

Respond ONLY with a single JSON object:
{ "converged": true | false, "reason": "one short sentence" }

Rules:
- Return true ONLY if all four models agree on the core answer and none express low confidence (1-2).
- Stylistic differences, different examples, or different reasoning paths that reach the same conclusion all count as convergence.
- If even one model gives a meaningfully different answer or expresses significant uncertainty, return false.
- When in doubt, return false (it is better to debate than to skip).`;

async function checkConvergence(
  client: OpenAI,
  prompt: string,
  r1: RoundOutput[]
): Promise<{ converged: boolean; reason: string }> {
  try {
    const content = `# Prompt\n${prompt}\n\n# Round 1 Independent Answers\n\n${formatOthers(r1, "__none__")}`;
    const res = await client.chat.completions.create({
      model: SYNTHESIZER.slug,
      max_tokens: 256,
      messages: [
        { role: "system", content: CONVERGENCE_CHECK_SYSTEM },
        { role: "user", content },
      ],
      response_format: { type: "json_object" } as never,
    });
    const text = res.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    return {
      converged: !!parsed.converged,
      reason: parsed.reason ?? "",
    };
  } catch (err) {
    // On failure, assume no convergence — always safer to debate
    return {
      converged: false,
      reason: `convergence check failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

async function checkDisagreement(
  client: OpenAI,
  prompt: string,
  roundOutputs: RoundOutput[],
  roundLabel: string
): Promise<{ disagree: boolean; reason: string }> {
  try {
    const content = `# Prompt\n${prompt}\n\n# ${roundLabel} Answers\n\n${formatOthers(
      roundOutputs,
      "__none__"
    )}`;
    const res = await client.chat.completions.create({
      model: SYNTHESIZER.slug,
      max_tokens: 512,
      messages: [
        { role: "system", content: DISAGREEMENT_CHECK_SYSTEM },
        { role: "user", content },
      ],
      response_format: { type: "json_object" } as never,
    });
    const text = res.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    return {
      disagree: !!parsed.disagree,
      reason: parsed.reason ?? "",
    };
  } catch (err) {
    return {
      disagree: false,
      reason: `disagreement check failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

async function synthesize(
  client: OpenAI,
  prompt: string,
  allRounds: { label: string; outputs: RoundOutput[] }[],
  skippedCritique: boolean
): Promise<{ rows: VerdictRow[]; finalAnswer: string; consensusScore: number }> {
  const skippedNote = skippedCritique
    ? "\n\nNote: Critique rounds were skipped because all models converged in Round 1. Base your verdict on Round 1 answers only.\n\n"
    : "";
  const user =
    `Original prompt:\n\n${prompt}\n\n` +
    skippedNote +
    `All debate rounds:\n\n${formatAllRounds(prompt, allRounds)}`;

  const tryOnce = async () => {
    const res = await client.chat.completions.create({
      model: SYNTHESIZER.slug,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYNTHESIZER_SYSTEM },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" } as never,
    });
    const text = res.choices?.[0]?.message?.content ?? "{}";
    return JSON.parse(text);
  };

  let parsed: { rows?: VerdictRow[]; finalAnswer?: string; consensusScore?: number } = {};
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      parsed = await tryOnce();
      if (Array.isArray(parsed.rows) && typeof parsed.finalAnswer === "string") {
        break;
      }
    } catch {
      // retry
    }
  }

  const rows: VerdictRow[] = (parsed.rows ?? []).map((r) => ({
    modelId: r.modelId,
    model: r.model ?? r.modelId,
    agree: r.agree ?? "",
    disagree: r.disagree ?? "",
    confidence: Number(r.confidence) || 0,
    reasoningTrace: r.reasoningTrace ?? "",
    positionAlignment: Number(r.positionAlignment) || 0,
  }));

  return {
    rows,
    finalAnswer: parsed.finalAnswer ?? "[Synthesizer failed to produce a final answer.]",
    consensusScore: Math.max(0, Math.min(100, Number(parsed.consensusScore) || 0)),
  };
}

// Helper function to build enhanced Round 2 prompt with stakes-aware adversarial challenge
function buildEnhancedRound2Prompt(
  basePrompt: string,
  metadata?: { stakeLevel?: string; domain?: string }
): string {
  if (!metadata?.stakeLevel || !metadata?.domain) {
    return basePrompt;
  }

  const stakeContext = getStakeContext(metadata.stakeLevel);
  const domain = metadata.domain as DomainType;
  const adversarialChallenge = stakeContext.adversarialPrompt(domain);

  return `${basePrompt}

[ADVERSARIAL CHALLENGE FOR THIS CONTEXT]
${adversarialChallenge}

Provide a rigorous critique that identifies weaknesses, assumptions, and alternative perspectives.`;
}

// Helper function to build enhanced Round 3 prompt with bias sweep and accountability checks
function buildEnhancedRound3Prompt(
  basePrompt: string,
  metadata?: { stakeLevel?: string; domain?: string }
): string {
  if (!metadata?.stakeLevel || !metadata?.domain) {
    return basePrompt;
  }

  const stakeContext = getStakeContext(metadata.stakeLevel);
  const domain = metadata.domain as DomainType;

  const biasCheckPrompt = stakeContext.biasCheckPrompt(domain);
  const accountabilityPrompt = stakeContext.accountabilityPrompt(domain);

  return `${basePrompt}

[FINAL STRESS TEST]

Before providing your final statement, complete this mental exercise:

BIAS CHECK:
${biasCheckPrompt}

ACCOUNTABILITY:
${accountabilityPrompt}

Now provide your final statement. Have these questions changed your position?`;
}

export async function runCouncil(
  prompt: string,
  forceRound3: boolean,
  webSearch: boolean,
  documentContext: string,
  onEvent: (e: CouncilEvent) => void,
  metadata?: {
    stakeLevel?: string;
    domain?: string;
    userQuestion?: string;
  }
) {
  const client = getClient();

  // Build the full prompt — prepend document context if provided
  const fullPrompt = documentContext
    ? `## Reference Document\n\nThe following document has been provided as context. Ground your answers in it where relevant.\n\n---\n\n${documentContext}\n\n---\n\n## Question\n\n${prompt}`
    : prompt;

  // Collect all rounds for synthesis
  const allRounds: { label: string; outputs: RoundOutput[] }[] = [];
  let skippedCritique = false;
  let disagreementReason = "";
  let triggeredRound3 = false;

  // Resolve domain for persona injection
  const domain = (metadata?.domain ?? "unknown") as DomainType;

  // ── Round 1 ──────────────────────────────────────────────
  const r1Label = webSearch ? "Round 01 — Independent ⟡ web" : "Round 01 — Independent";
  const r1 = await runRound(
    client, 1, r1Label,
    (m) => buildPersonaSystemPrompt(ROUND_1_SYSTEM, m.id, domain),
    () => fullPrompt,
    webSearch, onEvent
  );
  allRounds.push({ label: "Round 1 — Independent", outputs: r1 });

  // ── Vote-Then-Debate: convergence check after Round 1 ───
  const convergence = forceRound3
    ? { converged: false, reason: "full debate forced by user" }
    : await checkConvergence(client, fullPrompt, r1);

  if (convergence.converged) {
    skippedCritique = true;
    onEvent({ type: "convergence", converged: true, reason: convergence.reason, skippedRound2: true });
  } else {
    onEvent({ type: "convergence", converged: false, reason: convergence.reason, skippedRound2: false });

    // ── Round 2 ────────────────────────────────────────────
    const r2Label = webSearch ? "Round 02 — Critique & Update ⟡ web" : "Round 02 — Critique & Update";
    const r2 = await runRound(
      client, 2, r2Label,
      (m) => buildPersonaSystemPrompt(buildEnhancedRound2Prompt(ROUND_2_SYSTEM, metadata), m.id, domain),
      (m) => `Original prompt:\n\n${fullPrompt}\n\n---\n\nYour own Round 1 answer:\n\n${
        r1.find((r) => r.modelId === m.id)?.text ?? ""
      }\n\n---\n\nThe other models' Round 1 answers:\n\n${formatOthers(r1, m.id)}`,
      webSearch, onEvent
    );
    allRounds.push({ label: "Round 2 — Critique & Update", outputs: r2 });

    // ── Round 3: adaptive trigger ──────────────────────────
    const r2Check = forceRound3
      ? { disagree: true, reason: "forced by user" }
      : await checkDisagreement(client, fullPrompt, r2, "Round 2");

    if (r2Check.disagree) {
      triggeredRound3 = true;
      disagreementReason = r2Check.reason;

      const r3Label = webSearch ? "Round 03 — Final Statements ⟡ web" : "Round 03 — Final Statements";
      const r3 = await runRound(
        client, 3, r3Label,
        (m) => buildPersonaSystemPrompt(buildEnhancedRound3Prompt(ROUND_3_SYSTEM, metadata), m.id, domain),
        (m) => `Original prompt:\n\n${fullPrompt}\n\n---\n\nYour Round 2 answer:\n\n${
          r2.find((r) => r.modelId === m.id)?.text ?? ""
        }\n\n---\n\nThe other models' Round 2 answers:\n\n${formatOthers(r2, m.id)}`,
        webSearch, onEvent
      );
      allRounds.push({ label: "Round 3 — Final Statements", outputs: r3 });

      // ── Round 4: adaptive extension (hard cap) ───────────
      const r3Check = await checkDisagreement(client, fullPrompt, r3, "Round 3");

      if (r3Check.disagree) {
        disagreementReason = r3Check.reason;

        const r4Label = webSearch ? "Round 04 — Final Resolution ⟡ web" : "Round 04 — Final Resolution";
        const r4 = await runRound(
          client, 4, r4Label, () => ROUND_4_SYSTEM,
          (m) => `Original prompt:\n\n${fullPrompt}\n\n---\n\nYour Round 3 answer:\n\n${
            r3.find((r) => r.modelId === m.id)?.text ?? ""
          }\n\n---\n\nThe other models' Round 3 answers:\n\n${formatOthers(r3, m.id)}`,
          webSearch, onEvent
        );
        allRounds.push({ label: "Round 4 — Final Resolution", outputs: r4 });
      }
    }
  }

  // ── Synthesis ────────────────────────────────────────────
  const { rows, finalAnswer, consensusScore } = await synthesize(client, fullPrompt, allRounds, skippedCritique);
  onEvent({
    type: "verdict",
    rows,
    finalAnswer,
    triggeredRound3,
    disagreementReason,
    consensusScore,
    roundsCompleted: allRounds.length,
  });
  onEvent({ type: "done" });
}
