import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const res = await fetch("https://openrouter.ai/api/v1/credits", {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: res.status });
  }

  const json = await res.json();
  const { total_credits, total_usage } = json.data ?? {};
  const remaining = (total_credits ?? 0) - (total_usage ?? 0);

  return NextResponse.json({ remaining, total_credits, total_usage });
}
