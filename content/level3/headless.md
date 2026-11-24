# 헤드리스 모드 (claude -p)

> `claude -p "질문"`은 **화면(대화창) 없이 한 번 실행하고 결과만 출력**합니다. 스크립트·예약 작업·CI에 Claude를 끼워 넣을 때 쓰는 방법입니다. 공식 문서는 "비대화형 모드"라고 부릅니다.

## 기본 사용법
`claude` 명령에 `-p`(`--print`)만 붙이면 됩니다.

```powershell
claude -p "이 프로젝트의 auth 모듈이 하는 일을 설명해 줘"
```
- 답이 터미널에 **출력되고 바로 종료**됩니다. 대화가 이어지지 않습니다
- 성공하면 종료 코드 **0**, 실패하면 **0이 아닌 값**을 돌려줘서 스크립트가 성공·실패를 판단할 수 있습니다
- 대화 중 쓰던 방식 그대로 **스킬과 커스텀 명령**도 쓸 수 있습니다. 프롬프트에 `/스킬이름`을 넣으세요

| 대화형 (`claude`) | 헤드리스 (`claude -p`) |
|---|---|
| 사람이 화면을 보며 대화 | 한 번 실행하고 끝 |
| 권한이 필요하면 **물어봄** | 물어볼 사람이 없어 **미리 정해 둬야 함** |
| `/login`, `/model` 등 화면 명령 | 터미널 화면 전용 명령은 사용 불가 |

## 자주 쓰는 패턴

### 1. 다른 출력을 Claude에게 넘기기 (파이프)
```powershell
Get-Content build-error.txt | claude -p "이 빌드 오류의 근본 원인을 간단히 설명해 줘" > output.txt
```
`|`는 앞 명령의 출력을 뒤 명령의 입력으로 넘기고, `>`는 결과를 파일에 저장합니다. 파이프로 넘기는 입력은 **최대 10MB**입니다. 더 크면 파일에 저장하고 프롬프트에 파일 경로를 적으세요.

### 2. 결과 형식 고르기 (`--output-format`)
| 값 | 출력 |
|---|---|
| `text` (기본) | 일반 글 |
| `json` | 결과·세션 ID·비용 등이 담긴 구조화된 JSON |
| `stream-json` | 한 줄에 JSON 하나씩, **실시간**으로 흘려보냄 |

```powershell
claude -p "이 프로젝트를 요약해 줘" --output-format json
```
JSON 응답의 **`result`** 필드에 답이, 그 밖에 `session_id`, `total_cost_usd`(이번 호출 비용) 등이 들어 있습니다. PowerShell에서는 바로 읽을 수 있습니다.
```powershell
$r = claude -p "이 프로젝트를 요약해 줘" --output-format json | ConvertFrom-Json
$r.result
$r.total_cost_usd
```

### 3. 정해진 틀로 받기 (`--json-schema`)
JSON Schema를 주면 **그 모양 그대로** 결과를 `structured_output` 필드에 담아 줍니다. 다른 프로그램이 읽을 데이터를 만들 때 유용합니다. 유효하지 않은 스키마면 오류를 내고, 결과를 못 만들었을 때는 `structured_output`이 아예 없으니 **있는지 먼저 확인**하세요.

### 4. 사용할 도구 미리 허용하기 (`--allowedTools`)
헤드리스에서는 허가를 물어볼 사람이 없습니다. 쓸 도구를 **미리** 알려 줍니다.

```powershell
claude -p "테스트를 실행하고 실패하는 것을 고쳐 줘" --allowedTools "Bash,Read,Edit"
```
명령까지 좁히려면 권한 규칙 문법을 씁니다.
```powershell
claude -p "스테이징된 변경을 보고 알맞은 커밋을 만들어 줘" --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```
`Bash(git diff *)`처럼 `*` 앞에 **공백이 있어야** `git diff`와 그 인자에 맞습니다. 공백이 없으면 `git diff-index` 같은 다른 명령도 맞아 버립니다.

허용하지 않은 도구가 허가를 필요로 하면 **거부**됩니다(물어볼 사람이 없으므로).

### 5. 권한 모드를 통째로 정하기 (`--permission-mode`)
| 모드 | 효과 |
|---|---|
| `acceptEdits` | 파일 수정을 묻지 않고 허용. `mkdir`, `mv`, `cp` 같은 흔한 파일 명령도 자동 허용 |
| `dontAsk` | 물어봐야 하는 모든 호출을 **거부**. 잠가 둔 CI 실행에 적합 |
| `auto` | 분류기가 대부분의 동작을 검토 |

```powershell
claude -p "린트 수정을 적용해 줘" --permission-mode acceptEdits
```
사람이 없는 예약 작업에는 `--permission-prompts none`도 있습니다. 물어봐야 하는 것은 모두 거부하고 Claude에게 "아무도 승인할 수 없다"고 알려 준 채 계속 진행합니다.

