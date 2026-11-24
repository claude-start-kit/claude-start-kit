# 훅(Hooks)

> **훅**은 Claude Code가 일하는 **특정 순간에 내가 정한 명령을 자동으로 실행**하는 장치입니다. "파일을 고칠 때마다 서식 정리", "Claude가 입력을 기다리면 알림"처럼 **매번 반드시** 일어나야 하는 일에 씁니다.

## 훅이 필요한 이유
`CLAUDE.md`에 "수정 후 항상 서식을 정리해"라고 적어도 Claude가 **가끔 잊을 수 있습니다.** 훅은 Claude의 판단과 상관없이 **조건이 맞으면 무조건 실행**됩니다.

| 방법 | 성격 |
|---|---|
| `CLAUDE.md` 지침 | 부탁 — Claude가 따르려 노력하지만 보장은 아님 |
| **훅** | **규칙 — 해당 시점에 항상 실행** |

## 훅의 구성 요소
훅은 세 가지로 이루어집니다.

| 요소 | 의미 | 예 |
|---|---|---|
| **이벤트** | 언제 실행할지 | `PostToolUse`(도구 사용 후), `Notification`(알림 시) |
| **matcher** | 어떤 경우에만 실행할지 (거르기) | `Edit\|Write`(파일 수정 도구일 때만) |
| **handler** | 무엇을 실행할지 | `command`(명령 실행) |

### 자주 쓰는 이벤트
| 이벤트 | 실행 시점 | 막을 수 있나 |
|---|---|---|
| `SessionStart` | 세션이 시작·재개될 때 | 아니오 |
| `UserPromptSubmit` | 내가 프롬프트를 보낸 직후, Claude가 처리하기 전 | 예 |
| `PreToolUse` | 도구를 **실행하기 전** | **예** |
| `PostToolUse` | 도구가 **성공한 뒤** | 이미 실행됨(되돌릴 수 없음) |
| `Notification` | Claude가 알림을 보낼 때 (입력·권한 대기) | 아니오 |
| `Stop` | Claude가 답변을 마칠 때 | 예 (계속 일하게 할 수 있음) |
| `SessionEnd` | 세션이 끝날 때 | 아니오 |

이 밖에 서브에이전트, 컴팩트, 파일 변경, 워크트리 등 30개가 넘는 이벤트가 있습니다. 전체 목록은 [공식 훅 레퍼런스](https://code.claude.com/docs/ko/hooks)에서 확인하세요.

## 첫 훅 만들기: 알림 받기
Claude가 내 입력을 기다릴 때 **Windows 알림창**을 띄웁니다. 터미널을 계속 지켜보지 않아도 됩니다.

**1. 설정 파일 열기** — `%USERPROFILE%\.claude\settings.json` (없으면 새로 만듭니다)

**2. `hooks` 추가**
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "shell": "powershell",
            "command": "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; [System.Windows.Forms.MessageBox]::Show('Claude Code가 기다리고 있어요', 'Claude Code')"
          }
        ]
      }
    ]
  }
}
```

**3. 확인** — Claude Code에서 `/hooks`를 입력하면 `Notification` 아래에 방금 만든 훅이 보입니다.

**4. 시험** — `Shift+Tab`으로 수동 승인 모드로 바꾸고, 권한이 필요한 일을 시킨 뒤 다른 창으로 옮겨 보세요. 알림 대화상자가 뜹니다.

<details>
<summary>예시 읽는 법</summary>

| 항목 | 쉬운 설명 |
|---|---|
| `"Notification"` | 이벤트 이름. Claude가 입력이나 권한을 기다릴 때 발생합니다 |
| `"matcher": ""` | 비워 두면 **모든 경우**에 실행합니다 |
| `"type": "command"` | 명령을 실행하는 훅입니다 (가장 흔한 종류) |
| `"shell": "powershell"` | 이 명령을 **PowerShell로 실행**하라는 뜻입니다. Windows에서 Git Bash 없이도 동작합니다 |
| `"command"` | 실제로 실행할 명령입니다. 여기서는 대화상자를 띄웁니다 |

> 대화상자가 **터미널 뒤에 가려질 수** 있습니다. 안 보이면 작업 표시줄을 확인하세요. 먼저 PowerShell에서 명령만 따로 실행해 보면 문제를 쉽게 찾습니다.

</details>

> Claude에게 "Notification 훅으로 알림이 오게 설정해 줘"라고 말해도 만들어 줍니다.

## 훅이 정보를 주고받는 방법
훅은 **입력(stdin) → 처리 → 결과(종료 코드)** 순서로 Claude Code와 대화합니다.

1. 이벤트가 발생하면 Claude Code가 **상황을 JSON으로** 훅에 넘깁니다. (예: 어떤 도구를, 어떤 명령으로 쓰려는지)
2. 훅이 그 내용을 읽고 일을 합니다.
3. 훅이 **종료 코드**로 결과를 알립니다.

| 종료 코드 | 의미 |
|---|---|
| **0** | 문제없음. 계속 진행 (`PreToolUse`에서도 "허가"가 아니라 "이견 없음"이라, 평소 권한 확인은 그대로 거칩니다) |
| **2** | **막기.** stderr에 쓴 사유가 Claude에게 전달되어 다른 방법을 찾게 합니다 |
| 그 외 | 오류로 기록되지만 보통은 작업이 계속됩니다 |

`PreToolUse` 훅이 받는 입력 예시:
```json
{
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" }
}
```

## 위험한 명령 막기 (PowerShell 스크립트)
`rm -rf` 같은 삭제 명령을 **실행 전에 차단**합니다.

**1. 스크립트 만들기** — 프로젝트의 `.claude\hooks\block-rm.ps1`
```powershell
# .claude/hooks/block-rm.ps1
$callInput = [Console]::In.ReadToEnd() | ConvertFrom-Json
$command = $callInput.tool_input.command

