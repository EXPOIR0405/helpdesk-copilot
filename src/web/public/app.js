// 상담원 화면 + 운영 화면. 빌드 없는 바닐라 JS
// API(/api/ask, /api/ops)에 닿지 않으면 mock-data.js(평가 때의 실제 응답)로 동작
"use strict";

const EXAMPLES = [
  "아이폰에서 결제한 사람은 환불 어디서 해요?",
  "해지랑 환불이 뭐가 다른지 고객한테 설명해야 해요",
  "광고형 요금제는 얼마예요?",
  "학생 할인 있나요?",
];

const STATUS = {
  answered: {
    label: "확정 정책 기반 답변",
    guide: "근거 문서를 확인한 뒤 안내하세요.",
    icon: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  },
  pending_policy: {
    label: "준비 중인 정책",
    guide: "아직 확정되지 않은 내용입니다. 요금·일정을 약속하지 말고 공지 예정이라고만 안내하세요.",
    icon: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  },
  unanswerable: {
    label: "근거 없음",
    guide: "등록된 정책 문서에 근거가 없습니다. 추측해서 안내하지 말고 담당자에게 확인하세요.",
    icon: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  },
};
const REPLY_LABEL = { answered: "고객 답장 만들기", pending_policy: "고객 답장 만들기", unanswerable: "보류 답장 만들기" };
const CONFIDENCE = { high: "높음", medium: "보통", low: "낮음" };
const GROUNDING = { full: "충분", partial: "일부", none: "없음" };
const ICON = {
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  reply: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  doc: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/>',
};

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// 인라인 코드가 문서 id면(`refund` 문서 참고) 정책 문서 탭 링크로
const docLink = (code) => (docMeta[code] ? `<a class="doc-ref" href="#/docs/${encodeURIComponent(code)}">${esc(docMeta[code].title)}</a>` : null);
const md = (text, opts = {}) => window.renderMarkdown(text, { codeLink: docLink, ...opts });
const docHref = (docId, section) => `#/docs/${encodeURIComponent(docId)}${section ? `?s=${encodeURIComponent(section)}` : ""}`;
const icon = (paths, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const fmtTime = (iso) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p.month}.${p.day} ${p.hour}:${p.minute}`;
};

/* ── 데이터 접근 ───────────────────────── */

const mock = window.MOCK ?? null;
let mockMode = location.protocol === "file:" || new URLSearchParams(location.search).has("mock");

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? `요청 실패 (${res.status})`), { status: res.status, code: body.code });
  }
  return res.json();
}

let mockReason = null;

/** 실시간 API를 쓸 수 없으면 목업으로 전환: API 없음(정적 호스팅·파일), 서버·DB 오류, 하루 호출 한도 소진 */
async function withFallback(real, fake) {
  if (!mockMode) {
    try {
      return await real();
    } catch (e) {
      const unavailable = !e.status || e.status === 404 || e.status >= 500 || e.code === "daily_cap";
      if (!mock || !unavailable) throw e;
      mockMode = true;
      mockReason = e.code === "daily_cap" ? "오늘 데모 호출 한도를 모두 써서" : e.status ? "실시간 API에 연결할 수 없어" : null;
    }
  }
  return fake();
}

const bigrams = (s) => {
  const t = s.replace(/\s+/g, "");
  const set = new Set();
  for (let i = 0; i < t.length - 1; i++) set.add(t.slice(i, i + 2));
  return set;
};
function nearestMock(question) {
  const q = bigrams(question);
  let best = null;
  for (const item of mock.answers) {
    const b = bigrams(item.question);
    const inter = [...q].filter((x) => b.has(x)).length;
    const score = inter / (q.size + b.size - inter || 1);
    if (!best || score > best.score) best = { ...item, score };
  }
  return best;
}

const api = {
  ask: (question) =>
    withFallback(
      // 서버는 답변을 잠시 보관하고 answerId를 줌. 답장 요청은 id로만 받아 임의 텍스트 주입을 막음
      () => fetchJson("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }) }),
      async () => {
        await new Promise((r) => setTimeout(r, 600));
        const hit = nearestMock(question);
        return { answer: hit.answer, mockReply: hit.reply, matched: hit.question === question ? null : hit.question };
      },
    ),
  reply: (ctx) =>
    ctx.mockReply !== undefined
      ? new Promise((r) => setTimeout(() => r(ctx.mockReply ?? { text: "목업 데이터에 이 답변의 초안이 없습니다. npm run mock 을 API 키와 함께 실행하세요.", unsupportedNumbers: [] }), 500))
      : fetchJson("/api/reply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answerId: ctx.answerId, fresh: !!ctx.fresh }) }),
  ops: () => withFallback(() => fetchJson("/api/ops"), async () => mock.ops),
  docs: () => withFallback(() => fetchJson("/api/docs"), async () => mock.docs),
};

/* ── 라우팅 ───────────────────────────── */

/** #/ · #/support · #/inbox/<티켓id> · #/docs · #/docs/<문서id>?s=<섹션> · #/ops */
function parseHash() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  const parts = path.split("/").filter(Boolean);
  const name = ["ops", "docs", "support", "inbox"].includes(parts[0]) ? parts[0] : "agent";
  const id = parts[1] ? decodeURIComponent(parts[1]) : null;
  return { name, docId: id, ticketId: id, section: new URLSearchParams(query).get("s") };
}

function route() {
  const { name, docId, ticketId, section } = parseHash();
  for (const v of ["agent", "support", "inbox", "docs", "ops"]) $(`#view-${v}`).hidden = name !== v;
  for (const a of document.querySelectorAll(".tabs__link")) {
    if (a.dataset.route === name) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  document.title = `${{ ops: "운영 현황", docs: "정책 문서", agent: "상담", support: "고객 문의", inbox: "문의함" }[name]} · CineWave 상담 코파일럿`;
  if (name === "ops") renderOps();
  // support.js
  if (name === "support") window.renderSupport?.();
  if (name === "inbox") window.renderInbox?.(ticketId);
  if (name === "docs") renderDocs(docId, section);
}

