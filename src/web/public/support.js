// 자동 응대: 고객 문의 창(#/support) + 상담원 문의함(#/inbox) + 운영 탭 자동 응대 패널
// app.js의 $, esc, icon, fmtTime, fetchJson, md, docHref를 그대로 씀. 목업 모드에서는 실제 서버가 필요하다고 안내
"use strict";

const SUPPORT_EXAMPLES = [
  { q: "프리미엄 요금제는 몇 대까지 동시에 볼 수 있어요?", hint: "자동 응답" },
  { q: "어제 결제한 거 환불해 주세요. 아무것도 안 봤어요.", hint: "개인 처리 요청 → 상담원" },
  { q: "해외 여행 가서도 볼 수 있어요?", hint: "근거 없음 → 상담원" },
  { q: "광고 보는 대신 더 싼 요금제 있어요?", hint: "준비 중 정책 → 상담원" },
];
const TICKET_STATUS = { escalated: "상담원 대기", auto_replied: "자동 응답", resolved: "처리 완료" };
const EVENT_LABEL = {
  created: "접수",
  auto_replied: "자동 응답 발송",
  escalated: "상담원에게 넘김",
  notified: "상담원 알림",
  notify_failed: "알림 실패",
  agent_replied: "상담원 답장·종결",
  reviewed: "사후 검수",
  sla_reminded: "SLA 알림",
};
// 서버 설정(config.support.slaMinutes)의 기본값. 목록 강조 표시용
const SLA_MINUTES = 30;
const MINE_KEY = "cw.support.mine";

const supportApi = {
  submit: (question) =>
    fetchJson("/api/tickets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }) }),
  list: (status) => fetchJson(`/api/tickets${status ? `?status=${status}` : ""}`),
  get: (id) => fetchJson(`/api/ticket?id=${encodeURIComponent(id)}`),
  reply: (id, text) =>
    fetchJson("/api/ticket-reply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, text }) }),
  review: (id, verdict) =>
    fetchJson("/api/ticket-review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, verdict }) }),
  stats: () => fetchJson("/api/tickets-stats"),
};

const offline = (e) => !e.status || e.status === 404 || e.status >= 500;
const offlineNote = `<p class="muted">자동 응대는 실제 서버에 연결됐을 때만 동작합니다. 목업 모드에서는 상담 탭을 이용해 주세요.</p>`;
const waitLabel = (min) => (min == null ? "" : min < 60 ? `${min}분 대기` : `${Math.floor(min / 60)}시간 ${min % 60}분 대기`);

/* ── 고객 문의 창 ─────────────────────── */

// 이 브라우저에서 보낸 문의만 대화로 보여줌 (방문자별 편의 기능이라 localStorage, 실패해도 동작)
const mine = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(MINE_KEY) ?? "[]");
    } catch {
      return [];
    }
  },
  save(ids) {
    try {
      localStorage.setItem(MINE_KEY, JSON.stringify(ids.slice(-20)));
    } catch {}
  },
};

let supportReady = false;
let pollTimer = null;

function renderSupport() {
  if (!supportReady) {
    supportReady = true;
    $("#support-examples").innerHTML = SUPPORT_EXAMPLES.map(
      (e) => `<li><button type="button" class="chip" data-q="${esc(e.q)}">${esc(e.q)} <span class="chip__hint">${esc(e.hint)}</span></button></li>`,
    ).join("");
    $("#support-examples").addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]");
      if (b) sendSupport(b.dataset.q);
    });
    $("#support-form").addEventListener("submit", (e) => {
      e.preventDefault();
      sendSupport($("#support-q").value);
    });
    $("#support-q").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        $("#support-form").requestSubmit();
      }
    });
  }
  refreshThread();
}

async function refreshThread() {
  const ids = mine.load();
  if (!ids.length) {
    $("#thread").innerHTML = `<div class="empty"><p class="empty__title">아직 보낸 문의가 없습니다</p><p class="empty__body">아래 예시를 눌러 보거나 직접 적어 보세요.</p></div>`;
    return;
  }
  const found = await Promise.all(ids.map((id) => supportApi.get(id).catch((e) => (offline(e) && e.status !== 404 ? { offline: true } : null))));
  if (found.some((f) => f?.offline)) {
    $("#thread").innerHTML = offlineNote;
    return;
  }
  const tickets = found.filter(Boolean).map((f) => f.ticket);
  $("#thread").innerHTML = tickets.map(renderBubbles).join("");
  $("#thread").lastElementChild?.scrollIntoView({ block: "nearest" });
  // 상담원 답장을 기다리는 문의가 있으면 10초마다 갱신
  clearTimeout(pollTimer);
  if (tickets.some((t) => t.status === "escalated") && !$("#view-support").hidden) pollTimer = setTimeout(refreshThread, 10_000);
}

