// 로컬 MCP 서버 (stdio): Claude Desktop · Claude Code 등에서 시네웨이브 헬프데스크를 도구로 씀
// 배포된 API를 HTTP로 부르므로 로컬에 모델 키가 필요 없음 (호출 제한은 API가 그대로 적용)
// 실행: node src/mcp/stdio.ts   ·   HELPDESK_API_URL로 대상 변경 (기본: 공개 데모)
// stdout은 MCP 메시지 전용 → 로그는 stderr로만
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createHelpdeskMcpServer } from "./server.ts";

const base = (process.env.HELPDESK_API_URL?.trim() || "https://helpdesk-copilot.vercel.app").replace(/\/$/, "");

const server = createHelpdeskMcpServer((path, init) =>
  fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(45_000) }),
);
await server.connect(new StdioServerTransport());
console.error(`cinewave-helpdesk MCP (stdio) → ${base}`);
