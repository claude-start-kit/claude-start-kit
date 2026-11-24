# 권한 규칙 심화

> 2단계에서 `allow`·`ask`·`deny` 규칙의 기본을 배웠습니다. 이번에는 **규칙이 정확히 어떻게 일치하는지**, 어디가 **허술한지**, 그리고 **훅·샌드박스와 어떻게 함께 쓰는지**를 다룹니다. 먼저 [권한 모드](#/level2/permissions)를 읽고 오세요.

## 규칙은 Claude의 판단이 아니라 **Claude Code가 강제**합니다
`CLAUDE.md`나 프롬프트에 "이 파일은 건드리지 마"라고 써도 Claude의 **행동 의도**만 바뀔 뿐 권한 규칙은 바뀌지 않습니다. 접근을 허용·회수하려면 `/permissions`, 설정 파일의 규칙, 권한 모드, 또는 `PreToolUse` 훅을 쓰세요.

## 규칙 평가 순서
세 종류의 규칙은 **거부(deny) → 확인(ask) → 허용(allow)** 순서로 평가하고 **첫 번째로 맞는 규칙**이 결과를 정합니다.

| 종류 | 효과 |
|---|---|
| `allow` | 묻지 않고 사용 |
| `ask` | 사용할 때 확인을 물음 |
| `deny` | 사용 금지 |

- **구체성은 순서를 바꾸지 않습니다.** `deny`의 `Bash(aws *)`는 더 좁은 `allow`의 `Bash(aws s3 ls)`가 있어도 **막습니다.** allow로 deny의 예외를 만들 수 없습니다
- ask와 allow도 마찬가지입니다. 더 구체적인 allow가 있어도 맞는 ask가 있으면 **묻습니다**
- **도구 이름만** 쓴 deny(`Bash`)는 도구를 Claude의 **컨텍스트에서 아예 제거**합니다. 중간에 추가하면 다음 도구 호출부터 쓸 수 없습니다
- 여러 설정 범위에서 **한 곳이라도 deny**면 다른 곳이 allow해도 막힙니다. 관리형 설정의 deny는 `--allowedTools`로도 못 풉니다 ([팀·조직 설정](#/level3/managed-settings))
- `/permissions`로 규칙을 추가·삭제하면 **같은 턴의 다음 도구 호출부터** 적용됩니다

## 규칙 문법
형식은 `도구` 또는 `도구(지정자)`입니다.

| 규칙 | 의미 |
|---|---|
| `Bash` · `Bash(*)` | **모든** Bash 명령 (deny면 도구 제거) |
| `Read` | 모든 파일 읽기 |
| `Bash(npm run build)` | 정확히 이 명령 |
| `Read(./.env)` | 현재 폴더의 `.env` 읽기 |
| `WebFetch(domain:example.com)` | 해당 도메인 요청 |

### 입력 매개변수로 지정하기: `도구(이름:값)`
**deny와 ask**에서는 도구가 받는 최상위 입력값으로 맞출 수 있습니다.
| 규칙 | 일치하는 호출 |
|---|---|
| `Agent(model:opus)` | Opus 모델을 요청하는 서브에이전트 호출 |
| `Agent(isolation:worktree)` | git worktree 격리를 요청하는 호출 |
| `Bash(run_in_background:true)` | 백그라운드로 실행하는 Bash 호출 |

- 값이 **정확히** 같아야 하고 `*`로 일부를 대신할 수 있습니다
- 한 규칙에는 **매개변수 하나**. 둘을 모두 조건으로 하려면 규칙 두 개
- 모델이 **생략한** 매개변수는 일치하지 않습니다 (`Agent(model:*)`는 모델을 안 정한 호출에 안 맞음)
- **주 내용 필드**(Bash의 `command`, Read·Edit의 `file_path`, WebFetch의 `url` 등)는 이 방식으로 지정할 수 없습니다. `Bash(command:rm *)`는 복합 명령으로 우회되므로 **무시되고 경고**가 나옵니다. `Bash(rm *)`처럼 쓰세요
- 무슨 매개변수를 보내는지 보려면 `claude -p "..." --output-format stream-json --verbose`로 `tool_use`의 `input`을 확인하세요 ([헤드리스](#/level3/headless))

### 와일드카드 `*`
`Bash` 규칙에서 `*`는 **공백을 포함해 아무 글자**나 대신합니다. 규칙에 `*`가 없으면 **정확히 그 명령**만 맞습니다.

> **`*`는 하위 명령 뒤에** 두세요. `git log --oneline main`에서 `git`은 프로그램, `log`는 하위 명령입니다. `*` 앞의 글자는 **쓴 그대로** 일치해야 하므로 `Bash(git log *)`는 `git log`만, `Bash(git *)`는 **모든 git 명령**을 허용합니다.

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git commit *)"],
    "deny":  ["Bash(git push *)"]
  }
}
```

| 규칙 | 일치 | 불일치 |
|---|---|---|
| `Bash(npm run build)` | `npm run build` | `npm run build --watch` |
| `Bash(npm run *)` | `npm run build`, `npm run test --watch`, `npm run` | `npm install` |
| `Bash(git log * main)` | `git log --oneline main`, `git log -5 main` | `git log main`, `git push origin main` |
| `Bash(git * main)` | `git merge main`, `git push origin main` | `git log` |
| `Bash(* --version)` | `node --version` | `node -v` |
| `Bash(ls *)` | `ls -la`, `ls` | `lsof` |
| `Bash(ls*)` | `ls -la`, `lsof` | |

**세 가지 규칙**
1. `*`는 **그 자리에 있는 모든 글자**입니다. `Bash(git * main)`은 모든 git 하위 명령과 앞에 오는 모든 옵션(`-c` 포함)에 맞고, `Bash(* --version)`은 **어떤 프로그램**이든 맞습니다
2. 맨 끝 **` *`(공백+별표)** 는 **인자 없는 명령**도 포함합니다 (`Bash(ls *)`는 `ls`에도 맞음). 단, 별표가 규칙의 **유일한 와일드카드**일 때만
3. 별표 **앞의 공백도 규칙의 일부**입니다. `Bash(ls *)`는 `lsof`를 막지만 `Bash(ls*)`는 `lsof`도 맞춥니다

`Bash(ls:*)` 형태(끝의 `:*`)는 `Bash(ls *)`와 같습니다. 규칙 **중간**의 `:*`(예: `Bash(git:* push)`)는 글자 그대로 취급되어 맞지 않습니다.

### 도구 이름 와일드카드
**deny·ask**는 도구 이름 자리에 글롭(`*`)을 쓸 수 있습니다. 이름 **전체**에 맞아야 합니다.
```json
{ "permissions": { "deny": ["mcp__*"] } }
```
`"*"`은 모든 도구, `"mcp__*"`는 모든 MCP 서버의 모든 도구입니다. **allow**는 반드시 `mcp__서버이름__` 접두사 뒤에서만 글롭이 허용됩니다 (`mcp__puppeteer__*`, `mcp__github__get_*`). 접두사 없는 `"*"`, `"B*"`, `"mcp__*"` 같은 allow는 **건너뛰어지고** 아무것도 승인하지 않습니다.

## 도구별 규칙

### Bash — 복합 명령
`&&`, `||`, `;`, `|`, `|&`, `&`, 줄바꿈을 인식합니다. `Bash(safe-cmd *)`가 있어도 `safe-cmd && other-cmd`는 승인되지 않습니다. **모든 하위 명령이 허용**되어야 묻지 않고 실행됩니다.
- **deny·ask는 하위 명령 중 하나라도 맞으면** 적용됩니다 (서브셸, 명령 치환, `for` 반복 안의 명령 포함). `Bash(git clean *)` ask는 `cd /tmp && git clean -f`나 `echo "$(git clean -f)"`에도 묻습니다
- `npm test &&`처럼 뒤가 비어 있으면 **해석 불가**로 보고 allow 규칙으로 승인하지 않습니다
- 복합 명령에 "Yes, and don't ask again"을 고르면 **하위 명령별로 규칙이 따로** 저장됩니다

### Bash — 래퍼(wrapper)
규칙을 맞추기 전에 `timeout`, `time`, `nice`, `nohup`, `stdbuf`, `command`, `builtin`, `noglob`을 **벗겨 냅니다.** 그래서 `Bash(npm test *)`는 `timeout 30 npm test`에도 맞습니다. 그리고:
- 알려진 **안전한 환경 변수** 지정(`NODE_ENV=test npm test`)도 벗겨집니다. **다른 변수**를 붙이면 allow 규칙은 맞지 않지만, deny·ask는 어떤 변수 지정이 앞에 있어도 맞습니다 (`Bash(rm *)` deny는 `FOO=bar rm -rf tmp/`도 막음)
- 플래그 없는 `xargs`도 벗겨집니다
- **`npx`, `docker exec`, `devbox run`, `mise exec`** 같은 실행 도구는 목록에 **없습니다.** `Bash(devbox run *)`은 `run` 뒤에 오는 **무엇이든** 허용하는 셈입니다
- `watch`, `setsid`, `flock` 같은 **실행 래퍼**와, 삭제·쓰기 동작(`-exec`, `-delete`, `-fprint`)이 붙은 **`find`** 는 접두사 규칙으로 자동 승인되지 않아 **묻습니다**

### Bash 규칙이 **막지 못하는** 것 — 가장 중요합니다
Bash 규칙은 **Claude가 쓴 명령 글자**를 맞춥니다. 같은 프로그램을 **다른 모양**으로 호출하면 맞지 않습니다. deny·ask 규칙은 **보안 경계가 아니라** 평소 만드는 호출을 잡는 장치입니다.

| 규칙 | 막는 것 | **막지 못하는 것** |
|---|---|---|
| `Bash(curl *)` | `curl https://example.com` | `/usr/bin/curl https://...`, `sh -c 'curl https://...'` |
| `Bash(rm *)` | `rm -rf build/` | `/bin/rm -rf build/`, `bash -c 'rm -rf build/'` |
| `Bash(git push *)` | `git push origin main` | `git -C . push origin main`, `git -c push.default=current push origin main` |

> **인자를 제한하는 패턴은 깨지기 쉽습니다.** `Bash(curl http://github.com/ *)`로 GitHub 주소만 허용하려 해도 `curl -X GET http://github.com/...`(옵션이 앞), `https://`(다른 프로토콜), 리다이렉트, 변수(`URL=... && curl $URL`)에는 맞지 않습니다.
>
> **더 안전한 방법:** ① `curl`·`wget`을 deny하고 `WebFetch(domain:github.com)`로 허용 도메인만 열기 (샌드박스 네트워크 허용 목록과 함께 쓰기) ② `PreToolUse` [훅](#/level3/hooks)에서 URL 검사 ③ `CLAUDE.md` 안내 (의도를 알려 줄 뿐 **강제는 아님**).
>
> 파일·네트워크를 **명령 글자와 무관하게** 막으려면 [샌드박스](#/level3/sandbox)를 쓰세요.

### 읽기 전용 명령
`ls`, `cat` 같은 **읽기 전용으로 인식된 명령**은 모든 모드에서 묻지 않고 실행됩니다. 단, 다음은 일반 모드에서도 **묻습니다.**
- 쓰기·실행 플래그가 있는 명령(`find`, `sort`, `sed`, `git`)에 **따옴표 없는 글롭**이 있을 때 (`-delete`로 확장될 수 있어서)
- `docker`가 **다른 데몬**을 가리킬 때, `ps auxe`처럼 **환경 변수를 출력**할 수 있는 형태
- **Windows 네트워크 경로(UNC, `\\서버\공유\파일`)** — 접근하면 Windows 자격 증명이 그 호스트로 전송될 수 있어서
- `PATH`·`IFS` 같은 **특수 셸 변수**를 바꿀 때, 해석할 수 없는 명령, 10,000자가 넘는 명령
- `cd`와 `git`을 함께 쓸 때(다른 디렉터리로 가면 그곳의 훅이 실행될 수 있음)

### 리다이렉션
`> 파일`, `>> 파일`, `2> 파일`의 **대상 파일**은 Claude가 직접 쓴 것처럼 `Edit` 규칙·보호 경로·작업 폴더 규칙으로 검사됩니다. `Bash(git commit *)`가 허용돼도 **리다이렉션 대상까지** 허용하는 것은 아닙니다. `< 파일`은 `Read` 규칙으로 검사합니다. `/dev/null`, `2>&1` 같은 파일 없는 형태는 검사하지 않습니다. `tee`가 쓰는 파일도 같은 방식으로 검사합니다.

### PowerShell (Windows)
형식은 Bash와 같고 `PowerShell` 또는 `PowerShell(*)`은 모든 명령입니다.
```json
{
  "permissions": {
    "allow": ["PowerShell(Get-ChildItem *)", "PowerShell(git commit *)"],
    "deny":  ["PowerShell(Remove-Item *)"]
  }
}
```
- 흔한 **별칭은 정규화**되어 `PowerShell(Get-ChildItem *)`이 `gci`, `ls`, `dir`에도 맞습니다. **대소문자는 구분하지 않습니다**
- AST를 분석해 파이프 `|`, `;`, (PowerShell 7+) `&&`·`||`로 나뉜 **하위 명령을 각각** 검사하며 모두 허용돼야 묻지 않고 실행됩니다
- 쉘 명령을 실행하는 도구가 **둘**(Bash, PowerShell)이라면 **둘 다**에 규칙을 쓰세요. `Bash(rm *)`만으로는 `Remove-Item`을 막지 못합니다

### Read와 Edit — 파일 경로 규칙
```json
{
  "permissions": {
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)", "Edit(./package-lock.json)"]
  }
}
```
- `Edit` 규칙은 파일을 **고치는 모든 기본 도구**에 적용됩니다
- `Read(경로)` deny는 Grep·Glob, `@파일` 멘션, 붙여넣은 **이미지 경로**, @멘션한 **폴더의 목록**에도 **최선을 다해** 적용됩니다
- `Read` deny는 같은 경로의 **Edit·Write도 막습니다** (새 파일 생성 포함). NotebookEdit는 포함되지 않으니 못 고치게 하려면 `Edit` deny를 추가하세요
- **`Write(경로)`, `Glob(경로)`, `Grep(경로)` 규칙은 일치하지 않습니다.** `Write(docs/**)` 대신 `Edit(docs/**)`, `Grep(docs/**)` 대신 `Read(docs/**)`를 쓰세요

> **Read·Edit deny가 못 막는 것:** 파일 이름을 말하지 않고 읽는 명령(`grep -r pattern .`)이나, 파이썬·노드 스크립트가 **파일을 직접 여는** 경우에는 적용되지 않습니다. OS 수준에서 막으려면 [샌드박스](#/level3/sandbox)가 필요합니다.

#### 경로 패턴 4종 (gitignore 문법)
| 패턴 | 의미 | 예 |
|---|---|---|
| `//경로` | **파일 시스템 루트**부터의 절대 경로 | `Read(//Users/alice/secrets/**)` |
| `~/경로` | **홈 디렉터리**부터 | `Read(~/Documents/*.pdf)` |
| `/경로` | **설정 파일 기준** 상대 경로 | `Edit(/src/**/*.ts)` |
| `경로` 또는 `./경로` | **현재 디렉터리** 기준 | `Read(*.env)` |

> **함정:** `/Users/alice/file`은 절대 경로가 **아닙니다.** 슬래시 하나는 **설정 파일 기준**입니다. 절대 경로는 `//Users/alice/file`입니다.

`/경로`가 가리키는 위치는 규칙을 둔 **설정 파일에 따라 달라집니다.**
| 규칙을 둔 곳 | `/경로`의 기준 |
|---|---|
| `.claude\settings.json`, `.claude\settings.local.json` | **주 작업 폴더** |
| `%USERPROFILE%\.claude\settings.json` | `~/.claude/` |
| `--settings 파일` | 그 **파일이 있는 폴더** |
| 명령줄·세션 규칙 | 주 작업 폴더 |

그래서 사용자 설정의 `Read(/secrets/**)`는 **프로젝트의 `secrets`가 아니라** `~/.claude/secrets/**`를 막습니다. 모든 프로젝트에 적용하려면 `//`나 `~/`를 쓰세요.

**Windows 경로:** 경로는 **POSIX 형태로 바뀐 뒤** 비교됩니다. `C:\Users\alice`는 `/c/Users/alice`가 되므로 C 드라이브 어디서나 `.env`를 막으려면 `Read(//c/**/.env)`, **모든 드라이브**는 `Read(//**/.env)`처럼 씁니다.

### WebFetch
`domain:` 접두사와 **호스트 이름**으로 맞춥니다. 대소문자 구분이 없고 끝의 `.`은 무시합니다.
- `WebFetch(domain:example.com)` — `example.com`**만** (하위 도메인은 제외)
- `WebFetch(domain:*.example.com)` — **모든 깊이의 하위 도메인**(`api.example.com`, `a.b.example.com`). `example.com` 자체는 **제외**
- `WebFetch(domain:*)` — 모든 도메인

| 규칙 | `allow`에서 | `deny`에서 |
|---|---|---|
| `WebFetch` (이름만) | 묻지 않고 가져옴. **샌드박스가 접근할 호스트는 안 바뀜** | **도구 자체를 제거** → 아예 못 가져옴 |
| `WebFetch(domain:*)` | 묻지 않고 가져옴 + **샌드박스 명령도 모든 호스트 접근** | 도구는 두고 **모든 가져오기를 거절**, 샌드박스 명령도 모든 호스트 차단 |

두 형태는 **샌드박스 도메인 목록**에 반영되는지가 다릅니다.

> `WebFetch`만 막아도 **네트워크가 차단되지 않습니다.** Bash가 허용돼 있으면 `curl`, `wget`으로 어느 주소든 갈 수 있습니다.

### MCP
- `mcp__puppeteer` 또는 `mcp__puppeteer__*` — 그 서버의 **모든 도구**
- `mcp__puppeteer__puppeteer_navigate` — **그 도구 하나**
- 서버 이름의 `.`·공백은 `_`로 바뀝니다 (`my.server` → `mcp__my_server__*`). 플러그인 서버는 `mcp__plugin_플러그인_서버__*` 형태입니다
- MCP allow 규칙에는 **지정자를 붙이지 마세요.** 일부 호출만 허용하려고 붙이면 **어떤 호출에도 맞지 않습니다.** 설정 파일에 괄호가 든 `mcp__` 규칙은 **건너뛰어집니다**
- claude.ai 커넥터 도구는 `mcp__claude_ai_<서버>__<도구>`로 나타납니다. 조직이 `ask`로 정한 커넥터 도구는 allow 규칙이 **효력이 없습니다**

### Agent(서브에이전트)
`Agent(Explore)`, `Agent(Plan)`, `Agent(my-custom-agent)`로 서브에이전트를 지정합니다. `deny`에 넣으면 해당 서브에이전트를 쓸 수 없습니다.
```json
{ "permissions": { "deny": ["Agent(Explore)"] } }
```

## 규칙 오타를 잡아 주는 경고
- 어느 도구에도 맞지 않는 deny·ask 규칙은 **시작할 때 경고**합니다 (`_`나 `*`가 든 이름은 제외)
- `Bash(git *)`처럼 **첫 `*` 앞이 너무 짧은** 규칙도 경고합니다
- `claude doctor`와 시작 시 잘못된 설정 대화상자에서 건너뛴 규칙을 볼 수 있습니다

## 훅으로 권한 보완하기
`PreToolUse` [훅](#/level3/hooks)은 **권한 확인 전에** 실행되어 호출을 거부하거나, 묻게 하거나, 묻지 않고 통과시킬 수 있습니다.

**규칙과 훅의 우선순위**
- 훅의 `allow`는 규칙을 **넘지 못합니다.** 맞는 `deny` 규칙은 훅이 `allow`를 줘도 막고, 맞는 `ask` 규칙은 훅이 `allow`·`ask`를 줘도 **묻습니다**
- **종료 코드 2로 막는 훅**은 권한 규칙을 평가하기 **전에** 호출을 멈춥니다. allow 규칙이 있어도 막힙니다
- 훅이 `deny`하면 `bypassPermissions` 모드에서도 막힙니다
- **플랜 모드**에서는 훅의 `allow`가 파일 수정 같은 **읽기 전용이 아닌 호출**에는 효과가 없습니다

> "Bash는 모두 허용하되 **몇 개만** 막고 싶다"면 `allow`에 `"Bash"`를 넣고 막을 것만 `deny`에 나열하거나 `PreToolUse` 훅으로 막으세요. deny가 먼저 평가됩니다.

## 작업 폴더 추가
기본적으로 Claude는 **실행한 폴더**의 파일에 접근합니다. 넓히는 방법:
| 방법 | 시점 |
|---|---|
| `--add-dir <경로>` | 시작할 때 |
| `/add-dir` | 세션 중 |
| 설정의 `additionalDirectories` | 영구 설정 |

추가한 폴더의 파일은 **묻지 않고 읽을** 수 있고(네트워크 경로 검사 제외), 수정 권한은 현재 권한 모드를 따릅니다. 단, 폴더를 추가해도 **그 안의 설정·스킬·훅 같은 구성은 대부분 로드되지 않습니다** (파일 접근만 허용).
- **UNC 공유(`\\서버\공유`)는 작업 폴더로 추가할 수 없습니다.** 접근하면 호스트에 자격 증명이 새어 나갈 수 있어서입니다. Windows에서는 **드라이브 문자에 연결**한 뒤 `--add-dir`로 추가하세요
- `permissions.blockReadsOutsideWorkingDirectories`를 켜면 홈이나 마운트된 볼륨 등 작업 폴더 **밖** 읽기를 막을 수 있습니다

## 권한 모드와 관련 설정
| 모드 | 동작 |
|---|---|
| `default` (화면에는 Manual) | 대부분의 수정·셸 명령·네트워크 요청 전에 물음 |
| `acceptEdits` | 작업 폴더의 파일 수정과 `mkdir`, `touch`, `mv`, `cp` 같은 흔한 파일 명령을 자동 허용 |
| `plan` | 읽기·읽기 전용 명령으로 탐색만, 소스를 수정하지 않음 |
| `auto` | 분류기가 동작을 검토하며 일상적인 확인은 생략 |
| `dontAsk` | 물어봐야 할 호출은 **자동 거부**. 미리 허용한 도구는 동작 |
| `bypassPermissions` | 확인을 건너뜀 (아래 경고) |

> **`bypassPermissions`는 `.git`·`.claude` 같은 보호 경로 쓰기도 묻지 않습니다.** 격리된 환경에서만 쓰세요.

| 설정 | 효과 |
|---|---|
| `defaultMode` | 새 세션의 기본 모드 |
| `permissions.disableBypassPermissionsMode: "disable"` | `bypassPermissions` 사용 금지 |
| `permissions.disableAutoMode: "disable"` | `auto` 사용 금지 |
| `permissions.denyInsteadOfPrompting: true` | 확인 대기가 생기면 **묻지 않고 거부** (무인 실행용) |

## 폴더 신뢰와 프로젝트 규칙
프로젝트의 `.claude\settings.json`에 든 **`permissions.allow` 규칙과 `additionalDirectories`** 는 능력을 부여하므로, 그 폴더의 **신뢰 대화상자를 수락한 뒤에만** 적용됩니다.
- 저장소에서는 **git 저장소 루트** 기준으로 신뢰가 기록됩니다 (worktree는 메인 체크아웃 기준)
- 홈 디렉터리에서 시작하면 신뢰는 **그 세션에만** 유지되고 디스크에 저장되지 않습니다
- 상위 폴더를 신뢰한 것은 이 규칙들에는 **인정되지 않습니다**
- `settings.local.json`이 **git에 추적되거나** `.claude`가 심볼릭 링크면 저장소가 제공한 것으로 보고 신뢰 전에는 규칙을 적용하지 않습니다
- 신뢰 대화상자가 **없는** `claude -p`·SDK에서는 프로젝트의 allow 규칙이 **사용되지 않고** `this workspace has not been trusted` 경고가 나옵니다

남이 쓴 저장소에서 `claude -p`를 쓰기 전에는 `--setting-sources user`, `--bare`, `--settings '{"disableAllHooks": true}'` 같은 방법으로 실행 범위를 정하세요. ([헤드리스](#/level3/headless))

## 승인 프롬프트에서 알아 둘 것
- 허가 질문에서 **"Yes, and don't ask again"** 을 고르면 규칙이 **저장소 루트의 `.claude\settings.local.json`** 에 저장되어 그 저장소의 **이후 세션 어디서나** 적용됩니다. 파일 수정은 **세션이 끝날 때까지만**입니다
- 허가·거부 시 `Tab`으로 **코멘트**를 붙일 수 있습니다. **No**에 붙인 코멘트는 Claude에게 거부 이유로 전달되어 Claude가 계속 일합니다. 코멘트 없이 **No**를 고르면 메인 대화의 턴이 멈춥니다

## 설정 파일 예: 처음 쓰기 좋은 구성
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git commit *)"
    ],
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Edit(./package-lock.json)",
      "Bash(rm *)",
      "PowerShell(Remove-Item *)"
    ]
  }
}
```
> `Bash(rm *)` deny는 **같은 프로그램의 다른 호출 형태**(`/bin/rm`, `bash -c 'rm ...'`)를 막지 못합니다. 정말 지우기를 막아야 한다면 [훅](#/level3/hooks)이나 [샌드박스](#/level3/sandbox)를 함께 쓰세요.

## 확인 체크
- [ ] `deny → ask → allow` 순서로 평가되고 allow로 deny의 예외를 만들 수 없다는 것을 안다
- [ ] `Bash(git log *)`와 `Bash(git *)`의 차이를 설명할 수 있다
- [ ] `//절대경로`, `~/경로`, `/경로`, `./경로`의 차이를 안다
- [ ] Bash deny 규칙이 **막지 못하는 우회**(`/bin/rm`, `sh -c`)를 안다
- [ ] 비밀 파일에 `Read` deny를 걸고 `/permissions`에서 확인했다

## 자주 하는 실수
- **`Bash(git *)`** 로 `git`을 "조금만" 허용했다고 믿음 → **모든 git 하위 명령**이 허용됩니다
- **절대 경로를 `/경로`로** 씀 → 설정 파일 기준 경로입니다. `//경로`
- `Write(...)`, `Grep(...)` 규칙을 씀 → **일치하지 않습니다.** `Edit`, `Read`
- `Bash(curl http://github.com/ *)`로 URL을 제한 → 쉽게 우회됩니다
- deny 규칙만 믿고 **샌드박스·훅 없이** 운영 → 규칙은 보안 경계가 아닙니다
- Windows에서 `Bash(...)`만 쓰고 **`PowerShell(...)`을 빼먹음**
- **MCP allow 규칙에 지정자**를 붙임 → 어떤 호출에도 맞지 않습니다

## 더 알아보기
- [공식 권한 문서](https://code.claude.com/docs/ko/permissions)
- 설정 파일 전반: [설정 파일(settings.json)](#/level2/settings-json) · 조직 배포: [팀·조직 설정](#/level3/managed-settings)
- 규칙을 **강제**로 보완: [훅](#/level3/hooks) · [샌드박스](#/level3/sandbox)
