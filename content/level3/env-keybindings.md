# 환경 변수와 키 바인딩

> 이 레슨은 **환경 변수**(프로그램에 전달하는 `이름=값` 설정)와 **키 바인딩**(단축키 바꾸기)을 다룹니다. 둘 다 "Claude Code를 내 방식에 맞추는" 도구입니다.

## 1부. 환경 변수

### 환경 변수가 뭘까
**환경 변수**는 프로그램이 실행될 때 함께 전달되는 **이름=값 설정**입니다. Claude Code는 모델 선택, 인증, 요청 경로, 기능 켜기·끄기를 환경 변수로 조절할 수 있습니다. 같은 일을 **설정 파일**(`settings.json`), **명령줄 옵션**, **세션 안 명령**(`/model`)으로 할 수 있는 경우도 많습니다.

### 설정하는 두 가지 방법

#### 방법 1. 셸에서 설정하기 (그 터미널에서만)
**PowerShell**
```powershell
$env:API_TIMEOUT_MS = "1200000"
claude
```
- 이 터미널 창을 닫으면 사라집니다
- **계속** 유지하려면 한 번만 실행하고 **새 터미널**을 엽니다.
```powershell
[Environment]::SetEnvironmentVariable("API_TIMEOUT_MS", "1200000", "User")
```

**명령 프롬프트(CMD)**
```batch
set API_TIMEOUT_MS=1200000
claude
```
계속 유지하려면 `setx API_TIMEOUT_MS "1200000"` 후 새 터미널.

**확인하기** (설정해도 아무것도 출력되지 않습니다)
```powershell
echo $env:API_TIMEOUT_MS
```

#### 방법 2. 설정 파일의 `env`에 적기 (항상 적용)
```json
{
  "env": {
    "API_TIMEOUT_MS": "1200000",
    "BASH_DEFAULT_TIMEOUT_MS": "300000"
  }
}
```
- `claude`를 어떻게 실행했든 **읽어 들입니다**
- **값은 문자열**로 씁니다 (`"1200000"`)
- Claude Code가 값을 **그대로 복사**하므로 `~`, `$HOME` 같은 축약은 **풀리지 않습니다.** 경로는 **절대 경로**로 쓰세요
- 파일을 저장하면 실행 중인 세션에도 새 값이 반영됩니다. 단 **시작할 때 한 번만 읽는 기능**(예: OpenTelemetry 모니터링)은 다시 시작해야 합니다
- 설정 파일에서는 변수를 **설정할 수만** 있고 **지울 수는 없습니다.** 셸에서 물려받은 변수를 무효화하려면 빈 문자열로 둡니다 (`"CLAUDE_CODE_USE_VERTEX": ""`)

| 파일 | 적용 대상 |
|---|---|
| `%USERPROFILE%\.claude\settings.json` | 나, 모든 프로젝트 |
| `.claude\settings.json` | 프로젝트의 모든 사람 (커밋) |
| `.claude\settings.local.json` | 나, 이 프로젝트만 |
| 관리형 설정 | 조직 전체 (관리자 배포) |

> 프로젝트·로컬 설정에서는 `CLAUDE_CONFIG_DIR`, OpenTelemetry 내보내기 변수 등 일부 변수가 **무시**됩니다. 저장소 파일이 내 환경을 마음대로 바꾸지 못하게 하기 위해서입니다.

