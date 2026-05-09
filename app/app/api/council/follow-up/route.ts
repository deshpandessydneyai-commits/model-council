import { COUNCIL_MODELS, SYNTHESIZER } from "@/lib/models";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type FollowUpEvent =
  | { type: "model_start"; modelId: string }
  | { type: "token"; modelId: string; delta: string }
  | { type: "model_done"; modelId: string; text: string }
  | { type: "synthesis_start" }
  | { type: "synthesis_token"; delta: string }
  | { type: "synthesis_done"; text: string }
  | { type: "error"; message: string }
  | { type: "done" };

interface FollowUpRequest {
  question: string;
  previousContext: {
    originalPrompt: string;
    finalAnswer: string;
    consensusScore: number;
    roundSummaries: string[];
  };
  includeSynthesis?: boolean;
}

export async function POST(req: Request) {
  let body: FollowUpRequest;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { question, previousContext, includeSynthesis = false } = body;

  if (!question?.trim()) {
    return new Response("question is required", { status: 400 });
  }

  if (!previousContext) {
    return new Response("previousContext is required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: FollowUpEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      try {
        const client = new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: "https://openrouter.ai/api/v1",
        });

        // Build context string from previous debate
        const contextString = `
## Previous Debate Summary
**Original Question:** ${previousContext.originalPrompt}

**Previous Verdict:** ${previousContext.finalAnswer}

**Consensus Score:** ${previousContext.consensusScore}%

**Round Summaries:**
${previousContext.roundSummaries.join("\n")}

---

## Follow-Up Question
${question}
`;

        const systemPrompt = `You previously participated in a structured debate on the above topic. The models reached a verdict which is shown above. Now, please answer this follow-up question in light of the previous discussion and verdict. Be concise (200-400 words) and reference the previous debate where relevant.`;

        // Call all 4 council models in parallel
        const modelPromises = COUNCIL_MODELS.map(async (model) => {
          send({ type: "model_start", modelId: model.id });

          try {
            const stream = await client.messages.stream({
              model: model.slug,
              max_tokens: 2000,
              system: systemPrompt,
              messages: [{ role: "user", content: contextString }],
            });

            let fullResponse = "";

            for await (const chunk of stream) {
              if (
                chunk.type === "content_block_delta" &&
                chunk.delta.type === "text_delta"
              ) {
                const delta = chunk.delta.text;
                fullResponse += delta;
                send({ type: "token", modelId: model.id, delta });
              }
            }

            send({ type: "model_done", modelId: model.id, text: fullResponse });
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Unknown error calling model";
            send({
              type: "error",
              message: `${model.displayName} failed: ${msg}`,
            });
          }
        });

        // Wait for all models to complete
        await Promise.all(modelPromises);

        // Optional: synthesize responses with Opus
        if (includeSynthesis) {
          send({ type: "synthesis_start" });

          // For synthesis, we'd need to collect all responses first
          // For now, we'll skip this - can be implemented later
          // send({ type: "synthesis_done", text: "Synthesis not yet implemented" });
        }

        send({ type: "done" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send({ type: "error", message: msg });
        send({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