/* ── 상담원 화면 ──────────────────────── */

let docMeta = {};
const setDocMeta = (ops) => {
  for (const d of ops.docs) docMeta[d.id] = { ...docMeta[d.id], ...d };
};
const sectionId = (text) => `sec-${text.trim().replace(/\s+/g, "-")}`;
let asking = false;
let current = null; // 지금 화면의 답변. 고객 답장 만들 때 사용

function renderExamples() {
  const statusOf = (q) => mock?.answers.find((a) => a.question === q)?.answer.status;
  $("#examples").innerHTML = EXAMPLES.map((q) => {
    const st = statusOf(q);
    const dot = st ? `<span class="chip__dot chip__dot--${st}" aria-hidden="true"></span>` : "";
    return `<li><button type="button" class="chip" data-q="${esc(q)}">${dot}${esc(q)}</button></li>`;
  }).join("");
}

async function ask(question) {
  question = question.trim();
  if (!question || asking) return;
  asking = true;
  const submit = $("#ask-submit");
  submit.disabled = true;
  $("#result").setAttribute("aria-busy", "true");
  $("#result").innerHTML = `<div class="skeleton" aria-label="답변을 찾는 중"><i></i><i></i><i></i><i></i></div>`;
  $("#mock-note").hidden = true;

  try {
    // 문서 제목을 알아야 근거 안의 문서 참조가 링크로 바뀜. 실패해도 답변은 보여줌
    const [{ answer, answerId, mockReply, matched }] = await Promise.all([api.ask(question), loadDocs().catch(() => null)]);
    current = { question, answer, answerId, mockReply };
    renderAnswer(question, answer);
    renderTrace(answer);
    if (mockMode) {
      $("#mock-note").hidden = false;
      const why = mockReason ? `${mockReason} ` : "";
      $("#mock-note").textContent = matched
        ? `목업 모드: ${why}가장 비슷한 평가 문항 "${matched}"의 실제 응답을 보여줍니다.`
        : `목업 모드: ${why}평가 때 저장한 실제 모델 응답을 보여줍니다.`;
    }
  } catch (e) {
    $("#result").innerHTML = `<div class="answer appear"><div class="answer__status status--unanswerable">${icon(STATUS.unanswerable.icon)}<div><p class="answer__status-label">답변을 가져오지 못했습니다</p><p class="answer__status-guide">${esc(e.message)}</p></div></div></div>`;
  } finally {
    asking = false;
    submit.disabled = false;
    $("#result").setAttribute("aria-busy", "false");
  }
}

