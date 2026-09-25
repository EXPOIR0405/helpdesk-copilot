export const config = {
  docsDir: "data/synthetic/docs",
  indexPath: "data/index/index.json",
  unansweredLogPath: "data/logs/unanswered.jsonl",
  models: {
    embedding: "text-embedding-3-small",
    generation: "gpt-5.4-mini",
  },
  chunk: {
    maxChars: 700,
  },
  retrieval: {
    topK: 5,
    // 명백히 무관한 조각만 거르는 느슨한 하한.
    // 구어체 질문은 정답 문서도 0.3 아래로 나와서, 거절 판단은 모델 근거 판단에 맡김
    minScore: 0.15,
  },
  confidence: {
    // 최고 유사도 기준. 평가셋 결과로 조정
    high: 0.5,
    medium: 0.35,
  },
} as const;

export type Config = typeof config;
