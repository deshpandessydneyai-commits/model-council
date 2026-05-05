import { COUNCIL_MODELS, SYNTHESIZER } from "@/lib/models";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-4">
          {/* Branding - compact */}
          <div className="col-span-2 md:col-span-2">
            <h2 className="text-lg font-bold leading-tight">
              model<br />council
            </h2>
            <p className="mt-2 text-xs text-white/50 leading-tight">
              Debate chamber for frontier models
            </p>
          </div>

          {/* Council models */}
          <div>
            <div className="mono-meta text-white/40 text-xs mb-2">Council</div>
            <ul className="space-y-1 text-xs text-white/70">
              {COUNCIL_MODELS.map((m) => (
                <li key={m.id}>{m.displayName}</li>
              ))}
              <li className="text-white/40 pt-1">
                synth — {SYNTHESIZER.displayName}
              </li>
            </ul>
          </div>

          {/* Meta info */}
          <div>
            <div className="mono-meta text-white/40 text-xs mb-2">Meta</div>
            <ul className="space-y-1 text-xs text-white/70">
              <li>v0.1 — skeleton</li>
              <li>openrouter</li>
              <li>localhost</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between text-xs text-white/40 pt-3 border-t border-white/5">
          <span>© {new Date().getFullYear()} — Personal build</span>
          <span>Bold Editorial Studio</span>
        </div>
      </div>
    </footer>
  );
}