function renderAnswer(question, a) {
  const st = STATUS[a.status];
  const answered = a.status === "answered";
  const lowWarn = answered && a.confidence === "low" ? `<span class="conf__warn">근거가 약해요. 인용 원문을 직접 확인하세요</span>` : "";
  const conf = answered
    ? `<span class="conf conf--${a.confidence}">확신도 <span class="conf__bars" aria-hidden="true"><i></i><i></i><i></i></span><strong>${CONFIDENCE[a.confidence]}</strong></span>${lowWarn}`
    : "";
  const meta = `<div class="answer__meta">
      ${conf}
      <span class="answer__actions"><button type="button" class="btn btn--primary btn--sm" id="reply-btn">${icon(ICON.reply)}<span>${REPLY_LABEL[a.status]}</span></button></span>
    </div>
    <div id="reply-slot"></div>`;
  const cites = a.citations.length
    ? `<div class="cites">
        <button type="button" class="cites__toggle" aria-expanded="true" aria-controls="cites-list">
          근거 문서 <span class="cites__count">${a.citations.length}건</span>${icon(ICON.chev, "icon--chev")}
        </button>
        <ul class="cites__list" id="cites-list">
          ${a.citations.map(renderCite).join("")}
        </ul>
      </div>`
    : "";

  $("#result").innerHTML = `
    <article class="answer appear">
      <div class="answer__status status--${a.status}">
        ${icon(st.icon)}
        <div><p class="answer__status-label">${st.label}</p><p class="answer__status-guide">${st.guide}</p></div>
      </div>
      <p class="answer__question">Q. ${esc(question)}</p>
      <div class="answer__body md">${md(a.text)}</div>
      ${meta}
      ${cites}
    </article>`;
}

async function makeReply(fresh = false) {
  if (!current) return;
  const btn = $("#reply-btn");
  const slot = $("#reply-slot");
  btn.disabled = true;
  slot.innerHTML = `<div class="reply" aria-busy="true"><div class="skeleton" aria-label="답장 초안을 만드는 중"><i></i><i></i><i></i></div></div>`;
  try {
    const reply = await api.reply({ ...current, fresh });
    const warn = reply.unsupportedNumbers.length
      ? `<p class="reply__warn" role="alert">${icon(ICON.alert)}<span>근거에 없는 숫자가 들어 있어요: <strong>${reply.unsupportedNumbers.map(esc).join(", ")}</strong>. 보내기 전에 확인하세요.</span></p>`
      : "";
    slot.innerHTML = `<section class="reply appear" aria-labelledby="reply-title">
      <div class="reply__head"><h3 id="reply-title" class="reply__title">고객 답장 초안</h3><span class="pill pill--neutral">AI 초안</span></div>
      <label class="visually-hidden" for="reply-text">고객 답장 초안 (수정 가능)</label>
      <textarea id="reply-text" class="reply__text">${esc(reply.text)}</textarea>
      ${warn}
      <div class="reply__foot">
        <span class="reply__note">확인된 답변과 근거만으로 작성 · 보내기 전에 읽고 고쳐 주세요</span>
        ${current.mockReply === undefined ? `<button type="button" class="btn btn--ghost" id="reply-again">다시 만들기</button>` : ""}
        <button type="button" class="btn btn--sm" id="copy-btn">${icon(ICON.copy)}<span>복사</span></button>
      </div>
    </section>`;
    const ta = $("#reply-text");
    ta.style.height = `${ta.scrollHeight + 2}px`;
    btn.hidden = true;
    // 확신도가 없는 상태(준비 중·근거 없음)면 빈 막대가 남지 않게 통째로 숨김
    const meta = btn.closest(".answer__meta");
    if (!meta.querySelector(".conf")) meta.hidden = true;
  } catch (e) {
    slot.innerHTML = `<div class="reply"><p class="reply__warn" role="alert">${icon(ICON.alert)}<span>답장 초안을 만들지 못했습니다: ${esc(e.message)}</span></p></div>`;
    btn.disabled = false;
  }
}

