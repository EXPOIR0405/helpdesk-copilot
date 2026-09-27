import { describe, expect, it, vi } from "vitest";
import type { CustomerReply } from "../src/core/reply.ts";
import { createSupportDesk, summarizeTickets } from "../src/core/support.ts";
import { memoryTicketStore, nearestDocs, type Ticket } from "../src/core/tickets.ts";
import { decideRoute, maskPII } from "../src/core/triage.ts";
import type { Answer } from "../src/core/types.ts";

const answer = (over: Partial<Answer> = {}): Answer => ({
  status: "answered",
  text: "프리미엄은 4대까지 동시 시청할 수 있습니다.",
  confidence: "high",
  requestType: "question",
  citations: [],
  trace: {
    topScore: 0.7,
    grounding: "full",
    retrieved: [
      { chunkId: "plans#0", docId: "plans", score: 0.7 },
      { chunkId: "plans#1", docId: "plans", score: 0.6 },
      { chunkId: "account-sharing#0", docId: "account-sharing", score: 0.5 },
    ],
  },
  ...over,
});
const reply = (over: Partial<CustomerReply> = {}): CustomerReply => ({ text: "안녕하세요. 시네웨이브입니다.\n4대까지 됩니다.", unsupportedNumbers: [], ...over });

describe("decideRoute", () => {
  it("모든 기준을 통과할 때만 자동", () => {
    expect(decideRoute(answer(), reply())).toEqual({ route: "auto" });
  });

  it("넘김 사유는 우선순위대로: 조치 요청 > 근거 없음 > 준비 중 > 저확신 > 근거 밖 숫자", () => {
    const esc = (a: Partial<Answer>, r: Partial<CustomerReply> = {}) => decideRoute(answer(a), reply(r));
    // 답이 맞아도 조치 요청이면 사람이 처리
    expect(esc({ requestType: "action" })).toEqual({ route: "escalate", reason: "action_request" });
    expect(esc({ requestType: "action", status: "unanswerable" })).toMatchObject({ reason: "action_request" });
    expect(esc({ status: "unanswerable", confidence: "low" })).toMatchObject({ reason: "unanswerable" });
    expect(esc({ status: "pending_policy" })).toMatchObject({ reason: "pending_policy" });
    expect(esc({ confidence: "medium" })).toMatchObject({ reason: "low_confidence" });
    expect(esc({}, { unsupportedNumbers: ["2"] })).toMatchObject({ reason: "unsupported_numbers" });
  });

  it("requestType이 없는 답변(검색 결과 없음)은 질문으로 보고 다른 기준으로 판단", () => {
    expect(decideRoute(answer({ requestType: undefined, status: "unanswerable" }), reply())).toMatchObject({ reason: "unanswerable" });
  });
});

describe("maskPII", () => {
  it("이메일·전화·카드·주민번호를 가림", () => {
    expect(maskPII("minji.kang+cw@example.co.kr 로 연락 주세요")).toBe("[이메일] 로 연락 주세요");
    expect(maskPII("010-1234-5678 / 01098765432")).toBe("[전화번호] / [전화번호]");
    expect(maskPII("카드 1234-5678-9012-3456 결제")).toBe("카드 [카드번호] 결제");
    expect(maskPII("900101-1234567")).toBe("[주민등록번호]");
  });

  it("정책 질문의 숫자(요금·기간·오류 코드)는 그대로", () => {
    const q = "13,900원 요금제는 4대까지? CW-2003 오류, 7일 이내 환불 2026-09-27";
    expect(maskPII(q)).toBe(q);
  });
});

describe("nearestDocs", () => {
  it("조각을 문서별 최고 점수로 묶음", () => {
    expect(nearestDocs(answer(), { plans: "요금제" })).toEqual([
      { docId: "plans", title: "요금제", score: 0.7 },
      { docId: "account-sharing", title: "account-sharing", score: 0.5 },
    ]);
    expect(nearestDocs(null, {})).toEqual([]);
  });
});

