# Model Council — Usability Review & Recommendations

## Executive Summary
Model Council has a clean, minimal design that reflects its sophisticated purpose. However, there are **12 actionable UX improvements** across information hierarchy, interaction patterns, and feedback mechanisms that would significantly improve user experience.

---

## 🔴 Critical Issues (High Impact)

### 1. **Confusing Document Upload Area on Mobile**
**Problem**: The "DROP A FILE HERE" box doesn't respond to interaction feedback on mobile. Users don't know if they can drag/drop on mobile.

**Recommendation**:
- Disable drag-drop on mobile devices
- Change CTA to just "Browse file" on mobile
- Show platform-appropriate affordance ("tap to browse")

**Implementation**: Add `pointer: none` to drop zone on mobile via media query

---

### 2. **"Convene Council" Button is Hard to Find**
**Problem**: The button is cut off or not immediately visible. Users must scroll to find it.

**Recommendation**:
- Move "Convene Council" button to **sticky position** at bottom of screen
- Or make it visually prominent (use full width on mobile)
- Add visual indicator (e.g., badge) showing button is disabled when prompt is empty

**Why**: User must write prompt, then scroll to find button. Current scroll position is unclear.

---

### 3. **Document Context Section Lacks Clear Success State**
**Problem**: After uploading a document, there's no clear "file loaded successfully" message. The extracted textarea appears but users might think it failed.

**Recommendation**:
- Add success toast: "Document loaded — X characters, ~Y tokens"
- Show filename with checkmark icon
- Add "Extracting..." state while parsing

**Code addition**: Add toast notification when `documentContext` is set

---

### 4. **Checkbox Labels Are Too Small & Low Contrast**
**Problem**: Web Search and Force Round 3 checkboxes are in gray monospace. Very hard to read and understand purpose.

**Recommendation**:
- Increase checkbox label font size to 14px (was ~12px)
- Use `text-black` instead of `text-muted` for labels
- Consider moving to separate "Options" section with descriptions

**Current**: "⟡ WEB SEARCH" and "FORCE ROUND 3"
**Better**: 
```
⟡ Web Search
    Search the web for current information (adds ~30 sec per round)

✓ Force Round 3
    Trigger final statements even if models agree
```

---

## 🟡 High Priority Issues

### 5. **No Feedback During Debate (Empty State)**
**Problem**: Once the debate starts, there's no visible indication that something is happening. UI goes blank until first token arrives.

**Recommendation**:
- Show **animated progress indicator** immediately when "Convene" is clicked
- Display: "Round 1 running... waiting for responses"
- Show which model is responding (icons or names)
- Add cancel button that's always visible

**Why**: Users assume it crashed or didn't submit

---

### 6. **Token Count Estimation Is Vague**
**Problem**: "~2500 tokens" without context. Users don't know if that's good or bad.

**Recommendation**:
- Add explanation on hover: "Token estimate (Claude has 200k context limit)"
- Show warning threshold color-coded:
  - 🟢 Green: <50k tokens (safe)
  - 🟡 Yellow: 50-150k tokens (consider trimming)
  - 🔴 Red: >150k tokens (may exceed limits)

**Implementation**: Already improved in tokens.ts, but needs better UI display

---

### 7. **History Panel Lacks Search/Filter**
**Problem**: With 50 sessions stored, finding a specific debate is impossible. Just a chronological list.

**Recommendation**:
- Add search box: filter by prompt text or date
- Add sorting options: "Most recent" / "Longest" / "Shortest"
- Show prompt preview in list items (currently good, but truncated)

**Why**: After 20+ sessions, scrolling through history is tedious

---

### 8. **No Indication of Web Search Being Active**
**Problem**: User checks "⟡ Web Search" but gets no feedback that it's enabled. Could submit query without realizing search is off.

**Recommendation**:
- Add small indicator near button: "Web Search: ON" / "OFF" with toggle color
- Or show as active pill: `[⟡ Web Search Active]`

**Visual**: Use same pattern as GitHub's "Draft" PR label

---

## 🟠 Medium Priority Issues

### 9. **Verdict Display Could Be More Scannable**
**Problem**: When verdict appears, there's no visual hierarchy. All text looks the same weight.

