"use client";

import { COUNCIL_MODELS } from "@/lib/models";
import { ModelCard } from "./ModelCard";

const VARIANTS = ["a", "b", "c", "d"] as const;

export function RoundSection({
  round,
  label,
  outputs,
  doneSet,
  previousRoundOutputs = {},
}: {
  round: number;
  label: string;
  outputs: Record<string, string>;
  doneSet: Set<string>;
  previousRoundOutputs?: Record<string, string>;
}) {
  return (
    <section className="mt-20">
      <div className="mono-meta text-gray-600 dark:text-gray-400 mb-4 text-sm">{label}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COUNCIL_MODELS.map((m, i) => {
          return (
            <ModelCard
              key={m.id}
              model={m}
              text={outputs[m.id] ?? ""}
              variant={VARIANTS[i]}
              round={round}
              done={doneSet.has(m.id)}
              previousRoundText={previousRoundOutputs[m.id]}
            />
          );
        })}
      </div>
    </section>
  );
}
