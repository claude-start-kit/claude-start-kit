# 플러그인

> **플러그인**은 스킬·서브에이전트·훅·MCP 서버를 **폴더 하나로 묶어** 설치하고 공유하는 방법입니다. 남이 만든 설정을 명령 한 줄로 받아 쓰거나, 내 설정을 팀에 나눠 줄 때 씁니다.

## 플러그인이 뭘까
플러그인은 **구성 요소가 든 폴더**이며, 보통 이름표(매니페스트) 파일이 하나 있습니다.

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json        매니페스트 (이름·설명·버전)
├── skills/review/SKILL.md  스킬  → /my-plugin:review
├── agents/reviewer.md      서브에이전트
├── hooks/hooks.json        훅
└── .mcp.json               MCP 서버
```

| 구성 요소 | 하는 일 |
|---|---|
| **스킬** | Claude가 필요할 때 읽거나 `/플러그인:이름`으로 실행하는 지침 ([스킬](#/level3/skills)) |
| **에이전트** | Claude가 일을 맡길 수 있는 서브에이전트 정의 |
| **훅** | 수정 후·세션 시작 등 정해진 순간에 실행되는 명령 ([훅](#/level3/hooks)) |
| **MCP 서버** | 플러그인을 켜면 함께 연결되는 외부 도구 서버 ([MCP](#/level2/mcp)) |

> 모든 구성 요소를 갖출 필요는 **없습니다.** 스킬 하나만 든 플러그인도 플러그인입니다.

## 플러그인이 꼭 필요할까?
스킬·서브에이전트·훅·MCP는 **플러그인 없이도 각자 동작**합니다. 예를 들어 `%USERPROFILE%\.claude\skills\`에 둔 스킬은 이미 내 모든 프로젝트에서 쓸 수 있습니다.

| 이런 때는 | 플러그인 |
|---|---|
| 나 혼자, 한 프로젝트에서 쓴다 | 필요 없음 — `.claude\` 폴더에 그냥 두기 |
| 여러 구성 요소를 **한 묶음**으로 쓰고 싶다 | **플러그인** |
| **남이 만든 설정**을 명령 한 줄로 받고 싶다 | **플러그인** (업데이트도 마켓플레이스에서) |
| **팀원에게** 내 설정을 나눠 주고 싶다 / **버전을 관리**하며 배포하고 싶다 | **플러그인** |

## 마켓플레이스에서 설치하기
**마켓플레이스**는 플러그인 목록과 받는 위치가 적힌 **카탈로그**(저장소·폴더)입니다. 앱스토어처럼 파일을 직접 호스팅하는 곳이 아니라 "어디서 받아라"를 알려 주는 목록입니다. Anthropic의 **공식 마켓플레이스**(`claude-plugins-official`)는 대화형 세션을 처음 시작할 때 자동으로 추가됩니다.

### 1. 둘러보고 설치하기
```text
/plugin
```
입력하면 **Discover(탐색)** 탭에 플러그인 목록이 나옵니다. 글자를 입력해 검색하고 Enter로 상세를 엽니다. 이름을 알면 바로 지정할 수도 있습니다.
```text
/plugin install commit-commands@claude-plugins-official
```
`이름@마켓플레이스이름` 형식입니다. 이 명령은 **바로 설치하지 않고 상세 화면을 열어** 내용을 확인하고 범위를 고르게 합니다.

### 2. 설치 전에 확인하기
상세 화면의 항목을 읽어 보세요.
- **Will install**: 추가되는 명령·에이전트·스킬·훅·MCP 서버 목록
- **Context cost**: (공식 마켓플레이스 플러그인) **Every turn**은 메시지를 보낼 때마다 추가되는 토큰, **When invoked**는 실제로 쓸 때 추가되는 토큰

### 3. 범위(scope) 고르기
| 선택 | 범위 | 기록되는 곳 |
|---|---|---|
| Install for you (user) | **나**, 이 컴퓨터의 **모든 프로젝트** | `%USERPROFILE%\.claude\settings.json` |
| Install for all collaborators (project) | 이 저장소의 **모든 협업자** | `.claude\settings.json` (커밋) |
| Install for you, in this repo only (local) | **나**, 이 저장소에서만 | `.claude\settings.local.json` |

같은 플러그인이 여러 범위에 설정되면 **local > project > user** 순으로 우선합니다.

> project 범위로 설치해 설정을 커밋해도 팀원 컴퓨터에 **파일이 자동으로 받아지지는 않습니다.** 팀원은 클론마다 한 번 `claude plugin install 이름@마켓플레이스 --scope project`를 실행해야 합니다.

### 4. 설치 결과 읽기
마지막 문장으로 상태를 알 수 있습니다.

| 메시지 | 의미 |
|---|---|
| `Plugin is now active.` | 바로 사용 가능 |
| `Its bundled MCP server needs ...` | 포함된 MCP 서버에 **설정이 필요**. `/plugin` → Installed 탭 → 플러그인 선택 → **Configure** |
| `Run /reload-plugins to apply.` | 다시 불러오기 필요 (자동으로 실행됩니다) |
| `The plugin couldn't ...` | 로드 실패. `/plugin`의 **Errors** 탭에서 이유 확인 |

