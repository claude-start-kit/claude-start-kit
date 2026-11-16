# CLI reference — 터미널 명령·플래그

> 터미널에서 `claude`를 실행할 때 쓰는 **명령 36개와 플래그 80개**를 한국어로 정리한 참고용 표입니다. 위의 검색창에 이름이나 키워드를 입력하면 바로 거를 수 있습니다. (세션 안에서 쓰는 `/명령`은 [Commands](#/ref/slash-all)를 보세요.)

## 읽는 법
- **명령**은 `claude` 뒤에 붙는 하위 명령, **플래그**는 `claude` 뒤에 붙는 시작 옵션입니다
- `<arg>`는 **필수** 인자, `[arg]`는 **선택** 인자입니다
- **`claude --help`에 안 나오는 플래그도 있습니다.** 도움말에 없다고 해서 쓸 수 없는 것은 아닙니다
- **print 모드 전용** 표시가 있는 플래그는 `-p`(비대화형)로 실행할 때만 동작합니다
- 설명에 적힌 `v2.1.xxx 이상`은 그 버전부터 지원한다는 뜻입니다. `claude -v`으로 내 버전을 확인하세요
- 같은 설정이 `settings.json`에도 있을 때 어느 쪽이 우선인지는 항목 설명에 적힌 것만 확실합니다 (예: `--model`은 `model` 설정보다 우선)

## 자주 쓰는 조합
| 하고 싶은 일 | 명령 |
| :- | :- |
| 일반 대화 시작 | `claude` |
| 가장 최근 대화 이어가기 | `claude -c` |
| 이름 붙인 세션 다시 열기 | `claude -r "이름"` |
| 한 번만 물어보고 끝내기 | `claude -p "질문"` |
| 파일 내용을 넘겨 처리 | `cat logs.txt \| claude -p "요약해 줘"` |
| 계획부터 세우고 시작 | `claude --permission-mode plan` |
| 모델 지정 | `claude --model sonnet` |
| 작업 폴더 추가 | `claude --add-dir ../lib` |
| 격리된 작업 공간에서 시작 | `claude -w` |
| 설치·설정 점검 | `claude doctor` |
| 설정이 꼬였을 때 원인 찾기 | `claude --safe-mode` |

## 명령 · 세션 시작·이어가기 (7)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `claude` | 대화형 세션 시작 |  |
| `claude "query"` | 첫 질문을 주고 대화형 세션 시작 | 예: `claude "explain this project"` |
| `claude -p "query"` | SDK 방식으로 질문하고 결과를 출력한 뒤 종료(비대화형) | 예: `claude -p "explain this function"` |
| `cat file \| claude -p "query"` | 파이프로 넘긴 내용을 처리 | 예: `cat logs.txt \| claude -p "explain"` |
| `claude -c` | 현재 폴더의 가장 최근 대화 이어가기 |  |
| `claude -c -p "query"` | 가장 최근 대화를 비대화형(SDK 방식)으로 이어가기 | 예: `claude -c -p "Check for type errors"` |
| `claude -r "<session>" "query"` | ID 또는 이름으로 세션을 다시 열고 질문 | 예: `claude -r "auth-refactor" "Finish this PR"` |

## 명령 · 설치·업데이트·로그인·진단 (9)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `claude update` | 최신 버전으로 업데이트 |  |
| `claude install [version]` | 네이티브 바이너리 설치·재설치. `2.1.118` 같은 버전이나 `stable`, `latest` 지정 가능 | 예: `claude install stable` |
| `claude auth login` | Anthropic 계정 로그인. `--email`은 이메일 미리 입력, `--sso`는 SSO 강제, `--console`은 구독 대신 Anthropic Console(API 사용량 과금)로 로그인 | 예: `claude auth login --console` |
| `claude auth logout` | Anthropic 계정 로그아웃 |  |
| `claude auth status` | 인증 상태를 JSON으로 표시. `--text`는 읽기 쉬운 출력. 로그인돼 있으면 종료 코드 0, 아니면 1. JSON에는 CLI가 쓰는 설정 폴더를 알려 주는 `configDirectory` 필드(v2.1.268 이상)와 `authMethod` 필드(`none`, `claude.ai`, `oauth_token`, `api_key`, `api_key_helper`, `third_party` 중 하나)가 들어 있음 |  |
| `claude doctor` | 세션을 시작하지 않고 설치·설정 진단을 읽기 전용으로 출력(설치 상태, 설정 파일 오류, Remote Control 사용 가능 여부). 세션 안에서 수정까지 해 주는 점검은 `/doctor` |  |
| `claude import [source]` | 다른 코딩 에이전트의 설정을 Claude Code로 가져오는 `/import`를 실행하는 대화형 세션 시작. `--dry-run`, `--yes` 옵션 지원. Amazon Bedrock, Google Cloud Agent Platform, Microsoft Foundry, Claude Platform on AWS에서는 사용 불가. 기능 플래그 가져오기를 끈 경우에도 사용 불가 | v2.1.213+<br>예: `claude import codex --dry-run` |
| `claude purge [path]` | 프로젝트의 로컬 Claude Code 상태를 모두 삭제(대화 기록, 작업 목록, 디버그 로그, 파일 수정 기록, 프롬프트 기록, `~/.claude.json`의 프로젝트 항목). `[path]`를 생략하면 목록에서 선택. 옵션: `--dry-run`(미리보기), `-y`/`--yes`(확인 생략), `-i`/`--interactive`(항목별 확인), `--all`(모든 프로젝트) | 예: `claude purge ~/work/repo --dry-run` |
| `claude setup-token` | CI·스크립트용 장기 OAuth 토큰 생성. 저장하지 않고 터미널에만 출력. Claude 구독 필요 |  |

## 명령 · 백그라운드 세션 관리 (10)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `claude agents` | 에이전트 뷰를 열어 병렬 백그라운드 세션을 확인·지시. `--cwd <경로>`는 해당 폴더 세션만 표시, `--json`은 활성 세션을 JSON 배열로 출력(`--json --all`은 완료된 세션도 포함). `--permission-mode`, `--model`, `--effort`, `--agent`로 새 세션의 기본값을 지정. `--settings`, `--add-dir`, `--plugin-dir`, `--mcp-config`는 `claude`와 똑같이 사용. 에이전트 뷰는 대화형 터미널이 필요 | 예: `claude agents --json` |
| `claude attach <id\|name>` | 백그라운드 세션에 현재 터미널로 연결. ID 대신 실행 중인 세션 이름의 일부를 써도 됨(v2.1.290 이상) | 예: `claude attach 7c5dcf5d` |
| `claude daemon logs` | 백그라운드 세션 관리자(supervisor)의 로그 `~/.claude/daemon.log`를 새 줄이 올 때마다 출력. `Ctrl+C`로 종료 |  |
| `claude daemon run` | 백그라운드 세션 관리자를 이 터미널 앞에서 실행하며 로그를 출력 |  |
| `claude daemon status` | 관리자의 상태·버전·소켓 폴더·작업자 수를 진단용으로 출력. 관리자가 실행 중이 아니면 종료 코드 1 |  |
| `claude daemon stop --any` | 관리자와 그가 호스팅하는 세션을 중지. `--keep-workers`는 다음 관리자가 다시 붙을 수 있게 백그라운드 세션을 유지. `--any`는 온디맨드 관리자(기본값) 중지를 확인. 응답 없는 관리자를 복구할 때 사용 | 예: `claude daemon stop --any --keep-workers` |
| `claude logs <id\|name>` | 백그라운드 세션의 최근 출력을 표시. ID 대신 세션 이름의 일부를 써도 됨(v2.1.290 이상) | 예: `claude logs 7c5dcf5d` |
| `claude respawn <id>` | 실행 중이거나 중지된 백그라운드 세션을 대화를 유지한 채 재시작. `--all`은 실행 중인 모든 세션을 재시작(예: 업데이트된 Claude Code를 적용할 때) | 예: `claude respawn 7c5dcf5d` |
| `claude rm <id>` | 백그라운드 세션을 목록에서 제거. 세션의 worktree 때문에 거부되고 `claude rm`을 한 번 더 하면 해결되는 경우, 넘길 정확한 플래그와 값을 알려 줌: `--discard-unpushed <commit>@<worktree-id>`(푸시하지 않은 커밋이 있는 worktree를 커밋과 함께 폐기, v2.1.260 이상), `--force-remove-worktree <worktree-id>`(git이나 `WorktreeRemove` 훅이 지우지 못한 worktree 폴더 삭제, v2.1.268 이상). 대화 기록은 로컬에 남아 `claude --resume`으로 열 수 있음 | 예: `claude rm 7c5dcf5d` |
| `claude stop <id>` | 백그라운드 세션 중지. `claude kill`도 같은 동작 | 예: `claude stop 7c5dcf5d` |

## 명령 · 연동·확장·관리자용 (10)

| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `claude gateway` | 자체 호스팅 Claude apps 게이트웨이 서버 시작. Amazon Bedrock, Google Cloud Agent Platform, Microsoft Foundry 앞단에 SSO·정책을 구성하려는 관리자용. `gateway.yaml`을 가리키는 `--config` 필요 | 예: `claude gateway --config gateway.yaml` |
| `claude auto-mode defaults` | 내장 자동 모드 분류 규칙을 JSON으로 출력. 설정이 반영된 실제 규칙은 `claude auto-mode config`로 확인. `--label <접두어>`는 그 접두어로 시작하는 라벨의 규칙만 출력(대소문자 구분 없음). v2.1.208 이상 | 예: `claude auto-mode defaults --label 'Git Destructive'` |
| `claude auto-mode reset` | 사용자 설정 파일에서 `autoMode` 섹션을 지워 기본 자동 모드 설정으로 복원. 쓰기 전에 확인을 묻고 `-y`/`--yes`로 생략. 관리형 설정이나 `--settings`의 규칙은 계속 적용. v2.1.212 이상 | 예: `claude auto-mode reset --yes` |
| `claude mcp` | MCP(Model Context Protocol) 서버 설정 | 예: `See the [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp.md).` |
| `claude mcp login <name>` | 대화형 `/mcp` 패널을 열지 않고 설정된 MCP 서버의 OAuth 인증을 실행. HTTP, SSE, claude.ai 커넥터 서버에서 동작. SSH에서는 `--no-browser`로 브라우저 대신 인증 URL을 출력. HTTP·SSE 서버는 리디렉션된 URL을 프롬프트에 붙여 넣음. claude.ai 커넥터는 원문의 '셸에서 커넥터 다시 인증' 참고 | 예: `claude mcp login sentry` |
| `claude mcp logout <name>` | MCP 서버에 저장된 OAuth 인증 정보 삭제 | 예: `claude mcp logout sentry` |
| `claude plugin` | Claude Code 플러그인 관리. 별칭 `claude plugins`. 하위 명령은 플러그인 레퍼런스 참고 | 예: `claude plugin install code-review@claude-plugins-official` |
| `claude remote-control` | claude.ai나 Claude 앱에서 Claude Code를 제어하는 Remote Control 서버 시작. 별칭 `claude rc`. 서버 모드로 실행되어 로컬 대화형 세션은 없음. 서버를 멈춘 뒤 그 세션을 다시 불러오는 방법은 원문 참고 | 예: `claude remote-control --name "My Project"` |
| `claude self-hosted-runner` | 이 컴퓨터나 컨테이너를 자체 호스팅 환경에 등록하고 Claude Code 클라우드 세션을 내 인프라에서 실행하는 러너 시작. `setup`(안내형 설정), `doctor`(배포된 러너 진단), `orchestrator`(온디맨드 러너 생성) 하위 명령이 있음. v2.1.224 이상 | 예: `claude self-hosted-runner setup` |
| `claude ultrareview [target]` | ultrareview를 비대화형으로 실행. 결과를 표준 출력으로 내고 성공 0, 실패 1로 종료. `--json`은 원본 데이터 출력, `--timeout <분>`은 기본 45분 변경. `github.com` PR 대상에 `--post`를 쓰면 결과를 내 GitHub 계정의 일반 댓글 하나로 PR에 게시(`--no-post`가 기본값). `--post`/`--no-post`는 v2.1.227 이상 | 예: `claude ultrareview 1234 --json` |

## 플래그 · 세션·작업 폴더·연동 (15)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--add-dir` | Claude가 파일을 읽고 수정할 수 있는 작업 폴더를 추가. 파일 접근 권한만 주며, 이 폴더의 `.claude/` 설정 대부분은 찾지 않음. 각 경로가 실제 폴더인지 확인하고, `\\server\share` 같은 네트워크 경로는 대부분 추가 불가. 세션 간 유지하려면 설정의 `permissions.additionalDirectories` 사용 | 예: `claude --add-dir ../apps ../lib` |
| `--chrome` | 웹 자동화·테스트를 위한 Chrome 브라우저 연동 켜기 | 예: `claude --chrome` |
| `--continue`, `-c` | 현재 폴더의 가장 최근 대화를 불러옴(끝난 백그라운드 세션 포함, 끝난 세션 열기는 v2.1.257 이상). `claude -p`나 Agent SDK로 만든 세션, 첫 프롬프트가 `/loop`인 세션은 건너뜀(`claude -p --continue`는 이들도 포함). `/add-dir`로 이 폴더를 추가한 세션도 포함 | 예: `claude --continue` |
| `--desktop` | 현재 폴더에서 Claude Desktop 앱을 열고, 터미널에서는 세션을 시작하지 않고 종료. `--continue`나, 세션 ID와 함께 `--resume`을 붙이면 그 세션을 Desktop에서 엶(여기서 `--resume`은 이름·기록 경로가 아닌 세션 ID만 받음). 앱이 세션을 직접 시작하므로 프롬프트와 다른 플래그(`--verbose`, `--debug` 계열 제외)는 받지 않음. macOS와 x64 Windows에서 Claude 구독으로 로그인했을 때 사용 가능. v2.1.285 이상 | 예: `claude --desktop` |
| `--fork-session` | 다시 열 때 원래 세션 ID를 재사용하지 않고 새 세션 ID를 생성(`--resume`, `--continue`와 함께 사용) | 예: `claude --resume abc123 --fork-session` |
| `--from-pr` | 특정 PR에 연결된 세션만 보여 주는 세션 선택기를 엶. PR 번호, GitHub·GitHub Enterprise PR URL, GitLab 머지 리퀘스트 URL, Bitbucket PR URL을 받음. Claude가 PR을 만들면 세션이 자동으로 연결됨 | 예: `claude --from-pr 123` |
| `--ide` | 사용 가능한 유효 IDE가 정확히 하나일 때 시작과 함께 자동 연결 | 예: `claude --ide` |
| `--name`, `-n` | 세션 표시 이름 지정(`/resume`과 터미널 제목에 표시). `claude --resume <이름>`으로 다시 열 수 있음. `/rename`은 세션 도중 이름을 바꾸고 프롬프트 바에도 표시 | 예: `claude -n "my-feature-work"` |
| `--no-chrome` | 이 세션에서 Chrome 브라우저 연동 끄기 | 예: `claude --no-chrome` |
| `--resume`, `-r` | ID나 이름으로 특정 세션을 다시 열거나, 대화형 선택기에서 고름. ID 대신 세션 `.jsonl` 기록 파일의 절대 경로도 가능. 선택기와 이름 검색에는 `/add-dir`로 이 폴더를 추가한 세션도 포함. ID를 주면 현재 프로젝트 폴더와 그 git worktree를 먼저, 그다음 이 컴퓨터의 다른 모든 프로젝트를 검색(v2.1.223 이전에는 현재 프로젝트와 worktree만). 백그라운드 세션은 선택기에 `bg`로 표시되며, 실행 중인 세션을 열면 `claude attach`로 이 터미널에 연결되고 명령줄 프롬프트는 그 세션의 다음 턴으로 전달됨(v2.1.285 이전에는 거부하고 `claude attach` 명령을 안내) | 예: `claude --resume auth-refactor` |
| `--session-id` | 대화에 특정 세션 ID를 사용(유효한 UUID여야 함) | 예: `claude --session-id "550e8400-e29b-41d4-a716-446655440000"` |
| `--teleport` | 클라우드 세션을 내 로컬 터미널에서 이어가기 | 예: `claude --teleport` |
| `--tmux` | worktree용 tmux 세션 생성. `--worktree` 필요. 가능하면 iTerm2 기본 패널을 사용하고, 전통 tmux는 `--tmux=classic` | 예: `claude -w feature-auth --tmux` |
| `--version`, `-v` | 버전 번호 출력 | 예: `claude -v` |
| `--worktree`, `-w` | `<저장소>/.claude/worktrees/<이름>`의 격리된 git worktree에서 Claude 시작. 이름을 주지 않으면 자동 생성. `#<번호>`, GitHub PR URL, GitLab 머지 리퀘스트 URL을 주면 `origin`에서 그 PR/MR을 가져와 그 브랜치를 기준으로 worktree를 만듦. GitLab 머지 리퀘스트 기준 생성은 v2.1.233 이상 | 예: `claude -w feature-auth` |

## 플래그 · 모델·노력도 (6)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--advisor <model>` | 이 세션에서 서버 측 어드바이저 도구를 켬. 모델 별칭(`fable`, `opus`, `sonnet`) 또는 전체 모델 ID 지정. 세션 동안 `advisorModel` 설정보다 우선. `fable`은 Fable 접근 권한 필요 | 예: `claude --advisor opus` |
| `--autocompact <auto\|tokens>` | 저장된 설정은 바꾸지 않고 이 세션의 자동 compact 기준을 지정. `/autocompact`와 같은 값을 받음. v2.1.221 이상 | 예: `claude --autocompact 500k` |
| `--betas` | API 요청에 포함할 베타 헤더(API 키 사용자만) | 예: `claude --betas interleaved-thinking` |
| `--effort` | 이 세션의 노력도(effort) 설정: `low`, `medium`, `high`, `xhigh`, `max`, `ultracode`. 사용 가능한 수준은 모델에 따라 다름. `ultracode`는 ultracode를 켠 `xhigh` 요청이며 v2.1.203 이상 필요. 메인 대화 모델에서는 `modelSettings`, `effortLevel` 설정을 이 세션 동안 덮어쓰며 저장되지 않음 | 예: `claude --effort high` |
| `--fallback-model` | 기본 모델이 과부하이거나 사용할 수 없을 때(예: 종료된 모델) 지정한 모델로 자동 전환. 쉼표로 구분한 목록을 순서대로 시도(폴백 체인은 원문 참고). 세션 간 유지하려면 `fallbackModel` 설정을 쓰며, 이 플래그가 그 설정을 덮어씀 | 예: `claude --fallback-model sonnet,haiku` |
| `--model` | 이 세션의 모델 지정. 별칭(`sonnet`, `opus`, `haiku`, `fable`) 또는 모델 전체 이름. `model` 설정과 `ANTHROPIC_MODEL`보다 우선 | 예: `claude --model claude-sonnet-5` |

## 플래그 · 권한·도구 제한 (10)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--allow-dangerously-skip-permissions` | `bypassPermissions`로 시작하지는 않고 `Shift+Tab` 모드 순환에 추가. `plan` 같은 다른 모드로 시작했다가 나중에 `bypassPermissions`로 전환할 수 있음 | 예: `claude --permission-mode plan --allow-dangerously-skip-permissions` |
| `--allowedTools`, `--allowed-tools` | 권한 확인 없이 실행할 도구(네트워크 경로 읽기는 제외). 패턴은 권한 규칙 문법 참고. 사용 가능한 도구 자체를 제한하려면 `--tools` 사용. 작업 추적 도구를 이름으로 지정할 때의 동작은 원문 참고 | 예: `"Bash(git log *)" "Bash(git diff *)" "Read"` |
| `--dangerously-skip-permissions` | 권한 확인을 건너뜀. `--permission-mode bypassPermissions`와 같음. 무엇을 건너뛰고 건너뛰지 않는지는 권한 모드 문서 참고. `--bg`로 시작한 세션은 관리자가 재시작해도 이 모드가 유지됨 | 예: `claude --dangerously-skip-permissions` |
| `--disallowedTools`, `--disallowed-tools` | 거부 규칙. 도구 이름만 쓰면 그 도구를 Claude의 컨텍스트에서 제거(`"Edit"`는 Edit, `"*"`는 모든 도구, `"mcp__*"`는 모든 MCP 도구). `Bash(rm *)` 같은 범위 규칙은 도구는 남기고 일치하는 호출만 거부. `EndConversation`을 지정해도 다른 도구가 남아 있으면 제거되지 않음 | 예: `"Bash(git log *)" "Bash(git diff *)" "Edit"` |
| `--enable-auto-mode` | v2.1.111에서 제거됨. 자동 모드는 이제 기본으로 `Shift+Tab` 순환에 들어 있음. 자동 모드로 시작하려면 `--permission-mode auto` 사용 | 제거됨<br>예: `claude --permission-mode auto` |
| `--permission-mode` | 지정한 권한 모드로 시작: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, 또는 `default`의 별칭 `manual`. `manual`은 UI에서 Manual로 표시되는 모드를 고르며 v2.1.200 이상 필요(`claude --help`는 `default` 대신 이것을 표시하고 둘 다 동작). 설정 파일의 `defaultMode`를 덮어씀. 이 플래그나 `--dangerously-skip-permissions`가 없으면 새 세션은 원문의 '세션이 어떤 권한 모드로 시작하는가' 규칙을 따름(`-p` 실행 포함) | 예: `claude --permission-mode plan` |
| `--permission-prompt-tool` | 비대화형 모드에서 권한 확인을 처리할 MCP 도구를 지정. 실행에 로드되는 MCP 서버의 도구 전체 이름(`mcp__<서버>__<도구>`)을 입력. 첫 턴 전에 그 서버가 연결될 때까지 `MCP_TIMEOUT`(기본 30초)만큼 기다림. 사용자 상호작용이 필요하다고 표시된 MCP 도구는 승인할 수 없어, `allow` 결과가 거부로 바뀜(이 제한은 v2.1.199 이상) | 예: `claude -p --mcp-config ./mcp.json --permission-prompt-tool mcp__permissions__approve "query"` |
| `--permission-prompts` | print 모드에서 권한 확인에 누가 답할지 설정. 기본값 `host`는 Agent SDK 호스트나 `--permission-prompt-tool` 도구로 보냄. 답할 주체가 없으면 `none`을 주어 확인 없이 거부(무인 실행 설정 참고). v2.1.259 이상 | 예: `claude -p --permission-prompts none "query"` |
| `--restricted` | 제한 모드로 시작. 평가 도구가 공유 컴퓨터에서 `claude`를 돌릴 때, 명령 실행이나 그 컴퓨터의 사용자·프로젝트 설정 읽기를 막아야 하는 경우에 사용. 명령·코드를 실행하는 내장 도구와 WebFetch를 제거(`--tools`로 개별 지정하면 허용, `default` 프리셋으로는 안 됨). 내장 파일 도구를 작업 폴더로 제한하고, 관리형 설정과 `--settings`만 로드하며, `bypassPermissions`와 클라우드 세션 생성을 거부. v2.1.248 이상 | 예: `claude --restricted -p "query"` |
| `--tools` | Claude가 쓸 수 있는 내장 도구를 제한. 빈 문자열 `""`은 전부 끄기, `"default"`는 기본 세트, `"Bash,Edit,Read"`처럼 도구 이름도 지정 가능. macOS·Linux·WSL에서는 기본 세트에 `Glob`과 `Grep`이 빠짐(Glob 도구 동작 참고). 작업 추적 도구를 지정하면 세션이 그 기능에도 참여. MCP 도구에는 영향이 없으니 막으려면 `--disallowedTools "mcp__*"` 사용. `EndConversation`을 목록에서 빼도 제거되지 않고, `""`는 MCP 도구가 없을 때만 제거 | 예: `claude --tools "Bash,Edit,Read"` |

## 플래그 · 비대화형(-p)·스크립트 (17)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--bare` | 최소 모드: 훅, 스킬, 사용자 명령, 서브에이전트, 설치된 플러그인, MCP 서버, 자동 메모리, CLAUDE.md 자동 탐색을 건너뛰어 스크립트 호출이 빨리 시작됨. `--add-dir`로 지정한 폴더의 스킬은 로드됨. Claude는 Bash, 파일 읽기, 파일 수정 도구를 사용. `CLAUDE_CODE_SIMPLE`을 설정(bare 모드 문서 참고) | 예: `claude --bare -p "query"` |
| `--exclude-dynamic-system-prompt-sections` | 자동 메모리 위치 같은 사용자별 맥락을 시스템 프롬프트에서 빼서 첫 사용자 메시지로 옮김. 같은 작업을 돌리는 여러 사용자·기기 사이에서 프롬프트 캐시 재사용률을 높임. 기본 시스템 프롬프트를 쓸 때만 적용되고 `--system-prompt`나 `--system-prompt-file`이 있으면 무시됨. 스크립트·다중 사용자 작업에 `-p`와 함께 사용 | 예: `claude -p --exclude-dynamic-system-prompt-sections "query"` |
| `--forward-subagent-text` | 서브에이전트의 텍스트·사고 블록을 `parent_tool_use_id`가 붙은 `assistant`/`user` 메시지로 출력 스트림에 내보내 각 서브에이전트의 기록을 재구성할 수 있게 함. 이 플래그가 없으면 포그라운드 서브에이전트의 텍스트·사고 블록은 생략됨. `--print`와 `--output-format stream-json` 필요. 중첩 서브에이전트·포크된 스킬과 각각의 필요 버전은 원문 참고. `CLAUDE_CODE_FORWARD_SUBAGENT_TEXT` 환경 변수로도 같은 동작을 켤 수 있음. v2.1.211 이상 | 예: `claude -p --output-format stream-json --verbose --forward-subagent-text "query"` |
| `--init` | 세션 전에 `init` 매처의 Setup 훅 실행(print 모드 전용) | 예: `claude -p --init "query"` |
| `--init-only` | Setup과 `SessionStart` 훅을 실행한 뒤 대화를 시작하지 않고 종료 | 예: `claude --init-only` |
| `--include-hook-events` | 훅 생명주기 이벤트를 출력 스트림에 포함. `SessionStart`와 `Setup` 훅 이벤트는 항상 포함됨. `Notification`, `SessionEnd`, `PreCompact`, `PostCompact` 같은 일부 이벤트는 이 플래그를 써도 `hook_started`가 나오지 않음. 이런 이벤트는 1초 넘게 도는 명령 훅이 출력을 낼 때 `hook_progress`를, 백그라운드 훅이 끝났을 때만 `hook_response`를 내보냄. `--output-format stream-json` 필요 | 예: `claude -p --output-format stream-json --verbose --include-hook-events "query"` |
| `--include-partial-messages` | 부분 스트리밍 이벤트를 출력에 포함. `--print`와 `--output-format stream-json` 필요 | 예: `claude -p --output-format stream-json --verbose --include-partial-messages "query"` |
| `--input-format` | print 모드의 입력 형식(`text`, `stream-json`) | 예: `claude -p --input-format stream-json --output-format stream-json --verbose` |
| `--json-schema` | 에이전트가 작업을 끝낸 뒤 JSON 스키마에 맞게 검증된 JSON 출력을 받음(print 모드 전용). 스키마가 잘못되면 오류로 종료하며, `format` 키워드는 클라이언트 검증 없이 주석으로만 인정 | 예: `claude -p --json-schema '{"type":"object","properties":{...}}' "query"` |
| `--maintenance` | 세션 전에 `maintenance` 매처의 Setup 훅 실행(print 모드 전용) | 예: `claude -p --maintenance "query"` |
| `--max-budget-usd` | API 호출 예상 비용이 이 금액에 닿으면 실행을 멈춤(print 모드 전용). 클라이언트 측 추정치라 실제 청구액과 다를 수 있고, 서브에이전트 비용도 포함됨. 한도를 넘을 수 있으니 여유를 둘 것. `--continue`/`--resume`으로 돌아올 때 이전 실행에서 복원된 합계는 포함되지 않음. 한도에 닿으면 새 서브에이전트 생성이 `Budget limit reached`로 실패하고 실행 중인 백그라운드 서브에이전트도 중지됨(이 동작은 v2.1.217 이상) | 예: `claude -p --max-budget-usd 5.00 "query"` |
| `--max-turns` | 에이전트 턴 수 제한(print 모드 전용). 기본값은 제한 없음. `--input-format stream-json`에서는 제한으로 턴이 끝났을 때 대기 중인 메시지가 남아 있으면 그 메시지가 새 턴을 자체 제한과 함께 시작 | 예: `claude -p --max-turns 3 "query"` |
| `--no-session-persistence` | 세션을 디스크에 저장하지 않아 다시 열 수 없게 함. print 모드 전용. 모든 모드에서 같은 효과를 내려면 `CLAUDE_CODE_SKIP_PROMPT_HISTORY` 환경 변수 사용 | 예: `claude -p --no-session-persistence "query"` |
| `--output-format` | print 모드의 출력 형식(`text`, `json`, `stream-json`) | 예: `claude -p "query" --output-format json` |
| `--print`, `-p` | 대화형 모드 없이 응답을 출력(프로그램에서 쓰는 방법은 Agent SDK 문서 참고). 아직 실행 중인 백그라운드 세션을 `--resume`하는 경우는 원문 참고 | 예: `claude -p "query"` |
| `--prompt-suggestions` | 프롬프트 제안이 만들어진 턴마다 예측한 다음 사용자 프롬프트를 담은 `prompt_suggestion` 메시지를 내보냄(아주 짧은 대화에서는 없을 수 있음). `--print`, `--output-format stream-json`, `--verbose` 필요 | 예: `claude -p --prompt-suggestions --output-format stream-json --verbose "query"` |
| `--replay-user-messages` | stdin으로 받은 사용자 메시지를 확인용으로 stdout에 다시 내보냄. `--input-format stream-json`과 `--output-format stream-json` 필요 | 예: `claude -p --input-format stream-json --output-format stream-json --verbose --replay-user-messages` |

## 플래그 · 시스템 프롬프트 (7)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--append-subagent-system-prompt` | 모든 서브에이전트(중첩 포함)의 시스템 프롬프트 끝에 텍스트를 추가. 대화 자체의 프롬프트를 재사용하는 포크된 서브에이전트는 제외. `-p` 비대화형 모드에서만 적용. v2.1.205 이상 | 예: `claude -p --append-subagent-system-prompt "Cite file paths in every answer" "query"` |
| `--append-subagent-system-prompt-file` | 파일의 텍스트를 서브에이전트 시스템 프롬프트에 추가. 명령줄로 넘기기엔 긴 텍스트용이며 `--append-subagent-system-prompt`와 함께 쓸 수 없음. `-p` 비대화형 모드에서만 적용. v2.1.261 이상 | 예: `claude -p --append-subagent-system-prompt-file ./subagent-rules.txt "query"` |
| `--append-system-prompt` | 기본 시스템 프롬프트 끝에 텍스트를 추가 | 예: `claude --append-system-prompt "Always use TypeScript"` |
| `--append-system-prompt-file` | 파일의 시스템 프롬프트 텍스트를 기본 프롬프트 끝에 추가 | 예: `claude --append-system-prompt-file ./extra-rules.txt` |
| `--system-prompt` | 시스템 프롬프트 전체를 지정한 텍스트로 교체 | 예: `claude --system-prompt "You are a Python expert"` |
| `--system-prompt-file` | 파일에서 시스템 프롬프트를 불러와 기본 프롬프트를 교체 | 예: `claude --system-prompt-file ./custom-prompt.txt` |
| `--system-prompt-snapshot` | `off`를 주면 대화의 첫 요청에 기록된 프롬프트를 재사용하지 않고 매 요청마다 시스템 프롬프트를 다시 만듦(예: `--continue` 실행을 거듭하며 `--append-system-prompt` 텍스트를 고쳐 볼 때). v2.1.257 이상 | 예: `claude --system-prompt-snapshot off` |

## 플래그 · 에이전트·MCP·플러그인·설정 (12)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--agent` | 현재 세션에 쓸 에이전트를 지정(`agent` 설정보다 우선) | 예: `claude --agent my-custom-agent` |
| `--agents` | JSON으로 사용자 정의 서브에이전트를 즉석에서 정의. CLI에서 정의하는 서브에이전트의 필드를 받음. `--print`와 함께면 값을 JSON 파일 경로로 줄 수도 있음(파일 형식은 v2.1.281 이상). 시작할 때 값을 검증하고 잘못되면 종료함(검증은 v2.1.242 이상, 검증을 건너뛰는 플래그와 환경 변수는 원문 참고) | 예: `claude --agents '{"reviewer":{"description":"Reviews code","prompt":"You are a code reviewer"}}'` |
| `--channels` | (연구 미리보기) 이 세션에서 채널 알림을 들을 MCP 서버. `plugin:<이름>@<마켓플레이스>` 항목을 공백으로 구분한 목록. claude.ai 또는 Console API 키로 Anthropic 인증 필요 | 예: `claude --channels plugin:my-notifier@my-marketplace` |
| `--dangerously-load-development-channels` | 승인 목록에 없는 채널을 로컬 개발용으로 켬. `plugin:<이름>@<마켓플레이스>`, `server:<이름>` 항목을 받음. 확인 창이 뜨므로 대화형 세션에서만 적용되며 `-p`에서는 무시됨 | 예: `claude --dangerously-load-development-channels server:webhook` |
| `--disable-slash-commands` | 이 세션의 모든 스킬과 명령을 끔 | 예: `claude --disable-slash-commands` |
| `--mcp-config` | JSON 파일이나 문자열로 MCP 서버를 불러옴(공백으로 구분). `-p`와 함께 쓰면 첫 턴 전에 아직 연결 중인 서버를 `MCP_TIMEOUT`(기본 30초)까지 기다림. 도구 목록이 캐시된 서버는 기다리지 않고 처음 쓸 때 연결. 자체 호스팅 환경에서는 더 짧게 기다림. 이 대기는 v2.1.221 이상 | 예: `claude --mcp-config ./mcp.json` |
| `--plugin-dir` | 이 세션에서만 디렉터리나 `.zip`의 플러그인(또는 플러그인 폴더 안의 여러 개)을 로드. 플래그 하나에 경로 하나이며, 여러 개면 반복(`--plugin-dir A --plugin-dir B.zip`). 플러그인 폴더를 넘기는 방식은 v2.1.265 이상 | 예: `claude --plugin-dir ./my-plugin` |
| `--plugin-url` | 이 세션에서만 URL의 플러그인 `.zip`을 가져옴. 여러 개면 플래그를 반복하거나, 따옴표 안에 공백으로 구분한 URL을 한 번에 전달 | 예: `claude --plugin-url https://example.com/plugin.zip` |
| `--setting-sources` | 불러올 설정 출처를 쉼표로 구분해 지정(`user`, `project`, `local`). 이 세션에서 시작하는 세션이 목록을 상속하는 방식은 에이전트 뷰·에이전트 팀 문서 참고 | 예: `claude --setting-sources user,project` |
| `--settings` | 설정 JSON 파일 경로 또는 인라인 JSON 문자열. 여기서 정한 값은 이 세션 동안 `settings.json`의 같은 키를 덮어쓰고, 생략한 키는 파일의 값을 유지. 파일은 2 MiB 이하의 일반 파일이어야 함(설정 우선순위 참고) | 예: `claude --settings ./settings.json` |
| `--strict-mcp-config` | `--mcp-config`의 MCP 서버만 사용하고 다른 MCP 설정은 모두 무시. 관리형 MCP 파일이 있을 때의 동작은 원문 참고 | 예: `claude --strict-mcp-config --mcp-config ./mcp.json` |
| `--teammate-mode` | 에이전트 팀 팀원의 표시 방식: `in-process`(기본), `auto`, `tmux`, `iterm2`. 이 세션에서 `teammateMode` 설정을 덮어씀(표시 방식 선택 참고) | 예: `claude --teammate-mode auto` |

## 플래그 · 백그라운드·클라우드·원격 (8)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--bg`, `--background` | 세션을 백그라운드 에이전트로 시작하고 즉시 반환. 세션 ID와 관리 명령을 출력. `--exec`와 함께 쓰면 Claude 세션 대신 셸 명령을 백그라운드 작업으로, `--agent`와 함께 쓰면 특정 서브에이전트를 실행. 시작 전에 그 폴더의 작업 영역 신뢰 여부를 확인. `-p`/`--print`와 함께 쓸 수 없음(오류 레퍼런스 참고) | 예: `claude --bg "investigate the flaky test"` |
| `--cloud` | 작업 설명을 주면 새 클라우드 세션을 만듦. 세션 ID(`session_...` 또는 `cse_...`)나 claude.ai/code URL을 주면 `-p`와 함께 그 기존 세션에 메시지를 대기열로 보냄(후속 메시지 보내기 참고) | 예: `claude --cloud "Fix the login bug"` |
| `--environment <environment-id>` | 주어진 ID의 자체 호스팅 환경에서 실행되는 새 클라우드 세션을 만듦. 환경 ID는 `ccpool_`로 시작. 배포 동작과 함께 쓸 수 없는 플래그 조합은 원문 참고. v2.1.224 이상 | 예: `claude -p "Fix the login bug" --environment ccpool_abc123` |
| `--exec` | Claude 세션을 시작하는 대신 셸 명령을 PTY 기반 백그라운드 작업으로 실행. 셸에서 띄울 때는 `--bg`와 함께 사용 | 예: `claude --bg --exec 'pytest -x'` |
| `--ref <branch>` | `--environment`와 함께 쓸 때 새 세션의 체크아웃을 로컬 `HEAD` 대신 지정한 ref(브랜치)로 설정 | 예: `claude -p "Run the smoke test" --environment ccpool_abc123 --ref main` |
| `--remote` | `--cloud`의 더 이상 권장되지 않는 별칭(기존 세션 형식 포함) | 더 이상 권장되지 않음<br>예: `claude --remote "Fix the login bug"` |
| `--remote-control`, `--rc` | Remote Control을 켠 대화형 세션을 시작해 claude.ai나 Claude 앱에서도 제어할 수 있게 함. 세션 이름을 줄 수 있음. 별칭 `--rc` | 예: `claude --remote-control "My Project"` |
| `--remote-control-session-name-prefix <prefix>` | 이름을 따로 주지 않을 때 자동 생성되는 Remote Control 세션 이름의 접두어. 기본값은 기기 호스트 이름이며 `myhost-graceful-unicorn` 같은 이름이 만들어짐. 같은 효과를 내는 환경 변수는 `CLAUDE_REMOTE_CONTROL_SESSION_NAME_PREFIX` | 예: `claude remote-control --remote-control-session-name-prefix dev-box` |

## 플래그 · 디버그·진단·접근성 (5)

| 플래그 | 설명 | 비고 |
| :- | :- | :- |
| `--ax-screen-reader` | 스크린 리더 친화 출력: 장식 테두리·애니메이션 없는 평문. 클래식 렌더러를 강제하므로 `tui` 설정은 효과가 없음(연결한 백그라운드 세션은 여전히 전체 화면으로 표시). `CLAUDE_AX_SCREEN_READER` 환경 변수와 `axScreenReader` 설정보다 우선. v2.1.181 이상 | 예: `claude --ax-screen-reader` |
| `--debug` | 디버그 모드 켜기. `--debug='mcp,startup'`, `--debug='!mcp'`처럼 카테고리 필터를 줄 수 있음. 필터는 `=` 형식에서만 적용되고, 공백으로 구분하면 필터 없이 디버그만 켜짐 | 예: `claude --debug='mcp,startup'` |
| `--debug-file <path>` | 디버그 로그를 지정한 파일에 기록. 디버그 모드를 함께 켬. `CLAUDE_CODE_DEBUG_LOGS_DIR`보다 우선 | 예: `claude --debug-file /tmp/claude-debug.log` |
| `--safe-mode` | 설정이 꼬였을 때 원인을 찾기 위해 모든 사용자 설정을 끄고 시작: CLAUDE.md, 스킬, 플러그인, 훅, MCP 서버, 사용자 명령·에이전트, 출력 스타일, 워크플로, 사용자 테마·키 바인딩, 상태줄·파일 제안 명령, LSP 서버, 자동 메모리를 로드하지 않음. 인증, 모델 선택, 내장 도구, 권한은 정상 동작(`--bare`와 다름). 관리형 설정 정책은 계속 적용(정책으로 설정된 훅·상태줄·파일 제안 명령 포함)되나 관리형 플러그인·스킬·CLAUDE.md와 정책으로 설정된 MCP 서버는 로드되지 않음. 자동 모델 전환의 원인이 내 설정인지 확인할 때 유용. `CLAUDE_CODE_SAFE_MODE`를 설정 | 예: `claude --safe-mode` |
| `--verbose` | 상세 로그 켜기(턴별 전체 출력 표시). 이 세션에서 `viewMode` 설정을 덮어씀 | 예: `claude --verbose` |

---

**출처:** [공식 문서 cli-reference](https://code.claude.com/docs/en/cli-reference) · 이 표는 2026-11-17에 공식 문서에서 자동 추출했고, 설명은 한국어로 옮긴 것입니다. 한국어 설명이 원문과 다르거나 새 항목이 보이지 않으면 원문을 기준으로 하세요. 이 표는 작성에 쓴 Claude Code 2.1.323 기준 문서이며, 내 버전에 따라 다를 수 있습니다.
