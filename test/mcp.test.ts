import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it, vi } from "vitest";
import { createHelpdeskMcpServer, pickSection, type HelpdeskFetch } from "../src/mcp/server.ts";
import type { Answer } from "../src/core/types.ts";
import { memoryTicketStore } from "../src/core/tickets.ts";
import { memoryUsageLog } from "../src/core/usage.ts";
import { createApi } from "../src/server/api.ts";
import { memoryAnswerStore, memoryQuota } from "../src/server/stores.ts";

const DOCS = [
  { id: "refund", title: "환불 정책", status: "confirmed", updatedAt: "2026-09-02", body: "## 기본 원칙\n\n7일 이내 전액 환불\n\n## 인앱결제 환불\n\n앱마켓으로" },
  { id: "ad-plan", title: "광고형 요금제", status: "pending", updatedAt: "2026-09-10", body: "## 현재 상태\n\n미정" },
];

const answer: Answer = {
  status: "answered",
  text: "7일 이내면 전액 환불됩니다.",
  confidence: "high",
  requestType: "question",
  citations: [{ chunkId: "refund#0", docId: "refund", title: "환불 정책", section: "기본 원칙", excerpt: "7일 이내 전액 환불" }],
  trace: { topScore: 0.7, grounding: "full", retrieved: [] },
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function connect(fetchApi: HelpdeskFetch) {
  const server = createHelpdeskMcpServer(fetchApi);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(clientSide);
  return client;
}

// callTool 반환 타입은 content형·toolResult형 합집합 → content형으로 좁혀 읽음
const textOf = (r: unknown) => (r as { content: { type: string; text: string }[] }).content[0].text;

describe("MCP 도구", () => {
  it("도구 8개와 성격(읽기 전용·되돌릴 수 없음) 표시", async () => {
    const client = await connect(async () => json({}));
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      ["ask_policy", "draft_customer_reply", "get_ops_report", "get_policy_doc", "get_ticket", "list_policy_docs", "list_tickets", "reply_to_ticket"].sort(),
    );
    const reply = tools.find((t) => t.name === "reply_to_ticket")!;
    expect(reply.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true });
    expect(tools.find((t) => t.name === "ask_policy")!.annotations?.readOnlyHint).toBe(true);
  });

  it("ask_policy: 상태별 안내·근거·answerId, API 경로와 본문", async () => {
    const fetchApi = vi.fn<HelpdeskFetch>(async () => json({ answer, answerId: "a1", cached: false }));
    const client = await connect(fetchApi);
    const r = await client.callTool({ name: "ask_policy", arguments: { question: "환불 돼요?" } });
    const out = JSON.parse(textOf(r));
    expect(out).toMatchObject({ status: "answered", answerId: "a1", citations: [{ doc: "환불 정책", section: "기본 원칙" }] });
    expect(out.guide).toContain("인용 근거");
    const [path, init] = fetchApi.mock.calls[0];
    expect(path).toBe("/api/ask");
    expect(JSON.parse(init!.body as string)).toEqual({ question: "환불 돼요?" });
  });

  it("API 오류·연결 실패는 던지지 않고 isError 결과로 (모델이 읽고 대응)", async () => {
    const capped = await connect(async () => json({ code: "daily_cap", error: "오늘 데모 호출 한도를 모두 썼습니다." }, 429));
    const r = await capped.callTool({ name: "ask_policy", arguments: { question: "x" } });
    expect(r.isError).toBe(true);
    expect(textOf(r)).toBe("오늘 데모 호출 한도를 모두 썼습니다. [daily_cap]");

    const down = await connect(async () => {
      throw new Error("ECONNREFUSED");
    });
    const d = await down.callTool({ name: "list_tickets", arguments: {} });
    expect(d.isError).toBe(true);
    expect(textOf(d)).toContain("ECONNREFUSED");
  });

  it("입력 검사: 300자 넘는 질문·알 수 없는 상태는 API까지 가지 않음", async () => {
    const fetchApi = vi.fn<HelpdeskFetch>(async () => json({}));
    const client = await connect(fetchApi);
    const long = await client.callTool({ name: "ask_policy", arguments: { question: "가".repeat(301) } });
    expect(long.isError).toBe(true);
    const bad = await client.callTool({ name: "list_tickets", arguments: { status: "nope" } });
    expect(bad.isError).toBe(true);
    expect(fetchApi).not.toHaveBeenCalled();
  });

  it("정책 문서: 목록에 섹션 이름, 원문은 섹션 단위로", async () => {
    const client = await connect(async () => json(DOCS));
    const list = JSON.parse(textOf(await client.callTool({ name: "list_policy_docs", arguments: {} })));
    expect(list[0]).toEqual({ id: "refund", title: "환불 정책", status: "confirmed", updatedAt: "2026-09-02", sections: ["기본 원칙", "인앱결제 환불"] });

    const section = textOf(await client.callTool({ name: "get_policy_doc", arguments: { docId: "refund", section: "인앱결제 환불" } }));
    expect(section).toContain("## 인앱결제 환불\n\n앱마켓으로");
    expect(section).not.toContain("7일 이내");
    expect((await client.callTool({ name: "get_policy_doc", arguments: { docId: "nope" } })).isError).toBe(true);
    expect((await client.callTool({ name: "get_policy_doc", arguments: { docId: "refund", section: "없음" } })).isError).toBe(true);
  });

  it("정책 문서 리소스: policy://<id> 목록과 읽기", async () => {
    const client = await connect(async () => json(DOCS));
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toEqual(["policy://refund", "policy://ad-plan"]);
    expect(resources[1].description).toBe("준비 중 정책");
    const read = await client.readResource({ uri: "policy://refund" });
    expect((read.contents[0] as { text: string }).text).toContain("# 환불 정책");
  });

  it("pickSection: ## 제목이 정확히 같은 섹션만", () => {
    expect(pickSection(DOCS[0].body, "기본 원칙")).toBe("## 기본 원칙\n\n7일 이내 전액 환불");
    expect(pickSection(DOCS[0].body, "기본")).toBeNull();
  });
});