function renderBubbles(t) {
  const customer = `<div class="bubble bubble--me"><p>${esc(t.question)}</p><time>${fmtTime(t.createdAt)}</time></div>`;
  if (t.status === "escalated") {
    return `${customer}<div class="bubble bubble--wait"><p>문의가 접수되었습니다. 담당 상담원이 확인 후 답변드리겠습니다.</p><span class="bubble__who">시네웨이브 · 접수 안내</span></div>`;
  }
  const who = t.status === "auto_replied" ? "시네웨이브 · AI 자동 응답" : "시네웨이브 · 상담원";
  return `${customer}<div class="bubble"><p>${esc(t.finalReply ?? "").replace(/\n/g, "<br>")}</p><span class="bubble__who">${who}</span></div>`;
}

async function sendSupport(raw) {
  const question = raw.trim();
  if (!question) return;
  const btn = $("#support-submit");
  btn.disabled = true;
  $("#support-q").value = "";
  $("#thread").insertAdjacentHTML(
    "beforeend",
    `<div class="bubble bubble--me"><p>${esc(question)}</p></div><div class="bubble bubble--wait skeleton-text" id="pending">답변을 확인하고 있습니다…</div>`,
  );
  try {
    const t = await supportApi.submit(question);
    mine.save([...mine.load(), t.id]);
    await refreshThread();
    refreshInboxCount();
  } catch (e) {
    $("#pending")?.remove();
    $("#thread").insertAdjacentHTML("beforeend", `<p class="flash">${esc(offline(e) ? "자동 응대 서버에 연결할 수 없습니다." : e.message)}</p>`);
  } finally {
    btn.disabled = false;
  }
}

/* ── 상담원 문의함 ─────────────────────── */

let inboxReady = false;
let inboxTab = "escalated";
let inboxSelected = null;

async function renderInbox(ticketId) {
  if (!inboxReady) {
    inboxReady = true;
    $("#inbox-tabs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (!b) return;
      inboxTab = b.dataset.tab;
      loadInboxList();
    });
  }
  if (ticketId) inboxSelected = ticketId;
  await loadInboxList();
  if (inboxSelected) loadTicket(inboxSelected);
  else $("#inbox-detail").innerHTML = `<div class="empty"><p class="empty__title">티켓을 선택하세요</p><p class="empty__body">AI가 넘긴 문의에는 판단 근거·가까운 문서·비슷한 과거 처리·답장 초안이 모여 있습니다.</p></div>`;
}

async function loadInboxList() {
  $("#inbox-tabs").innerHTML = Object.entries(TICKET_STATUS)
    .map(([k, label]) => `<button type="button" role="tab" class="seg__btn" data-tab="${k}" aria-selected="${k === inboxTab}">${label}</button>`)
    .join("");
  let items;
  try {
    items = await supportApi.list(inboxTab);
  } catch (e) {
    $("#inbox-items").innerHTML = `<li>${offline(e) ? offlineNote : esc(e.message)}</li>`;
    return;
  }
  $("#inbox-sub").textContent = inboxTab === "escalated" ? `SLA ${SLA_MINUTES}분 · 오래 기다린 순` : "최신순 50건";
  // 대기 탭은 오래 기다린 순
  if (inboxTab === "escalated") items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  $("#inbox-items").innerHTML = items.length
    ? items
        .map((t) => {
          const late = t.waitingMinutes != null && t.waitingMinutes >= SLA_MINUTES;
          const tag =
            t.status === "auto_replied"
              ? `<span class="pill pill--${t.review === "wrong" ? "pending" : t.review === "ok" ? "confirmed" : "neutral"}">${t.review === "wrong" ? "틀림" : t.review === "ok" ? "검수 완료" : "검수 전"}</span>`
              : t.reasonLabel
                ? `<span class="pill pill--neutral">${esc(t.reasonLabel)}</span>`
                : "";
          return `<li><a class="ticket${t.id === inboxSelected ? " is-active" : ""}" href="#/inbox/${t.id}">
            <span class="ticket__q">${esc(t.question)}</span>
            <span class="ticket__meta">${tag}<span class="${late ? "is-late" : ""}">${t.status === "escalated" ? waitLabel(t.waitingMinutes) : fmtTime(t.createdAt)}</span></span>
          </a></li>`;
        })
        .join("")
    : `<li class="muted tickets__empty">${inboxTab === "escalated" ? "기다리는 문의가 없습니다." : "아직 없습니다."}</li>`;
}

