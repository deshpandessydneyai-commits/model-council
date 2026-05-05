"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Help() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 pt-16 pb-32">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Council
      </Link>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Help & FAQ</h1>
        <p className="text-gray-400">Everything you need to know about Model Council</p>
      </div>

      {/* FAQ sections */}
      <div className="space-y-8">
        {/* Getting Started */}
        <section className="border border-glass bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">How do I start a debate?</h3>
              <p className="text-gray-300">
                Click "New Council" in the sidebar to open the setup modal. Enter your question, configure options (Web Search, Force Round 3), and click "Begin Debate". The models will debate your question across 2-3 rounds.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">What should I ask?</h3>
              <p className="text-gray-300 mb-3">
                Model Council works best with <strong>open-ended questions</strong> where there are multiple valid perspectives:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                <li>✅ "What's the best approach to climate change?"</li>
                <li>✅ "Should we use microservices or monolith?"</li>
                <li>✅ "React vs. Vue: which is better?"</li>
                <li>❌ "What's 2+2?" (factual questions have one answer)</li>
                <li>❌ "Generate a poem" (not a debate)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">How long does a debate take?</h3>
              <p className="text-gray-300">
                Typically 30-60 seconds per round depending on response length. A 2-round debate takes ~2 minutes, a 3-round debate takes ~3 minutes.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border border-glass bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">How Debates Work</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Round 1 — Independent</h3>
              <p className="text-gray-300">
                All four models see only your prompt and respond independently. Responses are generated in parallel.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Round 2 — Critique & Update</h3>
              <p className="text-gray-300">
                Models see the other three responses and identify where they agree/disagree. They can update their position if others made valid points.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Round 3 — Final Statements (Conditional)</h3>
              <p className="text-gray-300">
                Claude Opus checks if substantive disagreement remains. If yes, a third round fires automatically. You can force it with the "Force Round 3" toggle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Synthesis</h3>
              <p className="text-gray-300">
                Opus 4.6 synthesizes the debate into a verdict table (showing what each model agreed/disagreed on) plus a final prose answer.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border border-glass bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Web Search</h3>
              <p className="text-gray-300">
                Toggle "Web Search" in the setup modal to augment model responses with live web results. Adds ~$0.004 per search.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Session History</h3>
              <p className="text-gray-300">
                All debates are automatically saved to browser localStorage. Click "Recent" in the sidebar to restore previous debates.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Export</h3>
              <p className="text-gray-300">
                Click "Export Markdown" to download the entire debate (all rounds + verdict) as a `.md` file. Great for sharing or publishing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Model Personas</h3>
              <p className="text-gray-300">
                Assign emoji personas to each model in the setup modal. Makes it easier to visually identify models in the debate cards.
              </p>
            </div>
          </div>
        </section>

        {/* Costs & Billing */}
        <section className="border border-glass bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Costs & Billing</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">How much does a debate cost?</h3>
              <p className="text-gray-300">
                <strong>Typically $0.10 – $0.40 USD</strong> depending on prompt length and model verbosity. Web Search adds a few cents.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Where do I buy credits?</h3>
              <p className="text-gray-300">
                Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">OpenRouter</a>, create an account, and add credits. You can check remaining credits in the sidebar footer.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">What if I run out of credits?</h3>
              <p className="text-gray-300">
                You'll see an error when starting a debate. Top up your OpenRouter account and try again.
              </p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="border border-glass bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Troubleshooting</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Debate won't start</h3>
              <p className="text-gray-300 mb-2">
                Check:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                <li>You entered a prompt</li>
                <li>Your OpenRouter API key is set in <code className="bg-[#1A1A2E] px-1 py-0.5 rounded text-xs">.env.local</code></li>
                <li>You have credits remaining in your OpenRouter account</li>
                <li>The dev server is running</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Models aren't responding</h3>
              <p className="text-gray-300">
                This usually means OpenRouter is rate-limited or experiencing issues. Wait a moment and try again.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">History isn't saving</h3>
              <p className="text-gray-300">
                Check your browser's localStorage quota. If you're out of space, clear old debates in browser settings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-400 mb-2">Something else is broken?</h3>
              <p className="text-gray-300">
                Open an issue on the <a href="https://github.com/deshpandessydneyai-commits/model-council" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">GitHub repo</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Tips & Tricks */}
        <section className="border border-glass bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Tips & Tricks</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              <strong className="text-violet-400">Be specific:</strong> Vague prompts lead to vague debates. Include context and constraints.
            </p>
            <p>
              <strong className="text-violet-400">Iterate:</strong> Run the same prompt multiple times or with different model lineups to find the best perspective.
            </p>
            <p>
              <strong className="text-violet-400">Use Web Search:</strong> For time-sensitive topics (current events, recent research), enable Web Search to get up-to-date context.
            </p>
            <p>
              <strong className="text-violet-400">Export & Share:</strong> Download debates as Markdown and share with teams or publish as blog posts.
            </p>
            <p>
              <strong className="text-violet-400">Check disagreement:</strong> Look at the verdict table to see where models actually disagreed—those are often the most interesting insights.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-glass text-sm text-gray-500">
        <p>
          Still have questions? Check out the <a href="https://github.com/deshpandessydneyai-commits/model-council" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">README on GitHub</a> or visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">OpenRouter docs</a>.
        </p>
      </div>
    </div>
  );
}
