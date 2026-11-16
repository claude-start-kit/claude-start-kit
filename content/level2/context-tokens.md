# 컨텍스트와 토큰

> **컨텍스트 = Claude가 한 번에 올려 두고 보는 작업 책상**입니다. 책상이 꽉 차면 느려지고, 정확도가 떨어지고, 비용이 늘어납니다.

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 330" font-family="'Malgun Gothic','Pretendard',sans-serif">
  <rect width="760" height="330" rx="16" fill="#151922"/>
  <text x="24" y="34" fill="#ff8a5c" font-size="15" font-weight="700">컨텍스트 = Claude가 한 번에 기억하는 작업 책상</text>
  <rect x="24" y="52" width="712" height="44" rx="10" fill="#0b0e14" stroke="#343c52"/>
  <a href="#/level2/markdown-basics" class="svg-link"><title>CLAUDE.md는 마크다운(.md) 파일입니다. 눌러서 알아보기</title><rect x="26" y="54" width="90" height="40" rx="8" fill="#6366f1"/></a><rect x="118" y="54" width="170" height="40" rx="8" fill="#0ea5e9"/><rect x="290" y="54" width="250" height="40" rx="8" fill="#ff8a5c"/>
  <g font-size="12" text-anchor="middle" fill="#0b0e14" font-weight="700">
    <a href="#/level2/markdown-basics" class="svg-link"><text x="71" y="79" text-decoration="underline">CLAUDE.md 등</text></a><text x="203" y="79">읽은 파일</text><text x="415" y="79">대화 · 실행 결과</text>
  </g>
  <text x="640" y="79" fill="#8b93a7" font-size="12" text-anchor="middle">남은 공간</text>
  <text x="24" y="124" fill="#8b93a7" font-size="13">가득 차면 느려지고, 앞부분을 잊고, 비용이 늘어납니다</text>
  <g font-size="14">
    <rect x="24" y="146" width="226" height="150" rx="14" fill="#222838" stroke="#343c52"/>
    <text x="40" y="176" fill="#ffd9c8" font-family="Consolas,monospace" font-size="17">/context</text>
    <text x="40" y="202" fill="#e6e9f2">지금 뭐가 얼마나</text><text x="40" y="222" fill="#e6e9f2">차 있는지 확인</text>
    <text x="40" y="276" fill="#8b93a7" font-size="12">먼저 진단</text>
    <rect x="267" y="146" width="226" height="150" rx="14" fill="#222838" stroke="#343c52"/>
    <text x="283" y="176" fill="#ffd9c8" font-family="Consolas,monospace" font-size="17">/compact</text>
    <text x="283" y="202" fill="#e6e9f2">대화를 요약해서</text><text x="283" y="222" fill="#e6e9f2">공간 확보 (이어서 작업)</text>
    <text x="283" y="276" fill="#8b93a7" font-size="12">같은 주제를 계속할 때</text>
    <rect x="510" y="146" width="226" height="150" rx="14" fill="#2b1f1a" stroke="#ff8a5c"/>
    <text x="526" y="176" fill="#ffd9c8" font-family="Consolas,monospace" font-size="17">/clear</text>
    <text x="526" y="202" fill="#e6e9f2">빈 컨텍스트로</text><text x="526" y="222" fill="#e6e9f2">새로 시작</text>
    <text x="526" y="276" fill="#c9a18d" font-size="12">주제가 바뀔 때 (가장 효과적)</text>
  </g>
</svg>

## 컨텍스트는 이렇게 쌓입니다
Claude는 새 요청을 받을 때마다 **지금까지의 대화를 모두 다시 읽고** 답합니다.

```text
1. 나: 요청
2. Claude: 응답
3. 나: 요청     ← Claude는 1, 2를 함께 보고 답함
4. Claude: 응답
5. 나: 요청     ← Claude는 1, 2, 3, 4를 함께 보고 답함
```

여기서 **1, 2, 3, 4가 컨텍스트**입니다. 대화가 길어질수록 책상 위 내용이 늘어납니다.