async function loadTicket(id) {
  const el = $("#inbox-detail");
  el.innerHTML = `<p class="muted">불러오는 중…</p>`;
  let data;
  try {
    data = await supportApi.get(id);
  } catch (e) {
    el.innerHTML = e.status === 404 ? `<p class="muted">티켓을 찾지 못했습니다.</p>` : offline(e) ? offlineNote : `<p class="flash">${esc(e.message)}</p>`;
    return;
  }
  const { ticket: t, events } = data;
  const a = t.answer;
  const ctx = t.context;
  const status = a ? STATUS[a.status] : null;

  const head = `<div class="td__head">
      <span class="pill pill--${t.status === "escalated" ? "pending" : "confirmed"}">${TICKET_STATUS[t.status]}</span>
      ${t.reasonLabel ? `<span class="td__reason">넘김 사유: <strong>${esc(t.reasonLabel)}</strong></span>` : ""}
      <span class="muted">${t.status === "escalated" ? waitLabel(t.waitingMinutes) : fmtTime(t.createdAt)}</span>
    </div>
    <blockquote class="td__q">${esc(t.question)}</blockquote>`;

  const judge = a
    ? `<section class="td__sec"><h3>AI 판단</h3>
        <p class="td__judge"><span class="chip__dot chip__dot--${a.status}"></span>${esc(status.label)} · 확신도 ${CONFIDENCE[a.confidence]} · 근거 ${GROUNDING[a.trace.grounding]}${a.requestType === "action" ? " · <strong>조치 요청</strong>" : ""}</p>
        <div class="md md--compact">${md(a.text)}</div></section>`
    : `<section class="td__sec"><h3>AI 판단</h3><p class="flash">모델 호출에 실패해 판단 없이 넘어왔습니다. 문의를 직접 확인해 주세요.</p></section>`;

  const docs = ctx.nearestDocs.length
    ? `<section class="td__sec"><h3>가까운 문서</h3><ul class="td__docs">${ctx.nearestDocs
        .map((d) => `<li><a href="${docHref(d.docId)}">${esc(d.title)}</a><span class="muted">${d.score.toFixed(2)}</span></li>`)
        .join("")}</ul></section>`
    : "";

  const similar =
    t.status === "auto_replied"
      ? ""
      : `<section class="td__sec"><h3>비슷한 과거 처리</h3>${
          ctx.similar.length
            ? `<ul class="td__similar">${ctx.similar
                .map((s) => `<li><p class="td__sq">${esc(s.question)}</p><p class="td__sr">${esc(s.finalReply)}</p><span class="muted">유사도 ${s.score?.toFixed(2) ?? "-"} · ${fmtTime(s.resolvedAt)}</span></li>`)
                .join("")}</ul>`
            : `<p class="muted">의미가 비슷한 처리 완료 문의가 아직 없습니다.</p>`
        }</section>`;

  let action = "";
  if (t.status === "escalated") {
    const warn =
      (t.draft?.unsupportedNumbers?.length
        ? `<p class="reply__warn">${icon(ICON.alert)} 근거에 없는 숫자: ${t.draft.unsupportedNumbers.map(esc).join(", ")}</p>`
        : "") +
      // 조치 요청인데 확인 전에 결과를 단정·약속했거나, 근거 없이 "처리할 수 없다"고 한 구절
      (t.draft?.outcomePromises?.length
        ? `<p class="reply__warn">${icon(ICON.alert)} 확인 전에 결과를 약속하거나 근거 없이 단정한 표현: ${t.draft.outcomePromises.map((s) => `"${esc(s)}"`).join(", ")}</p>`
        : "");
    action = `<section class="td__sec"><h3>답장</h3>
      <form id="td-reply">
        <textarea id="td-text" rows="7" maxlength="2000">${esc(t.draft?.text ?? "안녕하세요. 시네웨이브입니다.\n")}</textarea>
        ${warn}
        <div class="td__actions"><span class="muted">${t.draft ? "AI 초안입니다. 확인·수정 후 보내세요." : ""}</span>
        <button class="btn btn--primary" type="submit">고객에게 보내고 종결</button></div>
      </form></section>`;
  } else {
    const who = t.status === "auto_replied" ? "AI가 자동으로 보낸 답장" : "상담원이 보낸 답장";
    const review =
      t.status === "auto_replied"
        ? `<div class="td__actions"><span class="muted">${t.review ? `검수 결과: <strong>${t.review === "ok" ? "맞음" : "틀림 → 평가셋 후보"}</strong>` : "자동 응답이 맞았는지 확인해 주세요."}</span>
            <span><button class="btn btn--sm" data-review="ok" type="button">맞음</button> <button class="btn btn--sm" data-review="wrong" type="button">틀림</button></span></div>`
        : "";
    action = `<section class="td__sec"><h3>${who}</h3><p class="td__sent">${esc(t.finalReply ?? "").replace(/\n/g, "<br>")}</p>${review}</section>`;
  }

  const timeline = `<section class="td__sec"><h3>기록</h3><ol class="td__timeline">${events
    .map((e) => {
      const d = e.detail ?? {};
      const extra = d.via ? ` · ${esc(d.via)}` : d.verdict ? ` · ${d.verdict === "ok" ? "맞음" : "틀림"}` : d.editedDraft != null ? ` · 초안 ${d.editedDraft ? "수정" : "그대로"}` : d.error ? ` · ${esc(String(d.error).slice(0, 80))}` : "";
      return `<li><time>${fmtTime(e.at)}</time> ${EVENT_LABEL[e.type] ?? esc(e.type)}${extra}</li>`;
    })
    .join("")}</ol></section>`;

  el.innerHTML = head + judge + docs + similar + action + timeline;

  $("#td-reply")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $("#td-text").value.trim();
    if (!text) return;
    try {
      await supportApi.reply(t.id, text);
      await loadInboxList();
      loadTicket(t.id);
      refreshInboxCount();
    } catch (err) {
      el.insertAdjacentHTML("afterbegin", `<p class="flash">${esc(err.message)}</p>`);
    }
  });
  for (const b of el.querySelectorAll("[data-review]")) {
    b.addEventListener("click", async () => {
      try {
        await supportApi.review(t.id, b.dataset.review);
        await loadInboxList();
        loadTicket(t.id);
      } catch (err) {
        el.insertAdjacentHTML("afterbegin", `<p class="flash">${esc(err.message)}</p>`);
      }
    });
  }
}

