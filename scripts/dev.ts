// 로컬 개발 서버: 정적 화면 + API. Supabase 환경 변수가 없으면 로컬 인덱스·메모리 저장소로 동작
// 사용법: npm run dev → http://localhost:3000
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
// URL 경로는 항상 /로 구분 → posix로 정규화 (win32 normalize는 "/"를 "\\"로 바꿔 index.html을 못 찾음)
import { normalize } from "node:path/posix";
import handler from "../src/server/entry.ts";
import { selectBackend } from "../src/runtime.ts";

const root = "src/web/public";
const types: Record<string, string> = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };
const port = Number(process.env.PORT ?? 3000);

createServer(async (req, res) => {
  if (req.url?.startsWith("/api/")) return handler(req, res);
  const path = normalize(new URL(req.url ?? "/", "http://x").pathname).replace(/^(\.\.[/\\])+/, "");
  const file = join(root, path === "/" ? "index.html" : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": `${types[extname(file)] ?? "application/octet-stream"}; charset=utf-8` });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(port, () => console.log(`[${selectBackend().name}] http://localhost:${port}`));
