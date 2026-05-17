/**
 * Anthropic-powered structured extraction of a HM Land Registry title register PDF.
 *
 * Input: signed URL to the PDF (from PropertyData).
 * Output: parsed TitleRegisterSummary — owners, tenure, lease term, charges count,
 * restrictions count, cautions count, restrictive covenants flag.
 *
 * Cost: ~£0.05 per extraction (1 PDF call to Claude Sonnet 4.6 with vision).
 * Falls back to undefined if any step fails — the caller can still surface the
 * raw PDF download link to the buyer.
 *
 * Strategy: fetch PDF binary → base64 → send as document content block to Claude
 * with a strict JSON-only system prompt covering the exact HMLR register layout.
 */

import type { TitleRegisterSummary } from "../types";

const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";

const SYSTEM_PROMPT = `You are a UK conveyancing expert reading an official HM Land Registry "Official Copy of Register of Title" PDF.

Extract the following fields and return STRICT JSON, no prose, no markdown fences:

{
  "titleNumber": string,             // e.g. "AGL270803"
  "tenure": "freehold" | "leasehold",
  "registeredOwners": string[],      // names from "TITLE ABSOLUTE" Proprietorship Register
  "registeredOn": "YYYY-MM-DD" | null,  // date of last registration entry
  "pricePaid": { "amount": number, "date": "YYYY-MM-DD" } | null,  // most recent stated consideration
  "leaseTermYears": number | null,   // e.g. 999 — only for leasehold
  "leaseStartDate": "YYYY-MM-DD" | null,
  "leaseRemainingYears": number | null,
  "charges": number,                  // count of entries in Charges Register
  "restrictions": number,             // count of restrictions in Proprietorship Register
  "cautions": number,                 // count of cautions (often 0)
  "hasRestrictiveCovenants": boolean  // true if Charges Register references restrictive covenants
}

Rules:
- Use null for any field you cannot confirm from the document.
- "Charges" includes mortgages and any other entry under the Charges Register (Schedule of Notices / restrictive covenants etc count if present).
- "Restrictive covenants" specifically means clauses limiting use of the land (e.g. "shall not erect any building", "shall use only as private dwelling"). Notices of mortgages alone do NOT count.
- For leasehold, compute remaining years from (start_date + term - today). Today is provided in the user message.
- Names should be cleaned to "First Last" or "Company Ltd" style — no addresses inline.
- Output ONLY the JSON object. No commentary.`;

export async function extractTitleRegisterFromPdf(
  pdfUrl: string,
): Promise<TitleRegisterSummary | undefined> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY missing; title-register extraction unavailable");
    return undefined;
  }

  try {
    // 1. Fetch the PDF as binary and base64-encode it.
    const pdfRes = await fetch(pdfUrl, { signal: AbortSignal.timeout(15000) });
    if (!pdfRes.ok) {
      console.error("title PDF fetch failed", pdfRes.status);
      return undefined;
    }
    const pdfBuffer = await pdfRes.arrayBuffer();
    if (pdfBuffer.byteLength === 0 || pdfBuffer.byteLength > 25 * 1024 * 1024) {
      console.error("title PDF size unusable", pdfBuffer.byteLength);
      return undefined;
    }
    const base64 = Buffer.from(pdfBuffer).toString("base64");

    // 2. Send to Claude with document content block.
    const userMessage = `Today is ${new Date().toISOString().slice(0, 10)}. Extract the title register fields per the schema in the system prompt.`;
    const res = await fetch(ANTHROPIC_ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 },
              },
              { type: "text", text: userMessage },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Anthropic title extract failed", res.status, body.slice(0, 300));
      return undefined;
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((b) => b.type === "text")?.text;
    if (!text) return undefined;

    // 3. Parse the JSON (strip code fences if present).
    const json = extractJson(text);
    if (!json) return undefined;

    const parsed = JSON.parse(json) as Record<string, unknown>;
    const out: TitleRegisterSummary = {
      titleNumber: stringOrUndef(parsed.titleNumber),
      tenure: parsed.tenure === "leasehold" ? "leasehold" : parsed.tenure === "freehold" ? "freehold" : undefined,
      registeredOwners: Array.isArray(parsed.registeredOwners) ? parsed.registeredOwners.filter((x): x is string => typeof x === "string") : undefined,
      registeredOn: stringOrUndef(parsed.registeredOn),
      pricePaid: isPricePaid(parsed.pricePaid) ? parsed.pricePaid : undefined,
      leaseTermYears: numOrUndef(parsed.leaseTermYears),
      leaseStartDate: stringOrUndef(parsed.leaseStartDate),
      leaseRemainingYears: numOrUndef(parsed.leaseRemainingYears),
      charges: numOrUndef(parsed.charges),
      restrictions: numOrUndef(parsed.restrictions),
      cautions: numOrUndef(parsed.cautions),
      hasRestrictiveCovenants: typeof parsed.hasRestrictiveCovenants === "boolean" ? parsed.hasRestrictiveCovenants : undefined,
      rawDocumentUrl: pdfUrl,
    };
    return out;
  } catch (err) {
    console.error("extractTitleRegisterFromPdf failed", err);
    return undefined;
  }
}

function extractJson(s: string): string | undefined {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : s;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return undefined;
  return candidate.slice(start, end + 1).trim();
}

function stringOrUndef(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}
function numOrUndef(v: unknown): number | undefined {
  if (typeof v !== "number" || !Number.isFinite(v)) return undefined;
  return v;
}
function isPricePaid(v: unknown): v is { amount: number; date: string } {
  return !!v && typeof v === "object"
    && typeof (v as { amount?: unknown }).amount === "number"
    && typeof (v as { date?: unknown }).date === "string";
}
