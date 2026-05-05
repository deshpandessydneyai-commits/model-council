import { Suspense } from "react";

async function CreditsData() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return <span className="mono-meta text-sm text-muted">—</span>;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/credits", {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("fetch failed");
    const json = await res.json();
    const { total_credits, total_usage } = json.data ?? {};
    const remaining = (total_credits ?? 0) - (total_usage ?? 0);
    const color =
      remaining < 1 ? "#dc2626" : remaining < 3 ? "#d97706" : "#16a34a";
    return (
      <span className="mono-meta text-sm font-bold" style={{ color }}>
        ${remaining.toFixed(2)} remaining
      </span>
    );
  } catch {
    return <span className="mono-meta text-sm text-muted">unavailable</span>;
  }
}

export function CreditsWidget() {
  return (
    <div className="fixed top-[76px] right-6 z-40 bg-white border border-black flex items-center gap-4 px-5 py-3 shadow-sm">
      <span className="mono-meta text-muted text-xs">OpenRouter Credits</span>
      <span className="w-px h-4 bg-black/20" />
      <Suspense fallback={<span className="mono-meta text-sm text-muted">—</span>}>
        <CreditsData />
      </Suspense>
    </div>
  );
}
