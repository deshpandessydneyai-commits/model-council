import type { VerdictRow } from "./council";
import { COUNCIL_MODELS } from "./models";

export type RoundState = Record<string, string>;

export function buildMarkdown(opts: {
  prompt: string;
  rounds: { label: string; outputs: RoundState }[];
  verdict: {
    rows: VerdictRow[];
    finalAnswer: string;
    triggeredRound3: boolean;
    disagreementReason: string;
  } | null;
}) {
  const { prompt, rounds, verdict } = opts;
  const lines: string[] = [];
  lines.push(`# Model Council Session`);
  lines.push("");
  lines.push(`**Timestamp:** ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`## Prompt`);
  lines.push("");
  lines.push(prompt);
  lines.push("");

  rounds.forEach((r) => {
    lines.push(`## ${r.label}`);
    lines.push("");
    COUNCIL_MODELS.forEach((m) => {
      const text = r.outputs[m.id];
      if (!text) return;
      lines.push(`### ${m.displayName}`);
      lines.push("");
      lines.push(text);
      lines.push("");
    });
  });

  if (verdict) {
    lines.push(`## Verdict Table`);
    lines.push("");
    lines.push(`| Model | Agree | Disagree | Confidence | Reasoning Trace |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    verdict.rows.forEach((row) => {
      const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(
        `| ${esc(row.model)} | ${esc(row.agree)} | ${esc(row.disagree)} | ${row.confidence}/5 | ${esc(row.reasoningTrace)} |`
      );
    });
    lines.push("");
    if (verdict.triggeredRound3) {
      lines.push(
        `> Round 3 was auto-triggered. Reason: ${verdict.disagreementReason}`
      );
      lines.push("");
    }
    lines.push(`## Final Verdict — Claude Opus 4.6`);
    lines.push("");
    lines.push(verdict.finalAnswer);
    lines.push("");
  }

  lines.push(`## Methodology & Disclosure`);
  lines.push("");
  lines.push(`### Council Composition`);
  lines.push("");
  lines.push(`This debate was facilitated by the following language models:`);
  lines.push("");
  COUNCIL_MODELS.forEach((m) => {
    lines.push(`- **${m.displayName}** (${m.provider})`);
  });
  lines.push("");
  lines.push(`**Synthesizer:** Claude Opus 4.6 (Anthropic)`);
  lines.push("");
  lines.push(`### Synthesis Process`);
  lines.push("");
  lines.push(`Claude Opus 4.6 synthesized the council verdict using the following methodology:`);
  lines.push("");
  lines.push(`- **Consensus Detection:** Identifying areas of agreement across model responses and assigning position alignment scores`);
  lines.push(`- **Deliberation Analysis:** Synthesizing disagreements into nuanced positions that acknowledge competing viewpoints`);
  lines.push(`- **Final Answer Generation:** Structured reasoning based on debate outcomes and consensus thresholds`);
  lines.push("");
  lines.push(`### Known Biases & Limitations`);
  lines.push("");
  lines.push(`**Critical Disclaimers:**`);
  lines.push("");
  lines.push(`1. **LLM Limitations:** All council members are large language models with inherent risks of hallucination, confident-sounding incorrect answers, and potential fabrication of facts. This verdict should not be treated as authoritative without expert verification.`);
  lines.push("");
  lines.push(`2. **Training Data Cutoffs:** Models are trained on text data up to specific cutoff dates (varies per model). They lack knowledge of events or developments after their training cutoff and cannot access real-time information unless web search was enabled.`);
  lines.push("");
  lines.push(`3. **Anthropic Bias:** Claude models (Sonnet and Opus) are Anthropic products. The synthesis and final verdict may reflect Anthropic's constitutional AI alignment preferences, which prioritize helpfulness, harmlessness, and honesty as defined by Anthropic.`);
  lines.push("");
  lines.push(`4. **Limited Real-Time Access:** Models operate without real-time data streams, live market information, or current event feeds. Verdicts based on recent or rapidly evolving situations may lack crucial context.`);
  lines.push("");
  lines.push(`5. **Consensus ≠ Correctness:** Agreement among models does not guarantee accuracy. High consensus scores may reflect shared training data biases rather than ground truth. For critical decisions, consult domain experts and primary sources.`);
  lines.push("");
  lines.push(`### Citation & Reproducibility`);
  lines.push("");
  lines.push(`**Generated:** ${new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })}`);
  lines.push("");
  lines.push(`For reproducibility, all model responses and reasoning traces are included in the sections above. This verdict can be reviewed alongside the complete debate transcript.`);
  lines.push("");

  return lines.join("\n");
}
