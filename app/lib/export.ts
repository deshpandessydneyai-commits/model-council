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

  // Synthesizer Disclosure Section
  lines.push(`## Methodology & Synthesizer Disclosure`);
  lines.push("");
  lines.push(`**Synthesizer:** Claude Opus 4.6 (made by Anthropic)`);
  lines.push("");
  lines.push(`**Council Composition:**`);
  lines.push(`- Claude Sonnet 4.6 (Anthropic)`);
  lines.push(`- GPT-5 (OpenAI)`);
  lines.push(`- Gemini 3.1 Pro (Google)`);
  lines.push(`- Grok 4.20 (xAI)`);
  lines.push("");
  lines.push(`**Important Note on Potential Bias:**`);
  lines.push("");
  lines.push(`This verdict was synthesized by Claude Opus 4.6, which is made by Anthropic. Additionally, Claude Sonnet 4.6 (also made by Anthropic) was one of the four debating council members. This means 2 of 4 models in this council are from the same organization as the synthesizer.`);
  lines.push("");
  lines.push(`If Sonnet and Opus strongly agreed during the debate, the final verdict may be biased toward Anthropic's perspective or values. When reviewing this verdict, consider paying special attention to the positions taken by GPT-5 (OpenAI), Gemini 3.1 Pro (Google), and Grok 4.20 (xAI), especially if they expressed disagreement with the Anthropic models.`);
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

  return lines.join("\n");
}
