(() => {
  const app = document.getElementById("app");
  const STORE_KEY = "cskit-done-v1";
  let curriculum = null;

  // ---------- 유틸 ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveDone(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) { /* 저장 불가 환경은 무시 */ }
  }
  const findLevel = (id) => curriculum.levels.find((l) => l.id === id);
  // 준비 중인 레슨("soon": true)은 진행도·이전/다음 이동·레퍼런스 카드에서 제외하고, 사이드바에만 흐리게 보여 줍니다
  const levelLessons = (lv) => lv.categories.flatMap((c) => c.lessons.filter((l) => !l.soon).map((l) => ({ ...l, levelId: lv.id, catTitle: c.title })));
  const plannedLessons = (lv) => lv.categories.flatMap((c) => c.lessons.filter((l) => l.soon).map((l) => ({ ...l, levelId: lv.id, catTitle: c.title })));
  function allLessons() { return curriculum.levels.flatMap(levelLessons); }
  function setTitle(t) { document.title = `${t} · Claude Code 학습 키트`; }

  function progress(lv) {
    const done = loadDone();
    const list = levelLessons(lv);
    const n = list.filter((l) => done[l.id]).length;
    return { n, total: list.length, pct: list.length ? Math.round((n / list.length) * 100) : 0 };
  }

  // ---------- 공통 조각 ----------
  function sidebar(lv, currentId) {
    const done = loadDone();
    const isRef = lv.kind === "reference";
    const tabs = curriculum.levels.map((l) =>
      `<a href="#/${l.id}" class="${l.id === lv.id ? "on" : ""}">${esc(l.kind === "reference" ? "레퍼런스" : l.title.split(" · ")[0])}</a>`).join("");
    const cats = lv.categories.length === 0
      ? `<div class="empty-note">이 단계의 레슨은 준비 중입니다.</div>`
      : lv.categories.map((c) => `
          <div class="cat-title">${esc(c.title)}</div>
          ${c.lessons.map((l) => {
            if (l.soon) return `<a class="nav-btn soon" href="#/${lv.id}/${l.id}"><span>${esc(l.title)}</span><em>준비 중</em></a>`;
            const isDone = !isRef && !!done[l.id];
            const cls = [l.id === currentId ? "current" : "", isDone ? "done" : ""].join(" ");
            const chk = isRef ? "" : `<span class="chk" role="checkbox" aria-checked="${isDone}" tabindex="0" data-lesson="${l.id}" title="${isDone ? "완료 해제" : "학습 완료로 표시"}"></span>`;
            return `<a class="nav-btn ${cls}" href="#/${lv.id}/${l.id}" data-lv="${lv.id}" data-lesson="${l.id}">${chk}<span class="nm">${esc(l.title)}</span></a>`;
          }).join("")}`).join("");
    return `
      <aside class="pane side">
        <div class="side-head"><div class="lv">${esc(lv.title)}</div></div>
        <div class="side-levels">${tabs}</div>
        ${cats}
        ${isRef ? "" : `<div class="legend">
          <span><i style="background:var(--done)"></i>완료</span>
          <span><i style="background:var(--accent)"></i>학습 중</span>
          <span><i style="border:2px solid var(--muted)"></i>미학습</span>
        </div>`}
      </aside>`;
  }

  // 확인 체크 목록: 누를 수 있게 하고, 체크 상태를 이 브라우저에 저장
  function setupChecks(body, id) {
    const key = "cskit-checks-v1";
    const load = () => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; } };
    const saved = (load()[id]) || [];
    body.querySelectorAll('li input[type="checkbox"]').forEach((box, i) => {
      box.disabled = false;
      box.checked = !!saved[i];
      box.addEventListener("change", () => {
        const all = load();
        all[id] = [...body.querySelectorAll('li input[type="checkbox"]')].map((b) => b.checked);
        try { localStorage.setItem(key, JSON.stringify(all)); } catch (e) { /* 무시 */ }
      });
    });
  }

  // 완료 토글: 페이지를 다시 그리지 않고 사이드바·진행도·하단 버튼만 제자리에서 갱신
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("show"), 1600);
  }
  function toggleDone(id, announce) {
    const d = loadDone();
    d[id] = !d[id];
    saveDone(d);
    document.querySelectorAll(`.nav-btn[data-lesson="${id}"]`).forEach((a) => {
      a.classList.toggle("done", !!d[id]);
      const c = a.querySelector(".chk");
      if (c) { c.setAttribute("aria-checked", String(!!d[id])); c.title = d[id] ? "완료 해제" : "학습 완료로 표시"; }
    });
    const btn = document.getElementById("mark-done");
    if (btn && btn.dataset.id === id) {
      btn.textContent = d[id] ? "✔ 완료됨 (해제)" : "학습 완료 표시";
      btn.className = d[id] ? "btn finished" : "btn primary";
    }
    const lvId = (location.hash.split("/")[1]) || "";
    const lv = curriculum.levels.find((l) => l.id === lvId);
    const row = document.querySelector(".ring-row");
    if (lv && row) {
      const p = progress(lv);
      row.innerHTML = `${ring(p.pct)}<div><strong>${p.n} / ${p.total}</strong> 레슨 완료<br><span class="muted">${esc(lv.title)}</span></div>`;
    }
    if (announce || true) toast(d[id] ? "✔ 학습 완료로 표시했어요" : "완료 표시를 해제했어요");
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest && e.target.closest(".nav-btn .chk");
    if (!c) return;
    e.preventDefault(); e.stopPropagation();
    toggleDone(c.dataset.lesson, true);
  });
  document.addEventListener("keydown", (e) => {
    const c = e.target.closest && e.target.closest(".nav-btn .chk");
    if (c && (e.key === " " || e.key === "Enter")) { e.preventDefault(); toggleDone(c.dataset.lesson, true); }
  });

  function ring(pct) {
    const r = 26, c = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--border)" stroke-width="6"/>
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--done)" stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" transform="rotate(-90 32 32)"/>
      <text x="32" y="37" text-anchor="middle">${pct}%</text></svg>`;
  }

  function asidePanel(lv, lesson) {
    const isRef = lv.kind === "reference";
    const p = progress(lv);
    const parts = isRef || p.total === 0 ? [] : [`
      <div class="box">
        <h4>내 진행도</h4>
        <div class="ring-row">${ring(p.pct)}<div><strong>${p.n} / ${p.total}</strong> 레슨 완료<br><span class="muted">${esc(lv.title)}</span></div></div>
      </div>`];

    if (lesson) {
      parts.push(`
      <div class="box">
        <h4>${isRef ? "이 페이지" : "이 레슨 한눈에"}</h4>
        ${isRef ? `<span class="chip">찾아보기용</span>` : `<span class="chip">⏱ ${lesson.minutes || "?"}분</span>`}
        <span class="chip">Windows</span>
      </div>
      <div class="box" id="toc-box"></div>`);
      if (lesson.prompt) {
        parts.push(`
      <div class="box">
        <h4>Claude Code에 이렇게 물어보세요</h4>
        <div class="prompt-box" id="prompt-text">${esc(lesson.prompt)}</div>
        <button class="btn" id="copy-prompt">프롬프트 복사</button>
      </div>`);
      }
      parts.push(`
      <div class="box mini-links">
        <h4>공식 문서</h4>
        ${lesson.docsUrl ? `<a href="${esc(lesson.docsUrl)}" target="_blank" rel="noopener">공식 문서 열기 ↗</a>` : `<span class="muted">이 레슨은 공식 문서 링크가 없습니다</span>`}
        <div class="muted">기준일 ${esc(lesson.lastVerified || "-")}</div>
      </div>`);
    } else {
      parts.push(`
      <div class="box">
        <h4>${isRef ? "이 영역은" : "이 단계에서 배우는 것"}</h4>
        <span class="muted">${esc(lv.summary)}</span>
      </div>`);
    }
    return `<aside class="pane aside">${parts.join("")}</aside>`;
  }

  // ---------- 화면 ----------
  function renderHome() {
    window.CSKitHome.render(app, curriculum, { esc, progress });
    setTitle("Claude Code 학습 키트");
    window.scrollTo(0, 0);
  }

  function renderLevel(levelId) {
    const lv = findLevel(levelId);
    if (!lv) return render404();
    const list = levelLessons(lv);
    const done = loadDone();
    const firstTodo = list.find((l) => !done[l.id]) || list[0];
    const isRef = lv.kind === "reference";
    const center = isRef
      ? `<div class="lesson">
          <h1>${esc(lv.title)}</h1>
          <blockquote><p>${esc(lv.summary)}</p></blockquote>
          <p class="muted">학습용 레슨이 아니라 <strong>찾아보는 사전</strong>입니다. 완료 표시는 없고, 각 페이지에서 검색창으로 바로 찾을 수 있습니다.</p>
          <div class="cards" style="margin-top:20px">${list.map((l) => `
            <a class="card" href="#/${lv.id}/${l.id}"><h3>${esc(l.title)}</h3><p>${esc(l.catTitle)}</p></a>`).join("")}</div>
        </div>`
      : list.length === 0
      ? `<div class="lesson">
          <h1>${esc(lv.title)}</h1>
          <blockquote><p>${esc(lv.summary)}</p></blockquote>
          <div class="notice">이 단계의 레슨은 <strong>준비 중</strong>입니다. 아래 주제를 순서대로 공개할 예정입니다.</div>
          <div class="cards" style="margin-top:20px">${plannedLessons(lv).map((l) => `
            <a class="card soon" href="#/${lv.id}/${l.id}"><h3>${esc(l.title)}</h3><p>${esc(l.catTitle)} · 준비 중</p></a>`).join("")}</div>
        </div>`
      : `<div class="lesson">
          <h1>${esc(lv.title)}</h1>
          <blockquote><p>${esc(lv.summary)}</p></blockquote>
          <p class="muted">왼쪽에서 레슨을 골라 학습하세요. 완료한 레슨은 초록색으로 표시됩니다.</p>
          <div class="lesson-nav"><a class="btn primary" href="#/${lv.id}/${firstTodo.id}">${done[firstTodo.id] ? "처음부터 복습하기" : "이어서 학습하기"} →</a></div>
        </div>`;
    app.innerHTML = `<div class="shell">${sidebar(lv, null)}<section class="pane center">${center}</section>${asidePanel(lv, null)}</div>`;
    setTitle(lv.title);
    window.scrollTo(0, 0); restoreSide();
  }

  // 왼쪽 목차는 화면을 다시 그릴 때마다 새로 만들어져 스크롤이 맨 위로 돌아가므로, 이전 위치를 기억해 복원
  let sideY = null;
  function restoreSide() {
    const side = document.querySelector(".side");
    if (!side) return;
    if (sideY !== null) { side.scrollTop = sideY; return; }
    const cur = side.querySelector(".nav-btn.current");   // 다른 화면에서 들어왔다면 현재 레슨이 보이게
    if (cur) side.scrollTop = Math.max(0, cur.offsetTop - side.clientHeight / 2);
  }

  async function renderLesson(levelId, lessonId) {
    const lv = findLevel(levelId);
    if (!lv) return render404();
    const list = levelLessons(lv);
    const idx = list.findIndex((l) => l.id === lessonId);
    if (idx < 0) {
      const planned = plannedLessons(lv).find((l) => l.id === lessonId);
      if (!planned) return render404();
      app.innerHTML = `<div class="shell">${sidebar(lv, lessonId)}
        <section class="pane center">
          <div class="crumbs"><a href="#/">홈</a> › <a href="#/${lv.id}">${esc(lv.title)}</a> › ${esc(planned.catTitle)}</div>
          <div class="lesson"><h1>${esc(planned.title)}</h1>
            <blockquote><p>${esc(planned.summary || "")}</p></blockquote>
            <div class="notice">이 레슨은 <strong>준비 중</strong>입니다. 공개되면 이 자리에서 바로 볼 수 있습니다.</div>
            ${planned.docsUrl ? `<p>그동안은 공식 문서를 먼저 보세요: <a href="${esc(planned.docsUrl)}" target="_blank" rel="noopener">공식 문서 열기 ↗</a></p>` : ""}
            <div class="lesson-nav"><a class="btn" href="#/${lv.id}">← ${esc(lv.title)} 목록</a></div>
          </div>
        </section>${asidePanel(lv, null)}</div>`;
      window.scrollTo(0, 0); restoreSide();
      setTitle(planned.title + " (준비 중)");
      return;
    }
    const lesson = list[idx];
    const prev = list[idx - 1];
    const next = list[idx + 1];

    const isRef = lv.kind === "reference";
    app.innerHTML = `<div class="shell">${sidebar(lv, lessonId)}
      <section class="pane center">
        <div class="crumbs"><a href="#/">홈</a> › <a href="#/${lv.id}">${esc(lv.title)}</a> › ${esc(lesson.catTitle)}</div>
        ${isRef ? `<div class="filterbar"><input id="ref-filter" type="search" autocomplete="off" placeholder="명령·키워드 검색 (예: compact, worktree, 비용)"><span id="ref-count" class="muted"></span></div>` : ""}
        <div class="lesson ${isRef ? "ref" : ""}" id="lesson-body"><p class="muted">불러오는 중…</p></div>
        <nav class="lesson-nav">
          ${prev ? `<a class="btn" href="#/${lv.id}/${prev.id}">← ${esc(prev.title)}</a>` : "<span></span>"}
          ${isRef ? "<span></span>" : `<button class="btn" id="mark-done" data-id="${lesson.id}"></button>`}
          ${next ? `<a class="btn" href="#/${lv.id}/${next.id}">${esc(next.title)} →</a>` : "<span></span>"}
        </nav>
      </section>${asidePanel(lv, lesson)}</div>`;
    window.scrollTo(0, 0); restoreSide();
    setTitle(lesson.title);

    const body = document.getElementById("lesson-body");
    try {
      const res = await fetch(lesson.file, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      const md = await res.text();
      body.innerHTML = window.marked ? marked.parse(md) : `<pre>${esc(md)}</pre>`;
      if (window.hljs) body.querySelectorAll("pre code").forEach((b) => hljs.highlightElement(b));
      buildToc(body);
      setupChecks(body, lesson.id);
      if (isRef) setupFilter(body);
    } catch (e) {
      body.innerHTML = `<div class="notice">레슨을 불러오지 못했습니다. 로컬에서는 <code>node tools/serve.mjs</code>로 실행하세요.</div>`;
    }

    // 완료 표시
    const btn = document.getElementById("mark-done");
    if (btn) {
      const sync = () => {
        const d = loadDone();
        btn.textContent = d[lesson.id] ? "✔ 완료됨 (해제)" : "학습 완료 표시";
        btn.className = d[lesson.id] ? "btn finished" : "btn primary";
      };
      sync();
      btn.addEventListener("click", () => toggleDone(lesson.id, true));
    }

    // 프롬프트 복사
    const copy = document.getElementById("copy-prompt");
    if (copy) {
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(lesson.prompt);
          copy.textContent = "복사됨 ✔";
        } catch (e) {
          copy.textContent = "직접 선택해서 복사하세요";
        }
        setTimeout(() => (copy.textContent = "프롬프트 복사"), 1500);
      });
    }
  }

  // 레퍼런스 표 검색: 입력한 글자가 들어 있는 행만 남기고, 빈 분류는 숨김
  function setupFilter(body) {
    const input = document.getElementById("ref-filter");
    const count = document.getElementById("ref-count");
    if (!input) return;
    // 분류 표 = "(숫자)"로 끝나는 h2 + 바로 뒤의 표
    const sections = [];
    body.querySelectorAll("h2").forEach((h) => {
      if (!/\(\d+\)\s*$/.test(h.textContent)) return;
      let n = h.nextElementSibling;
      while (n && n.tagName !== "TABLE" && n.tagName !== "H2") n = n.nextElementSibling;
      if (n && n.tagName === "TABLE") sections.push({ h, table: n, rows: [...n.querySelectorAll("tbody tr")] });
    });
    if (!sections.length) { input.parentElement.remove(); return; }
    const intro = [];
    for (let el = body.firstElementChild; el && el !== sections[0].h; el = el.nextElementSibling) intro.push(el);
    const total = sections.reduce((n, s) => n + s.rows.length, 0);
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      sections.forEach((s) => {
        let vis = 0;
        s.rows.forEach((r) => { const ok = !q || r.textContent.toLowerCase().includes(q); r.hidden = !ok; if (ok) vis++; });
        s.h.hidden = s.table.hidden = vis === 0;
        shown += vis;
      });
      intro.forEach((el) => { el.hidden = !!q; });
      count.textContent = q ? `${total}개 중 ${shown}개` : `전체 ${total}개`;
    };
    input.addEventListener("input", apply);
    apply();
  }

  // 본문 h2 → 오른쪽 "이 페이지 목차"
  function buildToc(body) {
    const box = document.getElementById("toc-box");
    if (!box) return;
    const heads = [...body.querySelectorAll("h2")];
    if (heads.length === 0) { box.remove(); return; }
    heads.forEach((h, i) => { h.id = `sec-${i}`; });
    box.innerHTML = `<h4>이 페이지 목차</h4><ul class="toc">${heads.map((h, i) =>
      `<li><a href="javascript:void(0)" data-t="sec-${i}">${esc(h.textContent)}</a></li>`).join("")}</ul>`;
    box.querySelectorAll("a[data-t]").forEach((a) =>
      a.addEventListener("click", () => document.getElementById(a.dataset.t).scrollIntoView({ behavior: "smooth" })));
  }

  function render404() {
    app.innerHTML = `<div class="container"><div class="notice">페이지를 찾을 수 없습니다. <a href="#/">홈으로 돌아가기</a></div></div>`;
    setTitle("찾을 수 없음");
  }

  // ---------- 라우터 ----------
  function route() {
    if (!curriculum) return;
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts.length === 0) return renderHome();
    if (parts.length === 1) return renderLevel(parts[0]);
    if (parts.length === 2) return renderLesson(parts[0], parts[1]);
    render404();
  }

  async function init() {
    try {
      const res = await fetch("content/curriculum.json", { cache: "no-cache" });
      curriculum = await res.json();
      const el = document.getElementById("docs-check");
      if (el && curriculum.lastDocsCheck) el.textContent = `공식 문서 마지막 점검: ${curriculum.lastDocsCheck}`;
    } catch (e) {
      app.innerHTML = `<div class="container"><div class="notice">목차를 불러오지 못했습니다. 로컬에서는 <code>node tools/serve.mjs</code>로 실행하세요.</div></div>`;
      return;
    }
    // 되돌리기: 이동하기 전 화면의 주소와 스크롤 위치를 기억해 두고, 버튼을 누르면 그 자리로 돌아감
    const backBtn = document.getElementById("back-btn");
    const stack = [];
    let prevHash = location.hash, lastY = 0, going = null;
    window.addEventListener("scroll", () => { lastY = window.scrollY; }, { passive: true });
    const syncBack = () => { if (backBtn) backBtn.hidden = stack.length === 0; };
    if (backBtn) backBtn.addEventListener("click", () => {
      const prev = stack.pop();
      if (!prev) return;
      going = prev;
      syncBack();
      if (location.hash === prev.hash) { route(); going = null; } else location.hash = prev.hash;
    });
    const go = async () => {
      const restore = going; going = null;
      await route();
      if (restore) window.scrollTo(0, restore.y);
      syncBack();
    };
    window.addEventListener("hashchange", () => {
      const sideEl = document.querySelector(".side");
      sideY = sideEl ? sideEl.scrollTop : null;
      if (!going) { stack.push({ hash: prevHash, y: lastY }); if (stack.length > 50) stack.shift(); }
      prevHash = location.hash;
      go();
    });
    prevHash = location.hash;
    go();
  }

  init();
})();
