"use client";

import { useState } from "react";
import { Copy, Download, Link as LinkIcon } from "lucide-react";
import jsPDF from "jspdf";

interface ExportBarProps {
  sessionId: string;
  markdown: string;
  onCopy?: () => void;
}

export function ExportBar({ sessionId, markdown, onCopy }: ExportBarProps) {
  const [copiedState, setCopiedState] = useState<"link" | "markdown" | null>(null);

  const formatSessionId = (id: string) => {
    // Format: 1715383200000-abc123 → #MC-2025-0510-001
    const timestamp = parseInt(id.split("-")[0]);
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const sequence = String(Math.abs(date.getTime()) % 1000).padStart(3, "0");
    return `#MC-${year}${month}${day}-${sequence}`;
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}?session=${sessionId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedState("link");
      setTimeout(() => setCopiedState(null), 2000);
      onCopy?.();
    } catch {
      alert("Failed to copy link");
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedState("markdown");
      setTimeout(() => setCopiedState(null), 2000);
      onCopy?.();
    } catch {
      alert("Failed to copy markdown");
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;

      const lines = markdown.split("\n");
      let yPos = margin;
      const lineHeight = 4;
      const fontSize = 10;

      doc.setFontSize(fontSize);

      lines.forEach((line) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }

        // Wrap long lines
        const wrapped = doc.splitTextToSize(line || " ", maxWidth);
        wrapped.forEach((wrappedLine: string) => {
          doc.text(wrappedLine, margin, yPos);
          yPos += lineHeight;
        });
      });

      doc.save(`council-${sessionId}.pdf`);
    } catch {
      alert("Failed to generate PDF");
    }
  };

  const formattedId = formatSessionId(sessionId);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderTop: "1px solid var(--bd)",
        marginTop: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleCopyLink}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid var(--bd)",
            backgroundColor: "var(--bg-inset)",
            color: "var(--t1)",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--ac)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = "var(--ac)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-inset)";
            e.currentTarget.style.color = "var(--t1)";
            e.currentTarget.style.borderColor = "var(--bd)";
          }}
        >
          <LinkIcon size={14} />
          {copiedState === "link" ? "Copied!" : "Copy Link"}
        </button>

        <button
          onClick={handleCopyMarkdown}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid var(--bd)",
            backgroundColor: "var(--bg-inset)",
            color: "var(--t1)",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--ac)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = "var(--ac)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-inset)";
            e.currentTarget.style.color = "var(--t1)";
            e.currentTarget.style.borderColor = "var(--bd)";
          }}
        >
          <Copy size={14} />
          {copiedState === "markdown" ? "Copied!" : "Copy Markdown"}
        </button>

        <button
          onClick={handleDownloadPDF}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid var(--ac)",
            backgroundColor: "var(--ac)",
            color: "white",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1e40af";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--ac)";
          }}
        >
          <Download size={14} />
          PDF
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "var(--t3)",
        }}
      >
        <span>Session:</span>
        <span style={{ fontFamily: "monospace", fontWeight: "600" }}>
          {formattedId}
        </span>
      </div>
    </div>
  );
}
