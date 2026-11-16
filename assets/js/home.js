// 홈(소개) 화면. app.js 에서 호출합니다.
window.CSKitHome = (() => {
  const icon = (d) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    file: icon('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
    play: icon('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3z"/>'),
    memory: icon('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>'),
    shield: icon('<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    plug: icon('<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>'),
    branch: icon('<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10"/><path d="M18 11c0 4-6 3-12 6"/>'),
    mic: icon('<path d="M5 6h14M5 12h14M5 18h9"/>'),
    doc: icon('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    search: icon('<circle cx="11" cy="11" r="6"/><path d="m20 20-4-4"/>'),
    chart: icon('<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'),
    code: icon('<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14"/>'),
    loop: icon('<path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 0 0-9 3"/><path d="M20 12a8 8 0 0 1-14 5l-2 2v-6h6l-2 2a5 5 0 0 0 9-3"/>'),
  };

  const FEATURES = [
    { ic: "file", t: "파일을 읽고 직접 수정", d: "복사·붙여넣기 없이 내 폴더의 파일을 고칩니다.", to: "#/level1/what-is-claude-code" },
    { ic: "play", t: "실행하고 스스로 확인", d: "결과를 돌려 보고 오류가 나면 다시 시도합니다.", to: "#/level2/prompting" },
    { ic: "memory", t: "프로젝트를 기억", d: "CLAUDE.md에 규칙을 적어 두면 매번 설명하지 않아도 됩니다.", to: "#/level2/init-claudemd" },
    { ic: "shield", t: "안전장치 내장", d: "권한 확인, 플랜 모드, 되돌리기로 안심하고 맡깁니다.", to: "#/level2/permissions" },
    { ic: "plug", t: "외부 도구 연결", d: "MCP로 문서·코드·데이터베이스를 직접 다룹니다.", to: "#/level2/mcp" },
    { ic: "branch", t: "여러 일을 동시에", d: "서브에이전트와 worktree로 작업을 나눠 맡깁니다.", to: "#/level2/subagents" },
  ];

  const USECASES = [
    { ic: "mic", t: "회의와 업무 기록", p: "회의 메모에서 결정사항·담당자·마감일을 표로 뽑아 줘", to: "#/level2/mini-project" },
    { ic: "doc", t: "문서와 발표 자료", p: "이 보고서를 임원용 5줄 요약으로 바꿔 줘", to: "#/level2/prompting" },
    { ic: "search", t: "자료 조사와 지식 검색", p: "이 폴더 문서에서 환불 규정 관련 내용과 출처를 찾아 줘", to: "#/level2/prompting" },
    { ic: "chart", t: "데이터 분석과 시각화", p: "이 CSV에서 이상값을 찾고 월별 추이 차트를 만들어 줘", to: "#/level2/prompting" },
    { ic: "code", t: "개발과 검증", p: "이 요구사항으로 테스트 케이스를 만들고 실행해 줘", to: "#/level2/plan-mode" },
    { ic: "loop", t: "반복 작업 자동화", p: "매주 보고서 초안을 만드는 스크립트를 만들어 줘", to: "#/level2/subagents" },
  ];

  function render(app, curriculum, h) {
    const { esc, progress } = h;
    const learn = curriculum.levels.filter((lv) => lv.kind !== "reference"); // 학습 단계만 (레퍼런스 제외)
    const open = (c) => c.lessons.filter((l) => !l.soon); // 준비 중인 레슨은 개수·시간에서 제외
    const total = learn.reduce((n, lv) => n + lv.categories.reduce((m, c) => m + open(c).length, 0), 0);
    const first = learn[0];

    const levelCards = learn.map((lv, i) => {
      const p = progress(lv);
      const ready = p.total > 0;
      const mins = lv.categories.reduce((n, c) => n + open(c).reduce((m, l) => m + (l.minutes || 0), 0), 0);
      const planned = lv.categories.flatMap((c) => c.lessons.filter((l) => l.soon)).slice(0, 4).map((l) => l.title);
      const tag = ready ? `레슨 ${p.total}개 · 약 ${mins}분` : "준비 중";
      const prog = ready ? `<div class="bar"><i style="width:${p.pct}%"></i></div><span class="mini">${p.n}/${p.total} 완료</span>` : `<span class="mini">곧 공개됩니다${planned.length ? ` · ${esc(planned.join(" · "))} 등` : ""}</span>`;
      return `
        <a class="lvcard ${ready ? "" : "soon"}" href="#/${lv.id}">
          <div class="lvno">0${i + 1}</div>
          <h3>${esc(lv.title.split(" · ")[1])}</h3>
          <p>${esc(lv.summary)}</p>
          <div class="lvmeta"><span class="chip">${tag}</span></div>
          ${prog}
        </a>`;
    }).join("");

    app.innerHTML = `
    <div class="home">
      <section class="hero2">
        <div class="hero2-text">
          <span class="eyebrow">Windows · 공식 문서 기준 · 이미지로 배우는 가이드</span>
          <h1>말로 시키면,<br><em>일이 끝납니다.</em></h1>
          <p class="lead">Claude Code는 내 PC의 파일을 읽고, 고치고, 실행하고, 확인까지 하는 AI 에이전트입니다.<br>설치부터 실전까지, <strong>필요한 만큼만</strong> 배우세요.</p>
          <div class="cta">
            <a class="btn primary big" href="#/${first.id}/${first.categories[0].lessons[0].id}">첫 요청까지 20분 →</a>
            <button class="btn big" data-scroll="levels">단계 둘러보기</button>
          </div>
          <ul class="facts">
            <li><b>${total}</b><span>개 레슨</span></li>
            <li><b>1줄</b><span>설치 명령</span></li>
            <li><b>실제 실행</b><span>화면 포함</span></li>
          </ul>
        </div>
        <div class="hero2-art"><img src="assets/img/hero-session.svg" alt="Claude Code가 회의록을 표로 정리하는 예시 화면"></div>
      </section>

      <section class="for">
        <h2 class="sec-title">이런 분을 위해 만들었습니다</h2>
        <div class="for-grid">
          <div class="for-card"><span>“</span><p>AI 활용 사례를 보며 <strong>"나도 해 볼 수 있지 않을까?"</strong> 싶었던 적이 있다면</p></div>
          <div class="for-card"><span>“</span><p>챗봇은 써 봤지만 <strong>AI 에이전트는 어디서 시작할지</strong> 막막하다면</p></div>
          <div class="for-card"><span>“</span><p>긴 강의를 들을 여유는 없어도 <strong>제대로 쓰고 싶다면</strong></p></div>
        </div>
      </section>

      <section class="split">
        <div>
          <h2 class="sec-title">챗봇과 무엇이 다를까요?</h2>
          <p class="sec-sub">챗봇은 <strong>답을 줍니다.</strong> 에이전트는 <strong>일을 끝냅니다.</strong></p>
          <ul class="ticks">
            <li>챗봇: 글로 답하면, 사람이 그 답을 보고 직접 작업합니다</li>
            <li>Claude Code: 파일에 바로 반영하고, 실행해 보고, 오류는 스스로 고칩니다</li>
            <li>모든 변경은 <strong>내 확인</strong>을 거치고, 필요하면 되돌릴 수 있습니다</li>
          </ul>
          <a class="textlink" href="#/level1/what-is-claude-code">자세히 보기 →</a>
        </div>
        <div class="split-art"><img src="assets/img/model-vs-agent.svg" alt="AI 모델과 AI 에이전트의 차이"></div>
      </section>

      <section>
        <h2 class="sec-title">Claude Code가 해 주는 일</h2>
        <p class="sec-sub">공식 문서에 있는 기능만 소개합니다. 카드를 누르면 해당 레슨으로 이동합니다.</p>
        <div class="feat-grid">
          ${FEATURES.map((f) => `
            <a class="feat" href="${f.to}">
              <span class="ic">${ICONS[f.ic]}</span>
              <h3>${esc(f.t)}</h3>
              <p>${esc(f.d)}</p>
            </a>`).join("")}
        </div>
      </section>

      <section>
        <h2 class="sec-title">내 업무에는 이렇게</h2>
        <p class="sec-sub">업무에서 자주 하는 일에 맞춘 요청 예시입니다. 그대로 따라 해 보세요.</p>
        <div class="use-grid">
          ${USECASES.map((u) => `
            <a class="use" href="${u.to}">
              <div class="use-head"><span class="ic sm">${ICONS[u.ic]}</span><h3>${esc(u.t)}</h3></div>
              <div class="say"><span>&gt;</span> ${esc(u.p)}</div>
            </a>`).join("")}
        </div>
      </section>

      <section id="levels-anchor" data-anchor="levels">
        <h2 class="sec-title">나에게 맞는 단계를 고르세요</h2>
        <p class="sec-sub">처음이라면 1단계부터, 이미 써 봤다면 바로 2단계로 가도 됩니다.</p>
        <div class="lv-grid">${levelCards}</div>
      </section>

      <section class="refpromo">
        <div class="refpromo-text">
          <span class="eyebrow">스펙 레퍼런스</span>
          <h2 class="sec-title">이미 써 보셨다면, 찾아보세요.</h2>
          <p class="sec-sub">Commands, CLI reference, 오류 메시지, Git, PowerShell, MCP, 서브에이전트까지<br>한국어 표로 정리했습니다. 검색창에 키워드만 입력하면 바로 거를 수 있습니다.</p>
          <a class="btn big" href="#/ref/slash-all">스펙 레퍼런스 보기 →</a>
        </div>
        <div class="refpromo-art" aria-hidden="true">
          <div class="rp-search">🔍 compact</div>
          <div class="rp-row"><code>/compact [instructions]</code><span>대화를 요약해 컨텍스트 공간을 확보</span></div>
          <div class="rp-row"><code>/autocompact</code><span>자동 compact 시점을 설정</span></div>
          <div class="rp-row dim"><code>/context [all]</code><span>컨텍스트 사용량을 격자로 표시</span></div>
        </div>
      </section>

      <section class="final">
        <h2>오늘 20분, 첫 요청까지 해 보세요.</h2>
        <p>설치하고, 로그인하고, 말로 시켜 보면 이 가이드의 나머지는 훨씬 쉬워집니다.</p>
        <a class="btn primary big" href="#/${first.id}/${first.categories[0].lessons[0].id}">시작하기 →</a>
        <p class="basis">모든 내용은 <a href="https://code.claude.com/docs" target="_blank" rel="noopener">Claude Code 공식 문서</a>를 근거로 합니다 · 마지막 점검 ${esc(curriculum.lastDocsCheck || "-")}</p>
      </section>
    </div>`;

    app.querySelectorAll("[data-scroll]").forEach((b) =>
      b.addEventListener("click", () => {
        const t = app.querySelector(`[data-anchor="${b.dataset.scroll}"]`);
        if (t) t.scrollIntoView({ behavior: "smooth" });
      }));
  }

  return { render };
})();
