# Model Council

> One prompt. Four frontier models. A structured debate. One synthesized verdict.

**Model Council** is a research tool that convenes four AI frontier models, runs them through a structured 2–3 round debate, and uses Claude Opus 4.6 as a synthesizer to produce a final verdict with detailed reasoning and a comparison table.

Designed to surface **disagreement between models** on hard questions rather than defaulting to a single model's confident answer.

---

## ✨ Features

- **Live Debate Streaming** — Watch all four models respond in real-time over Server-Sent Events
- **Dark Mode UI with Glassmorphism** — Modern, polished interface with smooth animations
- **Markdown-Rendered Output** — Debate responses with headers, lists, code blocks, and proper typography
- **Modal-Based Setup** — Configure debate settings from an intuitive modal dialog
- **Side-by-Side Verdict Table** — Structured comparison of what each model agreed/disagreed on
- **One-Click Export** — Download entire debate as Markdown with all rounds and verdict
- **Web Search Integration** — Optional live web context via OpenRouter's `:online` mode
- **Model Persona System** — Assign emoji-based personas to each debater for visual clarity
- **Session History** — localStorage-backed debate history with restore capability
- **Configurable Council** — Swap any model in the lineup via the setup modal

---

## 🎯 How It Works

### Round 01 — Independent
All four council models see only your prompt and write independent answers (parallel calls).

### Round 02 — Critique & Update
Models see the three other Round 1 answers and identify agreement/disagreement points, then update their own position if others made valid arguments.

### Round 03 — Final Statements (Conditional)
Claude Opus checks for substantive disagreement. If found, models write final positions. You can force this round manually.

### Synthesis & Verdict
Opus 4.6 synthesizes the debate into:
- A **verdict table** (what each model agreed/disagreed on, confidence, reasoning)
- A **final prose answer** with synthesis and open questions

---

## 🏛️ The Council

| Seat | Model | Role |
|---|---|---|
| 1 | Claude Sonnet 4.6 | Debater |
| 2 | GPT-5 | Debater |
| 3 | Gemini 3.1 Pro | Debater |
| 4 | Grok 4.20 | Debater |
| Judge | Claude Opus 4.6 | Synthesizer |

**Swap anytime:** Edit `app/lib/models.ts` to customize the lineup with any OpenRouter model.

---

## 🌐 Web Search