### 5. 동작 확인
`/`를 입력하고 `/플러그인이름:스킬이름` 형태의 명령이 보이는지 확인합니다. 예) `/commit-commands:commit`. `/plugin`의 **Installed** 탭에도 범위와 함께 표시됩니다.

## 터미널에서 설치하기 (세션을 열지 않고)
```powershell
claude plugin install formatter@your-org --scope project
```
- 범위 기본값은 **user**이고, `--scope project`·`--scope local`로 바꿉니다
- 설치된 플러그인은 **다음에 Claude Code를 시작할 때**(또는 열린 세션에서 `/reload-plugins`) 적용됩니다
- 일부 플러그인은 마켓플레이스가 정한 **명령을 실행해서** 설치하는데, 그 명령을 보여 주고 수락을 묻습니다. 스크립트처럼 **답할 사람이 없는** 곳에서는 `--yes`를 붙여 그 확인을 수락합니다 (실행될 명령을 먼저 읽어 본 뒤에만 쓰세요)

## 마켓플레이스 추가하기
공식 마켓플레이스에 없는 플러그인(동료가 만든 것, 커뮤니티 것)을 쓰려면 **마켓플레이스를 먼저 한 번 추가**합니다.

```text
/plugin marketplace add anthropics/claude-plugins-official
```

| 출처 | 입력 예 |
|---|---|
| GitHub 저장소 | `owner/repo` (`#v1.2.0`을 붙이면 태그·브랜치 고정) |
| 그 밖의 git 주소 | `https://gitlab.example.com/그룹/마켓플레이스.git` (전체 주소) |
| 내 컴퓨터의 폴더·파일 | `./my-marketplace` (**`./`나 `../`로 시작**해야 함. 없으면 GitHub `owner/repo`로 오해) |
| 웹에 올린 `marketplace.json` | `https://example.com/marketplace.json` |

추가와 설치를 **한 번에** 할 수도 있습니다.
```text
/plugin install deploy-helper --marketplace your-org/plugins
```
`/plugin`의 **Marketplaces** 탭에서 추가된 마켓플레이스를 볼 수 있습니다. 목록·갱신·삭제는 `claude plugin marketplace list | update 이름 | remove 이름`입니다. **마켓플레이스를 삭제하면 거기서 설치한 플러그인이 모두 제거**됩니다.

## 설치한 플러그인 관리
`/plugin`의 **Installed** 탭에서 켜기·끄기(`Space`), 상세(`Enter`), **Update now**, **Uninstall**을 할 수 있습니다. 셸에서는 이렇게 합니다.
```powershell
claude plugin disable formatter@your-org     # 끄기 (설치는 유지)
claude plugin enable formatter@your-org      # 켜기
claude plugin uninstall formatter@your-org --scope project
```
- **끄기**: 지우지 않고 영향만 없애고 싶을 때. 쓰지 않는 플러그인도 설명이 **매 턴 컨텍스트를 차지**합니다
- **자동 업데이트**: 공식 마켓플레이스는 **기본 켜짐**, 그 밖의 마켓플레이스는 **기본 꺼짐**입니다. `Plugin updated: ... Run /reload-plugins to apply`가 보이면 `/reload-plugins`를 실행하세요
- 지금 업데이트: Installed 탭의 **Update now** 또는 `claude plugin update 이름@마켓플레이스` (모든 플러그인을 한꺼번에 갱신하는 명령은 없습니다. Marketplaces 탭의 **Update marketplace**로 한 마켓플레이스 단위 갱신은 가능)

## 내 플러그인 만들기
스킬 하나짜리 인사 플러그인을 만들어 봅니다.

**1. 폴더 만들기**
```powershell
mkdir my-first-plugin\.claude-plugin
mkdir my-first-plugin\skills\hello
```

