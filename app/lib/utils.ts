// Utility functions for Model Council

export function extractModelVersion(slug: string): string {
  // Input: "anthropic/claude-sonnet-4.6"
  // Output: "Claude Sonnet 4.6"
  const parts = slug.split("/");
  if (parts.length < 2) return slug;

  const model = parts[1];
  // "claude-sonnet-4.6" → "Claude Sonnet 4.6"
  return model
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
