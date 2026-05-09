"use client";

import { X, Trash2 } from "lucide-react";
import { useState } from "react";
import type { SavedSession } from "@/lib/history";

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

type Props = {
  open: boolean;
  sessions: SavedSession[];
  onClose: () => void;
  onRestore: (session: SavedSession) => void;
  onDelete: (id: string) => void;
};

export function HistoryPanel({ open, sessions, onClose, onRestore, onDelete }: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDelete(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-500"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 z-50 h-full w-[400px] bg-[#F5F4F0] dark:bg-[#0F0F1A] border-l border-[#E2E0DA] dark:border-gray-700 flex flex-col"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#E2E0DA] dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="mono-meta text-gray-900 dark:text-white">Session History</span>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
            >
              <X size={16} />
            </button>
          </div>
          {sessions.length > 0 && (
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E0DA] dark:border-gray-700 bg-[#EEEDEA] dark:bg-[#1A1A2E] rounded text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-violet-500"
            />
          )}
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mono-meta text-muted">No sessions yet</div>
              <div className="mt-2 text-sm text-muted">
                Completed debates will appear here.
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mono-meta text-muted">No matching sessions</div>
              <div className="mt-2 text-sm text-muted">
                Try adjusting your search.
              </div>
            </div>
          ) : (
            <ul>
              {filteredSessions.map((session) => (
                <li
                  key={session.id}
                  className="group border-b border-[#E2E0DA] dark:border-gray-700 px-6 py-5 hover:bg-[#F0EFEB] dark:hover:bg-white/[0.02] transition-colors duration-300"
                >
                  <div
                    onClick={() => onRestore(session)}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="text-sm leading-snug line-clamp-2 mb-3 text-gray-900 dark:text-white">
                      {session.prompt}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="mono-meta text-gray-600 dark:text-gray-400 text-xs flex items-center gap-3">
                        <span>{relativeTime(session.timestamp)}</span>
                        <span>·</span>
                        <span>{session.rounds.length} round{session.rounds.length !== 1 ? "s" : ""}</span>
                        {session.verdict && <span>· verdict</span>}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteId(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-300 p-1"
                        aria-label="Delete session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E2E0DA] dark:border-gray-700">
            <div className="mono-meta text-gray-600 dark:text-gray-400 text-xs">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} stored locally
            </div>
          </div>
        )}
      </aside>

      {/* Deletion Confirmation Dialog */}
      {pendingDeleteId && (
        <div
          onClick={() => setPendingDeleteId(null)}
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0F0F1A] border border-[#E2E0DA] dark:border-gray-700 rounded-lg p-6 max-w-sm mx-4"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Delete Session?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This session will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 mono-meta text-sm border border-[#E2E0DA] dark:border-gray-700 text-gray-900 dark:text-white hover:bg-[#F0EFEB] dark:hover:bg-white/5 transition-colors"
              >
                Keep
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 mono-meta text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