**2. 매니페스트** — `my-first-plugin\.claude-plugin\plugin.json`
```json
{
  "name": "my-first-plugin",
  "description": "기초를 익히는 인사 플러그인",
  "version": "1.0.0",
  "author": { "name": "내 이름" }
}
```
| 필드 | 설명 |
|---|---|
| `name` | **필수.** 플러그인 이름이자 **모든 스킬·에이전트의 접두사**. 공백 금지 |
| `description` | `/plugin`에서 사용자에게 보이는 설명 |
| `version` | 선택. 정하면 사용자는 **그 버전을 유지**하다가 내가 올릴 때 바뀝니다 |
| `author` | 만든 사람. `name`만 필수 |

**3. 스킬 추가** — `my-first-plugin\skills\hello\SKILL.md`
```markdown
---
name: hello
description: 사용자에게 친절하게 인사합니다
disable-model-invocation: true
---
사용자에게 따뜻하게 인사하고 오늘 무엇을 도와줄지 물어보세요.
```
명령은 **플러그인 이름 + 스킬 이름**이라 `/my-first-plugin:hello`입니다. 접두사 덕분에 다른 플러그인에 `hello`가 있어도 충돌하지 않습니다.

**4. 검사**
```powershell
claude plugin validate .\my-first-plugin
```
`✔ Validation passed`가 나오면 통과입니다. 실패하면 위 줄에 고칠 필드가 적혀 있습니다.

**5. 이 세션에서만 불러 쓰기**
```powershell
claude --plugin-dir .\my-first-plugin
```
시작한 뒤 `/my-first-plugin:hello`를 입력합니다. 파일을 고친 뒤에는 `/reload-plugins`로 바로 반영합니다. `--plugin-dir`은 **마켓플레이스 없이** 개발할 때 쓰며, 폴더나 `.zip`을 받고 여러 번 지정할 수 있습니다.

> 더 큰 플러그인을 Claude와 함께 만들려면 공식 마켓플레이스의 **`plugin-dev`** 플러그인을 설치하고 `/plugin-dev:create-plugin 만들 것 설명`을 쓰는 방법이 문서에 안내되어 있습니다.

