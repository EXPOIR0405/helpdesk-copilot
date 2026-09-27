import type { IncomingMessage, ServerResponse } from "node:http";

type WebHandler = (req: Request) => Promise<Response>;

/**
 * Vercel 라우트가 /api/<경로>를 /api/handler?__path=<경로>로 보냄 → 원래 경로·쿼리로 되돌림
 * 로컬 개발 서버처럼 __path가 없으면 그대로
 */
export function restoreRoutedPath(url: string): string {
  const u = new URL(url);
  const path = u.searchParams.get("__path");
  if (path === null) return url;
  u.searchParams.delete("__path");
  u.pathname = `/api/${path.replace(/^\/+/, "")}`;
  return u.toString();
}

/** Node의 req/res를 표준 Request/Response로 바꿔 handler에 넘김. 로컬 개발 서버와 Vercel 함수가 같이 씀 */
export function toNodeHandler(handler: WebHandler) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
      else if (v !== undefined) headers.set(k, v);
    }
    const hasBody = req.method !== "GET" && req.method !== "HEAD" && chunks.length > 0;
    const request = new Request(restoreRoutedPath(`http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`), {
      method: req.method,
      headers,
      body: hasBody ? Buffer.concat(chunks) : undefined,
    });
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  };
}