if ($command -match 'rm -rf|Remove-Item.*-Recurse') {
  @{
    hookSpecificOutput = @{
      hookEventName = "PreToolUse"
      permissionDecision = "deny"
      permissionDecisionReason = "삭제 명령은 훅이 막았습니다"
    }
  } | ConvertTo-Json
} else {
  exit 0
}
```

**2. 설정에 등록** — `.claude\settings.json`
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "powershell.exe",
            "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.ps1"]
          },
          {
            "type": "command",
            "if": "PowerShell(Remove-Item *)",
            "command": "powershell.exe",
            "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.ps1"]
          }
        ]
      }
    ]
  }
}
```

<details>
<summary>예시 읽는 법</summary>

| 항목 | 쉬운 설명 |
|---|---|
| `matcher: "Bash\|PowerShell"` | 터미널 명령을 실행하는 두 도구(Bash, PowerShell)에서만 반응합니다 |
| `if` | matcher보다 **더 세밀한 조건**. `Bash(rm *)`은 "`rm`으로 시작하는 명령일 때만"이라는 뜻입니다. 조건이 안 맞으면 스크립트를 실행하지도 않아 빠릅니다 |
| `args` | 명령에 넘길 인자 목록입니다. 따옴표·공백 문제를 피할 수 있습니다 |
| `${CLAUDE_PROJECT_DIR}` | 프로젝트 폴더 경로로 자동 치환되는 값입니다 |
| `-NoProfile` | PowerShell 프로필을 읽지 않아 훅이 빨리 시작합니다 |
| `-ExecutionPolicy Bypass` | 로컬 스크립트 파일 실행을 허용합니다 |
| `permissionDecision: "deny"` | 이 도구 호출을 **취소**하고 사유를 Claude에게 알려 줍니다 |

</details>

**`permissionDecision` 값**
| 값 | 효과 |
|---|---|
| `deny` | 도구 호출을 취소하고 사유를 Claude에게 전달 |
| `ask` | 평소처럼 내게 허가를 물음 |
| `allow` | 허가 질문을 건너뜀 (단, `deny`·`ask` 규칙은 여전히 평가됩니다) |

> **`deny`는 `--dangerously-skip-permissions`나 `bypassPermissions` 모드에서도 막습니다.** 사용자가 권한 모드를 바꿔도 우회할 수 없는 규칙을 만들 때 훅이 유용합니다.

