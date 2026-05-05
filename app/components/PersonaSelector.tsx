"use client";

import { COUNCIL_MODELS, PERSONAS } from "@/lib/models";
import { ChevronDown } from "lucide-react";

type PersonaSelectorProps = {
  personaMap: Record<string, string>;
  onChange: (personaMap: Record<string, string>) => void;
  disabled?: boolean;
};

export function PersonaSelector({ personaMap, onChange, disabled = false }: PersonaSelectorProps) {
  const handlePersonaChange = (modelId: string, personaId: string) => {
    onChange({ ...personaMap, [modelId]: personaId });
  };

  return (
    <div className="space-y-4">
      <div className="mono-meta text-muted text-sm">Model Personas</div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {COUNCIL_MODELS.map((model) => {
          const currentPersonaId = personaMap[model.id] || "default";
          const currentPersona = PERSONAS.find(p => p.id === currentPersonaId);

          return (
            <div key={model.id} className="border border-black/10 rounded p-3 bg-white">
              <div className="mono-meta text-xs text-muted mb-2">{model.shortLabel}</div>

              <div className="relative">
                <select
                  value={currentPersonaId}
                  onChange={(e) => handlePersonaChange(model.id, e.target.value)}
                  disabled={disabled}
                  className="appearance-none w-full pr-6 py-2 text-sm border border-black/10 rounded focus:outline-none focus:border-black disabled:opacity-50 bg-white cursor-pointer"
                >
                  {PERSONAS.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.emoji} {persona.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted" />
              </div>

              {currentPersona && currentPersona.id !== "default" && (
                <div className="mt-2 text-xs text-muted leading-tight">
                  {currentPersona.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
