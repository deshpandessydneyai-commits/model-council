import React from "react";

interface QuestionBannerProps {
  question: string;
  domains?: string[];
}

export const QuestionBanner: React.FC<QuestionBannerProps> = ({ question, domains = [] }) => {
  return (
    <div
      className="rounded-lg border p-5"
      style={{
        backgroundColor: "var(--bg-inset)",
        borderColor: "var(--bd)",
      }}
    >
      <div className="flex items-start justify-between gap-6">
        {/* Left: Question */}
        <div className="flex-1">
          <div
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--t3)" }}
          >
            Your Question
          </div>
          <p
            className="font-serif text-base leading-relaxed"
            style={{ color: "var(--t1)" }}
          >
            {question}
          </p>
        </div>

        {/* Right: Domain badges */}
        {domains.length > 0 && (
          <div className="flex flex-shrink-0 flex-wrap gap-2">
            {domains.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: domain === "web" ? "rgba(139,92,246,0.1)" : "rgba(245,158,11,0.1)",
                  color: domain === "web" ? "#8B5CF6" : "#D97706",
                  border: `1px solid ${domain === "web" ? "rgba(139,92,246,0.3)" : "rgba(245,158,11,0.3)"}`,
                }}
              >
                {domain === "web" && "🌐 "}
                {domain}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
