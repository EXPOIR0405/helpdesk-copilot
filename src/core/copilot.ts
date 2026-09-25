import { decideConfidence } from "./confidence.ts";
import type { Answer, Citation, Embedder, Generator, ScoredChunk, Search } from "./types.ts";
import type { UnansweredLog } from "./unanswered.ts";

export const NOT_FOUND_TEXT =
  "등록된 정책 문서에서 근거를 찾지 못했습니다. 추측해서 안내하지 말고 담당자에게 확인해 주세요.";

export type CopilotDeps = {
  search: Search;
  embed: Embedder;
  generate: Generator;
  log: UnansweredLog;
  retrieval: { topK: number; minScore: number };
  confidence: { high: number; medium: number };
  now?: () => Date;
};

export function createCopilot(deps: CopilotDeps) {
  const now = deps.now ?? (() => new Date());

  return {
    async ask(question: string): Promise<Answer> {
      const q = question.trim();
      const [vector] = await deps.embed([q]);
      const hits = await deps.search(vector, deps.retrieval);
      const topScore = hits[0]?.score ?? 0;
      const retrieved = hits.map((h) => ({ chunkId: h.id, docId: h.docId, score: h.score }));

      // 근거 후보가 하나도 없으면 모델을 부르지 않음 → 지어낸 답이 나올 여지 자체를 없앰
      if (hits.length === 0) {
        const answer: Answer = {
          status: "unanswerable",
          text: NOT_FOUND_TEXT,
          confidence: "low",
          citations: [],
          trace: { topScore, grounding: "none", retrieved },
        };
        await record(deps.log, q, answer, null, now());
        return answer;
      }

      const verdict = await deps.generate(q, hits);
      const cited = hits.filter((h) => verdict.citedChunkIds.includes(h.id));
      let status = verdict.status;
      let text = verdict.text;

      // 모델이 답했다고 해도 근거가 전혀 없으면 거절로 바꿈
      if (status === "answered" && (verdict.grounding === "none" || cited.length === 0)) {
        status = "unanswerable";
        text = NOT_FOUND_TEXT;
      }
      // 준비 중 문서를 근거로 확정 답을 내면 안 됨
      if (status === "answered" && cited.some((c) => c.status === "pending")) {
        status = "pending_policy";
      }

      const confidence =
        status === "unanswerable"
          ? "low"
          : decideConfidence({ topScore, grounding: verdict.grounding }, deps.confidence);

      const answer: Answer = {
        status,
        text,
        confidence,
        citations: status === "unanswerable" ? [] : cited.map(toCitation),
        trace: { topScore, grounding: verdict.grounding, retrieved },
      };
      if (status === "unanswerable" || confidence === "low") {
        await record(deps.log, q, answer, hits[0].docId, now());
      }
      return answer;
    },
  };
}

function toCitation(c: ScoredChunk): Citation {
  return { chunkId: c.id, docId: c.docId, title: c.docTitle, section: c.section, excerpt: c.text };
}

function record(log: UnansweredLog, question: string, answer: Answer, nearestDocId: string | null, at: Date) {
  return log.append({
    at: at.toISOString(),
    question,
    status: answer.status,
    confidence: answer.confidence,
    topScore: answer.trace.topScore,
    nearestDocId,
  });
}
