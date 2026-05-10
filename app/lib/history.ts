import type { VerdictRow } from "./council";

export type FollowUpQuestion = {
  id: string;
  question: string;
  timestamp: number;
  responses: Record<string, string>;
  synthesisResponse?: string;
};

export type SavedSession = {
  id: string;
  timestamp: number;
  prompt: string;
  rounds: { label: string; outputs: Record<string, string> }[];
  verdict: {
    rows: VerdictRow[];
    finalAnswer: string;
    triggeredRound3: boolean;
    disagreementReason: string;
    consensusScore: number;
  } | null;
  followUps?: FollowUpQuestion[];
};

const STORAGE_KEY = "council-history";
const MAX_SESSIONS = 50;
const QUOTA_WARNING_KEY = "council-quota-warning-shown";

export function saveSession(data: Omit<SavedSession, "id">): SavedSession & { quotaWarning?: string } {
  const all = listSessions();
  const entry: SavedSession = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...data,
  };
  const updated = [entry, ...all].slice(0, MAX_SESSIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    // localStorage quota hit — trim aggressively and retry
    const trimmed = [entry, ...all].slice(0, Math.floor(MAX_SESSIONS / 2));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      const warningMsg = `Storage quota exceeded. Trimmed history from ${updated.length} to ${trimmed.length} sessions. Older sessions were deleted.`;
      // Flag that we should show a warning to the user
      sessionStorage.setItem(QUOTA_WARNING_KEY, "true");
      return { ...entry, quotaWarning: warningMsg };
    } catch {
      // Even aggressive trim failed, just save the current session
      console.error("localStorage quota exhausted, could not save history");
      return { ...entry, quotaWarning: "Storage quota full. History will not be saved." };
    }
  }

  return entry;
}

export function hasQuotaWarning(): boolean {
  const warned = sessionStorage.getItem(QUOTA_WARNING_KEY);
  return !!warned;
}

export function clearQuotaWarning(): void {
  sessionStorage.removeItem(QUOTA_WARNING_KEY);
}

export function listSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSession[];
  } catch {
    return [];
  }
}

export function deleteSession(id: string): void {
  const updated = listSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateSession(id: string, updates: Partial<SavedSession>): SavedSession | null {
  const sessions = listSessions();
  const session = sessions.find((s) => s.id === id);
  if (!session) return null;

  const updated = { ...session, ...updates };
  const withoutSession = sessions.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([updated, ...withoutSession]));
  return updated;
}