### 6. 대화 이어 가기
```powershell
claude -p "이 코드의 성능 문제를 살펴봐 줘"
claude -p "이제 DB 쿼리에 집중해 줘" --continue
```
`--continue`는 **가장 최근** 대화를, `--resume 세션ID`는 **특정** 대화를 이어 갑니다. 세션 ID는 JSON 출력의 `session_id`에서 얻습니다. ([세션 이어가기](#/level2/session-resume)와 같은 개념입니다.)

### 7. 시스템 프롬프트 더하기
```powershell
claude -p "이 diff를 검토해 줘" --append-system-prompt "당신은 보안 엔지니어입니다. 취약점을 중심으로 검토하세요."
```
`--append-system-prompt`는 Claude Code의 기본 동작을 **유지한 채** 지침을 더합니다. `--system-prompt`는 기본 프롬프트를 **통째로 교체**하는 옵션입니다.

## 빠르고 깨끗하게 실행하기: `--bare`
`--bare`를 붙이면 **훅, 스킬, 서브에이전트, 플러그인, MCP 서버, 자동 메모리, CLAUDE.md를 자동으로 불러오지 않아** 시작이 빠르고, 내 PC 설정과 상관없이 **어디서 돌려도 같은 결과**가 나옵니다.

```powershell
claude --bare -p "README.md를 요약해 줘" --allowedTools "Read"
```
- 필요한 것은 옵션으로 직접 넘깁니다: `--settings`, `--mcp-config`, `--agents`, `--append-system-prompt`, `--plugin-dir`
- **구독 로그인을 쓰지 않습니다.** `ANTHROPIC_API_KEY` 환경 변수나 API 키 설정이 필요합니다
- 공식 문서는 스크립트·SDK 호출에 `--bare`를 권장하며, 앞으로 `-p`의 기본값이 될 예정이라고 합니다

> **`--bare`가 없으면** 프로젝트의 `.claude\settings.json`에 든 훅이 **폴더 신뢰 확인 없이** 실행됩니다(헤드리스에는 신뢰 대화상자가 없습니다). 남이 만든 저장소에 `claude -p`를 쓰기 전에는 `.claude\` 폴더를 먼저 읽어 보거나 `--bare`를 쓰세요.

## 스크립트에 넣어 쓰기
`package.json`의 스크립트로 "오타 검사기"를 만든 예입니다.
```json
{
  "scripts": {
    "lint:claude": "git diff main | claude -p \"you are a typo linter. for each typo in this diff, report filename:line on one line and the issue on the next. return nothing else.\""
  }
}
```
`npm run lint:claude`로 실행합니다. diff를 **파이프로 넘기므로** Claude에게 Bash 권한이 필요 없습니다.

## 실행이 끝나는 방식
- Claude가 시작한 **백그라운드 작업**(개발 서버, 서브에이전트 등)이 있으면 `-p` 실행이 끝나기를 기다립니다. 기본 최대 대기는 10분입니다
- 실행 도중 `SIGTERM`으로 멈추면 종료 코드 **143**으로 끝나고, 진행 중이던 턴은 결과가 기록되지 않습니다
- `--max-budget-usd`로 **비용 상한**을 걸 수 있습니다. 상한에 닿으면 남은 백그라운드 작업도 중단합니다

## 비용 주의
`claude -p`도 대화형과 **같은 사용량**을 씁니다. 반복 실행하는 스크립트는 금세 쌓입니다.
- JSON 출력의 `total_cost_usd`로 호출마다 비용을 기록해 두세요
- 처음에는 작은 입력으로 시험하세요
- 가격·한도는 자주 바뀌므로 [요금 안내](https://claude.com/pricing)를 참고하세요

## 확인 체크
- [ ] `claude -p`로 질문 하나를 실행해 봤다
- [ ] `--output-format json`으로 `result`와 `total_cost_usd`를 읽었다
- [ ] `--allowedTools`로 도구를 허용하고 실행해 봤다

## 자주 하는 실수
- **허용하지 않은 도구**를 쓰게 하고 "왜 안 되지?" → 헤드리스는 물어보지 않고 **거부**합니다. `--allowedTools`를 확인하세요
- `--bare`를 쓰면서 **구독 로그인**을 기대함 → API 키가 필요합니다
- `--allowedTools "Bash(git diff*)"` → `*` 앞 공백이 빠지면 의도보다 넓게 허용됩니다
- JSON을 읽을 때 `structured_output`이 **없는 경우**를 처리하지 않음
- 비용 상한 없이 반복 실행 → `--max-budget-usd`를 쓰세요

## 더 알아보기
- [공식 헤드리스 문서](https://code.claude.com/docs/ko/headless)
- 모든 옵션 목록: [CLI 옵션 전체 보기](#/ref/cli-all)
- 이걸 정기적으로 돌리려면 → [예약 작업](#/level3/scheduled)
- Python·TypeScript로 더 세밀하게 제어하려면 → [Agent SDK](#/level3/agent-sdk)
