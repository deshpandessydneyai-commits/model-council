"use client";

import type { StakeLevel } from "@/lib/types/stakes";
import { getStakeImpact } from "@/lib/gps-framework";

interface QuestionBannerProps {
  question: string;
  domains?: string[];
  stakeLevel?: StakeLevel;
}

const domainColors: Record<string, { bg: string; text: string }> = {
  web: { bg: "bg-purple-100", text: "text-purple-700" },
  domain: { bg: "bg-purple-100", text: "text-purple-700" },
  r3: { bg: "bg-amber-100", text: "text-amber-700" },
};

const stakeColors: Record<StakeLevel, { bg: string; text: string; border: string }> = {
  exploratory: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  implemented: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  timeCritical: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  resourceConstrained: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

const stakeLabels: Record<StakeLevel, string> = {
  exploratory: "Exploratory",
  implemented: "Implementation",
  critical: "Critical Stakes",
  timeCritical: "Time-Critical",
  resourceConstrained: "Resource-Constrained",
};

const stakeDescriptions: Record<StakeLevel, string> = {
  exploratory: "Intellectual exploration. Models are encouraged to explore nuances and trade-offs.",
  implemented: "Implementation concerns. Models prioritize practical constraints and feasibility.",
  critical: "Health, safety, legal, or major life consequences. High precision and rigor required.",
  timeCritical: "Time-sensitive decisions. Models provide rapid analysis with appropriate caveats.",
  resourceConstrained: "Limited resources. Models balance optimization with practical constraints.",
};

export function QuestionBanner({ question, domains = [], stakeLevel }: QuestionBannerProps) {
  return (
    <div
      className="mb-6 p-5 rounded-lg border"
      style={{
        backgroundColor: "var(--bg-inset)",
        borderColor: "var(--bd)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div
            className="text-xs uppercase tracking-widest font-medium mb-2"
            style={{ color: "var(--t3)" }}
          >
            Your Question
          </div>
          <p
            className="text-base font-medium"
            style={{ color: "var(--t1)", lineHeight: "1.6" }}
          >
            {question}
          </p>
        </div>

        {/* Stakes and Domain badges */}
        <div className="flex gap-2 flex-wrap justify-end">
          {stakeLevel && (
            <div
              className="text-xs px-3 py-1.5 rounded-full font-medium border cursor-help"
              style={{
                backgroundColor: stakeColors[stakeLevel]?.bg || "bg-gray-100",
                color: stakeColors[stakeLevel]?.text || "text-gray-700",
                borderColor: stakeColors[stakeLevel]?.border || "border-gray-300",
                borderWidth: "1px"
              }}
              title={`${stakeLabels[stakeLevel]}: ${stakeDescriptions[stakeLevel]}`}
            >
              <div>📊 {stakeLabels[stakeLevel]}</div>
              <div className="text-2xs opacity-75 mt-0.5">
                {getStakeImpact(stakeLevel)?.intensity || "Standard"} rigor applied
              </div>
            </div>
          )}
          {domains.length > 0 && domains.map((domain) => (
            <div
              key={domain}
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                domainColors[domain]?.bg || "bg-gray-100"
              } ${domainColors[domain]?.text || "text-gray-700"}`}
            >
              {domain === "web" ? "🌐 Web Search" : domain === "r3" ? "⚡ R3+" : domain}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
