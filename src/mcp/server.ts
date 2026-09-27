import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * 헬프데스크 API를 부르는 방법. 도구 정의는 하나, 호출 경로만 바꿔 끼움
 * - stdio(로컬 Claude Desktop·Claude Code): 배포된 API로 fetch
 * - 원격 /api/mcp: 같은 API 핸들러를 내부에서 직접 호출
 * 어느 쪽이든 API의 호출 제한·입력 검사·사용량 기록을 그대로 거침
 */
export type HelpdeskFetch = (path: string, init?: RequestInit) => Promise<Response>;

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

const text = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});

/** API 오류는 던지지 않고 도구 결과로 돌려줌 → 모델이 읽고 대응 (예: 호출 한도 → 나중에 다시) */
async function call(fetchApi: HelpdeskFetch, path: string, init?: RequestInit): Promise<{ ok: true; data: any } | { ok: false; result: ToolResult }> {
  let res: Response;
  try {
    res = await fetchApi(path, init);
  } catch (e) {
    return { ok: false, result: { ...text(`헬프데스크 API에 연결하지 못했습니다: ${e instanceof Error ? e.message : String(e)}`), isError: true } };
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error ?? `요청 실패 (${res.status})`;
    return { ok: false, result: { ...text(`${message}${body?.code ? ` [${body.code}]` : ""}`), isError: true } };
  }
  return { ok: true, data: body };
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

/** "## 섹션" 단위로 잘라 한 섹션만 (문서 전체를 넣으면 컨텍스트 낭비) */
export function pickSection(body: string, section: string): string | null {
  const parts = body.split(/^(?=## )/m);
  const hit = parts.find((p) => p.replace(/^## /, "").split("\n")[0].trim() === section.trim());
  return hit?.trim() ?? null;
}

const STATUS_GUIDE: Record<string, string> = {
  answered: "확정 정책 기반 답변. 인용 근거를 함께 안내",
  pending_policy: "준비 중인 정책. 가격·일정을 약속하지 말고 공지 예정이라고만 안내",
  unanswerable: "근거 없음. 추측하지 말고 담당자 확인이 필요하다고 안내",
};

export function createHelpdeskMcpServer(fetchApi: HelpdeskFetch): McpServer {
  const server = new McpServer(
    { name: "cinewave-helpdesk", version: "1.0.0" },
    {
      instructions:
        "가상 OTT 서비스 시네웨이브(CineWave) 고객센터 도구. 정책 질문은 ask_policy로 답을 받고, status가 answered가 아니면 추측해서 보완하지 말 것. " +
        "근거(citations) 없이 정책을 단정하지 말 것. reply_to_ticket은 고객에게 실제로 발송·종결되므로 사용자 확인 후에만 호출.",
    },
  );

  server.registerTool(
    "ask_policy",
    {
      title: "정책 질문",
      description:
        "시네웨이브 정책 문서만 근거로 질문에 답한다. 결과의 status가 answered(확정), pending_policy(준비 중 — 약속 금지), unanswerable(근거 없음 — 추측 금지) 중 하나이며 인용 근거와 확신도를 함께 준다. " +
        "고객에게 보낼 문장이 필요하면 answerId로 draft_customer_reply를 호출.",
      inputSchema: { question: z.string().min(1).max(300).describe("정책 질문 (300자 이내)") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ question }) => {
      const r = await call(fetchApi, "/api/ask", post({ question }));
      if (!r.ok) return r.result;
      const a = r.data.answer;
      return text({
        status: a.status,
        guide: STATUS_GUIDE[a.status],
        answer: a.text,
        confidence: a.confidence,
        requestType: a.requestType ?? null,
        citations: a.citations.map((c: { title: string; section: string; excerpt: string; docId: string }) => ({
          doc: c.title,
          docId: c.docId,
          section: c.section,
          excerpt: c.excerpt,
        })),
        answerId: r.data.answerId,
        cached: r.data.cached,
      });
    },
  );

  server.registerTool(
    "draft_customer_reply",
    {
      title: "고객 답장 초안",
      description:
        "ask_policy로 받은 답변(answerId)을 고객에게 보낼 정중한 답장 초안으로 바꾼다. 답변과 근거에 없는 사실은 넣지 않으며, 근거 밖 숫자가 있으면 unsupportedNumbers로 경고한다. 초안만 만들고 발송하지 않는다.",
      inputSchema: { answerId: z.string().min(1).describe("ask_policy 결과의 answerId") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ answerId }) => {
      const r = await call(fetchApi, "/api/reply", post({ answerId }));
      if (!r.ok) return r.result;
      return text({ reply: r.data.text, unsupportedNumbers: r.data.unsupportedNumbers });
    },
  );

  server.registerTool(
    "list_policy_docs",
    {
      title: "정책 문서 목록",
      description: "코파일럿이 근거로 쓰는 정책 문서 목록(id·제목·상태·수정일). status가 pending이면 준비 중인 정책.",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const r = await call(fetchApi, "/api/docs");
      if (!r.ok) return r.result;
      return text(
        r.data.map((d: { id: string; title: string; status: string; updatedAt: string; body: string }) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          updatedAt: d.updatedAt,
          sections: [...d.body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim()),
        })),
      );
    },
  );

  server.registerTool(
    "get_policy_doc",
    {
      title: "정책 문서 원문",
      description: "정책 문서 원문(Markdown). section을 주면 그 섹션만 돌려준다 (섹션 이름은 list_policy_docs 참고).",
      inputSchema: {
        docId: z.string().min(1).describe("문서 id (예: refund)"),
        section: z.string().optional().describe("## 섹션 제목. 생략하면 문서 전체"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ docId, section }) => {
      const r = await call(fetchApi, "/api/docs");
      if (!r.ok) return r.result;
      const doc = r.data.find((d: { id: string }) => d.id === docId);
      if (!doc) return { ...text(`문서를 찾지 못했습니다: ${docId}`), isError: true };
      const head = `# ${doc.title} (${doc.status === "pending" ? "준비 중" : "확정"}, 수정 ${doc.updatedAt})\n\n`;
      if (!section) return text(head + doc.body);
      const picked = pickSection(doc.body, section);
      return picked ? text(head + picked) : { ...text(`섹션을 찾지 못했습니다: ${section}`), isError: true };
    },
  );

  server.registerTool(
    "list_tickets",
    {
      title: "문의함 목록",
      description: "자동 응대 문의함. status: escalated(상담원 대기, 오래 기다린 순이 급함) · auto_replied(AI 자동 응답) · resolved(처리 완료). 최신 50건.",
      inputSchema: { status: z.enum(["escalated", "auto_replied", "resolved"]).optional().describe("생략하면 전체") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ status }) => {
      const r = await call(fetchApi, `/api/tickets${status ? `?status=${status}` : ""}`);
      if (!r.ok) return r.result;
      return text(r.data);
    },
  );

  server.registerTool(
    "get_ticket",
    {
      title: "문의 상세",
      description:
        "문의 한 건의 전체 맥락: 고객 원문, 넘김 사유, AI 판단·근거, 가까운 문서, 의미가 비슷한 과거 처리와 그때 보낸 답장, 답장 초안, 처리 기록.",
      inputSchema: { ticketId: z.string().min(1) },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ ticketId }) => {
      const r = await call(fetchApi, `/api/ticket?id=${encodeURIComponent(ticketId)}`);
      if (!r.ok) return r.result;
      const { ticket: t, events } = r.data;
      return text({
        id: t.id,
        status: t.status,
        reason: t.reasonLabel,
        waitingMinutes: t.waitingMinutes,
        question: t.question,
        ai: t.answer && {
          status: t.answer.status,
          answer: t.answer.text,
          confidence: t.answer.confidence,
          requestType: t.answer.requestType ?? null,
          citations: t.answer.citations.map((c: { title: string; section: string }) => `${c.title} > ${c.section}`),
        },
        nearestDocs: t.context.nearestDocs,
        similarResolved: t.context.similar,
        draft: t.draft,
        finalReply: t.finalReply,
        review: t.review,
        events: events.map((e: { at: string; type: string; detail: Record<string, unknown> }) => ({ at: e.at, type: e.type, ...e.detail })),
      });
    },
  );

  server.registerTool(
    "reply_to_ticket",
    {
      title: "문의에 답장하고 종결",
      description:
        "상담원 대기(escalated) 문의에 답장을 보내고 종결한다. 고객에게 실제로 발송되며 되돌릴 수 없다. 반드시 사용자가 답장 문구를 확인한 뒤에만 호출. " +
        "문구는 get_ticket의 draft를 출발점으로, 근거에 없는 약속(환불 완료·일정 등)을 넣지 말 것.",
      inputSchema: {
        ticketId: z.string().min(1),
        text: z.string().min(1).max(2000).describe("고객에게 보낼 답장 전문"),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async ({ ticketId, text: reply }) => {
      const r = await call(fetchApi, "/api/ticket-reply", post({ id: ticketId, text: reply }));
      if (!r.ok) return r.result;
      return text({ ok: true, ticketId: r.data.id, status: r.data.status });
    },
  );

  server.registerTool(
    "get_ops_report",
    {
      title: "운영 현황",
      description: "운영 요약: 품질 지표(평가셋), 오늘 비용·예산, 최근 7일 호출·대체 전환·실패, 자동 응대 처리율·넘김 사유, 답하지 못한 질문이 몰린 문서(보강 후보).",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const [ops, stats] = await Promise.all([call(fetchApi, "/api/ops"), call(fetchApi, "/api/tickets-stats")]);
      if (!ops.ok) return ops.result;
      const o = ops.data;
      return text({
        models: o.models,
        quality: o.eval,
        budget: o.budget ?? null,
        usage7d: o.usage ?? null,
        autoResponse: stats.ok ? stats.data : null,
        // 목록 전체는 길어서 문서별 건수와 최근 질문 3개만
        unansweredByDoc: o.unanswered.map((g: { docId: string | null; count: number; entries: { question: string }[] }) => ({
          docId: g.docId,
          count: g.count,
          recent: g.entries.slice(0, 3).map((e) => e.question),
        })),
      });
    },
  );

  // 정책 문서를 리소스로도: 클라이언트가 문서를 직접 첨부해 읽을 수 있게
  server.registerResource(
    "policy-doc",
    new ResourceTemplate("policy://{docId}", {
      list: async () => {
        const r = await call(fetchApi, "/api/docs");
        if (!r.ok) return { resources: [] };
        return {
          resources: r.data.map((d: { id: string; title: string; status: string }) => ({
            uri: `policy://${d.id}`,
            name: d.title,
            description: d.status === "pending" ? "준비 중 정책" : "확정 정책",
            mimeType: "text/markdown",
          })),
        };
      },
    }),
    { title: "시네웨이브 정책 문서", description: "코파일럿이 근거로 쓰는 정책 문서 원문", mimeType: "text/markdown" },
    async (uri, { docId }) => {
      const r = await call(fetchApi, "/api/docs");
      const doc = r.ok ? r.data.find((d: { id: string }) => d.id === String(docId)) : null;
      if (!doc) throw new Error(`문서를 찾지 못했습니다: ${docId}`);
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: `# ${doc.title}\n\n${doc.body}` }] };
    },
  );

  return server;
}
