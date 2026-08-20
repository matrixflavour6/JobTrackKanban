// Scans the signed-in Gmail account for likely job-application confirmation
// emails and runs them through the existing parseEmailText() heuristics.
//
// Uses the gmail.readonly scope requested in googleAuth.ts. Only messages
// matching a narrow search query are ever fetched — this does not scan the
// whole inbox, and nothing is sent to any server other than Google's own
// Gmail API (called directly from the browser).

import { getGoogleAccessToken } from './googleAuth';
import { parseEmailText, ParsedJobInfo } from './portalParser';

export interface GmailCandidate {
  messageId: string;
  subject: string;
  from: string;
  date: string;
  parsed: ParsedJobInfo;
}

const SEARCH_QUERY =
  '(subject:("application received" OR "thank you for applying" OR "we received your application" OR "your application to" OR "applying to" OR "application confirmation") OR from:(greenhouse OR lever OR workday OR myworkdayjobs OR linkedin OR indeed)) newer_than:120d';

function authHeader(): Record<string, string> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not signed in to Google yet.');
  return { Authorization: `Bearer ${token}` };
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return decodeURIComponent(escape(atob(normalized)));
  } catch {
    return atob(normalized);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBodyText(payload: any): string {
  if (!payload) return '';

  // Single-part message
  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    return payload.mimeType === 'text/html' ? stripHtml(decoded) : decoded;
  }

  // Multi-part: prefer text/plain, fall back to text/html
  if (payload.parts) {
    const plain = payload.parts.find((p: any) => p.mimeType === 'text/plain' && p.body?.data);
    if (plain) return decodeBase64Url(plain.body.data);

    const html = payload.parts.find((p: any) => p.mimeType === 'text/html' && p.body?.data);
    if (html) return stripHtml(decodeBase64Url(html.body.data));

    // Nested multipart (e.g. multipart/alternative inside multipart/mixed)
    for (const part of payload.parts) {
      const nested = extractBodyText(part);
      if (nested) return nested;
    }
  }

  return '';
}

function headerValue(headers: any[], name: string): string {
  const h = headers?.find((x: any) => x.name.toLowerCase() === name.toLowerCase());
  return h?.value || '';
}

/**
 * Searches Gmail for likely application-confirmation emails and returns
 * parsed candidates for the user to review before adding any to the board.
 * Capped at `limit` messages to keep API usage and load time reasonable.
 */
export async function scanGmailForApplications(limit = 20): Promise<GmailCandidate[]> {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(SEARCH_QUERY)}&maxResults=${limit}`,
    { headers: authHeader() }
  );
  if (!listRes.ok) throw new Error(`Gmail search failed (${listRes.status})`);
  const listData = await listRes.json();
  const messageRefs: { id: string }[] = listData.messages || [];

  if (messageRefs.length === 0) return [];

  const candidates: GmailCandidate[] = [];

  // Fetch full message bodies sequentially in small batches to stay well
  // under Gmail API per-user rate limits.
  for (const ref of messageRefs) {
    try {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${ref.id}?format=full`,
        { headers: authHeader() }
      );
      if (!msgRes.ok) continue;
      const msg = await msgRes.json();

      const headers = msg.payload?.headers || [];
      const subject = headerValue(headers, 'Subject');
      const from = headerValue(headers, 'From');
      const date = headerValue(headers, 'Date');
      const bodyText = extractBodyText(msg.payload) || msg.snippet || '';

      const combinedText = `${subject}\n${bodyText}`;
      const parsed = parseEmailText(combinedText);

      // Skip candidates the parser couldn't extract anything meaningful from
      if (!parsed.company && !parsed.position) continue;

      candidates.push({ messageId: ref.id, subject, from, date, parsed });
    } catch {
      // Skip any single message that fails to parse rather than aborting the scan
      continue;
    }
  }

  return candidates;
}
