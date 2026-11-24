# Commands — 세션 안에서 쓰는 / 명령

> 공식 문서의 **전체 명령 124개**를 한국어로 정리한 참고용 표입니다. 이미 Claude Code를 써 본 분이 확인용으로 찾아보세요. 위의 검색창에 명령 이름이나 키워드를 입력하면 바로 거를 수 있습니다.

## 읽는 법
- `<arg>`는 **필수** 인자, `[arg]`는 **선택** 인자입니다
- 명령은 **메시지의 맨 앞**에서만 인식됩니다. 뒤따르는 글자는 인자가 됩니다
- Claude가 응답하는 동안 보낸 명령은 대기했다가 턴이 끝나면 실행됩니다. `/status`, `/tasks`, `/usage`는 즉시 실행됩니다
- **내 화면에 안 보이는 명령이 있을 수 있습니다.** 플랫폼·플랜·환경·버전에 따라 달라집니다 (예: `/desktop`은 macOS와 x64 Windows에서 구독으로 로그인했을 때만 표시)
- 메뉴에서 **일부러 숨겨 둔 명령**(예: `/heapdump`)은 전체 이름을 입력해야 나타납니다
- **스킬**과 **워크플로** 표시는 번들로 제공되는 스킬·워크플로라는 뜻입니다. 내 명령은 [스킬](https://code.claude.com/docs/en/skills.md)로 만듭니다
- MCP 서버가 제공하는 프롬프트도 명령으로 나타납니다 ([MCP 프롬프트](https://code.claude.com/docs/en/mcp.md))

## 작업 흐름별로 보면
| 상황 | 자주 쓰는 명령 |
| :- | :- |
| **저장소에서 첫 세션** | `/init` → `/memory` → `/mcp` → `/permissions` |
| **작업 중** | `/plan`, `/model`, `/effort`, `/context`, `/compact`, `/btw` |
| **병렬 작업** | `/tasks`, `/background`, `/batch` |
| **배포 전** | `/diff`, `/code-review`(별칭 `/review`), `/security-review` |
| **세션 사이** | `/clear`, `/resume`, `/branch`, `/fork`, `/teleport`, `/remote-control` |
| **문제가 생겼을 때** | `/rewind`, `/doctor`, `/debug`, `/feedback` |

## 대화·컨텍스트 관리 (12)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/autocompact [auto\|<tokens>]` | 자동 compact가 일어나는 시점(컨텍스트가 얼마나 찼을 때)을 설정합니다. `500k` 같은 크기나 `auto`를 줍니다. 인자가 없으면 현재 값을 보여 주는 창이 열립니다. | v2.1.221+ |
| `/branch [name]` | 현재 대화를 이 시점에서 가지(branch)로 나눠, 원래 대화를 잃지 않고 다른 방향을 시도합니다. 원래 대화는 보존되어 되돌아올 수 있습니다. |  |
| `/btw [question]` | 대화 기록에 남기지 않고 곁가지 질문을 합니다. 질문 없이 실행하면 가장 최근의 곁가지 질문을 보여 주어 이전 답을 찾아볼 수 있습니다. |  |
| `/clear [name]` | 빈 컨텍스트로 새 대화를 시작합니다. 이름을 주면 이전 대화에 이름이 붙어 `/resume` 목록에서 찾기 쉽습니다. 같은 대화를 이어가며 공간만 확보하려면 `/compact`를 쓰세요. | 별칭 `/reset`, `/new` |
| `/compact [instructions]` | 지금까지의 대화를 요약해 컨텍스트 공간을 확보합니다. 요약에서 중시할 초점을 지시할 수 있습니다. |  |
| `/context [all]` | 컨텍스트 사용량을 색 격자로 보여 주고, 공간을 많이 쓰는 도구·메모리 비대·용량 경고에 대한 개선 제안을 보여 줍니다. |  |
| `/copy [N]` | 마지막 답변을 클립보드에 복사합니다. 숫자 `N`을 주면 N번째 최근 답변을 복사합니다(`/copy 2`는 끝에서 두 번째). 코드 블록이 있으면 하나씩 고르는 창이 열립니다. |  |
| `/export [filename]` | 현재 대화를 일반 텍스트로 내보냅니다. 파일 이름을 주면 바로 그 파일에 쓰고, 없으면 복사·저장 창이 열립니다. | v2.1.327+ |
| `/recap` | 현재 세션의 한 줄 요약을 필요할 때 만듭니다. 자리를 비웠다 돌아왔을 때 자동으로 나타나는 요약은 원문의 Session recap을 보세요. |  |
| `/rename [name]` | 현재 세션 이름을 바꿔 프롬프트 바에 표시합니다. 이름을 생략하면 대화 내용에서 자동으로 만듭니다. `-p` 모드에서도 쓸 수 있습니다. | v2.1.221+ |
| `/resume [session]` | ID나 이름으로 대화를 다시 열거나 세션 선택기를 엽니다. 백그라운드 세션은 `bg` 표시와 함께 목록에 나타납니다. |  |
| `/rewind` | 대화나 코드를 이전 시점으로 되돌리거나, 선택한 메시지부터 요약합니다. 체크포인트 기능입니다. | 별칭 `/checkpoint`, `/undo` |

## 모델·화면·입력 설정 (15)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/advisor [model\|off]` | 작업 중 중요한 순간에 두 번째 모델에게 조언을 구하는 advisor 도구를 켜거나 끕니다. `fable`, `opus`, `sonnet` 또는 전체 모델 ID를 줄 수 있고, 인자가 없으면 선택기가 열립니다. | v2.1.260+ |
| `/color [color\|default]` | 현재 세션의 프롬프트 바 색을 정합니다. 색: `red` `blue` `green` `yellow` `purple` `orange` `pink` `cyan`. `default`로 되돌리고, 인자 없이 실행하면 무작위 색이 됩니다. `-p` 모드에서도 쓸 수 있습니다. |  |
| `/config [key=value ...]` | 테마, 모델, 출력 스타일 등 설정 화면을 엽니다. `key=value`를 주면 화면 없이 바로 설정합니다. 예: `/config thinking=false` |  |
| `/effort [level\|auto\|status\|ultracode [on\|off]]` | 노력도(effort)를 설정합니다: `low`~`xhigh`, `max`, `auto`. `status`는 현재 값을 보여 줍니다. `max`는 세션 한정입니다. `ultracode`를 켜고 끌 수도 있습니다. | 옵션별 버전 조건 다름(원문 참고) |
| `/fast [on\|off]` | 빠른 모드(fast mode)를 켜고 끕니다. Claude가 응답 중일 때 실행해도 턴이 끝나기를 기다리지 않고 전환되지만, 진행 중인 턴은 원래 속도로 끝납니다. `-p` 모드에서는 사용에 제한이 있습니다. |  |
| `/focus` | 포커스 보기를 켜고 끕니다. 마지막 프롬프트, 도구 호출 한 줄 요약(수정 diffstat 포함), 최종 답변만 보여 줍니다. | v2.1.281+ |
| `/keybindings` | 키보드 단축키 설정 파일을 엽니다. |  |
| `/model [model]` | 모델을 바꾸고 새 세션의 기본값으로 저장합니다. 인자 없이 실행하면 선택기가 열리고, 행에서 `s`를 누르면 이번 세션만 바꿉니다. 지원하는 모델은 좌우 화살표로 노력도를 조절합니다. | v2.1.205+ |
| `/output-style [style]` | 출력 스타일 목록을 보거나 하나로 전환합니다. 예: `/output-style concise` | v2.1.269+ |
| `/scroll-speed` | 마우스 휠 스크롤 속도를 대화형으로 조절합니다. 전체 화면(fullscreen) 렌더링에서만 쓸 수 있고 JetBrains IDE 터미널에서는 쓸 수 없습니다. |  |
| `/statusline` | 상태 표시줄을 설정합니다. 원하는 내용을 말로 설명하거나, 인자 없이 실행하면 셸 프롬프트를 기준으로 자동 구성합니다. |  |
| `/terminal-setup` | VS Code, Cursor, Devin Desktop, Alacritty, Zed에서 줄바꿈용 Shift+Enter 키 바인딩을 설치합니다. Apple Terminal에서는 Option+Enter 줄바꿈을 켜고 경고음을 끄며, iTerm2에서는 클립보드 접근을 켭니다. |  |
| `/theme` | 색 테마를 바꿉니다. 터미널의 밝기에 맞추는 `auto`, 밝은·어두운 변형, 색각 접근성(daltonized) 테마, 터미널 팔레트를 쓰는 ANSI 테마 등이 있습니다. |  |
| `/tui [classic\|fullscreen]` | 터미널 UI 렌더러를 설정하고 대화를 유지한 채 다시 실행합니다. `fullscreen`은 깜박임 없는 전체 화면 렌더러를 켭니다. 인자가 없으면 현재 렌더러를 출력합니다. | v2.1.327+ |
| `/voice [hold\|tap\|off]` | 음성 받아쓰기를 켜고 끕니다. `hold`·`tap`처럼 특정 모드로 켤 수도 있습니다. Claude.ai 계정이 필요합니다. |  |

## 권한·보안·훅 (7)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/auto-mode-setup` | 프로젝트와 최근 세션을 바탕으로 `autoMode.environment` 항목 초안을 만들고, 검토 후 사용자 설정에 저장합니다. | 옵션별 버전 조건 다름(원문 참고) |
| `/fewer-permission-prompts` | 대화 기록에서 자주 쓰는 읽기 전용 Bash·MCP 호출을 찾아, 프로젝트 `.claude/settings.json`에 우선순위가 매겨진 허용 목록을 추가해 승인 요청을 줄입니다. | 스킬 |
| `/hooks` | 훅(hook) 설정을 봅니다. |  |
| `/permissions` | 도구 권한의 허용(allow)·확인(ask)·거부(deny) 규칙을 관리하는 대화창을 엽니다. 범위별 규칙 확인, 추가·삭제, 작업 폴더 관리, 최근 auto 모드 거부 내역 검토를 할 수 있습니다. |  |
| `/sandbox` | 샌드박스 모드를 켜고 끕니다. 지원하는 플랫폼에서만 사용할 수 있습니다. |  |
| `/security-review` | 현재 브랜치의 변경(origin 기본 브랜치와의 차이)에서 인젝션, 인증 문제, 데이터 노출 같은 보안 취약점을 분석합니다. `origin` 원격이 필요합니다. |  |
| `/update-config [request]` | 설정 변경(명령 허용, 환경 변수 설정, 훅 추가 등)을 말로 설명하면 Claude가 알맞은 `settings.json` 파일을 수정합니다. 테마·모델 같은 옵션은 `/config`를 쓰세요. | 스킬 |

## 프로젝트·메모리·작업 폴더 (6)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/add-dir <path>` | 이번 세션에서 파일에 접근할 작업 폴더를 추가합니다. 추가한 폴더의 `.claude/` 설정은 대부분 읽지 않으며, `\\server\share` 같은 네트워크 경로는 대부분 추가할 수 없습니다. |  |
| `/cd <path>` | 대화는 유지한 채 이 세션의 작업 폴더를 옮깁니다. 부분 경로를 입력하면 폴더 후보가 나타나고 `Tab`으로 고릅니다. |  |
| `/import [codex\|gemini\|cursor] [--dry-run] [--yes]` | 내 PC의 OpenAI Codex, Google Gemini CLI, Cursor 설정(지침 파일, MCP 서버, 명령, 서브에이전트, 스킬)을 Claude Code로 가져옵니다. `--dry-run`은 미리보기, `--yes`는 선택 화면 생략입니다. 일부 클라우드 제공자 환경과 게이트웨이에서는 쓸 수 없습니다. | v2.1.265+ |
| `/init` | 프로젝트용 `CLAUDE.md` 안내서를 만듭니다. `CLAUDE_CODE_NEW_INIT=1`을 설정하면 스킬·훅·개인 메모리 파일까지 안내하는 대화형 흐름이 됩니다. |  |
| `/memory` | `CLAUDE.md` 파일을 편집하고, 자동 메모리를 켜고 끄고, 자동 메모리 항목을 봅니다. |  |
| `/team-onboarding` | 지난 30일의 세션·명령·MCP 서버 사용 기록을 분석해, 팀원이 첫 메시지로 붙여넣어 시작할 수 있는 온보딩 안내서(마크다운)를 만듭니다. |  |

## 작업 실행·계획·검토 (16)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [--max-findings n\|all\|default] [pr#\|branch\|path]` | 현재 변경(또는 지정한 PR 번호·브랜치·경로)에서 정확성 버그를 검토합니다. `--fix`는 지적 사항을 적용하고, `--comment`는 GitHub PR이나 GitLab MR에 댓글로 남기고, `ultra`는 클라우드에서 심층 검토합니다. 노력도 단계(`low`~`max`, `ultra`)를 지정할 수 있습니다. | 스킬<br>옵션별 버전 조건 다름(원문 참고) |
| `/deep-research <question>` | 질문에 대해 웹 검색을 여러 갈래로 펼치고, 출처를 가져와 교차 검증해 출처가 달린 보고서로 종합합니다. | 워크플로 |
| `/diff` | 작업 트리의 변경(Claude가 지금까지 한 수정 포함)을 검토합니다. |  |
| `/goal [condition\|clear]` | 조건이 충족될 때까지 Claude가 여러 턴에 걸쳐 계속 작업하도록 목표를 설정합니다. 인자 없이 실행하면 현재(또는 최근 달성한) 목표를 보여 주고, `clear` 등으로 중도 해제합니다. |  |
| `/loop [interval] [prompt]` | 세션이 열려 있는 동안 프롬프트를 반복 실행합니다. 간격을 생략하면 Claude가 스스로 간격을 조절하고, 프롬프트를 생략하면 내장 유지보수 프롬프트나 `loop.md`를 실행합니다. 간격은 `/loop 5m ...`처럼 줍니다. | 스킬 |
| `/plan [description]` | 프롬프트에서 바로 플랜 모드로 들어갑니다. 설명을 주면 플랜 모드에 들어가면서 그 작업을 바로 시작합니다. 예: `/plan fix the auth bug` |  |
| `/review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [--max-findings n\|all\|default] [pr#\|branch\|path]` | `/code-review`의 별칭입니다. 현재 변경(또는 지정한 PR·브랜치·경로)을 검토하며 같은 노력도 단계와 옵션을 받습니다. 단계를 주지 않으면 마지막으로 입력한 `low`~`max` 단계를 다시 씁니다. |  |
| `/run` | 프로젝트의 앱을 실행하고 조작해, 테스트 통과만이 아니라 변경이 실제로 동작하는지 확인합니다. | 스킬 |
| `/run-skill-generator` | 깨끗한 환경에서 앱을 빌드·실행·조작하는 방법을 프로젝트별 스킬로 작성해 `/run`과 `/verify`에 가르칩니다. | 스킬 |
| `/schedule [description]` | 클라우드 예약 작업(이전 이름 routines)을 만들고, 수정하고, 조회하고, 실행합니다. Claude가 대화로 설정을 안내하며, 예약 작업의 최근 실행 내역도 물어볼 수 있습니다. |  |
| `/ship [level] [pr] [+bot]` | 작업을 커밋·푸시하고 브랜치에 PR이 없으면 GitHub PR을 열어 변경을 검토한 뒤, 이 세션에서 PR을 지켜보며 리뷰 의견과 실패한 검사에 맞춰 수정을 푸시합니다. `/ship stop`으로 지켜보기를 끝냅니다. | 스킬 |
| `/ship:review` | `/code-review`의 별칭입니다. |  |
| `/simplify [target]` | 변경한 코드에서 정리할 부분을 찾아 고칩니다. 기존 헬퍼 재사용, 단순화, 효율, 변경이 적절한 수준인지를 보는 리뷰 에이전트 4개가 병렬로 실행됩니다. | 스킬 |
| `/steward [pr] [+bot]` | 열려 있는 GitHub PR을 이 세션에서 지켜보며 리뷰 의견과 실패한 검사에 맞춰 수정을 푸시합니다. `/ship`과 달리 먼저 검토하는 단계가 없습니다. `/steward stop`으로 끝냅니다. | 스킬 |
| `/ultrareview [PR or branch]` | 클라우드 샌드박스에서 여러 에이전트가 심층 코드 리뷰를 합니다. PR 참조나 기준 브랜치·커밋을 줄 수 있습니다. 권장 호출은 `/code-review ultra`이며 `/ultrareview`는 별칭입니다. Pro·Max·Ultra는 무료 3회가 포함되고 이후에는 사용 크레딧이 필요합니다. |  |
| `/verify` | 테스트나 타입 검사에 의존하지 않고, 앱을 빌드·실행해 결과를 관찰하며 코드 변경이 의도대로 동작하는지 확인합니다. | 스킬 |

## 병렬·백그라운드 작업 (8)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/background [prompt]` | 현재 세션을 백그라운드 에이전트로 분리해 터미널을 비웁니다. 프롬프트를 주면 분리 전에 지시를 하나 더 보냅니다. `claude agents`로 확인합니다. |  |
| `/batch <instruction>` | 코드베이스 전체에 걸친 큰 변경을 병렬로 처리합니다. 코드를 조사해 5~30개의 독립 단위로 나누고 계획을 보여 주며, 승인하면 단위마다 격리된 worktree에서 백그라운드 서브에이전트가 구현·테스트하고 PR을 엽니다. | 스킬<br>v2.1.281+ |
| `/fork [prompt]` | 현재 대화를 새 백그라운드 세션으로 복사하고 여기서는 계속 작업합니다. 프롬프트를 주면 복사본이 바로 그 일을 시작하고, 없으면 에이전트 보기에서 첫 프롬프트를 기다립니다. | v2.1.221+ |
| `/list-agents` | Claude가 메시지를 보낼 수 있는 서브에이전트·에이전트 팀원·다른 Claude Code 세션의 목록과 각각의 이름을 보여 줍니다. | 별칭 `/peers`<br>v2.1.239+ |
| `/stop` | 연결된 백그라운드 세션을 중지합니다. 기록과 worktree는 보존됩니다. 중지하지 않고 분리만 하려면 `/exit` 또는 `←` 키를 씁니다. |  |
| `/subtask <task>` | 대화 전체를 물려받은 포크 서브에이전트를 백그라운드로 띄워 작업을 시키고, 나는 계속 일합니다. 끝나면 결과가 이 대화로 돌아옵니다. |  |
| `/tasks` | 현재 세션의 백그라운드 작업(끝난 서브에이전트 포함)을 보고 관리합니다. | 별칭 `/bashes` |
| `/workflows` | 진행 중이거나 끝난 워크플로를 보고, 일시 중지·재개·저장하는 진행 보기를 엽니다. |  |

## 확장: MCP·플러그인·스킬·에이전트 (10)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/agents` | 서브에이전트를 만들거나 관리하라고 Claude에게 요청하거나 `.claude/agents/`를 직접 편집하라는 안내를 출력합니다. v2.1.197 이하에서는 대화형 관리 화면이 열립니다. |  |
| `/claude-api [migrate\|upgrade\|api-version\|managed-agents-onboard\|managed-agents-secure\|prompt-audit\|cost-optimize\|latency-optimize\|build-eval\|hillclimb\|preserved-thinking-migration]` | 프로젝트 언어에 맞는 Claude API·Managed Agents 참고 자료를 불러옵니다. 코드가 `anthropic` 또는 `@anthropic-ai/sdk`를 import하면 자동으로 활성화됩니다. 하위 명령별 설명과 버전 조건은 원문을 보세요. | 스킬 |
| `/mcp [reconnect (<server>\|all)\|enable\|disable [<server>\|all]]` | MCP 서버 연결과 OAuth 인증을 관리합니다. 인자 없이 대화형 목록을 열고, `reconnect`·`enable`·`disable`에 서버 이름 또는 `all`을 줘서 바로 상태를 바꿉니다. `-p` 모드에서는 상태 요약 텍스트를 출력합니다. |  |
| `/plugin [subcommand]` | 플러그인을 관리합니다. 인자 없이 실행하면 플러그인 메뉴가 열리고, `list`·`install`·`enable`·`disable` 같은 하위 명령은 바로 실행됩니다. |  |
| `/plugin-authoring` | mod를 작성할 때 Claude가 참고하는 자료를 불러옵니다. 내장 플러그인에 들어 있는 스킬이며 `/plugin`에서 끌 수 있습니다. | v2.1.287+ |
| `/reload-plugins [--force]` | 활성 플러그인을 재시작 없이 다시 불러와 보류 중인 변경을 적용합니다. 구성 요소별 개수를 알려 주고 로드 오류를 표시합니다. | v2.1.260+ |
| `/reload-skills` | 스킬·명령 폴더를 다시 훑어, 세션 중에 디스크에 추가·변경한 스킬을 재시작 없이 쓸 수 있게 합니다. 사용 가능한 스킬 수와 추가·제거된 수를 알려 줍니다. |  |
| `/skill-doctor` | 스킬마다 컨텍스트를 얼마나 쓰고 얼마나 자주 쓰이는지 보여 주어, 꺼도 되는 스킬을 찾게 합니다. feature-flag 가져오기가 필요합니다. | v2.1.252+ |
| `/skills` | 사용 가능한 스킬 목록을 보여 줍니다. 입력으로 이름·설명·출처를 거르고, `t`로 토큰 수 정렬, `Space`·`Enter`로 Claude와 `/` 메뉴에 노출되는 상태를 바꾸고, `Esc`로 저장하고 닫습니다. 플러그인 스킬 등 일부는 바꿀 수 없습니다. |  |
| `/workflow-authoring` | 동적 워크플로 스크립트 작성 참고 자료(스크립트 API, 재개 동작, 품질 패턴, 예제)를 불러옵니다. 보통 스크립트를 쓰기 전에 Claude가 알아서 불러옵니다. | 스킬<br>v2.1.248+ |

## 계정·사용량·플랜 (11)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/cost` | `/usage`의 별칭입니다. |  |
| `/login` | Anthropic 계정에 로그인합니다. |  |
| `/logout` | Anthropic 계정에서 로그아웃합니다. |  |
| `/passes` | 친구에게 Claude Code 무료 1주일을 공유합니다. 계정이 자격이 있을 때만 표시됩니다. |  |
| `/privacy-settings` | 개인정보 설정을 보고 바꿉니다. Pro·Max·Ultra 구독자만 사용할 수 있습니다. |  |
| `/rate-limit-options` | claude.ai 사용 한도에 막혔을 때 계속 작업하는 방법(한도 재설정까지 대기 후 자동 재개, 추가 사용 크레딧, 플랜 업그레이드)을 보여 줍니다. 한도에 닿으면 Claude Code가 스스로 이 메뉴를 열기도 합니다. | v2.1.234+ |
| `/stats` | `/usage`의 별칭이며 통계(Stats) 탭으로 열립니다. |  |
| `/status` | 설정 화면의 상태(Status) 탭을 열어 버전, 모델, 계정, 연결 상태를 보여 줍니다. |  |
| `/upgrade` | 브라우저에서 상위 플랜으로 바꾸는 업그레이드 페이지를 엽니다. Enterprise 플랜에서는 표시되지 않습니다. | v2.1.323+ |
| `/usage` | 세션 비용, 플랜 사용 한도, 활동 통계를 보여 줍니다. Pro·Max·Ultra·Team·Enterprise 플랜에서는 무엇이 한도에 반영되는지 내역도 포함합니다. |  |
| `/usage-credits` | 한도에 닿았을 때 사용 크레딧을 설정하거나 관리자에게 요청합니다. 보통 브라우저에서 결제 설정이 열리고, 결제 권한이 없는 Team·Enterprise 구성원은 대신 관리자에게 요청이 전송됩니다. | v2.1.205+ |

## 연동·클라우드·다른 기기 (14)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/autofix-pr [prompt]` | 현재 브랜치의 PR을 지켜보다가 CI가 실패하거나 리뷰 댓글이 달리면 수정해서 푸시하는 클라우드 세션을 시작합니다. `gh` CLI와 클라우드 세션 접근 권한이 필요합니다. |  |
| `/chrome` | Claude in Chrome 설정을 엽니다. |  |
| `/claude-in-chrome [task]` | 브라우저에서 페이지 테스트, 양식 입력, 콘솔 로그 읽기 같은 작업을 Claude in Chrome으로 수행합니다. Chrome 연동이 켜진 세션에서 쓸 수 있습니다. | 스킬 |
| `/desktop` | 현재 세션을 Claude Code 데스크톱 앱에서 이어갑니다. macOS 또는 x64 Windows와 Claude 구독이 필요합니다. |  |
| `/ide` | IDE 연동을 관리하고 상태를 보여 줍니다. |  |
| `/install-github-app` | 저장소에 Claude GitHub 앱을 설치하고, 선택적으로 GitHub Actions 워크플로와 시크릿을 설정합니다. 저장소 선택부터 안내하며 github.com 저장소에서만 동작합니다. |  |
| `/install-slack-app` | Claude Slack 앱을 설치합니다. 브라우저에서 OAuth를 진행합니다. |  |
| `/mobile` | Claude 모바일 앱 다운로드용 QR 코드를 보여 줍니다. | 별칭 `/ios`, `/android` |
| `/remote-control` | 이 세션을 claude.ai에서 이어서 쓸 수 있도록 Remote Control에 연결합니다. claude.ai 구독이 필요합니다. |  |
| `/remote-env` | CLI에서 시작하는 클라우드 세션의 기본 클라우드 환경을 고릅니다. |  |
| `/setup-bedrock` | Amazon Bedrock 인증·리전·모델 고정을 마법사로 설정합니다. `CLAUDE_CODE_USE_BEDROCK=1`을 설정하기 전에는 메뉴에 숨겨져 있어 전체 이름을 입력해야 합니다. |  |
| `/setup-vertex` | Google Cloud Agent Platform 인증·프로젝트·리전·모델 고정을 마법사로 설정합니다. `CLAUDE_CODE_USE_VERTEX=1`을 설정하기 전에는 메뉴에 숨겨져 있어 전체 이름을 입력해야 합니다. |  |
| `/teleport` | 클라우드 세션을 이 터미널로 가져옵니다. 선택 창에서 고르면 브랜치와 대화를 받아옵니다. claude.ai 구독이 필요합니다. | 별칭 `/tp` |
| `/web-setup` | 로컬 `gh` CLI 자격 증명으로 클라우드 세션용 GitHub 계정을 연결합니다. |  |

## 진단·도움말·종료 (11)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/bug [report]` | 버그를 신고하거나 대화를 공유합니다. 포함할 세션 기록의 범위를 고르고, 동의 화면에서 확인한 뒤에만 전송됩니다. | v2.1.229+ |
| `/debug [description]` | 현재 세션의 디버그 로그를 켜고, 로그를 읽어 문제를 진단합니다. `claude --debug`로 시작하지 않았다면 기본은 꺼져 있습니다. | 스킬 |
| `/doctor [prompt-audit [path]]` | 설치·설정·확장·`CLAUDE.md` 문제를 진단하고, 확인 후 Claude가 적용할 수정안을 제안합니다. `prompt-audit`으로 지침 파일을 점검할 수 있습니다. | 스킬<br>v2.1.283+ |
| `/exit` | CLI를 종료합니다. 연결된 백그라운드 세션에서는 분리만 되고 세션은 계속 실행됩니다. |  |
| `/feedback [report]` | Claude Code에 대한 의견을 보냅니다. `/bug`와 같은 창과 같은 동의 절차를 씁니다. |  |
| `/heapdump` | 메모리 사용량 진단용 JavaScript 힙 스냅샷과 메모리 분석을 `~/Desktop`(없으면 홈 폴더)에 씁니다. 신고할 때는 `-diagnostics.json` 파일만 첨부하세요. 메뉴에서 숨겨져 있어 전체 이름을 입력해야 합니다. |  |
| `/help` | 도움말과 사용 가능한 명령을 보여 줍니다. |  |
| `/insights` | 이 PC의 최근 세션을 분석한 HTML 보고서(어떤 프로젝트에서 어떻게 쓰는지, 어디서 막히는지, 써 볼 기능)를 만듭니다. 클라우드 세션에서는 쓸 수 없습니다. |  |
| `/powerup` | 움직이는 데모가 있는 짧은 대화형 레슨으로 Claude Code 기능을 알아봅니다. |  |
| `/release-notes` | 변경 이력을 버전 선택기로 봅니다. 특정 버전을 고르거나 전체를 볼 수 있으며, 내용은 화면에만 나타나고 Claude가 보는 대화에는 들어가지 않습니다. |  |
| `/restart` | Claude Code를 다시 시작하고 이 세션을 이어갑니다. 설치된 업데이트를 적용할 때 쓰며, 업데이트 후 하단에서 안내할 때 실행합니다. Pro·Max·Ultra 플랜과 macOS·Linux 네이티브 설치가 필요합니다(WSL 제외). | v2.1.288+ |

## 디자인·아티팩트·문서 만들기 (9)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/artifact-capabilities` | 게시한 아티팩트가 쓸 수 있는 런타임 기능(커넥터 호출, 파일 다운로드 등)의 참고 자료를 불러옵니다. 아티팩트를 지원하는 환경에서만 표시됩니다. | 스킬 |
| `/artifact-diagramming` | 아티팩트에 다이어그램을 넣을 때의 안내(언제 그릴지, 밝은·어두운 테마에서 읽히는 인라인 SVG 작성법)를 불러옵니다. | 스킬<br>v2.1.221+ |
| `/artifacts` | 내가 만들었거나 공유받은 아티팩트 목록을 보고, 세션에 붙이거나 브라우저에서 열거나 링크를 복사합니다. |  |
| `/dataviz [request]` | 차트·그래프·대시보드 디자인 안내. 데이터에 맞는 차트 형태를 고르고, 역할별로 색을 정하고, 색각 접근성과 대비를 번들 스크립트로 검증합니다. | 스킬 |
| `/design [brief]` | UI 시안·화면 흐름·랜딩 페이지·포스터를 한 캔버스의 아트보드로 초안 작성해 Claude Design 아티팩트로 게시합니다. | 스킬<br>v2.1.265+ |
| `/design consent`, `/design revoke` | Claude Design 접근 권한을 허용하거나(`consent`) 철회합니다(`revoke`). Claude가 실행하라고 요청해도 반드시 직접 입력하세요. |  |
| `/design-login` | `/design-sync`에 필요한 디자인 시스템 접근을 claude.ai 계정으로 인증합니다. |  |
| `/design-sync [hint]` | 저장소의 React 디자인 시스템을 변환해 Claude Design에 올려, 이후 만드는 시안이 실제 컴포넌트를 쓰게 합니다. 디자인 시스템 이름을 줄 수 있습니다. | 스킬 |
| `/slides [brief]` | 요청 내용으로 채운 새 프레젠테이션을 Claude Slides 아티팩트로 만듭니다. 아티팩트를 쓸 수 있는 세션이 필요합니다. | 스킬<br>v2.1.265+ |

## 기타 · 제거된 명령 (5)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/pr-comments [PR]` | v2.1.91에서 제거되었습니다. 대신 Claude에게 PR 댓글을 보여 달라고 직접 요청하세요. 이전 버전에서는 GitHub PR의 댓글을 가져와 보여 주었습니다. | 제거됨 |
| `/radio` | 브라우저에서 Claude FM 로파이 라디오를 엽니다. 브라우저가 없으면 스트림 주소를 출력합니다. |  |
| `/stickers` | Claude Code 스티커를 주문합니다. |  |
| `/ultraplan <prompt>` | 제거되었습니다. 대신 플랜 모드를 쓰세요. 이전에는 계획 작업을 클라우드 세션으로 보내 브라우저에서 검토했습니다. | 제거됨 |
| `/vim` | v2.1.92에서 제거되었습니다. Vim/일반 편집 모드 전환은 `/config` → Editor mode에서 합니다. | 제거됨 |

---

**출처:** [공식 문서 commands](https://code.claude.com/docs/en/commands) · 이 표는 2026-11-25에 공식 문서에서 자동 추출했고, 설명은 한국어로 옮긴 것입니다. 한국어 설명이 원문과 다르거나 새 명령이 보이지 않으면 원문을 기준으로 하세요. 이 표는 작성에 쓴 Claude Code 2.1.323 기준 문서이며, 내 버전에 따라 다를 수 있습니다.