function setup(opts: { answer?: Answer; reply?: CustomerReply; askError?: Error; notify?: "ok" | "fail" | "throw" } = {}) {
  let t = new Date("2026-09-27T10:00:00Z");
  const store = memoryTicketStore();
  // 가짜 임베딩: 해외·외국 문의는 같은 방향, 나머지는 직교 → 의미 유사도 흉내
  const vectorOf = (q: string) => (/해외|외국/.test(q) ? [1, 0.1] : [0, 1]);
  const ask = vi.fn(async (q: string) => {
    if (opts.askError) throw opts.askError;
    return { answer: opts.answer ?? answer(), vector: vectorOf(q) };
  });
  const writeReply = vi.fn(async () => opts.reply ?? reply());
  const notifyEscalated = vi.fn(async () => {
    if (opts.notify === "throw") throw new Error("n8n down");
    return opts.notify === "fail" ? { via: "n8n", ok: false, error: "timeout" } : { via: "n8n", ok: true };
  });
  const desk = createSupportDesk({ ask, writeReply, store, docTitles: async () => ({ plans: "요금제" }), notifyEscalated, now: () => t });
  return { desk, store, ask, notifyEscalated, advance: (min: number) => (t = new Date(t.getTime() + min * 60_000)) };
}

describe("supportDesk.submit", () => {
  it("자동 응답: 보낸 답장이 최종 답장, 알림 없음", async () => {
    const { desk, store, notifyEscalated } = setup();
    const t = await desk.submit("프리미엄 몇 대?");
    expect(t).toMatchObject({ status: "auto_replied", reason: null, finalReply: reply().text, nearestDocId: "plans" });
    expect(notifyEscalated).not.toHaveBeenCalled();
    expect(store.log.map((e) => e.type)).toEqual(["created", "auto_replied"]);
  });

  it("넘김: 맥락(가까운 문서·비슷한 처리 완료 티켓·초안)을 모으고 알림 결과를 기록", async () => {
    const { desk, store } = setup({ answer: answer({ status: "unanswerable", confidence: "low" }) });
    const old = await desk.submit("해외에서도 돼요?");
    await desk.agentReply(old.id, "확인 후 안내드리겠습니다.");
    // 다른 주제로 처리한 티켓은 비슷한 과거로 잡히면 안 됨
    const other = await desk.submit("학생 할인 있어요?");
    await desk.agentReply(other.id, "학생 할인은 없습니다.");

    const t = await desk.submit("외국에서 볼 수 있나요?");
    expect(t).toMatchObject({ status: "escalated", reason: "unanswerable", finalReply: null });
    expect(t.draft).not.toBeNull();
    expect(t.context.nearestDocs[0]).toEqual({ docId: "plans", title: "요금제", score: 0.7 });
    expect(t.context.similar).toEqual([expect.objectContaining({ id: old.id, finalReply: "확인 후 안내드리겠습니다.", score: expect.closeTo(1, 5) })]);
    // 가까운 문서는 셋 다 plans(엉뚱한 문서)인데도 질문 의미로 구분
    expect(store.log.filter((e) => e.ticketId === t.id).map((e) => e.type)).toEqual(["created", "escalated", "notified"]);
  });

  it("개인정보는 모델 호출·저장 전에 가림", async () => {
    const { desk, ask } = setup();
    const t = await desk.submit("제 번호 010-1234-5678 인데 프리미엄 몇 대예요?");
    expect(ask).toHaveBeenCalledWith("제 번호 [전화번호] 인데 프리미엄 몇 대예요?");
    expect(t.embedding).toEqual([0, 1]);
    expect(t.question).not.toContain("5678");
  });

  it("모델이 실패해도 문의는 잃지 않고 처리 실패로 넘김", async () => {
    const { desk, store } = setup({ askError: Object.assign(new Error("503 overloaded"), { status: 503 }) });
    const t = await desk.submit("프리미엄 몇 대?");
    expect(t).toMatchObject({ status: "escalated", reason: "error", answer: null, draft: null });
    expect(store.log.find((e) => e.type === "escalated")?.detail).toMatchObject({ reason: "error", error: "503 overloaded" });
  });

  it("알림 실패·예외도 접수는 성공, notify_failed로 기록", async () => {
    for (const notify of ["fail", "throw"] as const) {
      const { desk, store } = setup({ answer: answer({ requestType: "action" }), notify });
      const t = await desk.submit("환불해 주세요");
      expect(t.status).toBe("escalated");
      expect(store.log.at(-1)).toMatchObject({ type: "notify_failed" });
    }
  });
});

