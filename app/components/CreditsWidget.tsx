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
    <div className="fixed bottom-24 left-4 z-40 bg-white dark:bg-[#1A1A2E] border border-[#E2E0DA] dark:border-glass rounded-lg flex items-center gap-2 px-3 py-2 hover:bg-[#F0EFEB] dark:hover:bg-[#222235] transition-colors group">
      <span className="mono-meta text-gray-600 dark:text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
        Credits
      </span>
      <Suspense fallback={<span className="mono-meta text-sm text-gray-500 dark:text-gray-500">—</span>}>
        <CreditsData />
      </Suspense>
    </div>
  );
}