### 폴더 구조 규칙
| 위치 | 내용 |
|---|---|
| `.claude-plugin\plugin.json` | 매니페스트 |
| `skills\` | 스킬마다 `이름\SKILL.md` |
| `commands\` | 옛 방식의 마크다운 파일 (새 플러그인은 `skills\` 사용) |
| `agents\` | 서브에이전트당 마크다운 파일 하나 |
| `hooks\hooks.json` | 최상위 `"hooks"` 키 아래에 설정 파일과 같은 형태 |
| `.mcp.json` | MCP 서버 정의 |

> **`.claude-plugin\` 안에는 `plugin.json`만** 넣으세요. 거기에 둔 스킬·에이전트는 로드되지 않습니다. 구성 요소 폴더(`skills\` 등)는 **플러그인 폴더 바로 아래**에 둡니다.

### 이미 있는 `.claude\` 설정을 플러그인으로
`.claude\`에 스킬·에이전트·훅이 이미 있다면 다시 쓰지 않고 **복사해서 옮길 수** 있습니다. 매니페스트를 만들고 `skills\`, `agents\`, `hooks\` 등을 플러그인 폴더로 복사한 뒤 `claude --plugin-dir`로 시험하세요. 이름이 `/플러그인:이름`으로 바뀐다는 점만 기억하면 됩니다.

### 내 플러그인 나누기
| 방법 | 설명 |
|---|---|
| 직접 전달 | 폴더나 `.zip`을 건네줌 (게시 불필요) |
| 내 마켓플레이스 | 팀원이 마켓플레이스를 한 번 추가하고 이름으로 설치, 업데이트도 받음 |
| Anthropic 디렉터리 제출 | 심사를 통과하면 claude.ai와 Cowork에서도 추가 가능 |

## 안전하게 쓰기 — 가장 중요합니다
> **플러그인은 내 컴퓨터에서 내 계정의 권한으로 코드를 실행할 수 있습니다.** 설치 전에 믿을 만한지 확인하세요. (공식 안내문도 같은 경고를 보여 줍니다.)

플러그인이 할 수 있는 일:
| 요소 | 위험 |
|---|---|
| **훅** | 도구 호출 전후에 **셸 명령 실행** (권한 규칙·샌드박스 **밖**에서) |
| **MCP·LSP 서버** | 내 컴퓨터에서 **프로세스를 시작** |
| **`bin\` 폴더** | 실행 파일이 Claude의 명령 경로(PATH)에 추가됨 |
| **스킬·에이전트** | 지침으로 Claude의 행동을 **유도** |
| **자동 업데이트** | 내가 검토한 뒤에도 **파일이 바뀔 수 있음** |

**설치 전 점검 순서**
1. `claude plugin marketplace list`로 **마켓플레이스의 출처** 확인
2. `/plugin` 상세의 **Will install** 목록 읽기
3. 상세에서 **Open homepage / View on GitHub**로 소스 열기 — 훅은 목록에 "있다"만 나오고 **무엇을 실행하는지는** 안 나옵니다. 아래 파일을 직접 읽으세요
   - `hooks\hooks.json` — 훅이 실행하는 명령
   - `.mcp.json` — 서버의 명령이나 주소
   - `bin\` — 안에 든 모든 파일
4. 목록으로 구성 요소 보기: `claude plugin details 이름` (설치 후)

**마켓플레이스 등급**
| 등급 | 대상 |
|---|---|
| 공식 | `claude-plugins-official` 등 Anthropic의 공식 이름 |
| 커뮤니티 | `claude-community`, `claude-plugins-community`, `healthcare` |
| 서드파티 | **그 밖의 모두** (동료·회사가 만든 것 포함) |

> 어느 등급이든 **설치 전에 직접 확인**하세요. 이름만으로는 플러그인 하나하나가 무엇을 하는지 알 수 없습니다.

**믿을 수 없게 된 플러그인 제거**
```powershell
claude plugin uninstall 이름 --scope 설치한범위
```
파일은 `%USERPROFILE%\.claude\plugins\cache\` 아래에 14일 동안 남습니다. 마켓플레이스 운영자도 못 믿겠다면 마켓플레이스째 삭제하세요.

조직에서는 관리형 설정으로 **마켓플레이스 허용·차단 목록**, 플러그인 **강제 설치**, `--plugin-dir` 차단 등을 통제할 수 있습니다 ([팀·조직 설정](#/level3/managed-settings)).

## 문제가 생기면
| 증상 | 확인할 것 |
|---|---|
| 고쳤는데 반영이 안 됨 | `/reload-plugins` 실행 → `/plugin`의 **Installed·Errors** 탭 확인 → 셸에서 `claude plugin list` |
| 플러그인은 로드되는데 **스킬이 없음** | `skills\` 폴더가 `.claude-plugin\` **안에** 있지는 않은지. 플러그인 폴더 바로 아래로 옮기기 |
| `path not found` | 매니페스트에 적은 경로가 실제로 있는지 |
| `--plugin-dir`로 마켓플레이스 폴더를 지정함 | `marketplace.json`은 읽지 않습니다. **플러그인 폴더**(`plugin.json`이 든 곳)를 지정 |
| MCP 서버가 안 뜸 | 세션에서 `/mcp`로 상태 확인 |
| 훅이 안 돎 | 디버그 로그를 켜고 이벤트를 일으켜 보기 ([훅](#/level3/hooks)) |

## 확인 체크
- [ ] `/plugin`을 열어 Discover 탭을 둘러봤다
- [ ] 설치 전에 **Will install** 목록과 **Context cost**를 읽었다
- [ ] 플러그인을 하나 설치하고 `/플러그인:명령`이 보이는지 확인했다
- [ ] (선택) `claude plugin validate`와 `--plugin-dir`로 내 플러그인을 시험해 봤다

## 자주 하는 실수
- 출처를 확인하지 않고 **설치부터** 함 → 훅과 MCP 서버는 내 권한으로 실행됩니다
- project 범위로 설치하고 **팀원도 자동으로 받는 줄** 앎 → 각자 설치 명령을 한 번 실행해야 합니다
- `.claude-plugin\` 안에 **스킬 폴더**를 둠 → 로드되지 않습니다
- 쓰지 않는 플러그인을 **켜 둔 채** 방치 → 설명이 매 턴 컨텍스트를 차지합니다. 끄거나 삭제하세요
- `/plugin marketplace add ./내폴더`에서 **`./`를 빼먹음** → GitHub 저장소 이름으로 오해합니다

## 더 알아보기
- [공식 플러그인 개요](https://code.claude.com/docs/ko/plugins) · [설치·관리](https://code.claude.com/docs/ko/plugins/install) · [플러그인 만들기](https://code.claude.com/docs/ko/plugins/create)
- [플러그인 보안과 신뢰](https://code.claude.com/docs/ko/plugins/security)
- 구성 요소 이야기: [스킬](#/level3/skills) · [훅](#/level3/hooks) · [MCP](#/level2/mcp) · [서브에이전트](#/level2/subagents)