describe("상담원 처리·검수·SLA", () => {
  it("상담원 답장은 대기 티켓만, 초안 수정 여부 기록", async () => {
    const { desk, store } = setup({ answer: answer({ requestType: "action" }) });
    const t = await desk.submit("환불해 주세요");
    const done = await desk.agentReply(t.id, "환불 접수했습니다.");
    expect(done).toMatchObject({ status: "resolved", finalReply: "환불 접수했습니다." });
    expect(store.log.at(-1)).toMatchObject({ type: "agent_replied", detail: { editedDraft: true } });
    expect(await desk.agentReply(t.id, "또")).toBe("not_escalated");
    expect(await desk.agentReply("nope", "x")).toBe("not_found");
  });

  it("사후 검수는 자동 응답만", async () => {
    const { desk } = setup();
    const t = await desk.submit("프리미엄 몇 대?");
    expect(await desk.review(t.id, "wrong")).toMatchObject({ review: "wrong" });
    const esc = await setup({ answer: answer({ confidence: "low" }) }).desk.submit("x");
    expect(esc.status).toBe("escalated");
  });

  it("SLA: 대기 30분 넘은 티켓만, 알린 뒤에는 재알림 간격까지 제외", async () => {
    const { desk, advance } = setup({ answer: answer({ status: "unanswerable" }) });
    const t = await desk.submit("해외?");
    advance(20);
    expect(await desk.overdue(30, 60)).toHaveLength(0);
    advance(15);
    expect((await desk.overdue(30, 60)).map((x) => x.id)).toEqual([t.id]);
    await desk.markReminded(t.id, "n8n");
    advance(30);
    expect(await desk.overdue(30, 60)).toHaveLength(0);
    advance(31);
    expect(await desk.overdue(30, 60)).toHaveLength(1);
    await desk.agentReply(t.id, "답");
    expect(await desk.overdue(30, 60)).toHaveLength(0);
  });
});

it("summarizeTickets: 자동 처리율·사유·처리 시간·대기·검수", () => {
  const base: Pick<Ticket, "channel" | "answer" | "draft" | "context" | "nearestDocId" | "updatedAt" | "embedding"> = {
    channel: "web",
    answer: null,
    draft: null,
    context: { nearestDocs: [], similar: [] },
    nearestDocId: null,
    updatedAt: "",
    embedding: null,
  };
  const tk = (over: Partial<Ticket>): Ticket => ({
    ...base,
    id: Math.random().toString(),
    createdAt: "2026-09-27T09:00:00Z",
    question: "q",
    status: "auto_replied",
    reason: null,
    finalReply: null,
    resolvedAt: null,
    review: null,
    ...over,
  });
  const s = summarizeTickets(
    [
      tk({ review: "ok" }),
      tk({ review: "wrong" }),
      tk({}),
      tk({ status: "escalated", reason: "unanswerable", createdAt: "2026-09-27T09:20:00Z" }),
      tk({ status: "resolved", reason: "action_request", resolvedAt: "2026-09-27T09:10:00Z" }),
      tk({ status: "resolved", reason: "unanswerable", resolvedAt: "2026-09-27T09:30:00Z" }),
    ],
    new Date("2026-09-27T10:00:00Z"),
    30,
  );
  expect(s).toMatchObject({ total: 6, autoReplied: 3, escalated: 1, resolved: 2, autoRate: 0.5, medianResolveMinutes: 10, oldestWaitingMinutes: 40, overdue: 1 });
  expect(s.reasons).toEqual([{ reason: "unanswerable", count: 2 }, { reason: "action_request", count: 1 }]);
  expect(s.review).toEqual({ ok: 1, wrong: 1, pending: 1 });
});
