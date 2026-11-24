# 팀·조직 설정

> 혼자 쓸 때는 내 설정 파일만 고치면 됩니다. 팀이나 조직이 함께 쓰면 **"누구의 설정이 이기는가"** 와 **"관리자가 정한 규칙을 어떻게 배포하는가"** 가 문제가 됩니다. 이 레슨은 **설정 우선순위**와 **관리형 설정(managed settings)** 을 다룹니다.

> 이 레슨의 뒷부분(관리형 설정 배포)은 **조직의 관리자**를 위한 내용입니다. 개인 사용자는 "내 컴퓨터에 관리자가 정한 규칙이 있는지 확인하는 법"과 "팀 설정을 공유하는 법"까지만 알아도 충분합니다. 기본 개념은 [설정 파일(settings.json)](#/level2/settings-json)을 먼저 보세요.

## 1. 설정 파일 네 가지와 적용 범위
| 범위 | 파일 | 누구에게 | 쓰는 곳 |
|---|---|---|---|
| **사용자** | `%USERPROFILE%\.claude\settings.json` | **나**, 이 컴퓨터의 모든 프로젝트 | 테마, 편집 모드, 기본 모델, 내 권한 규칙 |
| **공유 프로젝트** | `.claude\settings.json` | 그 폴더에서 일하는 **모든 사람** (git에 커밋하면 팀원도 받음) | 팀 권한, 훅, 플러그인, 프로젝트에 필요한 환경 변수 |
| **프로젝트 로컬** | `.claude\settings.local.json` | **나**, 이 프로젝트에서만 | 개인 재정의, 공유하기 전 시험 |
| **관리형** | `managed-settings.json` 등 | 조직이 **배포한 모든 사람** | 보안 정책·규정 준수 |

> Claude Code를 설치해도 설정 파일은 **저절로 만들어지지 않습니다.** 사용자 파일은 테마 같은 설정을 저장할 때, 로컬 파일은 허가 질문에 "Yes, and don't ask again"을 고를 때 만들어집니다.

참고: `%USERPROFILE%\.claude.json`은 Claude Code가 **스스로 쓰는 별도 파일**(계정, MCP 서버 설정, 신뢰 결정 등)입니다. 직접 고치지 마세요.

### 팀에 설정 공유하기
`.claude\settings.json`을 **커밋**하면 저장소를 받는 모두가 같은 권한·훅·플러그인 설정을 얻습니다. 개인 예외는 각자 `.claude\settings.local.json`에 두면 커밋하지 않고 덮어쓸 수 있습니다.

- 커밋한 설정 중 일부는 팀원이 **폴더를 신뢰해야** 적용됩니다 (`permissions.allow` 규칙, `additionalDirectories`, `env` 대부분 등)
- 일부 키는 저장소 파일에 넣어도 **적용되지 않습니다** (사용자·관리형에서만 설정 가능한 키)
- `permissions.defaultMode`의 `auto`·`bypassPermissions` 값은 **프로젝트·로컬 설정에서는 효력이 없습니다**. 사용자·관리형 설정에 두거나 `--permission-mode`를 쓰세요

### 나만 바꾸고 싶을 때
팀 파일이 `"model": "claude-sonnet-5-5"`인데 나는 Opus를 쓰고 싶다면 `.claude\settings.local.json`에 내 값을 두면 **내 세션만** 바뀝니다.

- Claude Code가 이 파일을 처음 쓸 때 **전역 git 제외 목록**에 `**/.claude/settings.local.json`을 추가해 커밋되지 않게 합니다. 직접 만들었다면 **`.gitignore`에 직접 추가**하세요
- 저장소 안에서 하위 폴더에서 시작해도 이 파일은 **저장소 루트**에서 읽고 씁니다 (Windows 등 일부 경우는 예외)

## 2. 설정을 바꾸는 방법
| 방법 | 설명 |
|---|---|
| `/config` | 테마·편집 모드 같은 **개인 옵션 일부**. 터미널 화면에서만 열립니다. `/config verbose=true`처럼 `키=값`으로 직접 지정도 가능 |
| 파일 직접 편집 | 해당 범위의 `settings.json`에 키 추가 |
| **한 세션만** | `claude --settings '{"model": "claude-opus-5-5"}'`, 전용 플래그(`--model`), 환경 변수(`ANTHROPIC_MODEL`) |

- 설정 파일은 **엄격한 JSON**입니다. `//` 주석이나 마지막 쉼표가 있으면 오류입니다
- `"$schema": "https://json.schemastore.org/claude-code-settings.json"`을 맨 위에 두면 VS Code 등에서 **자동 완성과 검증**을 받습니다
- 파일을 고치면 **재시작 없이** 대부분 반영됩니다 (`permissions`, `hooks`, `apiKeyHelper` 등). 단 `model`처럼 **시작할 때 한 번만** 읽는 키는 `/model`로 바꾸세요
- `/model`로 모델을 바꾸면 **사용자 설정**에 저장됩니다. 저장하지 않고 이번 세션만 바꾸려면 선택기에서 `s`를 누릅니다

### 지금 무엇이 적용 중인지 확인
```text
/status
```
`Setting sources` 줄에 **불러온 설정 파일**이 나열됩니다 (예: `User settings`, `Project local settings`). 관리형 설정이 적용 중이면 `Enterprise managed settings (...)`로 표시됩니다. 이 줄은 **어느 파일을 읽었는지**만 알려 줄 뿐 **어느 파일이 각 키를 제공했는지**는 알려 주지 않습니다. 거부된 항목은 `claude doctor`에서 봅니다.

### 설정 파일이 망가졌을 때
| 표시 | 의미 |
|---|---|
| **Settings Error** | 사용자·프로젝트·로컬 파일의 JSON이 잘못되었거나 값이 거부됨. 시작할 때 Claude의 도움으로 고치거나, 종료하거나, 그 설정 없이 계속할 수 있는 대화상자가 뜸 |
| **Settings Warning** | 일부 항목만 문제(잘못된 권한 규칙, 알 수 없는 훅 이벤트 이름). 그 값만 건너뛰고 나머지는 유지 |
| `claude -p` 실행 | 대화상자 없이 깨진 파일·값을 건너뜀. 끝난 뒤 `claude doctor`로 무엇이 무시됐는지 확인 |

## 3. 우선순위: 같은 키가 여러 곳에 있으면?
**높은 쪽이 이깁니다.**

| 순위 | 출처 |
|---|---|
| 1 (최고) | **관리형 설정** — 어떤 것도 못 덮어씀 |
| 2 | **명령줄** `--settings` (이번 세션만) |
| 3 | **프로젝트 로컬** (`.claude\settings.local.json`) |
| 4 | **공유 프로젝트** (`.claude\settings.json`) |
| 5 (최저) | **사용자** (`%USERPROFILE%\.claude\settings.json`) |

- **환경 변수는 이 순서에 속하지 않습니다.** 변수마다 정해져 있습니다. `ANTHROPIC_MODEL`은 어느 파일의 `model`보다 우선하고, `ANTHROPIC_DEFAULT_MODEL`은 어느 파일도 `model`을 정하지 않았을 때만 적용됩니다
- **목록은 덮어쓰지 않고 합쳐집니다.** 여러 파일에 `permissions.allow`가 있으면 모두 합칩니다. (예외: `fallbackModel`, `modelPicker`, `availableModels`, `modelSettings`는 각자 규칙)
- **deny는 어디서든 이깁니다.** 사용자 설정이 allow하고 프로젝트가 deny하면 막힙니다 ([권한 규칙 심화](#/level3/permissions-deep))

### 예: tips를 끄고 싶은데 켜지는 이유
`spinnerTipsEnabled`를 내 사용자 설정에서 `false`로 했다고 하겠습니다.

| 상황 | 결과와 해결 |
|---|---|
| 팀의 `.claude\settings.json`이 `true` | 그 프로젝트에서는 tips가 보임 → 그 프로젝트의 `.claude\settings.local.json`에 `false`를 두면 **나만** 돌아옴 |
| 조직의 관리형 설정이 `true` | **되돌릴 수 없음** (관리형이 최상위). `/status`로 어떤 출처인지 확인하고 관리자에게 문의 |
| `claude --settings '{"spinnerTipsEnabled": true}'`로 시작 | 그 세션만 켜짐. 다음 세션에는 내 값 |
| 플래그·환경 변수가 같은 것을 지정 | 키마다 다름. 설정 레퍼런스에서 확인 |

### 설정이 적용되지 않을 때 점검
1. `/status`로 **파일이 로드됐는지** 확인
2. **더 높은 곳**에서 같은 키를 정하는지 (다른 파일, `--settings`, 관리형)
3. 그 **파일에서는 설정할 수 없는 값**인지 (예: 프로젝트의 `defaultMode: auto`)
4. 파일이 **깨졌는지** (`claude doctor`)
5. 폴더를 **신뢰**했는지 (커밋된 `permissions.allow` 등은 신뢰 전에는 무시)

## 4. 관리형 설정 (관리자용)
**관리형 설정**은 조직이 모든 개발자 PC에 배포하는 설정입니다. **사용자·프로젝트·로컬·`--settings` 값이 모두 이것을 덮어쓸 수 없습니다.** 보안 정책과 규정 준수에 씁니다.

### 내 컴퓨터에 관리형 설정이 있나?
```text
/status
```
`Setting sources` 줄에 `Enterprise managed settings`와 **괄호 안 출처**가 보입니다.

| 괄호 | 출처 |
|---|---|
| `(remote)` | claude.ai 관리자 콘솔 또는 게이트웨이의 **서버 관리형 설정** |
| `(plist)` · `(HKLM)` | macOS 구성 프로파일 · Windows 레지스트리 **MDM 정책** |
| `(file)` · `(drop-ins)` · `(file + drop-ins)` | `managed-settings.json` 파일, 드롭인 폴더 |
| `(HKCU)` | 사용자가 쓸 수 있는 레지스트리 대체 경로 |
| `(... , merged)` | 조직이 모든 출처를 **합쳐** 쓰는 구성 |

이 줄이 **없다면** 정책 키가 든 관리형 출처를 찾지 못한 것입니다. 건너뛴 출처가 있으면 `Skipped sources` 줄에 표시됩니다.

### 전달 방식 네 가지
| 방식 | 전달 | 읽는 때 | 알맞은 곳 |
|---|---|---|---|
| **서버 관리형** | claude.ai 관리자 콘솔(Teams·Enterprise 플랜) 또는 자체 게이트웨이 | 시작할 때 가져오고 **1시간마다** 확인 | 기기를 건드리지 않고 한 곳에서 정책을 바꾸고 싶을 때 |
| **MDM·OS 정책** | macOS 구성 프로파일, Windows `HKLM` 레지스트리 (Jamf, Intune, 그룹 정책 등) | 시작 시 + **30분마다** | 이미 MDM으로 기기를 관리할 때 |
| **파일 기반** | 시스템 폴더의 `managed-settings.json` | 시작 시 + 파일이 바뀔 때 | MDM이 없는 PC, Linux, 직접 만든 이미지 |
| **HKCU 레지스트리** | Windows 사용자 레지스트리 | 시작 시 + 30분마다 | `HKLM`에 쓸 수 없을 때. **관리자 권한 없이 쓸 수 있으니 강제 수단으로는 부적합** |

### 파일 방식으로 배포하기
**1. `managed-settings.json` 작성** — `settings.json`과 같은 모양입니다.
```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./secrets/**)"
    ],
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true
}
```
- `.env`와 `secrets` 읽기를 막고
- `bypassPermissions` 모드를 쓰지 못하게 하고
- **사용자·프로젝트의 권한 규칙을 무시**합니다 (관리형만 유효)

**2. 각 컴퓨터의 시스템 폴더에 저장**
| 운영체제 | 경로 |
|---|---|
| **Windows** | `C:\Program Files\ClaudeCode\managed-settings.json` |
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` |
| Linux · WSL | `/etc/claude-code/managed-settings.json` |

- Windows의 예전 경로 `C:\ProgramData\ClaudeCode\managed-settings.json`은 **읽지 않습니다**
- Windows 레지스트리(MDM)로는 `HKLM\SOFTWARE\Policies\ClaudeCode`의 `Settings` 값(JSON 문자열, `REG_SZ`)을 씁니다

**3. 확인** — 한 대에서 `/status`를 열어 `Setting sources`에 `Enterprise managed settings (file)`가 보이는지 확인한 뒤 나머지 PC에 배포합니다.

### 팀별로 나눠 관리하기: `managed-settings.d`
여러 팀이 정책을 나눠 맡으면 같은 폴더의 `managed-settings.d\`에 파일을 따로 둡니다.
```text
managed-settings.json
managed-settings.d\
  10-telemetry.json
  20-security.json
```
`managed-settings.json`을 먼저, 그다음 `*.json`을 **파일 이름 순서**로 합칩니다. 숫자 접두사로 순서를 정하세요. 같은 키가 겹치면:
| 종류 | 합치는 규칙 |
|---|---|
| 단일 값 | **나중 파일**이 이김 |
| 목록 (`permissions.deny` 등) | **합침** (중복 제거) |
| 중첩 블록 (`env`, `sandbox`) | 키별로 병합 |
| `fallbackModel`, `modelPicker` | 나중 것이 **통째로 교체** |

### 출처가 여러 개일 때
같은 PC에 관리형 출처가 여러 개 전달되면 기본(`"first-wins"`)은 **우선순위가 가장 높고 정책 키가 든 하나만** 쓰고 나머지는 **합치지 않고 무시**합니다. 순서는 **① 서버 관리형 → ② MDM/OS 정책 → ③ 관리형 파일 → ④ HKCU**입니다. `managedSourcesBehavior: "merge"`로 바꾸면 모든 관리자 출처를 합칩니다.

> 일부 키(샌드박스 잠금, MCP 허용 목록 잠금 등)는 **모든 관리자 출처에서 읽습니다.**

### 무엇을 강제할 수 있나
| 통제 | 하는 일 | 대표 키 |
|---|---|---|
| **권한 규칙** | 도구·명령 허용/확인/거부 | `permissions.allow` · `permissions.deny` |
| **권한 잠금** | 권한 규칙을 관리형만 쓰게 함, `--dangerously-skip-permissions` 끔 | `allowManagedPermissionRulesOnly`, `permissions.disableBypassPermissionsMode` |
| **샌드박스** | 파일·네트워크 격리, 도메인 허용 목록 ([샌드박스](#/level3/sandbox)) | `sandbox.enabled`, `sandbox.network.allowedDomains` |
| **관리형 CLAUDE.md** | 조직 전체 행동 지침 (강제 규칙이 아닌 안내) | 관리형 정책 경로의 파일 |
| **MCP 서버 통제** | 연결할 수 있는 MCP 서버 제한·고정 배포 | `allowedMcpServers`, `deniedMcpServers`, `allowManagedMcpServersOnly`, `managedMcpServers`, `managed-mcp.json` |
| **플러그인 통제** | 추가할 수 있는 마켓플레이스 제한, 외부 설치 플래그 차단 | `strictKnownMarketplaces`, `blockedMarketplaces`, `disableSideloadFlags` |
| **훅 통제** | 실행될 수 있는 훅 제한 | `allowManagedHooksOnly` |
| **확장 잠금** | 스킬·에이전트·훅·MCP를 사용자·프로젝트 출처에서 막음 | `strictPluginOnlyCustomization` |
| **시작 보장** | 서버 정책을 새로 받지 못하면 시작하지 않게 함 | `forceRemoteSettingsRefresh` |

**관리형 설정 전용 키:** 위 잠금 계열 키는 **관리형 출처에서만** 읽습니다. 사용자·프로젝트 설정에 넣어도 효과가 없습니다. 전체 목록은 공식 설정 레퍼런스의 Scope 열에서 확인하세요.

**원격 제어·클라우드 세션** 같은 일부 기능은 Teams·Enterprise 플랜 소유자가 claude.ai 관리자 설정에서 조직 단위로 켜고 끕니다.

### 관리형 설정이 해도 안 되는 것
| 개발자가 여전히 할 수 있는 것 | 설명 |
|---|---|
| **세션의 모델 고르기** | 관리형 `model`은 **기본값**이지 잠금이 아닙니다. 선택을 제한하려면 `availableModels`를 쓰세요 |
| 자동 압축 창 크기 | 관리형 값은 기본값. 플래그·변수가 그 세션에서 우선 |
| **로컬 관리자 권한** | 기기 관리자는 관리형 파일 자체를 고칠 수 있습니다. 그래서 MDM이 정기적으로 다시 배포하고, HKLM·macOS 관리형 도메인이 있는 것입니다 |
| **다른 도구** | 관리형 설정은 Claude Code에만 적용됩니다. API를 다른 도구로 호출하면 적용 안 됨 |
| **허용 목록에 항목 추가** | 목록은 합쳐지므로 개발자가 `permissions.allow`나 `allowedMcpServers`에 항목을 더할 수 있습니다. 막으려면 `allowManaged*Only` 키 사용 |

### 관리형 설정을 이기는 예외 (더 엄격한 값은 허용)
보안 키 몇 개는 **낮은 수준의 더 엄격한 값도 인정**합니다. 예를 들어 `disableClaudeAiConnectors: true`, `permissions.blockReadsOutsideWorkingDirectories: true`는 **관리형이 `false`여도 어느 범위에서든 `true`면 적용**됩니다. `maxEffortLevel`은 가장 낮은 상한이 적용됩니다. (개발자가 스스로를 **더 제한**하는 것은 막지 않습니다.)

### 잘못된 값이 들어가면
- 개별 항목이 잘못되면 **그 항목만 건너뛰고** 경고합니다
- 관리형 파일이 **JSON으로 해석되지 않으면 Claude Code가 시작을 거부**하고, 다른 출처에 유효한 정책이 있어도 오류를 냅니다
- 확인: 해당 PC에서 `/status`와 `claude doctor`

### 시작 전에 정할 것 (공식 관리자 가이드 순서)
1. **API 공급자**: Claude for Teams/Enterprise(기본 권장), Claude Console, Amazon Bedrock, Google Cloud, Microsoft Foundry
2. **설정 전달 방식**: 위 표에서 선택
3. **무엇을 강제할지**: 위 "강제할 수 있는 것" 표
4. **사용량 가시성, 데이터 처리 검토, 검증·온보딩**

> WSL에서 Claude Code를 쓰는 Windows PC는 기본으로 **Linux 경로**(`/etc/claude-code`)만 읽습니다. Windows 쪽 정책을 WSL에도 적용하려면 Windows 관리형 출처에 `wslInheritsWindowsSettings: true`를 배포하세요.

## 5. 텔레메트리와 개인정보
Claude Code는 Anthropic API를 쓰는 세션에서 운영 텔레메트리를 **기본으로 보냅니다.** 조직 차원에서 끄려면 관리형 설정의 `env`에 `DISABLE_TELEMETRY`를 `"1"`로 둡니다.
```json
{
  "env": {
    "DISABLE_TELEMETRY": "1"
  }
}
```
(관리자는 데이터 처리 방식과 공급자별 기본 동작을 공식 데이터 사용 문서에서 먼저 확인하세요.)

## 확인 체크
- [ ] 설정 파일 네 가지(사용자·공유 프로젝트·프로젝트 로컬·관리형)와 각각의 범위를 설명할 수 있다
- [ ] `/status`의 `Setting sources` 줄을 읽어 봤다
- [ ] 우선순위가 **관리형 > 명령줄 > 로컬 > 공유 프로젝트 > 사용자**임을 안다
- [ ] 목록은 **합쳐지고** deny는 어디서든 이긴다는 것을 안다
- [ ] (관리자) `managed-settings.json`의 위치와 `/status`로 배포를 확인하는 방법을 안다

## 자주 하는 실수
- **관리형 값을 내 설정으로 덮어쓰려** 함 → 불가능합니다. 관리자에게 문의
- 팀 설정을 커밋했는데 **팀원에게 안 먹힘** → 폴더 신뢰 전에는 `permissions.allow`·`env` 등이 보류됩니다
- `settings.local.json`을 **직접 만들고** `.gitignore`에 안 넣음 → 커밋될 수 있습니다
- JSON에 **주석이나 마지막 쉼표** → 파일 전체가 무시되거나 오류
- 관리형 `model`로 **모델을 강제**했다고 믿음 → `--model`로 바뀝니다. `availableModels`를 쓰세요
- `HKCU` 레지스트리를 **강제 수단**으로 사용 → 사용자가 쓸 수 있어서 안전하지 않습니다

## 더 알아보기
- [공식 설정 문서](https://code.claude.com/docs/ko/settings) · [관리형 설정 배포](https://code.claude.com/docs/ko/managed-settings) · [서버 관리형 설정](https://code.claude.com/docs/ko/server-managed-settings)
- 모든 설정 키: 공식 설정 레퍼런스
- 권한 규칙: [권한 규칙 심화](#/level3/permissions-deep) · 샌드박스: [샌드박스](#/level3/sandbox)