function renderCite(c) {
  const pending = docMeta[c.docId]?.status === "pending";
  return `<li class="cite">
    <div class="cite__head">${icon(ICON.doc)}<span>${esc(c.title)} <span class="cite__path">› ${esc(c.section)}</span></span>
      ${pending ? '<span class="pill pill--pending">준비 중</span>' : ""}
      <span class="cite__id">${esc(c.chunkId)}</span>
      <a class="cite__open" href="${docHref(c.docId, c.section)}">원문 보기</a></div>
    <div class="md md--compact">${md(c.excerpt, { headingShift: 2 })}</div>
  </li>`;
}

function renderTrace(a) {
  const cited = new Set(a.citations.map((c) => c.chunkId));
  const hits = a.trace.retrieved;
  const list = hits.length
    ? hits
        .map((h) => {
          const title = docMeta[h.docId]?.title ?? h.docId;
          const isCited = cited.has(h.chunkId);
          return `<li class="hit ${isCited ? "hit--cited" : ""}">
            <span class="hit__name" title="${esc(h.chunkId)}">${esc(title)} <span class="cite__path">${esc(h.chunkId.split("#")[1] ? "#" + h.chunkId.split("#")[1] : "")}</span>${isCited ? '<span class="visually-hidden"> (근거로 사용)</span>' : ""}</span>
            <span class="hit__score">${h.score.toFixed(2)}</span>
            <span class="hit__bar" aria-hidden="true"><i style="width:${Math.max(4, Math.min(100, h.score * 100))}%"></i></span>
          </li>`;
        })
        .join("")
    : `<li class="muted">관련 문서 조각을 찾지 못해 모델을 호출하지 않았습니다.</li>`;

  $("#trace").innerHTML = `
    <dl class="trace__summary">
      <div class="trace__stat"><dt>최고 유사도</dt><dd>${a.trace.topScore.toFixed(2)}</dd></div>
      <div class="trace__stat"><dt>모델 근거 판단</dt><dd>${GROUNDING[a.trace.grounding]}</dd></div>
    </dl>
    <div>
      <p class="panel__sub" style="margin-bottom:8px">검색된 조각 상위 ${hits.length}개</p>
      <ul class="hits">${list}</ul>
    </div>
    <div class="trace__legend"><span class="is-cited">근거로 사용</span><span>검색만 됨</span></div>
    <p class="trace__note">유사도는 참고용입니다. 답할지 말지는 모델이 조각 안에 근거가 있는지 판단해 정하고, 확신도는 두 신호 중 약한 쪽을 따릅니다.</p>`;
}

/* ── 정책 문서 화면 ───────────────────── */

let docsCache = null;

async function loadDocs() {
  docsCache ??= api.docs().then((docs) => {
    for (const d of docs) docMeta[d.id] = { ...docMeta[d.id], ...d };
    return [...docs].sort((a, b) => a.title.localeCompare(b.title, "ko"));
  });
  try {
    return await docsCache;
  } catch (e) {
    docsCache = null;
    throw e;
  }
}

