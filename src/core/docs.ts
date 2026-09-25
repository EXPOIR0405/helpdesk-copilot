import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DocStatus, PolicyDoc } from "./types.ts";

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;

export function parseDoc(raw: string, fallbackId: string): PolicyDoc {
  const match = raw.match(FRONTMATTER);
  const meta: Record<string, string> = {};
  if (match) {
    for (const line of match[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const status: DocStatus = meta.status === "pending" ? "pending" : "confirmed";
  return {
    id: meta.id || fallbackId,
    title: meta.title || fallbackId,
    status,
    updatedAt: meta.updated_at || "",
    body: match ? raw.slice(match[0].length) : raw,
    raw,
  };
}

export async function loadDocs(dir: string): Promise<PolicyDoc[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
  return Promise.all(
    files.map(async (f) => parseDoc(await readFile(join(dir, f), "utf8"), f.replace(/\.md$/, ""))),
  );
}