describe("원격 MCP (/api/mcp)", () => {
  function setup() {
    const ask = vi.fn(async () => answer);
    const handle = createApi({
      copilot: { ask, askWithVector: async () => ({ answer: await ask(), vector: [1] }) },
      replyWriter: { write: async () => ({ text: "안녕하세요.", unsupportedNumbers: [] }) },
      answers: memoryAnswerStore(),
      quota: memoryQuota(),
      ops: async () => ({ syncedAt: null, models: { embedding: "e", generation: "g" }, docs: [], unanswered: [], eval: null }),
      policyDocs: async () => DOCS,
      keepalive: async () => {},
      limits: { questionMaxChars: 300, perIpPerMinute: 3, perIpDailyModelCalls: 100, dailyModelCalls: 100, answerCacheHours: 24, dailyBudgetUsd: 100, budgetAlertRatio: 0.8 },
      usage: memoryUsageLog(),
      alerts: { notify: async () => {} },
      generationModel: "gemini-3.8-flash",
      health: async () => ({ chunks: 1, syncedAt: null }),
      tickets: { store: memoryTicketStore(), docTitles: async () => ({}), notify: async () => ({ via: "x", ok: true }), slaMinutes: 30, remindEveryMinutes: 60 },
    });
    let id = 0;
    const rpc = async (method: string, params: unknown, ip = "1.1.1.1") => {
      const res = await handle(
        new Request("https://x/api/mcp", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "x-forwarded-for": ip },
          body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
        }),
      );
      return { status: res.status, body: await res.json() };
    };
    return { rpc, ask, handle };
  }

  const init = { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } };

  it("initialize → tools/list → tools/call이 내부 API를 거쳐 동작", async () => {
    const { rpc, ask } = setup();
    expect((await rpc("initialize", init)).body.result.serverInfo.name).toBe("cinewave-helpdesk");
    expect((await rpc("tools/list", {})).body.result.tools).toHaveLength(8);
    const call = await rpc("tools/call", { name: "ask_policy", arguments: { question: "환불 돼요?" } });
    expect(JSON.parse(call.body.result.content[0].text)).toMatchObject({ status: "answered", answerId: expect.any(String) });
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it("호출자 IP로 API의 IP별 제한이 그대로 적용 (MCP로 우회 불가)", async () => {
    const { rpc } = setup();
    // 분당 3회: ask_policy는 IP별 분당 제한을 셈
    for (const q of ["a", "b", "c"]) expect((await rpc("tools/call", { name: "ask_policy", arguments: { question: q } })).body.result.isError).toBeFalsy();
    const blocked = await rpc("tools/call", { name: "ask_policy", arguments: { question: "d" } });
    expect(blocked.body.result).toMatchObject({ isError: true });
    expect(blocked.body.result.content[0].text).toContain("rate_limited");
    // 다른 IP는 영향 없음
    expect((await rpc("tools/call", { name: "ask_policy", arguments: { question: "e" } }, "2.2.2.2")).body.result.isError).toBeFalsy();
  });

  it("무상태라 GET·DELETE는 405", async () => {
    const { handle } = setup();
    expect((await handle(new Request("https://x/api/mcp"))).status).toBe(405);
    expect((await handle(new Request("https://x/api/mcp", { method: "DELETE" }))).status).toBe(405);
  });
});