async function renderDocs(docId, section) {
  let docs;
  try {
    docs = await loadDocs();
  } catch (e) {
    $("#doc-view").innerHTML = `<p class="muted">문서를 불러오지 못했습니다: ${esc(e.message)}</p>`;
    return;
  }
  const doc = docs.find((d) => d.id === docId) ?? docs[0];
  if (!doc) return;

  $("#doc-count").textContent = `${docs.length}개`;
  $("#doc-list").innerHTML = docs
    .map(
      (d) => `<li><a href="${docHref(d.id)}" ${d.id === doc.id ? 'aria-current="page"' : ""}>
        <span>${esc(d.title)}</span>${d.status === "pending" ? '<span class="pill pill--pending">준비 중</span>' : ""}</a></li>`,
    )
    .join("");
  $("#doc-select").innerHTML = docs
    .map((d) => `<option value="${esc(d.id)}" ${d.id === doc.id ? "selected" : ""}>${esc(d.title)}${d.status === "pending" ? " (준비 중)" : ""}</option>`)
    .join("");

  // 제목 id는 섹션 이름 기준 → 근거 카드의 "원문 보기"가 해당 섹션으로 바로 이동
  const headingId = sectionId;
  const pending = doc.status === "pending"
    ? `<p class="doc__notice">${icon(ICON.alert)}<span>준비 중인 정책입니다. 확정 전 내용이므로 고객에게 요금·일정을 약속하지 마세요.</span></p>`
    : "";
  $("#doc-view").innerHTML = `
    <header class="doc__head">
      <h2 class="doc__title">${esc(doc.title)}</h2>
      <span class="pill pill--${doc.status}">${doc.status === "pending" ? "준비 중" : "확정"}</span>
      <span class="doc__meta">수정일 ${esc(doc.updatedAt)}</span>
    </header>
    ${pending}
    <div class="md">${md(doc.body, { skipTitle: true, headingId })}</div>
    <p class="doc__source">코파일럿이 답변 근거로 검색하는 원문과 같은 동기화 결과입니다 · 문서 id <code>${esc(doc.id)}</code></p>`;

  const target = section && document.getElementById(sectionId(section));
  if (target) {
    target.scrollIntoView({ block: "start" });
    target.classList.add("flash");
    setTimeout(() => target.classList.remove("flash"), 1700);
  } else {
    window.scrollTo(0, 0);
  }
}

/* ── 운영 화면 ────────────────────────── */

let opsLoaded = false;

async function renderOps() {
  if (opsLoaded) return;
  let ops;
  try {
    ops = await api.ops();
  } catch (e) {
    $("#ops-stats").innerHTML = `<p class="muted">운영 데이터를 불러오지 못했습니다: ${esc(e.message)}</p>`;
    return;
  }
  opsLoaded = true;
  setDocMeta(ops);

  const pending = ops.docs.filter((d) => d.status === "pending").length;
  const chunks = ops.docs.reduce((n, d) => n + d.chunks, 0);
  const unansweredTotal = ops.unanswered.reduce((n, g) => n + g.count, 0);
  const stat = (label, value, sub) => `<div class="stat"><p class="stat__label">${label}</p><p class="stat__value">${value}</p><p class="stat__sub">${sub}</p></div>`;
  $("#ops-stats").innerHTML = [
    stat("정책 문서", ops.docs.length, `확정 ${ops.docs.length - pending} · 준비 중 ${pending}`),
    stat("검색 조각", chunks, `임베딩 ${esc(ops.models.embedding)}`),
    stat("미답변·저확신", unansweredTotal, `${ops.unanswered.length}개 문서 주변`),
    stat("마지막 동기화", fmtTime(ops.syncedAt), "바뀐 문서만 다시 처리"),
  ].join("");

  $("#unanswered").innerHTML = ops.unanswered.length
    ? ops.unanswered.map(renderGroup(ops)).join("")
    : `<p class="muted">아직 기록된 미답변 질문이 없습니다.</p>`;

  renderCost(ops);
  window.renderSupportStats?.();

  const ev = ops.eval;
  const pct = ({ n, d }) => (d ? `${((n / d) * 100).toFixed(1)}%<small>${n}/${d}</small>` : "-");
  // 여러 회차 평가면 합산 비율 (total = 문항 수 × 회차)
  const runs = ev.runs ?? 1;
  $("#quality-sub").textContent = `평가셋 ${ev.total / runs}문항${runs > 1 ? ` × ${runs}회 합산` : ""} · 모델 ${ev.model ?? ops.models.generation}`;
  $("#quality").innerHTML = `
    <div class="q q--key"><dt>잘못된 답변률</dt><dd>${pct(ev.wrongAnswer)}</dd></div>
    <div class="q"><dt>상태 정확도</dt><dd>${pct(ev.statusAccuracy)}</dd></div>
    <div class="q"><dt>검색 적중률</dt><dd>${pct(ev.retrievalHit)}</dd></div>
    <div class="q"><dt>과잉 거절률</dt><dd>${pct(ev.overRefusal)}</dd></div>`;

  $("#docs-sub").textContent = "최근 수정 순";
  $("#docs tbody").innerHTML = ops.docs
    .map(
      (d) => `<tr>
        <td>${esc(d.title)}</td>
        <td><span class="pill pill--${d.status}">${d.status === "pending" ? "준비 중" : "확정"}</span></td>
        <td class="num">${esc(d.updatedAt.slice(5).replace("-", "."))}</td>
        <td class="num">${d.chunks}</td>
      </tr>`,
    )
    .join("");
}

