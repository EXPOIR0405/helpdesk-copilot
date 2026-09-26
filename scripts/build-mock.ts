// 평가 결과(실제 모델 응답)로 웹 목업 데이터를 만듦. API 키 없이 화면을 볼 수 있게 하는 용도
// 사용법: npm run mock -- data/logs/eval-<ts>.json
// OPENAI_API_KEY가 있으면 고객 답장 초안도 실제 모델로 만듦 (.cache/replies.json에 캐시)
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import OpenAI from "openai";
import { config } from "../src/config.ts";
import { openAIReplyGenerator } from "../src/core/openai.ts";
import { createReplyWriter, type CustomerReply } from "../src/core/reply.ts";
import { buildOps, summarizeEval, type EvalRow } from "../src/core/report.ts";
import { loadIndex } from "../src/core/sync.ts";
import type { UnansweredEntry } from "../src/core/unanswered.ts";

const evalPath =
  process.argv[2] ??
  (await readdir("data/logs"))
    .filter((f) => f.startsWith("eval-"))
    .sort()
    .map((f) => `data/logs/${f}`)
    .at(-1);
if (!evalPath) throw new Error("평가 결과가 없습니다. 먼저 npm run eval 을 실행하세요");

const rows: EvalRow[] = JSON.parse(await readFile(evalPath, "utf8"));
const index = await loadIndex(config.indexPath);
if (!index) throw new Error("인덱스가 없습니다. 먼저 npm run sync 를 실행하세요");


const cachePath = ".cache/replies.json";
const cache: Record<string, CustomerReply> = await readFile(cachePath, "utf8").then(JSON.parse, () => ({}));
const cacheKey = (r: EvalRow) => `${r.q.question}\n${r.a.text}`;
if (process.env.OPENAI_API_KEY) {
  const writer = createReplyWriter(openAIReplyGenerator(new OpenAI(), config.models.generation));
  const todo = rows.filter((r) => !cache[cacheKey(r)]);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let r = todo.shift(); r; r = todo.shift()) cache[cacheKey(r)] = await writer.write(r.q.question, r.a);
    }),
  );
  await mkdir(".cache", { recursive: true });
  await writeFile(cachePath, JSON.stringify(cache, null, 1));
}

// 운영에서 미답변 로그에 남는 조건과 같게: 거절 또는 낮은 확신도
const base = Date.parse(index.syncedAt);
const unanswered: UnansweredEntry[] = rows
  .filter((r) => r.a.status === "unanswerable" || r.a.confidence === "low")
  .map((r, i) => ({
    at: new Date(base + (i + 1) * 47 * 60_000).toISOString(),
    question: r.q.question,
    status: r.a.status,
    confidence: r.a.confidence,
    topScore: r.a.trace.topScore,
    nearestDocId: r.a.trace.retrieved[0]?.docId ?? null,
  }));

const chunkCount = new Map<string, number>();
for (const c of index.chunks) chunkCount.set(c.docId, (chunkCount.get(c.docId) ?? 0) + 1);

const mock = {
  source: evalPath,
  docs: Object.entries(index.docs)
    .map(([id, d]) => ({ id, title: d.title, status: d.status, updatedAt: d.updatedAt, body: d.body }))
    .sort((a, b) => a.id.localeCompare(b.id)),
  answers: rows.map((r) => ({ question: r.q.question, answer: r.a, reply: cache[cacheKey(r)] ?? null })),
  ops: buildOps({
    syncedAt: index.syncedAt,
    models: config.models,
    docs: Object.entries(index.docs).map(([id, d]) => ({ id, title: d.title, status: d.status, updatedAt: d.updatedAt, chunks: chunkCount.get(id) ?? 0 })),
    unansweredEntries: unanswered,
    eval: summarizeEval(rows, new Date(index.syncedAt)),
  }),
};

const out = "src/web/public/mock-data.js";
await writeFile(out, `// npm run mock 으로 생성. 직접 수정하지 말 것\nwindow.MOCK = ${JSON.stringify(mock, null, 1)};\n`);
console.log(`${out} (응답 ${mock.answers.length}건, 미답변 ${unanswered.length}건, 출처 ${evalPath})`);
const replies = mock.answers.filter((a) => a.reply);
const flagged = replies.filter((a) => a.reply!.unsupportedNumbers.length);
console.log(`고객 답장 초안 ${replies.length}건, 근거 밖 숫자 포함 ${flagged.length}건`);
for (const a of flagged) console.log(`- ${a.question} → ${a.reply!.unsupportedNumbers.join(", ")}`);
