async function CreditsData() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return <div className="text-sm font-bold text-green-400">$0.00</div>;

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
      <div className="text-sm font-bold" style={{ color }}>
        ${remaining.toFixed(2)}
      </div>
    );
  } catch {
    return <div className="text-sm font-bold text-gray-400">unavailable</div>;
  }
}

export { CreditsData };
