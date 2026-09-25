export type DocStatus = "confirmed" | "pending";

export type PolicyDoc = {
  id: string;
  title: string;
  status: DocStatus;
  updatedAt: string;
  body: string;
  raw: string;
};

export type Chunk = {
  id: string;
  docId: string;
  docTitle: string;
  section: string;
  status: DocStatus;
  text: string;
};

export type IndexedChunk = Chunk & { embedding: number[] };

export type ScoredChunk = Chunk & { score: number };

export type AnswerStatus = "answered" | "pending_policy" | "unanswerable";

export type Confidence = "high" | "medium" | "low";

export type Grounding = "full" | "partial" | "none";

export type Citation = {
  chunkId: string;
  docId: string;
  title: string;
  section: string;
  excerpt: string;
};

export type Answer = {
  status: AnswerStatus;
  text: string;
  confidence: Confidence;
  citations: Citation[];
  trace: {
    topScore: number;
    grounding: Grounding;
    retrieved: { chunkId: string; docId: string; score: number }[];
  };
};

/** 텍스트 목록을 같은 순서의 벡터 목록으로 바꿈 */
export type Embedder = (texts: string[]) => Promise<number[][]>;

/** 모델이 근거 조각만 보고 내린 판단 */
export type ModelVerdict = {
  status: AnswerStatus;
  text: string;
  grounding: Grounding;
  citedChunkIds: string[];
};

/** 질문 벡터로 가까운 조각을 찾음. 로컬은 메모리 코사인, 배포는 pgvector (같은 코사인 계산) */
export type Search = (vector: number[], opts: { topK: number; minScore: number }) => Promise<ScoredChunk[]>;

export type Generator = (question: string, chunks: ScoredChunk[]) => Promise<ModelVerdict>;
