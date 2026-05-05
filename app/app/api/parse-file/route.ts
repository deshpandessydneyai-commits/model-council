import { NextResponse } from "next/server";
import { stripHtmlTags } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
      { status: 413 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    let text = "";

    if (ext === "txt" || ext === "md") {
      text = buffer.toString("utf-8");
    } else if (ext === "pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (
        buf: Buffer
      ) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (ext === "docx") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require("mammoth") as {
        extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
      };
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: .${ext}` },
        { status: 415 }
      );
    }

    // Strip any HTML tags to prevent XSS
    const sanitized = stripHtmlTags(text).trim();

    // Warn if extraction yielded minimal text
    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: "File appears to be empty or contains no extractable text. Try a different file." },
        { status: 422 }
      );
    }

    if (sanitized.length < 100) {
      console.warn(`Document extraction yielded only ${sanitized.length} characters`);
    }

    return NextResponse.json({ text: sanitized, chars: sanitized.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Parse failed: ${msg}` },
      { status: 500 }
    );
  }
}