Toggle "Web Search" in the setup modal to augment model calls with live web results via [Exa](https://exa.ai). Each searched call adds ~$0.004 to model costs.

Synthesis and disagreement checks never use web search—they reason purely over debate transcripts.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 + Dark Mode + Glassmorphism |
| **Streaming** | Web Streams + Server-Sent Events |
| **LLM API** | OpenAI SDK → OpenRouter |
| **State** | React Context (SetupModal) + localStorage (History) |
| **Markdown** | Custom parser (MarkdownContent component) |

No database. No auth. Personal tool—runs entirely on localhost.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/deshpandessydneyai-commits/model-council.git
cd model-council/app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Get Your OpenRouter API Key
- Go to [OpenRouter](https://openrouter.ai) and create a free account
- Generate an API key at https://openrouter.ai/keys
- Add credits to your account (debates typically cost $0.10–$0.40 each)

### 4. Set Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your OpenRouter key:
```env
OPENROUTER_API_KEY=your_key_here
```

### 5. Start the Dev Server
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### 6. Run a Debate
1. Click "Start a New Council" in the sidebar
2. Enter your question/prompt
3. (Optional) Toggle Web Search or Force Round 3
4. Click "Begin Debate"
5. Watch the debate unfold in real-time
6. Review the verdict table and final synthesis
7. Export as Markdown if you want to save it

---

## 📁 Project Structure

```
model-council/
├── README.md                     # This file
├── PRD-model-council.md          # Full product spec
├── ASSUMPTIONS-model-council.md  # Risk analysis
└── app/                          # Next.js application
    ├── app/
    │   ├── layout.tsx            # Root layout + Sidebar
    │   ├── page.tsx              # Home page (hero, prompt, rounds, verdict)
    │   ├── globals.css           # Base styles + dark theme variables
    │   └── api/
    │       └── council/route.ts  # SSE streaming endpoint
    ├── components/
    │   ├── Sidebar.tsx           # Left sidebar navigation
    │   ├── ModelCard.tsx         # Individual model response card
    │   ├── MarkdownContent.tsx   # Markdown parser/renderer
    │   ├── DebateSetupModal.tsx  # Modal for debate configuration
    │   ├── VerdictTable.tsx       # Verdict comparison table
    │   ├── RoundSection.tsx       # 2×2 grid per debate round
    │   ├── Footer.tsx            # Footer with model info
    │   └── [other components]
    └── lib/
        ├── models.ts             # Council + synthesizer config
        ├── council.ts            # Debate orchestration & prompts
        ├── setup-modal-context.tsx # Global modal state
        └── [other utilities]
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key from https://openrouter.ai/keys |
| `OPENROUTER_APP_NAME` | No | Optional: shown in OpenRouter dashboard |
| `OPENROUTER_APP_URL` | No | Optional: HTTP-Referer header |

### Customize the Council

Edit `app/lib/models.ts` to change the debate lineup:

```typescript
export const COUNCIL_MODELS: CouncilModel[] = [
  {
    id: "sonnet",
    slug: "anthropic/claude-sonnet-4.6",
    displayName: "Claude Sonnet 4.6",
    provider: "Anthropic",
  },
  // Add or swap any OpenRouter model slug
];
```

Visit [OpenRouter Models](https://openrouter.ai/models) to see all available options.

---

## 🎨 UI/UX Highlights

### Dark Mode
Built-in dark theme with Tailwind CSS v4. All components use CSS variables for consistency.

### Glassmorphism
Frosted glass effect on cards and modals with `backdrop-filter: blur(20px)` and `rgba` backgrounds.

### Markdown Rendering
Debate responses render with proper typography:
- **Headers** (#, ##, ###) with semantic sizing
- **Code blocks** with dark syntax highlighting
- **Lists** with proper indentation
- **Bold text** inline formatting

### Responsive Layout
- **Desktop:** Sidebar + main content + footer
- **Mobile:** Collapsible sections and optimized spacing

---

## 📊 Cost Estimate

Typical debate costs depend on:
- Prompt length
- Model verbosity
- Web search (adds ~$0.04 per search)

**Ballpark:** $0.10–$0.40 per debate

You can check remaining credits in the sidebar footer.

---

## ⚠️ Known Limitations

- **Self-reported confidence is uncalibrated.** A model's "5/5" doesn't mean it's right 95% of the time. Treat scores as relative.
- **Synthesizer bias.** Using Opus 4.6 as judge when Claude Sonnet is a debater introduces bias. Rotate synthesizers occasionally.
- **Consensus ≠ Truth.** Four models can agree and still be wrong. The verdict shows what the council agreed on, not ground truth.
- **No follow-up threading.** One prompt, one debate, one verdict. Multi-turn refinement isn't implemented in v1.
- **Debate quality depends on prompts.** Vague prompts = vague debates. Be specific.

---

## 🗺️ Roadmap

- [ ] Cost tracking and session analytics
- [ ] Custom system prompts per model
- [ ] Multi-turn follow-ups on same debate
- [ ] Export to PDF with formatting
- [ ] Debate templates (legal, technical, ethical, etc.)
- [ ] Model outcome tracking (which models were right?)

---

## 🤝 Contributing

This is a personal research project, but if you:
- **Find bugs** → Open an issue with reproducible steps
- **Have feature ideas** → Fork and experiment
- **Improve UX/design** → PRs welcome

---

## 📜 License

MIT. Do whatever you want with it—no warranty.

---

## 👏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- Powered by [OpenRouter](https://openrouter.ai) for unified API access
- UI inspired by [Bold Editorial Studio](https://bold.is)
- Styling with [Tailwind CSS](https://tailwindcss.com)

---

**Questions?** Open an issue on GitHub or reach out.

Happy debating! 🎙️
