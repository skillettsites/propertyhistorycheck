/**
 * Turns the AI-generated seller questions into a ready-to-send draft email.
 * Shared by the online results page (copyable) and the PDF (rendered as a
 * "Draft email" section), so the two always read identically.
 */

export interface SellerQuestionLike {
  question: string;
}

export function buildSellerEmail(
  address: string | undefined,
  questions: SellerQuestionLike[]
): string {
  const addr = (address ?? "").trim() || "the property";
  const qs = questions.map((q) => q.question.trim()).filter(Boolean);

  const lines: string[] = [];
  lines.push(`Subject: Pre-offer enquiries regarding ${addr}`);
  lines.push("");
  lines.push("Dear Sir or Madam,");
  lines.push("");
  lines.push(
    `Thank you for the information provided so far. Before I submit a formal offer on ${addr}, I would be grateful if you could help with the following questions, which have come out of my pre-offer research:`
  );
  lines.push("");
  qs.forEach((q, i) => {
    lines.push(`${i + 1}. ${q}`);
  });
  lines.push("");
  lines.push(
    "These are standard pre-contract enquiries and will help me proceed quickly. I am a serious buyer and happy to discuss any of the above."
  );
  lines.push("");
  lines.push("Many thanks for your time.");
  lines.push("");
  lines.push("Kind regards,");
  lines.push("[Your name]");

  return lines.join("\n");
}
