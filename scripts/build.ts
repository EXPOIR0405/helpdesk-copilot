// Vercel Build Output API(v3) 형식으로 직접 빌드
// - Vercel의 TS 자동 빌드에 기대지 않고 esbuild로 함수 하나를 번들 → `.ts` 확장자 import 문제 없음
// - 경로별 함수 폴더에 같은 번들을 두고, 라우팅은 번들 안의 createApi가 처리
// 사용법: npm run build (Vercel 빌드 명령도 동일)
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const out = ".vercel/output";
const routes = [
  "ask", "reply", "ops", "docs", "keepalive", "health",
  // 자동 응대
  "tickets", "ticket", "ticket-reply", "ticket-review", "tickets-stats", "tickets-overdue", "ticket-event",
];

await rm(out, { recursive: true, force: true });
await mkdir(`${out}/static`, { recursive: true });
await cp("src/web/public", `${out}/static`, { recursive: true });

const bundle = ".cache/api-bundle/index.mjs";
await build({
  entryPoints: ["src/server/entry.ts"],
  outfile: bundle,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  // 번들 안의 CommonJS 의존성이 require를 쓸 수 있게
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  logLevel: "warning",
});

for (const name of routes) {
  const dir = `${out}/functions/api/${name}.func`;
  await mkdir(dir, { recursive: true });
  await cp(bundle, `${dir}/index.mjs`);
  await writeFile(
    `${dir}/.vc-config.json`,
    JSON.stringify({ runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs", shouldAddHelpers: false, maxDuration: 30 }),
  );
}

await writeFile(
  `${out}/config.json`,
  JSON.stringify(
    {
      version: 3,
      // Supabase 무료 프로젝트는 약 7일 무요청이면 일시정지 → 하루 한 번 깨움 (UTC 18시 = 한국 새벽 3시)
      crons: [{ path: "/api/keepalive", schedule: "0 18 * * *" }],
    },
    null,
    2,
  ),
);

console.log(`${out} 생성: 정적 화면 + 함수 ${routes.map((r) => `/api/${r}`).join(", ")}`);
