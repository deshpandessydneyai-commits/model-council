"use client";

import { X } from "lucide-react";
import { DebateFlowDiagram } from "./DebateFlowDiagram";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--bd)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b sticky top-0"
          style={{ borderColor: "var(--bd)", backgroundColor: "var(--bg-inset)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--t1)" }}>
            Help & Guidance
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: "var(--t3)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What is Model Council */}
          <section>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              What is Model Council?
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--t2)" }}>
              Model Council facilitates structured debates between four AI models (Claude, GPT, Llama, and Grok). Instead of asking one model a question, you get diverse perspectives from multiple models that actively debate and respond to each other's arguments.
            </p>
          </section>

          {/* How the Debate Works */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              How the Debate Works
            </h3>
            <div className="space-y-3 text-sm" style={{ color: "var(--t2)" }}>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>Round 1 — Independent Responses</div>
                <p>Each model responds to your question independently, without seeing others' responses. This gives you their initial, uninfluenced perspective.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>Round 2 — Critique & Response</div>
                <p>Models see what others said and can critique, agree with, or challenge their arguments. They can refine their position based on the debate.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>Round 3 (Optional) — Final Statements</div>
                <p>If models haven't reached consensus or if you enable "Force Final Round," a 3rd round lets each model make closing arguments before the synthesizer creates a verdict.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>Synthesis — Final Verdict</div>
                <p>Claude Opus analyzes all responses and creates a verdict showing areas of agreement, disagreement, and each model's position on the question.</p>
              </div>
            </div>
          </section>

          {/* GPS Framework */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              GPS Framework: How Debates Work
            </h3>
            <p className="text-sm mb-3" style={{ color: "var(--t2)" }}>
              Model Council uses the <strong>GPS Framework</strong> to structure debates:
            </p>
            <div className="space-y-3 text-sm" style={{ color: "var(--t2)" }}>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>🎯 G — Gather (Round 1)</div>
                <p>Models independently gather perspectives without influence from others. This reveals their initial reasoning and potential biases.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>⚔️ P — Probe (Round 2)</div>
                <p>Models probe each other's arguments through adversarial challenge. They identify weaknesses, test assumptions, and refine their positions based on peer critique.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>✨ S — Synthesize (Round 3 + Verdict)</div>
                <p>Models synthesize by checking their own reasoning for cognitive biases and blind spots. Claude Opus then creates the final verdict by analyzing consensus and disagreement patterns.</p>
              </div>
            </div>
          </section>

          {/* Visual Flow Diagram */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              Visual Flow
            </h3>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-inset)", borderColor: "var(--bd)" }} className="border">
              <DebateFlowDiagram />
            </div>
          </section>

          {/* How to Use */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              How to Use
            </h3>
            <ol className="text-sm leading-relaxed space-y-2" style={{ color: "var(--t2)" }}>
              <li><strong>1. Ask a Question:</strong> Enter a debate-style question in the input field. Good questions have multiple valid perspectives.</li>
              <li><strong>2. Set Context:</strong> Choose the decision stakes and whether to include web search for current information.</li>
              <li><strong>3. Start Council:</strong> Click "Start Council" to begin the debate. Models will respond in rounds.</li>
              <li><strong>4. Review Debate:</strong> Watch the models respond in real-time. Each round shows their thinking and positions.</li>
              <li><strong>5. Read Verdict:</strong> After all rounds, see the synthesized verdict with consensus scores and model alignment.</li>
            </ol>
          </section>

          {/* How Stakes Affect the Debate */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              How Stakes Affect the Debate
            </h3>
            <p className="text-sm mb-3" style={{ color: "var(--t2)" }}>
              The <strong>decision stakes level</strong> you select changes how intensely models analyze your question:
            </p>
            <div className="space-y-3 text-sm" style={{ color: "var(--t2)" }}>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>📊 Exploratory</div>
                <p><strong>Use for:</strong> Intellectual exploration, nuanced analysis, trade-off exploration. <strong>Models will:</strong> Encourage alternative perspectives, explore unknowns, prioritize nuance over certainty.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>📊 Implementation</div>
                <p><strong>Use for:</strong> Decisions that will be acted upon. <strong>Models will:</strong> Stress-test for failures, check for unintended consequences, focus on practical feasibility.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>📊 Critical Stakes</div>
                <p><strong>Use for:</strong> Health, safety, legal, or major life decisions. <strong>Models will:</strong> Identify worst-case scenarios, surface knowledge gaps, cross-check reasoning rigorously.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>📊 Time-Critical</div>
                <p><strong>Use for:</strong> Decisions needed within 48 hours. <strong>Models will:</strong> Focus on highest-risk assumptions, provide rapid analysis with appropriate caveats.</p>
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--t1)" }}>📊 Resource-Constrained</div>
                <p><strong>Use for:</strong> Decisions with limited resources. <strong>Models will:</strong> Identify safe shortcuts, check for critical dependencies that could break.</p>
              </div>
            </div>
            <p className="text-sm mt-3" style={{ color: "var(--t3)" }}>
              💡 <strong>Tip:</strong> Higher stakes levels increase the debate length and cost. The "How Stakes Shaped This Verdict" section in the verdict explains exactly how stakes affected that specific debate.
            </p>
          </section>

          {/* Question Types */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              Good Questions
            </h3>
            <p className="text-sm mb-2" style={{ color: "var(--t2)" }}>
              <strong>Work well:</strong> "Should we prioritize AI safety?" "Is remote work better than office work?" "What's the best approach to climate change?"
            </p>
            <p className="text-sm" style={{ color: "var(--t2)" }}>
              <strong>Don't work:</strong> Factual questions with one answer ("What year was X founded?"), math problems, or content generation requests.
            </p>
          </section>

          {/* Export & Save */}
          <section>
            <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              Export & Save
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>
              After a verdict is ready, use the Export Bar to copy the debate link, download markdown, or export as PDF. Sessions are automatically saved to your browser history.
            </p>
          </section>

          {/* Understanding Results */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              Understanding Results
            </h3>
            <div className="space-y-3 text-sm">
              <p style={{ color: "var(--t2)" }}>
                The verdict section shows how models aligned and disagreed:
              </p>
              <ul className="leading-relaxed space-y-2" style={{ color: "var(--t2)" }}>
                <li><strong>Consensus Score:</strong> Percentage of agreement among all models (0-100%). Green = high agreement, amber = partial consensus, red = disagreement.</li>
                <li><strong>Final Answer:</strong> The synthesized position based on areas of agreement and model insights.</li>
                <li><strong>Council Composition:</strong> Shows which models participated and their versions.</li>
                <li><strong>How Stakes Shaped This Verdict:</strong> Explains how the stakes level you chose affected model rigor. At critical stakes, models apply more rigorous analysis. At exploratory stakes, they prioritize nuance.</li>
                <li><strong>Known Biases & Limitations:</strong> Important disclosures about LLM limitations, training data cutoffs, and why consensus doesn't guarantee correctness.</li>
              </ul>
              <p style={{ color: "var(--t3)" }}>
                💡 <strong>Key Insight:</strong> The verdict is most valuable when you understand why models agreed or disagreed. Look at individual round responses to see the reasoning behind each model's position.
              </p>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--t1)" }}>
              Tips for Best Results
            </h3>
            <ul className="text-sm leading-relaxed space-y-2" style={{ color: "var(--t2)" }}>
              <li>• Be specific and provide context in your question</li>
              <li>• Include constraints or criteria that matter to you</li>
              <li>• Consider enabling web search for current events or recent data</li>
              <li>• Review all rounds to understand how consensus was reached</li>
              <li>• High consensus doesn't always mean correctness — verify critical claims</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex justify-end"
          style={{ borderColor: "var(--bd)", backgroundColor: "var(--bg-inset)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--ac)",
              color: "white",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
