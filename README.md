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
- **GPS Framework** — Stakes-aware prompting with domain detection, adversarial challenges, and bias checks
- **Session History** — localStorage-backed debate history with restore capability
- **Configurable Council** — Swap any model in the lineup via settings

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

## 🎯 GPS Framework — Stakes-Aware Prompting

Model Council uses the **GPS Framework** (Gaslight/Push Back/Stress Test) to generate domain-aware, stakes-conscious debate prompts:

### Domain Detection
The system automatically identifies 8 question types based on keywords and context:
- **Medical** — Health, treatment, clinical decisions
- **Academic** — Research, theories, scholarly debate
- **Technical** — Code, architecture, engineering decisions
- **Legal** — Contracts, compliance, regulatory matters
- **Creative** — Art, design, subjective aesthetic questions
- **Policy** — Governance, regulation, societal decisions
- **Personal** — Life choices, relationships, self-improvement
- **Business** — Markets, strategy, organizational decisions

### Stakes Levels
Select how much weight the question carries, and the system adjusts prompting intensity:

| Level | Use Case | Prompt Adjustment |
|---|---|---|
| **Exploratory** | Low-risk brainstorming | Focus on creative thinking, multiple angles |
| **Implemented** | Already decided, seeking validation | Test for blind spots, alternative approaches |
| **Critical** | Significant impact, needs rigor | Demand evidence, accountability, bias checks |
| **Time-Critical** | Urgent decision required | Streamline analysis, prioritize key factors |
| **Resource-Constrained** | Limited budget/time/options | Practical trade-offs, feasibility focus |

### How It Works
1. **Gaslight (Round 1)**: Main prompt sets the context and stakes
2. **Push Back (Round 2)**: Domain-specific adversarial challenges force models to defend positions
3. **Stress Test (Round 3)**: Bias checks and accountability prompts test reasoning rigor

This ensures debates are tailored to both the domain and the stakes, producing more relevant insights.

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

## 💡 Use Cases & Examples

Model Council works for anyone who needs **multiple perspectives** on a hard question. The GPS Framework ensures debates adapt to your domain and stakes. Here's how different users leverage it:

### 🔬 Research & Academia
**Explore topics rigorously, test hypotheses, document thinking.**

Example prompts:
- `"Compare quantitative vs. qualitative research methods for studying human behavior"`
- `"Evaluate different interpretations of this historical event"`
- `"What are the strongest arguments for and against this theory?"`

**Export:** Markdown (for papers) + JSON (for data analysis)

---

### 💼 Product & Business
**Make better decisions by considering multiple angles.**

Example prompts:
- `"Should we build mobile-first or web-first? Consider our target users, dev resources, and market trends"`
- `"Evaluate these 4 business models for our SaaS product"`
- `"What are the risks of pivoting into market X?"`

**Export:** Summary + verdict table (for decision memos)

---

### 🔧 Engineering & Development
**Debate technical decisions with structured reasoning.**

Example prompts:
- `"React vs. Vue vs. Svelte—which is best for our use case?"`
- `"Microservices or monolith architecture? Consider scalability, complexity, and team size"`
- `"Compare SQL vs. NoSQL databases for our application"`

**Export:** JSON (for parsing into decision docs)

---

### ✍️ Content & Marketing
**Generate multiple angles for articles, explore ideas, validate messaging.**

Example prompts:
- `"What will be the future of remote work post-pandemic?"`
- `"Explore 4 different perspectives on AI's impact on creative industries"`
- `"Compare these 3 marketing strategies for reaching Gen Z"`

**Export:** Markdown (for blog posts) + highlight disagreements (for engaging content)

---

### 🎓 Education & Learning
**Teach critical thinking, explore topics from multiple angles.**

Example prompts:
- `"Debate the causes and proposed solutions for climate change"`
- `"Should AI be regulated? What are the strongest arguments on each side?"`
- `"Compare different approaches to solving income inequality"`

**Export:** Full debate (for classroom discussion)

---

### 🤔 Personal Exploration & Decisions
**Test assumptions, explore tough questions, make better decisions.**

Example prompts:
- `"Career decision: should I prioritize financial security or personal passion?"`
- `"Is it worth starting a business? Compare pros/cons rigorously"`
- `"Should I relocate? Consider career, lifestyle, relationships, finances"`

**Export:** Full debate (for reflection)

---

### 🏢 Consulting & Strategy
**Justify recommendations with rigorous multi-perspective analysis.**

Example prompts:
- `"Should our client enter the European market? Compare acquisition vs. partnership vs. greenfield"`
- `"Evaluate the viability of this acquisition target"`
- `"What are the risks and opportunities in this merger?"`

**Export:** Summary + recommendations (for client pitches)

---

## 🎯 Quick Tips for Better Debates

| Tip | Example |
|---|---|
| **Be specific** | ❌ "Is AI good?" → ✅ "Should AI regulation be broad or focused?" |
| **Include context** | Add relevant constraints: budget, timeline, audience, constraints |
| **Ask "why"** | ❌ "Compare A vs B" → ✅ "Compare A vs B for a startup with limited budget" |
| **Iterate** | Run the same prompt multiple times, toggle Web Search on/off |
| **Export & share** | Markdown exports make it easy to share with teams |

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
