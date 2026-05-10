# Model Council — Session Handoff

## Project
Next.js app at `/Users/amitdeshpande/Desktop/AmitProjects/model-council/app`
Python mockup server: `python3 -m http.server 4200` from `/mockups/` directory

## Agreed Design Direction
**File:** `mockups/chamber-research.html` (http://localhost:4200/chamber-research.html)

This is the approved design to implement into the actual app. Key decisions:

### Visual Design
- **Light theme by default** — warm white `#FAFAF8` background
- **Single accent colour** — deep blue `#1D4ED8` only (safe for all colorblindness types)
- **WCAG AA compliant** — all text ≥ 4.5:1 contrast ratio
- **Status uses shape + text + colour** — never colour alone (✓ Done, ✎ Writing, ○ Queued)
- **Dark mode toggle** available (top-right button)
- **Fonts:** Inter (UI), Lora serif (question/verdict), JetBrains Mono (versions/timestamps)

### Layout (desktop)
- Sticky top nav (logo, Council/History/Settings/Help, dark mode toggle, avatar)
- Stage tabs bar (Pose ✓ → Deliberate active → Verdict)
- Question strip (QUESTION label + serif question text + tags)
- Round stepper (Independent ✓ → Critique → Rebuttal → Synthesis)
- Left sidebar 240px — session history grouped by Today/Yesterday/This Week + New Session button
- Main area: 2×2 model response grid
- Verdict panel below grid: arc gauge + blockquote + model alignment TABLE (not just pills)
- Export bar: Copy link / PDF report / Export report
- Follow-up input + suggestion chips

### Layout (mobile)
- Sidebar hidden, bottom nav (Council / History / Export / Settings)
- Single column model cards

### Researcher Features to Implement
1. **Session history sidebar** — searchable, grouped by date
2. **"What is this?" tooltip** on consensus score — explains methodology
3. **Model Alignment Table** — columns: Model, Role, Alignment, Confidence, Key point, View button
4. **"Full response" expandable** per model card
5. **Export report** — PDF + copy link (prominent, always visible after verdict)
6. **Model version shown** on each card (e.g. `claude-3-5-sonnet-20241022`)
7. **Timestamps** on responses and verdict
8. **Session ID** for citation (e.g. `#MC-2025-0509-003`)
9. **"Select text to annotate"** hint on model excerpts
10. **Skip-to-content link** for keyboard/screen reader accessibility

## Current App State
- Running on `localhost:3000` (Next.js dev server)
- Key components: `ModelCard.tsx`, `VerdictTable.tsx`, `DebateCard.tsx`, `Sidebar.tsx`, `HistoryPanel.tsx`
- Modified but uncommitted app files exist — these are previous feature work, not the new design yet
- Git branch: `main`, 6 commits ahead of origin

## What To Do Next
Implement `chamber-research.html` design into the actual Next.js app, starting with:
1. Update `globals.css` with the new design tokens
2. Restyle `ModelCard.tsx` to match the new card design
3. Add the alignment table to `VerdictTable.tsx`
4. Update nav/layout with session sidebar
5. Add export bar component
