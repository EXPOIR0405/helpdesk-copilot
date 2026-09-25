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
  // 공개 데모 비용 방어
  limits: {
    questionMaxChars: 300,
    perIpPerMinute: 6,
    // 모델을 실제로 부르는 요청(답변·답장) 하루 전체 상한. 넘으면 화면이 목업 모드로 전환
    dailyModelCalls: 300,
    // 같은 질문은 이 시간 동안 저장된 답변 재사용
    answerCacheHours: 24,
  },
} as const;

export type Config = typeof config;
