# GitHub Actions·CI 연동

> **GitHub Actions**는 GitHub 저장소에서 자동으로 돌아가는 작업 흐름입니다. 여기에 Claude Code를 연결하면 **PR·이슈 댓글에 `@claude`라고 부르거나, 정해진 시각·이벤트마다** Claude가 저장소에서 일합니다.

> 이 레슨은 GitHub에 저장소가 있고 **저장소 관리자(admin) 권한**이 있을 때 따라 할 수 있습니다. [Git과 GitHub 기초](#/level2/git-basics)를 먼저 보면 좋습니다.

## 어떤 일을 시킬 수 있나
- 이슈 내용을 보고 **PR 만들기** ("`@claude` 이 이슈대로 구현해 줘")
- 댓글로 **버그 수정** 요청 ("`@claude` 대시보드의 TypeError를 고쳐 줘")
- PR이 열릴 때마다 **코드 검토**
- 매일·매주 **보고서·점검 작업**

> 이름이 비슷한 기능이 여럿 있습니다. 이 레슨은 **워크플로 파일(`.github/workflows/*.yml`)로 설정하는 `claude-code-action`** 을 다룹니다. 워크플로 없이 PR마다 자동 검토만 받고 싶다면 공식 문서의 **Code Review** 기능을, 클라우드에서 도는 세션은 **Claude Code on the web** 문서를 보세요.

## 준비물
| 준비물 | 설명 |
|---|---|
| GitHub 저장소 | github.com 저장소만 가능 (GitLab은 별도의 GitLab CI/CD 문서) |
| 저장소 **admin 권한** | 앱 설치·시크릿 등록에 필요 |
| 인증 정보 | **API 키**(`ANTHROPIC_API_KEY`) 또는 **구독 토큰**(`CLAUDE_CODE_OAUTH_TOKEN`) |
| GitHub CLI (`gh`) | 빠른 설정에서 필요. `gh auth login`으로 로그인 |

## 설정하기

### 방법 1. 빠른 설정 (권장)
Claude Code에서 명령 하나로 설정합니다.

1. 저장소 폴더에서 `claude`를 실행합니다
2. `/install-github-app`을 입력합니다
3. 브라우저가 열리면 **Claude GitHub 앱**을 저장소에 설치하고 Claude Code로 돌아와 Enter
4. **Set up GitHub Actions workflows**를 선택합니다. `@claude` 멘션 워크플로와 PR 검토 워크플로 중 필요한 것만 남길 수 있습니다
5. 인증 방식을 고릅니다: **구독으로 만든 장기 토큰** 또는 **API 키** 붙여넣기. 저장소 시크릿에 `CLAUDE_CODE_OAUTH_TOKEN` 또는 `ANTHROPIC_API_KEY`라는 이름으로 저장됩니다
6. 변경 목록을 확인하고 **Yes, make these changes**
7. Claude Code가 워크플로 파일이 든 브랜치를 올리고 **PR 생성 화면**을 엽니다. **그 PR을 만들어 머지해야** 켜집니다

설정 후 **이슈 댓글에 `@claude`를 써서** 시험해 보세요.

> 빠른 설정은 github.com 저장소에서만 동작합니다. Amazon Bedrock·Google Cloud·Microsoft Foundry를 쓴다면 공식 문서의 "클라우드 공급자와 함께 사용" 페이지를 보세요.

### 방법 2. 직접 설정
Claude Code를 로컬에서 쓰지 않거나, 빠른 설정이 실패했거나, 워크플로를 직접 통제하고 싶을 때입니다.

1. [Claude GitHub 앱](https://github.com/apps/claude)을 저장소에 설치합니다
2. 저장소 **Settings → Secrets and variables → Actions**에서 시크릿을 추가합니다
   - `ANTHROPIC_API_KEY`: [Claude Console](https://platform.claude.com)에서 만든 API 키
   - 또는 `CLAUDE_CODE_OAUTH_TOKEN`: 내 컴퓨터에서 `claude setup-token`으로 만든 구독 토큰 (Pro, Max, Ultra, Team, Enterprise)
3. 워크플로 파일을 `.github/workflows/`에 넣습니다 (아래 예시 참고)

## 두 가지 동작 방식
워크플로에 **`prompt`가 있느냐**로 방식이 정해집니다.

| 방식 | 조건 | 동작 |
|---|---|---|
| **대화형** | `prompt` 없음 | 이슈·PR 댓글, PR 리뷰, 새 이슈의 제목·본문에 **`@claude`가 있을 때** 응답. 진행 상황과 결과는 **댓글**로 표시 |
| **자동화** | `prompt` 있음 | 멘션을 기다리지 않고 **바로 실행**. 결과는 기본적으로 **실행 로그**에 표시 (프롬프트가 지시하고 도구가 있으면 댓글도 가능) |

### 누가 실행시킬 수 있나
두 방식 모두 실행 전에 두 가지를 확인하고, 하나라도 통과하지 못하면 실행이 실패합니다.
- **쓰기 권한**: 이슈·PR 이벤트에서는 요청한 사용자에게 **저장소 쓰기 권한**이 있어야 합니다. `schedule`처럼 사람이 만들지 않은 이벤트는 이 확인을 건너뜁니다
- **사람 확인**: 봇이 Claude를 무한히 부르지 않도록 **봇 계정은 거부**됩니다 (`allowed_bots`에 적으면 허용). 예약 실행도 해당합니다. GitHub은 예약 실행을 `cron`을 마지막으로 고친 사용자의 실행으로 보므로, 그 사용자가 봇이면 `allowed_bots`에 적어야 합니다

## 예시 1. `@claude` 멘션에 응답하기
`.github/workflows/claude.yml`
```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

<details>
<summary>예시 읽는 법</summary>

| 항목 | 쉬운 설명 |
|---|---|
| `on:` | **언제** 실행할지. 이슈·PR에 댓글이 달릴 때입니다 |
| `if: contains(..., '@claude')` | 댓글에 `@claude`가 있을 때만 실행해 **불필요한 실행을 막습니다** |
| `runs-on: ubuntu-latest` | GitHub가 빌려주는 리눅스 가상 컴퓨터에서 실행합니다 |
| `permissions` | 이 작업이 저장소에서 **할 수 있는 일**의 범위입니다. 필요한 만큼만 주세요 |
| `actions/checkout` | 저장소 코드를 가상 컴퓨터로 **내려받아** Claude가 작업할 수 있게 합니다 |
| `anthropics/claude-code-action@v1` | Claude Code를 실행하는 **공식 액션** |
| `${{ secrets.ANTHROPIC_API_KEY }}` | 저장소 **시크릿**에 저장한 키를 꺼내 씁니다. 키를 파일에 직접 쓰지 않습니다 |

> 구독 토큰을 쓴다면 `anthropic_api_key:` 줄을 `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}`으로 바꿉니다.

</details>

이제 이슈나 PR 댓글에 이렇게 씁니다.
```text
@claude 이슈 설명대로 이 기능을 구현해 줘
@claude 이 엔드포인트에 사용자 인증을 어떻게 넣는 게 좋을까?
@claude 사용자 대시보드 컴포넌트의 TypeError를 고쳐 줘
```
Claude가 **같은 이슈·PR에 댓글로 답하고 진행 상황을 갱신**합니다.

## 예시 2. 매일 아침 보고서 (예약 + 자동화 방식)
`prompt`를 주면 멘션 없이 어떤 이벤트에서도 실행됩니다. 아래는 매일 09:00(UTC)에 실행 로그에 보고서를 남깁니다.

```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: read
      id-token: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "어제의 커밋과 열린 이슈를 요약해 줘"
          claude_args: |
            --model claude-opus-5-5
            --allowedTools "mcp__github__list_commits,mcp__github__list_issues"
```
- `cron`은 **UTC 기준**입니다. 한국 시간 오전 9시는 UTC 0시이므로 `0 0 * * *`입니다 ([cron 식 읽는 법](#/level3/scheduled))
- 평문 프롬프트로는 Claude에게 쉘·GitHub API 권한이 **없습니다.** 필요한 도구를 `--allowedTools`로 허용해야 합니다
- 이 예시는 GitHub API로 커밋·이슈를 읽으므로 `checkout` 단계가 없어도 됩니다

## 예시 3. PR이 열릴 때 코드 검토하기
```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]
jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
      issues: read
      id-token: write
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 1
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          plugin_marketplaces: "https://github.com/anthropics/claude-plugins-official.git"
          plugins: "code-review@claude-plugins-official"
          prompt: "/code-review:code-review --comment ${{ github.repository }}/pull/${{ github.event.pull_request.number }}"
          claude_args: '--allowedTools "mcp__github_inline_comment__create_inline_comment"'
```
- `prompt`에 **스킬 호출**(`/플러그인:스킬`)을 넣을 수 있습니다. 저장소의 `.claude/skills/` 스킬을 쓰려면 `checkout`이 **먼저** 있어야 합니다
- `--comment`가 있어야 검토 결과가 **PR에 댓글로** 달립니다. 없으면 실행 로그에만 남습니다
- `claude_args`의 `--allowedTools` 줄은 **빼지 마세요.** 인라인 댓글 서버가 이 줄이 있을 때만 시작됩니다
- 초안(draft)·닫힌 PR, 이미 Claude 댓글이 있는 PR 등은 건너뜁니다

## 자주 쓰는 설정값
| 입력 | 설명 |
|---|---|
| `prompt` | Claude에게 줄 지시나 스킬 호출. 없으면 멘션에 응답 |
| `claude_args` | Claude Code **명령줄 옵션**을 그대로 전달 |
| `anthropic_api_key` · `claude_code_oauth_token` | 인증 (둘 중 하나) |
| `trigger_phrase` | 부르는 말. 기본 `@claude` |
| `settings` | Claude Code 설정(JSON 문자열 또는 파일 경로) |
| `plugins` · `plugin_marketplaces` | 설치할 플러그인과 마켓플레이스 |

`claude_args`에 자주 넣는 옵션: `--max-turns`(반복 횟수 제한), `--model`(모델), `--mcp-config`(MCP 설정 파일), `--allowedTools`(허용 도구).

## 비용 관리
실행할 때마다 **두 가지**가 소모됩니다.
1. **GitHub Actions 분(分)** — GitHub이 빌려주는 실행 환경 사용 시간
2. **API 토큰** — 프롬프트·답변 길이, 작업 난이도, 코드베이스 크기에 비례. 구독 토큰을 쓰면 구독 사용량에서 차감

줄이는 방법:
- `@claude` 요청을 **구체적으로** 써서 적은 턴으로 끝나게 하기
- `CLAUDE.md`를 **간결하게** (매 실행마다 읽습니다)
- `--max-turns`로 반복 횟수 제한
- 워크플로에 **`timeout-minutes`** 지정
- GitHub의 **concurrency**로 동시 실행 제한

> 이 학습 키트도 같은 방식으로 **매주 공식 문서를 확인해 레슨을 갱신하는 PR**을 자동으로 올립니다. 이때 `--max-turns 30`, `timeout-minutes: 30`, 허용 도구를 `Read,Edit,Write,Glob,Grep`으로 제한해 **비용과 권한 범위를 모두 묶어** 두었습니다. 그리고 **머지는 사람이 합니다.**

## 보안 수칙
> **API 키·토큰은 절대 저장소에 커밋하지 마세요.** 항상 **GitHub Secrets**에 저장하고 `${{ secrets.이름 }}`으로 참조합니다.

- 워크플로에는 **필요한 권한만** 주세요 (`permissions`)
- Claude가 만든 변경은 **머지 전에 직접 검토**하세요
- 외부인이 쓸 수 있는 이슈·댓글 내용은 **프롬프트 주입** 위험이 있습니다. 쓰기 권한이 있는 사람만 실행되도록 한 기본 검사를 풀지 마세요
- 앱을 설치하면 **여러 권한**(Actions, Contents, Issues, PR, Workflows 등 읽기·쓰기 포함)을 한꺼번에 부여합니다. 부여 범위를 줄이려면 **직접 만든 GitHub 앱**(Contents·Issues·Pull requests만)을 쓰는 방법이 공식 문서에 안내되어 있습니다
- 조직 전체에 쓰려면 앱을 조직 수준으로 설치하고 시크릿은 **조직 시크릿**으로 공유합니다. 이때는 구독 토큰(만든 사람 한 명의 구독에 묶임)보다 **API 키**를 권장합니다

## 문제 해결
| 증상 | 확인할 것 |
|---|---|
| `@claude`에 응답이 없다 | 앱이 설치됐는지, 저장소에서 **워크플로가 켜져** 있는지, **시크릿**이 있는지, 댓글에 `@claude`가 **단어 그대로** 있는지(`/claude`, `@claude-bot`은 안 됨), 댓글 작성자에게 **쓰기 권한**이 있는지 |
| Claude가 올린 커밋에 CI가 안 돈다 | 기본 `GITHUB_TOKEN`으로 만든 커밋은 워크플로를 일으키지 않습니다. `github_token: ${{ secrets.GITHUB_TOKEN }}`를 **지우세요**(Claude GitHub 앱으로 인증됨). CI의 `on:` 이벤트도 확인 |
| 인증 오류 | 키·토큰이 유효한지 **내 컴퓨터에서 `claude`로 먼저 시험** |

## 베타 버전에서 올릴 때
`@beta`를 쓰는 옛 워크플로는 `@v1`로 바꾸고, `mode`는 지우고(자동 감지), `direct_prompt`는 `prompt`로, `max_turns`·`model` 같은 옵션은 `claude_args`로 옮깁니다.

## 확인 체크
- [ ] 저장소 admin 권한이 있는지 확인했다
- [ ] `/install-github-app`(또는 직접 설정)으로 워크플로를 만들고 머지했다
- [ ] 이슈 댓글에 `@claude`를 써서 응답을 받았다
- [ ] 키가 **저장소 시크릿**에만 있고 코드에는 없다

## 자주 하는 실수
- 키를 **워크플로 파일에 직접** 적음 → 시크릿을 쓰세요
- 설정 PR을 **머지하지 않고** 기다림 → 워크플로 파일이 `main`에 있어야 동작합니다
- 평문 `prompt`에 **도구 허용 없이** 일을 시킴 → `--allowedTools`를 추가하세요
- `--max-turns`·`timeout-minutes` 없이 실행 → 비용이 예상보다 커질 수 있습니다
- 자동 생성된 PR을 **검토 없이 머지** → 반드시 직접 확인하세요

## 더 알아보기
- [공식 GitHub Actions 문서](https://code.claude.com/docs/ko/github-actions)
- [claude-code-action 예제 모음](https://github.com/anthropics/claude-code-action/tree/main/examples)
- 같은 원리를 내 컴퓨터에서: [헤드리스 모드](#/level3/headless), [예약 작업](#/level3/scheduled)