**Recommendation**:
- Table headers should be bolder
- Add subtle background colors to alternate rows (zebra striping)
- Confidence score (1-5) should be visually prominent (maybe as stars or bar)
- "Reasoning Trace" should be expandable (collapsible by default)

**Why**: Current table is hard to scan quickly for key insights

---

### 10. **Export Button Location Is Hidden**
**Problem**: "Export Markdown" button appears way down after verdict. Users might not see it.

**Recommendation**:
- Move export button to **top of verdict section**, next to "Verdict" label
- Or add to sticky header bar
- Add icon: `⬇️ Download` instead of just text

**Alternative**: Add copy-to-clipboard button alongside download

---

### 11. **No Clear Indication of What Models Are Running**
**Problem**: Footer shows model list, but during debate, user doesn't see which model is responding or in what order.

**Recommendation**:
- Show model cards during each round with status indicators:
  ```
  Claude Sonnet 4.6    [⏳ Responding...]
  GPT-5               [✓ Done - 452 tokens]
  Gemini 3.1 Pro      [⏳ Responding...]
  Grok 4.20           [🔄 Retrying...]
  ```

**Why**: Makes real-time debate feel more transparent and engaging

---

### 12. **No Onboarding or First-Time User Guidance**
**Problem**: New users see the interface but don't understand:
- What the debate actually does
- How long it takes
- What the output means
- Why they might use it

**Recommendation**:
- Add **"?"** info icon next to "Model Council." title
- Clicking shows 30-second guided tour:
  1. "Upload context (optional)"
  2. "Ask a question"
  3. "Watch 4 models debate"
  4. "Get synthesized verdict"
- Add estimated time: "~2-3 minutes per debate"

**Alternative**: Add FAQ section in footer

---

## 📱 Responsive Design Issues

### Mobile-Specific Problems:

**13. Columns Break on Tablet**
- Document upload area and prompt are stacked on mobile, taking up much screen space
- Suggestion: Hide document context section behind toggle on mobile

**14. Credits Display**
- Top-right credit display is cramped on mobile
- Suggestion: Stack vertically or move to sidebar menu

**15. Buttons Too Small on Mobile**
- "Browse file" button is ~60px wide, hard to tap
- Suggestion: Use full width on mobile (<640px)

---

## 💡 Quick Wins (Easy to Implement)

| Issue | Fix | Time | Impact |
|-------|-----|------|--------|
| Make checkbox labels bigger | CSS font-size 14px | 2 min | High |
| Add toast on file upload | Add notification component | 15 min | High |
| Sticky submit button | `position: sticky` | 5 min | High |
| Color-coded token warning | CSS color logic | 10 min | Medium |
| Export button reposition | Move DOM element | 5 min | Medium |
| Search history | Add input + filter logic | 20 min | Medium |
| Info tooltip | Add hover popover | 10 min | Low |

---

## 🎯 Design Principles Observations

**What's Working Well:**
- ✅ Minimal, focused design (no clutter)
- ✅ Good use of whitespace
- ✅ Clear button states and hierarchy
- ✅ Consistent typography and spacing

**What Needs Work:**
- ❌ Feedback loops (user doesn't know what's happening)
- ❌ Progressive disclosure (too much info at once)
- ❌ Error states not visible
- ❌ Mobile interactions not considered

---

## Recommended Implementation Order

### Phase 1 (1-2 hours) — Critical Usability Fixes
1. Sticky "Convene Council" button
2. Document upload success state (toast)
3. Improve checkbox labels (size + color)
4. Add debate progress indicator

### Phase 2 (2-3 hours) — Polish & Enhancement
1. Token count color coding
2. History search/filter
3. Model status display during debate
4. Verdict table improvements (zebra striping, expandable rows)

### Phase 3 (1-2 hours) — Nice-to-Have
1. Onboarding tour
2. Export button repositioning
3. Mobile layout improvements
4. Web search visual indicator

---

## Summary

Model Council has solid foundations but lacks **feedback and discoverability**. The core issues are:

1. **Users don't know what's happening** (no progress feedback)
2. **Users can't find key UI** (submit button, export button)
3. **Information is hard to scan** (tables, token counts, options)
4. **Mobile experience is secondary** (not optimized for touch)

Fixing these 12 issues would transform Model Council from a functional tool into a **genuinely delightful user experience** that makes the debate process transparent and engaging.