## 쌓이면 어떻게 되나
| 책상 위가 많아지면 | 이유 |
|---|---|
| **토큰(비용·한도)을 빨리 씁니다** | 요청할 때마다 쌓인 내용을 다시 읽습니다 |
| **정확도가 떨어질 수 있습니다** | 앞쪽 지시를 놓치거나 헷갈립니다 |
| **느려집니다** | 읽을 양이 많아집니다 |

> **토큰**은 Claude가 글을 읽고 쓰는 단위입니다. 사용량·한도는 토큰으로 계산됩니다.

## 무엇이 컨텍스트를 채우나
- 내 지시와 Claude의 답
- Claude가 **읽은 파일**과 명령 실행 결과
- 시작할 때 읽는 [CLAUDE.md](#/level2/markdown-basics), 메모리, 도구 목록

## 책상을 정리하는 습관 3가지
1. **주제가 바뀌면 `/clear`** — 가장 효과가 큽니다
2. **같은 주제를 계속하면 `/compact`** — 초점을 줄 수 있습니다
   ```text
   /compact 로그인 버그 수정 내용 위주로 요약해 줘
   ```
3. **가끔 `/context`로 확인** — 무엇이 공간을 쓰는지 보여 줍니다

> **`/context` 보는 법**
> ```text
> Tokens: 165.3k / 1m (17%)      ← 책상이 얼마나 찼는지
> Messages        131.6k         ← 우리 대화 내용(요청·응답·읽은 파일·실행 결과)
> System prompt    3k            ← 시작할 때 이미 올라가 있는 기본 내용
> ```
> **Messages가 우리 대화입니다.** 대화가 길어지면 이 숫자가 커집니다.
>
> **팁:** 맨 위 퍼센트(%)가 절반을 넘어가면 `/compact`로 책상을 압축해 보세요. 압축해도 Claude는 **지금까지의 핵심을 요약해서 기억**하므로 이어서 작업할 수 있습니다. 다만 세세한 내용은 빠질 수 있으니, 꼭 지켜야 할 규칙은 CLAUDE.md에 적어 두세요.

<details>
<summary>자동 compact (auto-compact)</summary>

책상이 한도에 가까워지면 Claude Code가 **알아서 `/compact`를 실행**합니다. 이것이 **기본값(켜짐)** 입니다.

- 편리하지만 **내가 정하지 않은 시점**에 요약이 일어납니다. 지금 하던 일의 중요한 부분이 요약에서 빠질 수도 있습니다.
- 끄고 켜는 곳: `/config` → **Auto-compact**

> **팁:** 이 키트는 **auto-compact를 끄고, `/context`로 확인하며 직접 `/compact`하는 방법**을 권장합니다. 정리할 시점과 남길 내용(`/compact 로그인 버그 수정 내용 위주로`)을 내가 정할 수 있기 때문입니다.
>
> **단, 끄면 책임도 내게 옵니다.** 책상이 가득 차면 `Context limit reached · /compact or /clear to continue` 메시지가 나오며 **더 진행되지 않습니다.** 그 전에 `/compact`를 하세요. 자주 잊는다면 켜 두는 편이 안전합니다.

</details>

## 토큰을 아끼는 방법 (공식 권장)
- 관련 없는 작업 사이에 `/clear`
- 쓰지 않는 MCP 서버는 `/mcp`에서 끄기
- 긴 로그·테스트 출력은 **서브에이전트에 맡기기**
- CLAUDE.md는 짧게 (200줄 이하 권장)

## 확인 체크
- [ ] `/context`를 실행해 봤다
- [ ] 주제를 바꿀 때 `/clear`를 쓴다

## 자주 하는 실수
- 한 대화로 **모든 일을 처리** → 요약이 쌓이다 정확도가 떨어집니다
- 한도에 가까워지면 자동으로 compact 되지만, **중요한 지시는 CLAUDE.md**에 적어 두세요
