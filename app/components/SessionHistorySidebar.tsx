"use client";

import { useState, useMemo } from "react";
import { Search, Trash2, ChevronRight } from "lucide-react";
import type { SavedSession } from "@/lib/history";

interface SessionHistorySidebarProps {
  sessions: SavedSession[];
  onSelectSession?: (session: SavedSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function SessionHistorySidebar({
  sessions,
  onSelectSession,
  onDeleteSession,
  isOpen = true,
  onToggle,
}: SessionHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;

    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (session) =>
        session.prompt.toLowerCase().includes(query) ||
        new Date(session.timestamp).toLocaleDateString().includes(query)
    );
  }, [sessions, searchQuery]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 h-screen w-80 border-r z-40 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--bd)",
      }}
    >
      {/* Header */}
      <div
        className="border-b p-4"
        style={{
          borderColor: "var(--bd)",
          backgroundColor: "var(--bg-inset)",
        }}
      >
        <h2
          className="text-sm uppercase tracking-widest font-semibold mb-3"
          style={{ color: "var(--t1)" }}
        >
          Sessions ({sessions.length})
        </h2>

        {/* Search */}
        <div
          className="relative flex items-center px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: "var(--bg)",
            borderColor: "var(--bd)",
          }}
        >
          <Search size={14} style={{ color: "var(--t3)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="flex-1 ml-2 bg-transparent text-sm focus:outline-none"
            style={{
              color: "var(--t1)",
            }}
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-4 text-center">
            <p
              className="text-sm"
              style={{ color: "var(--t3)" }}
            >
              {sessions.length === 0
                ? "No sessions yet"
                : "No matching sessions"}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--bd)" }}>
            {filteredSessions.map((session) => {
              const isExpanded = expandedId === session.id;
              const date = new Date(session.timestamp);
              const dateStr = date.toLocaleDateString();
              const timeStr = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const questionPreview = session.prompt.substring(0, 60);
              const hasFollowUps = session.followUps && session.followUps.length > 0;

              return (
                <div
                  key={session.id}
                  className="hover:opacity-75 transition-opacity"
                >
                  {/* Session Item */}
                  <button
                    onClick={() => {
                      setExpandedId(isExpanded ? null : session.id);
                      if (!isExpanded) {
                        onSelectSession?.(session);
                      }
                    }}
                    className="w-full text-left p-3 flex items-start gap-2 group"
                  >
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 mt-0.5"
                      style={{
                        color: "var(--t3)",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold line-clamp-2"
                        style={{ color: "var(--t1)" }}
                      >
                        {questionPreview}
                        {session.prompt.length > 60 ? "..." : ""}
                      </p>

                      <div
                        className="flex items-center gap-2 mt-1 text-xs"
                        style={{ color: "var(--t3)" }}
                      >
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{timeStr}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2 mt-2">
                        {session.verdict && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: "var(--bg-inset)",
                              color: "var(--t2)",
                            }}
                          >
                            ✓ Verdict
                          </span>
                        )}
                        {hasFollowUps && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: "var(--ac)",
                              color: "white",
                            }}
                          >
                            {session.followUps!.length} Q&A
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            "Are you sure you want to delete this session?"
                          )
                        ) {
                          onDeleteSession?.(session.id);
                        }
                      }}
                      className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        color: "#ef4444",
                      }}
                      title="Delete session"
                    >
                      <Trash2 size={14} />
                    </button>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div
                      className="border-t px-4 py-3 text-xs"
                      style={{
                        backgroundColor: "var(--bg-inset)",
                        borderColor: "var(--bd)",
                        color: "var(--t2)",
                      }}
                    >
                      <p className="line-clamp-4 leading-relaxed mb-3">
                        {session.prompt}
                      </p>

                      {session.verdict && (
                        <div className="mb-3">
                          <p
                            style={{ color: "var(--t3)" }}
                            className="font-semibold mb-1"
                          >
                            Consensus: {Math.round(session.verdict.consensusScore * 100)}%
                          </p>
                          <p className="line-clamp-3">
                            {session.verdict.finalAnswer}
                          </p>
                        </div>
                      )}

                      {session.rounds && (
                        <p style={{ color: "var(--t3)" }}>
                          {session.rounds.length} round{session.rounds.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {sessions.length > 0 && (
        <div
          className="border-t p-4 text-xs"
          style={{
            borderColor: "var(--bd)",
            backgroundColor: "var(--bg-inset)",
            color: "var(--t3)",
          }}
        >
          <div className="flex justify-between">
            <span>Total sessions: {sessions.length}</span>
            {sessions.filter((s) => s.verdict).length > 0 && (
              <span>
                Completed: {sessions.filter((s) => s.verdict).length}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