## 수정한 파일 자동으로 서식 정리하기
`PostToolUse` + `Edit|Write` matcher로, Claude가 파일을 고칠 때마다 Prettier를 실행합니다. (Node.js와 `jq`가 필요한 예시입니다. `jq`가 없으면 위 PowerShell 방식처럼 스크립트로 JSON을 읽으세요.)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path') && npx prettier --write --ignore-unknown \"$f\""
          }
        ]
      }
    ]
  }
}
```
성공하면 **대화에 아무것도 표시되지 않습니다.** 파일이 정리됐는지로 확인하세요.

## 훅의 종류 (type)
| type | 하는 일 | 쓸 때 |
|---|---|---|
| `command` | 셸 명령·스크립트 실행 | 규칙이 **명확**할 때 (가장 흔함) |
| `http` | 이벤트 데이터를 URL로 POST | 외부 서비스·서버와 연동 |
| `prompt` | Claude 모델이 한 번 판단 | "이 작업이 끝났나?"처럼 **판단**이 필요할 때 |
| `agent` | 도구를 쓰며 여러 단계로 검증 (실험적) | 테스트를 돌려 보고 확인해야 할 때 |
| `mcp_tool` | 연결된 MCP 서버의 도구 호출 | MCP 서비스를 훅에서 쓸 때 |

## 훅을 둘 위치
| 위치 | 범위 | 공유 |
|---|---|---|
| `%USERPROFILE%\.claude\settings.json` | 내 모든 프로젝트 | 안 함 |
| `.claude\settings.json` | 이 프로젝트 | 가능 (git 커밋) |
| `.claude\settings.local.json` | 이 프로젝트, 나만 | 안 함 |
| 관리형 정책 설정 | 조직 전체 | 관리자 통제 |
| 플러그인의 `hooks/hooks.json` | 플러그인을 켰을 때 | 플러그인과 함께 |
| 스킬·서브에이전트 frontmatter | 해당 스킬·에이전트가 쓰일 때 | 파일과 함께 |

모든 훅을 끄려면 설정에 `"disableAllHooks": true`를 넣습니다.

## 제한 사항
- 명령 훅은 **stdout·stderr·종료 코드**로만 소통합니다. `/` 명령이나 도구 호출을 직접 일으킬 수는 없습니다
- 기본 제한 시간: `command` 10분(`UserPromptSubmit`은 30초), `prompt` 30초, `agent` 60초. 훅마다 `timeout`(초)으로 바꿀 수 있습니다
- `PostToolUse` 훅은 이미 실행된 일을 **되돌릴 수 없습니다**
- `Stop` 훅은 작업 완료가 아니라 **Claude가 답변을 마칠 때마다** 실행됩니다. 내가 중단했을 때는 실행되지 않습니다
- Claude는 셸 명령으로도 파일을 바꿀 수 있습니다. 모든 변경을 잡아야 하면 `Stop` 훅에서 `git status`로 확인하세요

## 보안 주의
> 명령 훅은 **내 계정의 모든 권한**으로 실행됩니다. 파일을 지우거나 읽을 수 있으니, **내용을 이해한 뒤에** 추가하세요.

- 출처 모를 프로젝트의 `.claude\settings.json`에 든 훅은 **실행 전에 읽어 보세요**. 대화형 세션에서는 폴더 신뢰 확인(workspace trust)을 수락하기 전에 훅이 실행되지 않습니다. 다만 `claude -p`(헤드리스)는 이 확인창이 없고 폴더를 신뢰한 것으로 취급하므로, 처음 보는 저장소에는 먼저 `.claudesettings.json`을 읽어 보세요
- 입력값을 **그대로 믿지 말고** 검사하세요 (경로에 `..`가 있는지 등)
- `.env`, 키 파일은 훅에서도 다루지 마세요

## 문제가 생기면
| 증상 | 확인할 것 |
|---|---|
| 훅이 안 돈다 | `/hooks`에 보이는지, **matcher가 도구 이름과 정확히 같은지** (대소문자 구분), 이벤트가 맞는지 |
| `hook error` 메시지 | 스크립트를 따로 실행해 종료 코드 확인. 경로는 절대 경로나 `${CLAUDE_PROJECT_DIR}` 사용 |
| `blocking because Git Bash wasn't found` | Windows에서 Git Bash를 못 찾음. Git for Windows를 설치하거나 `"shell": "powershell"`로 지정 |
| JSON 결과가 무시됨 | 스크립트가 JSON 앞에 **다른 글자를 출력**하지 않는지, 필드 위치(`hookSpecificOutput` 안쪽)가 맞는지 |

무슨 일이 있었는지 보려면 `Ctrl+O`로 대화 기록을 열거나, `claude --debug-file 경로`로 디버그 로그를 남기세요.

테스트용으로 스크립트에 샘플 입력을 직접 넣어 볼 수도 있습니다.
```powershell
'{"tool_name":"Bash","tool_input":{"command":"rm -rf build"}}' | powershell.exe -NoProfile -File .claude\hooks\block-rm.ps1
```

## 확인 체크
- [ ] `/hooks`에서 내 훅이 목록에 보인다
- [ ] `Notification` 훅으로 알림을 받아 봤다
- [ ] 훅이 막은 명령에 Claude가 사유를 받고 다른 방법을 찾는 것을 확인했다

## 자주 하는 실수
- **matcher 철자·대소문자 오류** → `Edit|write`는 동작하지 않습니다. `Edit|Write`
- `jq`가 없는데 `jq`를 쓰는 예시를 그대로 복사 → "command not found". PowerShell 스크립트를 쓰세요
- `PreToolUse`에서 `exit 0`을 "허가"로 착각 → 허가가 아니라 **이견 없음**입니다
- 훅 안에서 **오래 걸리는 작업**을 돌려 Claude가 멈춘 듯 보임 → 시간이 걸리면 비동기 훅(공식 레퍼런스 참고)을 쓰세요
- 스크립트에 **키·비밀번호**를 적어 둠 → 설정 파일은 git에 올라갈 수 있습니다

## 더 알아보기
- [공식 훅 가이드](https://code.claude.com/docs/ko/hooks-guide)
- [공식 훅 레퍼런스](https://code.claude.com/docs/ko/hooks) — 이벤트별 입력·출력, 비동기 훅, MCP 도구 훅
- 같은 설정 파일 이야기: [설정 파일(settings.json)](#/level2/settings-json), 권한 이야기: [권한 모드](#/level2/permissions)
