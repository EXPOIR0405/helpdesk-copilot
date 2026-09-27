export const config = {
  docsDir: "data/synthetic/docs",
  indexPath: "data/index/index.json",
  unansweredLogPath: "data/logs/unanswered.jsonl",
  // 모델 호출 시간 예산. SDK 기본값(OpenAI 10분, Gemini 없음)이면 요청 하나가 서버 함수 시간을 다 씀
  calls: {
    // Vercel 함수 30초 안에 기본 모델 + 대체 모델 + 임베딩·DB가 들어가야 함
    // 같은 제공사 재시도 대신 다른 제공사로 넘기는 것을 재시도로 씀 (장애 중엔 같은 곳에 다시 보내도 대부분 실패)
    serving: { timeoutMs: 10_000, attempts: 1, baseDelayMs: 500 },
    // 질문 임베딩: 대체 모델이 없어 같은 곳 재시도가 유일한 방법. 평소 1초 미만이라 짧게 끊고 한 번 더
    // 최악 8초 + 생성 10초 + 대체 10초 → 30초 안
    embedding: { timeoutMs: 4_000, attempts: 2, baseDelayMs: 0 },
    // 평가는 시간보다 완주가 중요. Gemini 무료 티어 분당 제한을 넘기면 간격을 넉넉히 두고 재시도
    eval: { timeoutMs: 30_000, attempts: 4, baseDelayMs: 4_000 },
  },
  models: {
    // 임베딩을 바꾸면 전체 재동기화가 필요하고 검색 결과도 달라짐 → 생성 모델 비교 때는 고정
    embedding: "text-embedding-3-small",
    // 후보와 가격은 src/core/models.ts. GENERATION_MODEL 환경 변수로 배포 없이 교체
    // 선택 근거: docs/model-selection.md
    generation: process.env.GENERATION_MODEL || "gemini-3.8-flash",
    // 기본 모델이 일시 오류로 실패하면 쓸 모델. 다른 제공사를 고를 것. FALLBACK_MODEL을 빈 값으로 두면 대체 없음
    fallback: process.env.FALLBACK_MODEL ?? "gpt-5.4-mini",
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
  // 자동 응대 (docs/auto-response-design.md)
  support: {
    // 상담원 대기가 이 시간을 넘으면 SLA 초과 → n8n이 Slack으로 알림
    slaMinutes: Number(process.env.SUPPORT_SLA_MINUTES) || 30,
    // 같은 티켓 SLA 재알림 간격
    remindEveryMinutes: 60,
    // Slack·n8n 알림의 문의함 링크
    publicBaseUrl: process.env.PUBLIC_BASE_URL || "https://helpdesk-copilot.vercel.app",
  },
  // 같은 알림은 이 시간 안에 한 번만 (서버리스 인스턴스가 여러 개여도 DB로 확인)
  alertWindowSeconds: 1800,
  // 공개 데모 비용 방어
  limits: {
    questionMaxChars: 300,
    // 연타 방지용. 질문 하나에 답변·답장 2번이라 넉넉하게
    perIpPerMinute: 20,
    // 비용 방어는 하루 모델 호출 상한으로: 한 방문자가 전체 한도를 다 쓰지 못하게 IP별 상한을 먼저 적용
    perIpDailyModelCalls: 30,
    // 모델을 실제로 부르는 요청(답변·답장) 하루 전체 상한. 넘으면 화면이 목업 모드로 전환
    dailyModelCalls: 300,
    // 같은 질문은 이 시간 동안 저장된 답변 재사용
    answerCacheHours: 24,
    // 하루 모델 비용 예산(USD). 넘기 전(alertRatio)에 Slack 알림. 차단은 dailyModelCalls가 맡음
    dailyBudgetUsd: 1,
    budgetAlertRatio: 0.8,
  },
} as const;

export type Config = typeof config;
