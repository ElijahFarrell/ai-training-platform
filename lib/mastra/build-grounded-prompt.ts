export type RetrievedChunk = {
  text: string;
  excerpt: string;
  lessonTitle: string;
  moduleTitle: string;
  score: number;
};

const MAX_CONTEXT_CHARS = 6000;

export function buildGroundedSystemAddendum(chunks: RetrievedChunk[]) {
  if (chunks.length === 0) {
    return [
      "Retrieved context: (none — no relevant training material was found for this question)",
    ].join("\n");
  }

  const lines: string[] = ["Retrieved context (use this and only this to answer):"];
  let total = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const header = `\n[${i + 1}] ${chunk.moduleTitle} — ${chunk.lessonTitle}`;
    const body = chunk.text;
    const piece = `${header}\n${body}`;
    if (total + piece.length > MAX_CONTEXT_CHARS && lines.length > 1) break;
    lines.push(piece);
    total += piece.length;
  }
  return lines.join("\n");
}
