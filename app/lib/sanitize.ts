/**
 * Sanitizes text by escaping HTML entities and removing potentially harmful content.
 * This prevents XSS attacks through document uploads.
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Strips HTML/script tags from text. Less strict than sanitizeText but faster.
 */
export function stripHtmlTags(text: string): string {
  return text
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "");
}
