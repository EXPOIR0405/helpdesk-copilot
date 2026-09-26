// 정책 문서·답변용 최소 마크다운 렌더러
// 지원: 제목(#~####), 목록(-, 1.), 표, 굵게, 인라인 코드. 원문을 먼저 이스케이프한 뒤 변환해서 HTML 주입 없음
"use strict";

(function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function inline(text, opts) {
    return esc(text)
      .replace(/`([^`]+)`/g, (_, code) => (opts.codeLink && opts.codeLink(code)) || `<code>${code}</code>`)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  const HEADING = /^(#{1,4})\s+(.*)$/;
  const BULLET = /^\s*[-*]\s+(.*)$/;
  const NUMBERED = /^\s*\d+\.\s+(.*)$/;
  const TABLE_ROW = /^\s*\|.*\|\s*$/;
  const TABLE_SEP = /^\s*\|?\s*:?-{2,}/;
  const BLOCK_START = /^(#{1,4}\s|\s*[-*]\s|\s*\d+\.\s|\s*\|)/;
  const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

  /**
   * opts.headingShift: 제목 단계를 몇 칸 내릴지 (카드 안에서 작게 보이게)
   * opts.headingId(text, level): 제목에 붙일 id (문서 안 이동용)
   * opts.codeLink(code): 인라인 코드를 링크로 바꿀 때 HTML 반환, 아니면 null
   * opts.skipTitle: 맨 앞 "# 제목" 줄 생략 (화면에 제목을 따로 보여줄 때)
   */
  function renderMarkdown(text, opts = {}) {
    const lines = String(text).replace(/\r/g, "").split("\n");
    const out = [];
    let i = 0;
    if (opts.skipTitle) {
      while (i < lines.length && !lines[i].trim()) i++;
      if (/^#\s/.test(lines[i] ?? "")) i++;
    }

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) {
        i++;
        continue;
      }

      const h = HEADING.exec(line);
      if (h) {
        const level = Math.min(h[1].length + (opts.headingShift ?? 0), 6);
        const id = opts.headingId ? ` id="${esc(opts.headingId(h[2], h[1].length))}"` : "";
        out.push(`<h${level}${id}>${inline(h[2], opts)}</h${level}>`);
        i++;
        continue;
      }

      if (TABLE_ROW.test(line) && TABLE_SEP.test(lines[i + 1] ?? "")) {
        const head = cells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && TABLE_ROW.test(lines[i])) rows.push(cells(lines[i++]));
        out.push(
          `<div class="md-table"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c, opts)}</th>`).join("")}</tr></thead>` +
            `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c, opts)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
        );
        continue;
      }

      const list = BULLET.test(line) ? { re: BULLET, tag: "ul" } : NUMBERED.test(line) ? { re: NUMBERED, tag: "ol" } : null;
      if (list) {
        const items = [];
        while (i < lines.length && list.re.test(lines[i])) items.push(list.re.exec(lines[i++])[1]);
        out.push(`<${list.tag}>${items.map((t) => `<li>${inline(t, opts)}</li>`).join("")}</${list.tag}>`);
        continue;
      }

      const para = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) para.push(lines[i++]);
      out.push(`<p>${para.map((l) => inline(l, opts)).join("<br>")}</p>`);
    }
    return out.join("");
  }

  window.renderMarkdown = renderMarkdown;
})();