/** 모델 호출 비용·대체 전환·실패. 목업 데이터에는 없음 */
function renderCost(ops) {
  const { models, usage, budget } = ops;
  $("#cost-sub").textContent = models.fallback ? `기본 ${models.generation} → 대체 ${models.fallback}` : `모델 ${models.generation} · 대체 없음`;
  if (!usage || !budget) {
    $("#cost").innerHTML = `<p class="muted">실제 서버에 연결됐을 때만 표시됩니다.</p>`;
    return;
  }
  const ratio = budget.dailyUsd ? budget.spentTodayUsd / budget.dailyUsd : 0;
  const level = ratio >= 0.8 ? "stop" : ratio >= 0.5 ? "warn" : "ok";
  const usd = (v) => `$${v < 0.01 && v > 0 ? v.toFixed(4) : v.toFixed(2)}`;

  // 일별 합계 (모델별 행을 날짜로 묶음)
  const days = new Map();
  for (const u of usage) {
    const d = days.get(u.day) ?? { calls: 0, costUsd: 0, fallbacks: 0, failures: 0, p95LatencyMs: 0 };
    d.calls += u.calls;
    d.costUsd += u.costUsd;
    d.fallbacks += u.fallbacks;
    d.failures += u.failures;
    d.p95LatencyMs = Math.max(d.p95LatencyMs, u.p95LatencyMs);
    days.set(u.day, d);
  }
  const rows = [...days]
    .map(
      ([day, d]) => `<tr>
        <td class="num">${esc(day.slice(5).replace("-", "."))}</td>
        <td class="num">${d.calls}</td>
        <td class="num">${usd(d.costUsd)}</td>
        <td class="num${d.fallbacks ? " is-warn" : ""}">${d.fallbacks}</td>
        <td class="num${d.failures ? " is-stop" : ""}">${d.failures}</td>
        <td class="num">${(d.p95LatencyMs / 1000).toFixed(1)}s</td>
      </tr>`,
    )
    .join("");

  $("#cost").innerHTML = `
    <div class="meter meter--${level}" role="meter" aria-valuemin="0" aria-valuemax="${budget.dailyUsd}" aria-valuenow="${budget.spentTodayUsd.toFixed(4)}" aria-label="오늘 모델 비용">
      <div class="meter__row"><span>오늘 비용</span><strong>${usd(budget.spentTodayUsd)} <small>/ 예산 ${usd(budget.dailyUsd)}</small></strong></div>
      <div class="meter__track"><div class="meter__fill" style="width:${Math.min(100, ratio * 100).toFixed(1)}%"></div></div>
    </div>
    ${
      rows
        ? `<div class="table-wrap"><table class="table">
            <thead><tr><th scope="col" class="num">날짜</th><th scope="col" class="num">호출</th><th scope="col" class="num">비용</th><th scope="col" class="num">대체</th><th scope="col" class="num">실패</th><th scope="col" class="num">p95</th></tr></thead>
            <tbody>${rows}</tbody></table></div>`
        : `<p class="muted">최근 7일 모델 호출이 없습니다.</p>`
    }`;
}

