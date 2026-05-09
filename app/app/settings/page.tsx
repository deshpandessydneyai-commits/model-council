"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useSetupModal } from "@/lib/setup-modal-context";

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { setIsOpen } = useSetupModal();

  return (
    <div className="max-w-[1600px] mx-auto px-6 pt-16 pb-32 min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-indigo-600 dark:text-violet-400 hover:text-indigo-700 dark:hover:text-violet-300 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Council
      </Link>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure Model Council to your preferences</p>
      </div>

      {/* Settings sections */}
      <div className="space-y-8">
        {/* Theme */}
        <section className="border border-gray-300 dark:border-glass bg-gray-50 dark:bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-gray-300 font-medium">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">
                {isDark ? "Currently using dark mode" : "Currently using light mode"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: isDark ? "#7c3aed" : "#4f46e5",
                color: "#ffffff",
                border: "none",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "#6d28d9" : "#4338ca";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "#7c3aed" : "#4f46e5";
              }}
            >
              {isDark ? (
                <>
                  <Sun size={18} />
                  Switch to Light
                </>
              ) : (
                <>
                  <Moon size={18} />
                  Switch to Dark
                </>
              )}
            </button>
          </div>
        </section>
        {/* API Configuration */}
        <section className="border border-gray-300 dark:border-glass bg-gray-50 dark:bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">API Configuration</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Your OpenRouter API key is stored locally in <code className="bg-gray-200 dark:bg-[#1A1A2E] px-2 py-1 rounded text-sm text-gray-900 dark:text-gray-200 font-mono">.env.local</code>
            </p>
            <p>
              To change your API key, edit the file in your project root:
            </p>
            <pre className="bg-gray-100 dark:bg-[#1A1A2E] border border-gray-300 dark:border-glass rounded p-4 overflow-x-auto text-sm text-gray-900 dark:text-gray-200 font-mono">
{`OPENROUTER_API_KEY=your_new_key_here`}
            </pre>
            <p className="text-sm text-gray-500">
              Then restart the dev server: <code className="bg-gray-200 dark:bg-[#1A1A2E] px-2 py-1 rounded text-gray-900 dark:text-gray-200 font-mono">npm run dev</code>
            </p>
          </div>
        </section>

        {/* Model Configuration */}
        <section className="border border-gray-300 dark:border-glass bg-gray-50 dark:bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customize the Council</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Want different models? Edit the lineup in <code className="bg-gray-200 dark:bg-[#1A1A2E] px-2 py-1 rounded text-sm text-gray-900 dark:text-gray-200 font-mono">app/lib/models.ts</code>
            </p>
            <p>
              Find available models at <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">OpenRouter Models</a>
            </p>
            <p className="text-sm text-gray-500">
              Change the <code className="bg-gray-200 dark:bg-[#1A1A2E] px-2 py-1 rounded text-gray-900 dark:text-gray-200 font-mono">slug</code> values to swap in any model you want.
            </p>
          </div>
        </section>

        {/* Data & Storage */}
        <section className="border border-gray-300 dark:border-glass bg-gray-50 dark:bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data & Storage</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              Your debate history is stored locally in your browser's localStorage.
            </p>
            <p>
              To clear your history:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open browser DevTools (F12)</li>
              <li>Go to Application → Storage → Local Storage</li>
              <li>Find the Model Council entries and delete them</li>
            </ol>
            <p className="text-sm text-gray-500">
              No data is sent to external servers except API calls to OpenRouter.
            </p>
          </div>
        </section>

        {/* Cost Tracking */}
        <section className="border border-gray-300 dark:border-glass bg-gray-50 dark:bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cost Estimation</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              <strong>Typical debate cost:</strong> $0.10 – $0.40 USD
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Depends on prompt length and model verbosity</li>
              <li>Web Search adds ~$0.004 per search</li>
              <li>Check remaining credits in the sidebar footer</li>
            </ul>
            <p className="text-sm text-gray-500">
              View your OpenRouter credits at <a href="https://openrouter.ai/account/credits" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">openrouter.ai/account/credits</a>
            </p>
          </div>
        </section>

        {/* Advanced */}
        <section className="border border-gray-300 dark:border-glass bg-gray-50 dark:bg-[#0F0F1A] rounded-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Advanced</h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              <strong>Environment Variables:</strong>
            </p>
            <div className="space-y-2 text-sm">
              <p><code className="bg-[#1A1A2E] px-2 py-1 rounded">OPENROUTER_APP_NAME</code> — Your app name (shown in OpenRouter dashboard)</p>
              <p><code className="bg-[#1A1A2E] px-2 py-1 rounded">OPENROUTER_APP_URL</code> — Your app URL (for referrer header)</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-300 dark:border-glass text-sm text-gray-600 dark:text-gray-500">
        <p>Questions? Check the <Link href="/help" className="text-indigo-600 dark:text-violet-400 hover:text-indigo-700 dark:hover:text-violet-300">Help</Link> page or visit the <a href="https://github.com/deshpandessydneyai-commits/model-council" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-violet-400 hover:text-indigo-700 dark:hover:text-violet-300">GitHub repo</a>.</p>
      </div>
    </div>
  );
}
