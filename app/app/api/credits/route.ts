export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ remaining: 0 });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/credits", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error("fetch failed");
    const json = await res.json();
    const { total_credits, total_usage } = json.data ?? {};
    const remaining = (total_credits ?? 0) - (total_usage ?? 0);
    return Response.json({ remaining });
  } catch {
    return Response.json({ remaining: 0 }, { status: 500 });
  }
}