/** 탭 옆 대기 건수 */
async function refreshInboxCount() {
  try {
    const n = (await supportApi.list("escalated")).length;
    const badge = $("#inbox-count");
    badge.textContent = n;
    badge.hidden = n === 0;
  } catch {}
}

/* ── 운영 탭: 자동 응대 ─────────────────── */

async function renderSupportStats() {
  let s;
  try {
    s = await supportApi.stats();
  } catch (e) {
    $("#auto-stats").innerHTML = offline(e) ? `<p class="muted">실제 서버에 연결됐을 때만 표시됩니다.</p>` : `<p class="flash">${esc(e.message)}</p>`;
    return;
  }
  $("#auto-sub").textContent = `최근 ${s.days}일 · 문의 ${s.total}건`;
  if (!s.total) {
    $("#auto-stats").innerHTML = `<p class="muted">아직 들어온 문의가 없습니다. <a href="#/support">고객 문의</a>에서 보내 보세요.</p>`;
    return;
  }
  const pct = (v) => `${Math.round(v * 100)}%`;
  const reviewed = s.review.ok + s.review.wrong;
  const max = Math.max(...s.reasons.map((r) => r.count), 1);
  $("#auto-stats").innerHTML = `
    <dl class="quality">
      <div class="q q--key"><dt>자동 처리율</dt><dd>${pct(s.autoRate)}<small>${s.autoReplied}/${s.total}</small></dd></div>
      <div class="q"><dt>상담원 대기</dt><dd>${s.escalated}<small>SLA 초과 ${s.overdue}</small></dd></div>
      <div class="q"><dt>처리 시간 중앙값</dt><dd>${s.medianResolveMinutes == null ? "-" : `${Math.round(s.medianResolveMinutes)}분`}</dd></div>
      <div class="q"><dt>자동 응답 검수</dt><dd>${reviewed ? pct(s.review.ok / reviewed) : "-"}<small>틀림 ${s.review.wrong} · 검수 전 ${s.review.pending}</small></dd></div>
    </dl>
    ${
      s.reasons.length
        ? `<p class="auto__title">넘김 사유</p><ul class="bars">${s.reasons
            .map((r) => `<li><span>${esc(REASON_TEXT[r.reason] ?? r.reason)}</span><span class="bars__track"><span class="bars__fill" style="width:${((r.count / max) * 100).toFixed(0)}%"></span></span><span class="num">${r.count}</span></li>`)
            .join("")}</ul>`
        : ""
    }
    <p class="muted auto__link"><a href="#/inbox">문의함 열기</a></p>`;
}

const REASON_TEXT = {
  action_request: "개인 처리 요청",
  unanswerable: "근거 없음",
  pending_policy: "준비 중 정책",
  low_confidence: "저확신",
  unsupported_numbers: "근거 밖 숫자",
  error: "처리 실패",
};

window.renderSupport = renderSupport;
window.renderInbox = renderInbox;
window.renderSupportStats = renderSupportStats;

// app.js가 먼저 route()를 실행하므로, 처음부터 이 화면으로 들어왔으면 한 번 더 그림
if (/^#\/(support|inbox)/.test(location.hash)) route();
refreshInboxCount();
