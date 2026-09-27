// Vercel Build Output API(v3) 형식으로 직접 빌드
// - Vercel의 TS 자동 빌드에 기대지 않고 esbuild로 함수 하나를 번들 → `.ts` 확장자 import 문제 없음
// - 함수는 하나: /api/* 전부를 한 함수로 보내고 라우팅은 번들 안의 createApi가 처리
//   경로마다 함수 폴더를 두면 Hobby 플랜 "배포당 함수 12개" 한도에 걸림 (자동 응대 경로를 더해 13개에서 배포 실패)
// 사용법: npm run build (Vercel 빌드 명령도 동일)
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const out = ".vercel/output";

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

const fn = `${out}/functions/api/handler.func`;
await mkdir(fn, { recursive: true });
await cp(bundle, `${fn}/index.mjs`);
await writeFile(
  `${fn}/.vc-config.json`,
  JSON.stringify({ runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs", shouldAddHelpers: false, maxDuration: 30 }),
);

await writeFile(
  `${out}/config.json`,
  JSON.stringify(
    {
      version: 3,
      // /api/<경로> → 함수 하나. 원래 경로는 __path로 넘기고 진입점(restoreRoutedPath)에서 되살림
      routes: [{ src: "^/api/(.*)$", dest: "/api/handler?__path=$1" }],
      // Supabase 무료 프로젝트는 약 7일 무요청이면 일시정지 → 하루 한 번 깨움 (UTC 18시 = 한국 새벽 3시)
      crons: [{ path: "/api/keepalive", schedule: "0 18 * * *" }],
    },
    null,
    2,
  ),
);

console.log(`${out} 생성: 정적 화면 + 함수 1개(/api/* → api/handler)`);
