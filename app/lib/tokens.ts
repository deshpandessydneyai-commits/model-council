/**
 * Rough estimate of token count using common tokenization ratios.
 * This is NOT a precise tokenizer but good enough for warnings.
 * For most English text: ~1 token per 4 characters
 * For code/structured: ~1 token per 2-3 characters (more tokens per char)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // Count code blocks (higher token density)
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).join("");
  const codeChars = codeBlocks.length;
  const nonCodeChars = text.length - codeChars;

  // Code: 1 token per 2.5 chars, Regular: 1 token per 4 chars
  const codeTokens = Math.ceil(codeChars / 2.5);
  const textTokens = Math.ceil(nonCodeChars / 4);

  return codeTokens + textTokens;
}

/**
 * Check if combined prompt + document would exceed typical context limits.
 * Claude models have 200k context, but we use ~10k for overhead, leaving ~190k.
 * Debate uses: prompt + document + 3 rounds of responses
 */
export function checkContextWarning(
  promptLength: number,
  documentLength: number
): { warning: string | null; color: string } {
  const promptTokens = estimateTokens(promptLength.toString()); // rough
  const docTokens = estimateTokens(documentLength.toString());
  const totalBefore = promptTokens + docTokens;

  if (totalBefore > 180000) {
    return {
      warning: "⚠ Document + prompt may exceed safe context limits. Consider trimming.",
      color: "text-red-600",
    };
  }

  if (totalBefore > 100000) {
    return {
      warning: "⚡ Large document — debate may take longer or hit limits",
      color: "text-amber-600",
    };
  }

  return { warning: null, color: "" };
}