### 우선순위
- 환경 변수와 **설정 키**가 둘 다 있는 동작은 **키마다** 다릅니다. 예를 들어 `ANTHROPIC_MODEL`은 변수를 **먼저** 보고 설정의 `model`은 변수가 없을 때만 씁니다
- 같은 변수를 셸과 설정 파일 `env` 양쪽에 두면 **대부분의 세션에서 설정 파일 값**이 적용됩니다 (Claude Code가 `env` 항목을 프로세스 환경에 써서 셸에서 받은 값을 덮어씁니다)
- 설정 파일끼리는 [설정 우선순위](#/level3/managed-settings)를 따릅니다. 관리형이 사용자·프로젝트를 이깁니다
- 명령줄·세션 명령과의 관계는 기능마다 다릅니다. `--model`과 `/model`은 `ANTHROPIC_MODEL`을 이기지만, `CLAUDE_CODE_EFFORT_LEVEL`은 `--effort`와 `/effort`를 **이깁니다**
- 셸 변수는 **시작할 때** 읽습니다. 바꾼 뒤에는 `claude`를 **다시 시작**하세요

### 값 쓰는 규칙
- **켜고 끄는** 변수: `1`·`true`·`yes`·`on`은 켜기, `0`·`false`·`no`·`off`는 끄기 (대소문자 무관)
- 일부 변수는 **설정했는지만** 봅니다. **`0`을 넣어도 켜집니다.** 끄려면 변수를 **지우거나 빈 값**으로 두세요. 이런 변수: `DISABLE_TELEMETRY`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `DISABLE_ERROR_REPORTING` 등
- 시간·토큰 같은 **숫자 변수**는 `2e3`(=2000), `64_000`(=64000)처럼 쓸 수 있습니다 (변수에 "숫자만"이라고 적혀 있으면 그 변수는 예외)

### 자주 쓰는 환경 변수

#### 인증·모델
| 변수 | 설명 |
|---|---|
| `ANTHROPIC_API_KEY` | API 키. **설정하면 구독 대신 이 키를 씁니다** (로그인했어도). `-p` 실행에서는 항상 이 키, 대화형에서는 한 번 승인을 묻습니다. 구독으로 돌아가려면 변수를 지우세요 |
| `CLAUDE_CODE_OAUTH_TOKEN` | claude.ai 인증 토큰. `/login` 대신 자동화 환경에서. `claude setup-token`으로 생성 |
| `ANTHROPIC_MODEL` | 사용할 모델 (설정의 `model`보다 우선) |
| `ANTHROPIC_DEFAULT_MODEL` | 새 세션의 기본 모델 (설정의 `model`이 없을 때만) |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` · `…_SONNET_MODEL` · `…_HAIKU_MODEL` · `…_FABLE_MODEL` | **별칭이 가리킬 모델 ID** (`opus` → 어떤 모델). 모델을 고정할 때 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 서브에이전트·에이전트 팀의 **기본 모델** ([서브에이전트 심화](#/level3/subagents-advanced)) |
| `CLAUDE_CODE_EFFORT_LEVEL` | 노력도 (`low`·`medium`·`high`·`xhigh`·`max`). `--effort`와 `/effort`보다 **우선** |
| `MAX_THINKING_TOKENS` | 확장 사고의 고정 토큰 예산 |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 요청당 최대 출력 토큰 (모델 상한 초과 시 상한으로 낮춤) |

#### Windows에서 자주 만나는 변수
| 변수 | 설명 |
|---|---|
| `CLAUDE_CODE_GIT_BASH_PATH` | **Git Bash(`bash.exe`)의 경로.** Git Bash가 설치돼 있는데 PATH에 없을 때. 경로가 없거나 파일 이름이 다르면 무시하고 자동 감지 |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL` | PowerShell 도구 켜고 끄기. **Git Bash 없는 Windows에서는 자동으로 켜짐** (`0`이면 끔). Git Bash가 있으면 claude.ai·Console 계정에서 기본 켜짐 |
| `CLAUDE_CONFIG_DIR` | **설정 폴더 위치**(기본 `~/.claude`) 바꾸기. 설정·세션 기록·플러그인이 이 경로 아래로 갑니다. 계정을 **나란히** 쓸 때 유용 |

> 계정을 둘 쓰려면 PowerShell에서 `$env:CLAUDE_CONFIG_DIR = "C:\Users\나\.claude-work"; claude`처럼 **절대 경로**로 지정하세요. (설정 파일의 `env`에서는 `~`가 풀리지 않습니다.)

#### 동작·시간
| 변수 | 설명 |
|---|---|
| `API_TIMEOUT_MS` | API 요청이 **응답 헤더를 받는 데** 허용하는 시간(ms). 스트리밍 응답 길이는 제한하지 않음 |
| `BASH_DEFAULT_TIMEOUT_MS` | 포그라운드 Bash·PowerShell 명령 기본 제한 시간 (기본 120000 = 2분) |
| `BASH_MAX_TIMEOUT_MS` | 모델이 정할 수 있는 최대 제한 시간 (기본 600000 = 10분) |
| `BASH_MAX_OUTPUT_LENGTH` | 명령 출력 중 Claude가 읽는 최대 글자 수 (기본 30000, 최대 150000) |
| `MCP_TIMEOUT` | MCP 서버 시작 제한 시간 (기본 30000 = 30초) |
| `MAX_MCP_OUTPUT_TOKENS` | MCP 도구 응답의 최대 토큰 (기본 25000, 10,000 초과 시 경고) |
| `ENABLE_TOOL_SEARCH` | MCP 도구 검색. `auto`, `auto:5`(컨텍스트의 5%), `false` 등 ([MCP](#/level2/mcp)) |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` · `DISABLE_AUTO_COMPACT` | 자동 압축 창 크기, 자동 압축 끄기 (`/compact`는 계속 가능) |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 자동 압축이 시작되는 비율(1~100). **더 일찍**만 가능하고 기본보다 올릴 수는 없음 |

#### 기능 끄기·개인정보
| 변수 | 설명 |
|---|---|
| `DISABLE_TELEMETRY` | **텔레메트리 끄기.** 어떤 값이든 **값이 있으면** 끕니다 (`0`도 끔). 켜려면 변수를 지우기. 텔레메트리에는 코드·파일 경로·Bash 명령 같은 사용자 데이터가 포함되지 않습니다. 기능 플래그 가져오기도 함께 꺼집니다 |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 자동 업데이트·텔레메트리·오류 보고·`/feedback` 등 **필수가 아닌 네트워크 통신** 모두 끄기 |
| `DISABLE_AUTOUPDATER` | 자동 업데이트 끄기 (수동 `claude update`는 가능) |
| `DISABLE_COST_WARNINGS` | 비용 경고 끄기 |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | 자동 메모리 끄기 (`0`이면 강제로 켬) |
| `CLAUDE_CODE_DISABLE_CLAUDE_MDS` | `CLAUDE.md`를 컨텍스트에 **불러오지 않음** |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | 백그라운드 실행과 `Ctrl+B` 끄기 |
| `CLAUDE_CODE_DISABLE_CRON` | 세션 예약 작업(`/loop`) 끄기 ([예약 작업](#/level3/scheduled)) |
| `CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING` | 파일 체크포인트 끄기. **`/rewind`가 코드 변경을 복원하지 못하게 됩니다** |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` | 터미널 제목 자동 갱신 끄기 |

#### 보안
| 변수 | 설명 |
|---|---|
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` | `1`이면 Bash 명령·훅·stdio MCP 서버 같은 **하위 프로세스의 환경에서 자격 증명을 제거** |
| `CLAUDE_CODE_TMPDIR` | 내부 임시 파일 폴더 |

**`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`가 제거하는 것**
| 예 | 처리 |
|---|---|
| `ANTHROPIC_API_KEY`, `AWS_SECRET_ACCESS_KEY` | 제거 |
| `NPM_TOKEN`, `DB_PASSWORD` | 제거 (이름이 자격 증명처럼 보여서) |
| 비밀번호가 든 `DATABASE_URL` | 제거 (값이 자격 증명처럼 보여서) |
| 비밀번호가 든 `PIP_INDEX_URL` | URL은 두고 **사용자 이름·비밀번호만** 제거 |
| `GITHUB_TOKEN`, `GH_TOKEN` | **그대로 둠** (`gh` 등이 동작하도록) |
| `HTTP_PROXY`, `HTTPS_PROXY` | 그대로 둠 |
| 이름과 값이 평범해 보이는 비밀 | **그대로 둠** |

> 이 기능은 **한 겹의 방어**입니다. 변수 이름과 값의 모양으로 판단하므로 좁은 [권한 규칙](#/level3/permissions-deep)과 함께 쓰세요. `GITHUB_TOKEN`이 남으므로 샌드박스 `credentials`로 따로 막을 수도 있습니다 ([샌드박스](#/level3/sandbox)).

#### 네트워크
| 변수 | 설명 |
|---|---|
| `HTTPS_PROXY` · `HTTP_PROXY` | 프록시 서버 |
| `NO_PROXY` | 프록시를 거치지 않을 도메인·IP |
| `ANTHROPIC_BASE_URL` | API 주소를 프록시·게이트웨이로 바꿈 |

#### 실험 기능
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`(에이전트 팀, [에이전트 팀](#/level3/agent-teams)), `CLAUDE_CODE_NO_FLICKER=1`(전체 화면 렌더링 시험판) 등이 있습니다.

> 이 목록은 일부입니다. 변수는 수백 개이고 **자주 바뀝니다.** 전체와 최신 설명은 [공식 환경 변수 문서](https://code.claude.com/docs/ko/env-vars)를 보세요.

### 어떤 기능은 "기능 플래그 가져오기"가 필요합니다
Claude Code는 일부 기능을 Anthropic에서 가져오는 **기능 플래그**로 켭니다. 다음 경우에는 가져오지 않습니다: `CLAUDE_CODE_DISABLE_FEATURE_FLAGS`, `DISABLE_TELEMETRY`, `DO_NOT_TRACK`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`를 설정했을 때, 서드파티 공급자(Bedrock, Google Cloud, Foundry) 세션, 게이트웨이 세션. 이때 **원격 제어(Remote Control)**, **다른 컴퓨터의 세션과 메시지 주고받기**, `claude import` 등은 쓸 수 없습니다.

텔레메트리를 끄면 일부 기능도 함께 막힌다는 점을 기억하세요.

## 2부. 키 바인딩

### 단축키를 내 마음대로
```text
/keybindings
```
`%USERPROFILE%\.claude\keybindings.json`을 만들거나 엽니다. **파일을 저장하면 재시작 없이** 자동 반영됩니다.

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+s": null
      }
    }
  ]
}
```

| 항목 | 설명 |
|---|---|
| `$schema` | (선택) 편집기 자동 완성용 스키마 주소 |
| `$docs` | (선택) 문서 주소 |
| `bindings` | **컨텍스트별 묶음**의 배열 |
| `"context"` | 이 단축키가 **적용되는 화면** |
| `"ctrl+e": "chat:externalEditor"` | 단축키 → **동작** |
| `"ctrl+s": null` | 기본 단축키를 **해제** |

위 예시는 채팅 입력창에서 `Ctrl+E`로 외부 편집기를 열게 하고 `Ctrl+S`(프롬프트 임시 보관)를 해제합니다.

### 컨텍스트(적용 화면)
| 컨텍스트 | 설명 |
|---|---|
| `Global` | 앱 전체 |
| `Chat` | **메인 입력창** |
| `Autocomplete` | 자동 완성 메뉴가 열렸을 때 |
| `Settings` | 설정 메뉴 |
| `Confirmation` | 허가·확인 대화상자 |
| `Transcript` | 대화 기록 보기 |
| `HistorySearch` | 기록 검색(`Ctrl+R`) |
| `Task` | 포그라운드에서 작업이 실행 중일 때 |
| `MessageSelector` | 되돌리기·요약 대화상자의 메시지 선택 |
| `ModelPicker` · `EffortSlider` | 모델 선택기, `/effort` 슬라이더 |
| `Select` | 일반 선택 목록 |
| `Agents` | 에이전트 보기(`claude agents`) |
| `Scroll` | 전체 화면 모드의 스크롤·선택 |

그 밖에 `Tabs`, `Help`, `ThemePicker`, `Attachments`, `Footer`, `DiffDialog`, `DiffPanel`, `Plugin` 등이 더 있습니다.

### 동작 이름 `네임스페이스:동작`
```text
chat:submit        메시지 보내기
app:toggleTodos    할 일 목록 보이기
```

#### 자주 쓰는 동작과 기본 단축키
| 동작 | 기본 단축키 | 설명 |
|---|---|---|
| `app:interrupt` | `Ctrl+C` | 현재 작업 취소 |
| `app:exit` | `Ctrl+D` | 종료 (800ms 안에 **두 번**) |
| `app:toggleTodos` | `Ctrl+T` | Claude의 할 일 체크리스트 보이기·숨기기 |
| `app:toggleTranscript` | `Ctrl+O` | 자세한 대화 기록 보기 |
| `history:search` | `Ctrl+R` | 기록 검색 |
| `chat:cancel` | `Esc` | 입력 취소 |
| `chat:cycleMode` | `Shift+Tab` | 권한 모드 순환 |
| `chat:modelPicker` | `Meta+P` (`Alt+P`) | 모델 선택기 |
| `chat:fastMode` | `Meta+O` | 빠른 모드 켜고 끄기 |
| `chat:thinkingToggle` | `Meta+T` | 확장 사고 켜고 끄기 |
| `chat:submit` | `Enter` | 메시지 보내기 |
| `chat:newline` | `Ctrl+J` | **줄바꿈** (보내지 않음) |
| `chat:undo` | `Ctrl+_` | 마지막 동작 취소 |
| `chat:externalEditor` | `Ctrl+G` · `Ctrl+X Ctrl+E` | **외부 편집기**로 열기 |
| `chat:stash` | `Ctrl+S` | 입력 중인 프롬프트를 임시 보관 |
| `chat:imagePaste` | `Ctrl+V` (Windows·WSL은 `Alt+V`) | 클립보드 이미지 붙여넣기 |
| `chat:killAgents` | `Ctrl+X Ctrl+K` | 실행 중인 백그라운드 서브에이전트 모두 중지 |
| `chat:queueSubmit` | `Ctrl+X Enter` | 메시지를 보내되 Claude가 일하는 중이면 **끼어들지 않고 대기열에** |
| `chat:sendNow` | `Ctrl+Enter` · `Ctrl+X Ctrl+S` | 대기 중인 메시지를 **지금 바로** 보냄 |
| `command:<이름>` | (없음) | **`/이름` 명령 실행**. 예: `"meta+g": "command:compact"` |

> Windows에서 `Shift+Tab`은 VT 모드가 없는 오래된 환경(Node 24.2.0 미만 등)에서는 기본이 `Meta+M`일 수 있습니다. `Alt+V`로 이미지를 붙여넣는 것은 Windows 터미널에서 `Ctrl+V`가 텍스트 붙여넣기에 쓰이기 때문입니다.

#### 자주 만드는 단축키 예
```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "meta+g": "command:compact",
        "ctrl+e": "chat:externalEditor"
      }
    }
  ]
}
```
`Alt+G`로 `/compact`를 실행하고 `Ctrl+E`로 외부 편집기를 엽니다.

### 키 표기법
**수식 키**는 `+`로 연결합니다.
| 표기 | 의미 |
|---|---|
| `ctrl` · `control` | Ctrl |
| `shift` | Shift |
| `alt` · `opt` · `option` · `meta` | **Windows·Linux는 Alt**, macOS는 Option |
| `cmd` · `command` · `super` · `win` | macOS Command, **Windows 키**, Linux Super |

- `cmd` 그룹은 Super 수식 키를 보고하는 터미널(Kitty 키보드 프로토콜 등)에서만 감지됩니다. **대부분의 터미널은 보내지 않으니** 어디서나 동작하게 하려면 `ctrl`이나 `meta`를 쓰세요
- 대소문자는 **구분하지 않습니다** (`ctrl+K` = `ctrl+k`). Shift와 글자는 `shift+k`로 씁니다
- 특수 키: `escape`/`esc`, `enter`/`return`, `tab`, `space`, `up` `down` `left` `right`, `pageup` `pagedown`, `home` `end`, `backspace` `delete`, `wheelup` `wheeldown`
- **키 이름은 라틴 문자**로 쓰세요. 한글 등 다른 자판을 쓰고 있어도 `ctrl+w`로 적습니다

#### 연속 키(chord)
공백으로 이어 쓰면 **차례로 누르는** 단축키입니다.
```text
ctrl+k ctrl+s    Ctrl+K를 누르고 뗀 뒤 Ctrl+S
```
각 키는 **3초 안에** 이어서 눌러야 하며 늦으면 취소됩니다.

### 기본 단축키 해제하기
동작에 `null`을 지정합니다.
```json
{
  "bindings": [
    { "context": "Chat", "bindings": { "ctrl+s": null } }
  ]
}
```
연속 키도 같은 방식으로 해제합니다. 같은 첫 키로 시작하는 연속 키를 **모두** 해제해야 그 첫 키를 단독 단축키로 쓸 수 있습니다. (`Ctrl+X`로 시작하는 기본 연속 키가 여럿 있습니다.)

### 바꿀 수 없는 단축키
| 단축키 | 이유 |
|---|---|
| `Ctrl+C` | 취소로 **고정** |
| `Ctrl+D` | 종료로 **고정** |
| `Ctrl+M` | 항상 Enter로 받음 |
| `Ctrl+[` | 항상 Escape로 받음 |
| `Ctrl+I` | 항상 Tab으로 받음 |
| `Ctrl+H` | 백스페이스 바이트 |
| `Caps Lock` | 터미널 프로그램에 전달되지 않음 |

### 터미널과 충돌하는 단축키
| 단축키 | 충돌 |
|---|---|
| `Ctrl+B` | tmux의 접두 키 (두 번 눌러야 전달) |
| `Ctrl+A` | GNU screen의 접두 키 |
| `Ctrl+Z` | 프로세스 일시 중지(SIGTSTP) |

### 글자 입력 칸과 Vim 모드
- 글자·숫자·`Space` 하나만 단축키로 묶어도 **대화상자 안의 입력 칸**(예: Claude가 묻는 `Other` 답변)에서는 평소처럼 **그 글자를 입력**할 수 있습니다. Ctrl·Alt·Cmd가 붙은 키와 Enter·Esc·Tab·방향키는 계속 단축키로 동작합니다
- `/config`에서 **Vim 모드**를 켜면 키 바인딩과 Vim은 **독립적**으로 동작합니다. Vim의 `Esc`는 입력 모드를 바꾸며 `chat:cancel`을 일으키지 않고, Vim 키는 키 바인딩 파일로 바꿀 수 없습니다. 삽입 모드에서 `jj`를 Esc로 바꾸려면 `vimInsertModeRemaps` 설정을 쓰세요

## 확인 체크
- [ ] PowerShell에서 `$env:이름 = "값"`으로 변수를 설정하고 `echo $env:이름`으로 확인했다
- [ ] 설정 파일 `env`에 변수 하나를 넣어 봤다
- [ ] `DISABLE_TELEMETRY`가 **`0`을 넣어도 끈다**는 것을 안다
- [ ] `/keybindings`로 파일을 열어 단축키 하나를 바꾸거나 해제했다

## 자주 하는 실수
- `ANTHROPIC_API_KEY`가 **남아 있어** 구독이 아닌 API 요금이 청구됨 → 변수를 지우세요
- `$env:`로 설정한 변수가 **다음 터미널에서는 사라짐** → `SetEnvironmentVariable(..., "User")`로 저장하거나 설정 파일 `env` 사용
- 설정 파일 `env`에서 경로에 **`~`나 `$HOME`** 사용 → 풀리지 않습니다. 절대 경로
- `DISABLE_TELEMETRY=0`으로 **켜려고** 함 → 오히려 끕니다. 변수를 지우세요
- 키 바인딩 파일에서 **`ctrl+C`**, **`ctrl+D`** 를 바꾸려 함 → 고정입니다
- 키 이름을 **한글 자판 글자**로 적음 → 라틴 문자로 쓰세요
- 설정 변수가 **안 먹힘** → 프로젝트·로컬 파일에서는 무시되는 변수일 수 있습니다

## 더 알아보기
- [공식 환경 변수 문서](https://code.claude.com/docs/ko/env-vars) · [공식 키 바인딩 문서](https://code.claude.com/docs/ko/keybindings)
- 설정 파일 전반은 [설정 파일(settings.json)](#/level2/settings-json), 우선순위는 [팀·조직 설정](#/level3/managed-settings)