const renderGroup = (ops) => (g) => {
  const doc = ops.docs.find((d) => d.id === g.docId);
  const title = doc ? esc(doc.title) : "가까운 문서 없음";
  const hint = doc
    ? "이 문서 근처에서 답하지 못한 질문입니다. 문서에 빠진 내용이 있는지 확인하세요."
    : "어떤 문서와도 가깝지 않은 질문입니다. 새 문서가 필요할 수 있습니다.";
  const rows = g.entries
    .map(
      (e) => `<li class="uq">
        <span class="tag tag--${e.status === "unanswerable" ? "unanswerable" : "low"}">${e.status === "unanswerable" ? "근거 없음" : "저확신"}</span>
        <span class="uq__q">${esc(e.question)}</span>
        <time class="uq__time" datetime="${esc(e.at)}">${fmtTime(e.at)}</time>
      </li>`,
    )
    .join("");
  return `<div class="group">
    <div class="group__head">${icon(ICON.doc)}<span class="group__title">${title}</span>
      ${doc?.status === "pending" ? '<span class="pill pill--pending">준비 중</span>' : ""}
      <span class="group__count">${g.count}건</span></div>
    <p class="group__hint">${hint}</p>
    <ul>${rows}</ul>
  </div>`;
};

/* ── 이벤트 ───────────────────────────── */

$("#ask-form").addEventListener("submit", (e) => {
  e.preventDefault();
  ask($("#question").value);
});

$("#question").addEventListener("keydown", (e) => {
  // 한글 조합 중 Enter는 무시해야 마지막 글자가 중복 전송되지 않음
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    $("#ask-form").requestSubmit();
  }
});

$("#question").addEventListener("input", (e) => {
  e.target.style.height = "auto";
  e.target.style.height = `${e.target.scrollHeight}px`;
});

$("#examples").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  $("#question").value = btn.dataset.q;
  ask(btn.dataset.q);
});

$("#result").addEventListener("click", async (e) => {
  const toggle = e.target.closest(".cites__toggle");
  if (toggle) {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    $("#cites-list").hidden = open;
    return;
  }
  if (e.target.closest("#reply-btn, #reply-again")) {
    makeReply(!!e.target.closest("#reply-again"));
    return;
  }
  const copy = e.target.closest("#copy-btn");
  if (copy) {
    try {
      await navigator.clipboard.writeText($("#reply-text").value);
      copy.innerHTML = `${icon(ICON.check)}<span>복사됨</span>`;
      setTimeout(() => (copy.innerHTML = `${icon(ICON.copy)}<span>복사</span>`), 1500);
    } catch {
      copy.querySelector("span").textContent = "복사 실패";
    }
  }
});

$("#doc-select").addEventListener("change", (e) => (location.hash = docHref(e.target.value)));

window.addEventListener("hashchange", route);

renderExamples();
route();
// ?q= 로 들어오면 바로 질문, &reply=1 이면 답장 초안까지 (데모 링크 공유용)
const params = new URLSearchParams(location.search);
const initialQ = params.get("q");
if (initialQ && location.hash !== "#/ops") {
  $("#question").value = initialQ;
  ask(initialQ).then(() => params.has("reply") && makeReply());
}
// 검색 추적에 문서 제목을 쓰려고 운영 데이터를 미리 한 번 읽어 둠
// 검색 추적·문서 참조 링크에 문서 제목을 쓰려고 문서 목록을 미리 한 번 읽어 둠
loadDocs().catch(() => {});
