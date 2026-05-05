"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { COUNCIL_MODELS, PERSONAS } from "@/lib/models";

type DebateSetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: DebateConfig) => void;
  isLoading?: boolean;
};

export type DebateConfig = {
  prompt: string;
  webSearch: boolean;
  forceRound3: boolean;
  personaMap: Record<string, string>;
};

export function DebateSetupModal({ isOpen, onClose, onStart, isLoading = false }: DebateSetupModalProps) {
  const [prompt, setPrompt] = useState("");
  const [webSearch, setWebSearch] = useState(true);
  const [forceRound3, setForceRound3] = useState(false);
  const [personaMap, setPersonaMap] = useState<Record<string, string>>({});

  const handleStart = () => {
    if (!prompt.trim()) return;
    onStart({
      prompt,
      webSearch,
      forceRound3,
      personaMap,
    });
  };

  const handlePersonaChange = (modelId: string, personaId: string) => {
    setPersonaMap({ ...personaMap, [modelId]: personaId });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start a New Council" size="md">
      <div className="p-6 space-y-6">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Your Question
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the council anything..."
            rows={4}
            disabled={isLoading}
            className="w-full border border-glass bg-[#1A1A2E] p-4 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:border-violet-500 focus:bg-[#222235] transition-colors disabled:opacity-50"
          />
        </div>

        {/* Settings Section */}
        <div className="border-t border-glass pt-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            ⚙️ Council Settings
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={webSearch}
                onChange={(e) => setWebSearch(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 accent-violet-500 rounded cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Web Search
              </span>
              {webSearch && <span className="text-xs text-violet-400 ml-auto">Active</span>}
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={forceRound3}
                onChange={(e) => setForceRound3(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 accent-violet-500 rounded cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Force Round 3 (skip convergence check)
              </span>
            </label>
          </div>
        </div>

        {/* Model Personas Section */}
        <div className="border-t border-glass pt-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            🎭 Model Personas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {COUNCIL_MODELS.map((model) => {
              const currentPersonaId = personaMap[model.id] || "default";
              const currentPersona = PERSONAS.find((p) => p.id === currentPersonaId);

              return (
                <div key={model.id} className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">{model.displayName}</label>
                  <select
                    value={currentPersonaId}
                    onChange={(e) => handlePersonaChange(model.id, e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[#1A1A2E] border border-glass text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-violet-500 disabled:opacity-50 cursor-pointer"
                  >
                    {PERSONAS.map((persona) => (
                      <option key={persona.id} value={persona.id} className="bg-[#1A1A2E] text-white">
                        {persona.emoji} {persona.label}
                      </option>
                    ))}
                  </select>
                  {currentPersona && currentPersona.id !== "default" && (
                    <p className="text-xs text-gray-500 leading-tight">
                      {currentPersona.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="border-t border-glass pt-6">
          <button
            onClick={handleStart}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? "Starting debate..." : "Start Council"}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            💡 Tip: Different personas will debate your question from unique perspectives
          </p>
        </div>
      </div>
    </Modal>
  );
}
