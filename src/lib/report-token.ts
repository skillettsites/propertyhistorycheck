/**
 * Derive a short, URL-friendly token from a Stripe checkout session id.
 * Pattern matches CarCostCheck: last 12 chars of session id, used as the
 * shareable path segment for /r/{token}. Lookup via ilike '%{token}'.
 */
const TOKEN_LENGTH = 12;

export function deriveReportToken(sessionId: string | null | undefined): string | null {
  if (!sessionId) return null;
  const trimmed = sessionId.trim();
  if (trimmed.length < TOKEN_LENGTH) return null;
  return trimmed.slice(-TOKEN_LENGTH);
}

export function isValidReportToken(token: string | null | undefined): token is string {
  if (!token) return false;
  if (token.length !== TOKEN_LENGTH) return false;
  return /^[A-Za-z0-9]+$/.test(token);
}

export function buildReportUrl(
  sessionId: string | null | undefined,
  origin = "https://www.homebuyercheck.co.uk"
): string | null {
  const token = deriveReportToken(sessionId);
  if (!token) return null;
  return `${origin}/r/${token}`;
}
