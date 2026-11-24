# 샌드박스

> **샌드박스**는 Claude가 실행하는 **셸 명령이 닿을 수 있는 파일과 네트워크의 범위를 운영체제 수준에서 가두는** 안전 장치입니다. 규칙을 "부탁"하는 것이 아니라 **운영체제가 강제**합니다.

> **먼저 확인하세요: Windows에서는?**
> 샌드박스는 **macOS, Linux, WSL2**에서 동작합니다. **일반(네이티브) Windows에서는 Claude Code가 명령을 샌드박스 없이 실행합니다.** Windows PC에서 샌드박스를 쓰려면 **WSL2(Linux용 Windows 하위 시스템) 안에서 Claude Code를 실행**해야 합니다.
>
> 그래서 이 레슨은 "무엇을 가두는지, 어떤 설정이 있는지"를 이해하는 데 초점을 둡니다. 지금 Windows에서 PowerShell로 쓰고 있다면 안전은 **[권한 모드](#/level2/permissions)와 [권한 규칙](#/level3/permissions-deep)** 이 담당합니다.

## 샌드박스가 가두는 것
기본적으로 **꺼져 있습니다.** 켜면 Claude가 실행하는 셸 명령과 그 명령이 만든 **하위 프로세스**가 경계 안에서 시작됩니다.

| 대상 | 기본 동작 | 바꾸는 설정 |
|---|---|---|
| **쓰기** | **작업 폴더**, 사용자별 임시 폴더, 내가 추가한 폴더만. 보호 경로(아래 "보호되는 경로" 참고)는 계속 쓰기 금지 | `filesystem.allowWrite` · `denyWrite` |
| **읽기** | **컴퓨터 대부분** (`~/.ssh`, `~/.aws/credentials` 같은 자격 증명 파일 포함!) | `filesystem.denyRead` · `credentials` |
| **네트워크** | **직접 연결 불가.** 내 컴퓨터의 **프록시**를 거치며 프록시는 허용 도메인 목록과 대조. 목록은 처음에 **비어 있음** | `network.allowedDomains` · `deniedDomains` |
| **환경 변수** | Claude Code의 것을 **그대로 상속** (비밀 값 포함) | `credentials` · `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` |

> **읽기는 기본적으로 넓게 열려 있습니다.** 샌드박스를 켜도 비밀 키 파일을 읽을 수 있으니, 지키고 싶은 파일은 `denyRead`나 `credentials`에 **직접 적어야** 합니다. 내장 거부 목록은 없습니다.

## 샌드박스 **밖**에서 실행되는 것
샌드박스는 **셸 명령만** 감쌉니다. 다음은 밖에서 실행됩니다.

| 밖에서 실행됨 | 대신 적용되는 것 |
|---|---|
| **Read·Edit·Write·WebFetch·WebSearch** 같은 기본 파일·웹 도구 | [권한 규칙](#/level3/permissions-deep). `denyRead`는 Read 도구를 막지 못하고, `allowedDomains`는 WebFetch를 제한하지 않습니다 |
| **훅**, 로컬 **MCP 서버**, 플러그인 모니터, 상태 줄 명령 | 내 **전체 권한** |
| 내가 `!` 프롬프트에 **직접 입력한** 명령 | 대부분 샌드박스 없음 |
| `excludedCommands`에 적은 명령 | 샌드박스 없음 |
| Claude가 요청해 **샌드박스 없이 재시도**한 명령 | 평소 권한 흐름 |

그래서 [훅](#/level3/hooks)이나 [플러그인](#/level3/plugins)은 샌드박스를 켜도 **내 권한으로** 돕니다. 전체를 한 경계 안에 넣으려면 Claude Code 프로세스 자체를 컨테이너·가상 머신에서 실행하는 방법을 공식 문서가 안내합니다.

## 시작하기
**1. `/sandbox` 실행**
```text
/sandbox
```
패널에 탭이 나옵니다.
- **Mode**: 샌드박스 명령의 승인 방식
- **Overrides**: 샌드박스에서 실패한 명령을 **밖에서 다시 실행**하게 허용할지 (`allowUnsandboxedCommands`)
- **Config**: 현재 적용된 설정 보기
- (Linux에서 부족한 구성 요소가 있으면) **Dependencies**: 설치해야 할 것 안내. 이 탭만 보이면 아직 시작할 수 없는 상태입니다

**2. 모드 고르기**

| 모드 | 동작 |
|---|---|
| **자동 허용 (auto-allow)** | 샌드박스 **안**에서 실행되는 명령은 **묻지 않고** 승인 |
| **일반 권한** | 샌드박스 안이어도 **평소처럼 허가를 물음** (더 안전, 더 번거로움) |

두 모드 모두 **파일·네트워크 제한은 동일**합니다. 달라지는 것은 **승인 방식**뿐입니다.

자동 허용 모드에서도 아래는 **그대로 적용**됩니다.
- `Bash` **거부 규칙**에 걸리는 명령은 여전히 차단
- **중요 경로**를 지우는 `rm`·`rmdir`은 평소 권한 흐름을 거침
- `Bash(git push *)` 같은 **내용 지정 ask 규칙**은 여전히 묻습니다

**3. 명령 실행** — 빌드나 테스트를 시켜 보세요. 처음 새 도메인이 필요하면 승인을 묻습니다.

**한 세션만 샌드박스로 켜기**
```text
claude --settings '{"sandbox": {"enabled": true, "allowUnsandboxedCommands": false}}'
```

모든 프로젝트에서 켜려면 `%USERPROFILE%\.claude\settings.json`에 `"sandbox": { "enabled": true }`를 둡니다. `/sandbox`에서 고른 모드는 **프로젝트의 `.claude\settings.local.json`** 에 저장됩니다.

> **경고:** 플랫폼이 샌드박스를 지원하지 않거나 시작 점검에 실패하면 **기본값은 샌드박스 없이 계속 실행**입니다. 시작 자체를 막으려면 `sandbox.failIfUnavailable`을 `true`로 두세요.

### 제대로 동작하는지 확인하기
**Claude에게 시켜서** 실행하세요. (`!`로 직접 입력한 명령은 샌드박스 밖에서 돌기 때문에 시험이 안 됩니다.)

| 명령 | 샌드박스 안에서의 결과 |
|---|---|
| `touch ~/sandbox-probe` | 실패 (`Operation not permitted` 또는 `Read-only file system`) |
| `curl --noproxy '*' https://example.com` | 실패 (`Could not resolve host`). 프록시를 우회하는 길이 없기 때문 |

### WSL2·Linux에서 준비
`bubblewrap`과 `socat`이 필요합니다. 없어도 `/sandbox`를 열면 부족한 것을 알려 줍니다.
```bash
sudo apt-get install bubblewrap socat     # Ubuntu / Debian
```

## 설정하기
`settings.json`의 `sandbox` 항목에서 정합니다.

### 쓰기 허용 범위 넓히기
`kubectl`, `terraform`, `npm` 같은 도구가 작업 폴더 밖에 써야 한다면:
```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "allowWrite": ["~/.kube", "/tmp/build"]
    }
  }
}
```
- 경로는 **운영체제 수준**에서 강제되어 하위 프로세스도 따릅니다
- `~/.kube`는 홈 기준, `/tmp/build`는 절대 경로입니다. (권한 규칙의 `//절대경로`, `/프로젝트기준` 표기와는 **다릅니다**)
- Linux·WSL2에서는 **아직 없는 경로**의 항목은 효과가 없으니 먼저 폴더를 만드세요
- 여러 설정 범위의 배열은 **합쳐집니다**

### 읽기 막기
```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "denyRead": ["~/"],
      "allowRead": ["."]
    }
  }
}
```
홈 폴더 전체를 막고 **현재 프로젝트만** 읽게 합니다. 이 예시는 **프로젝트의 `.claude\settings.json`** 에 두어야 `.`이 프로젝트 루트를 가리킵니다. (사용자 설정에 두면 `.`이 `~/.claude`가 됩니다.)

겹치면 **더 좁은 경로가 이깁니다.** 그래도 넓은 허용 안에 둔 `denyRead`는 유지되므로, 넓은 허용이 비밀 파일을 **조용히 다시 열어 버리지** 않습니다.

### 자격 증명 보호하기
```json
{
  "sandbox": {
    "enabled": true,
    "credentials": {
      "files": [
        { "path": "~/.aws/credentials", "mode": "deny" },
        { "path": "~/.ssh", "mode": "deny" }
      ],
      "envVars": [
        { "name": "GITHUB_TOKEN", "mode": "deny" },
        { "name": "NPM_TOKEN", "mode": "deny" }
      ]
    }
  }
}
```
`deny`로 지정한 **파일은 읽기 금지**, **환경 변수는 샌드박스 명령 실행 전에 제거**됩니다. 모든 설정 범위의 `deny` 항목이 합쳐지고, 어느 범위도 다른 범위의 `deny`를 풀 수 없습니다. 이 설정은 **샌드박스된 Bash에만** 적용됩니다. 모든 하위 프로세스에서 자격 증명을 빼려면 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`를 쓰세요.

### 샌드박스에서 빼기: `excludedCommands`
샌드박스에서 **동작하지 않는** 도구를, 내가 **전체 권한을 줘도 될 만큼 믿을 때만** 제외합니다.
```json
{
  "sandbox": {
    "enabled": true,
    "excludedCommands": ["docker compose *"]
  }
}
```
> 제외한 명령은 **파일·네트워크 제한이 모두 사라집니다.** 도구가 폴더 하나나 호스트 하나만 더 필요한 거라면 제외하기보다 `allowWrite`·`allowedDomains`를 먼저 시도하세요.

## 네트워크 동작
- 샌드박스 명령은 **네트워크에 직접 나갈 수 없고** 내 컴퓨터의 **프록시**를 거칩니다. 프록시가 **호스트 이름**을 허용·거부 목록과 대조합니다
- `curl`, `npm`, HTTPS의 `git`처럼 **프록시 환경 변수를 읽는 도구**는 호스트가 허용되면 연결됩니다
- 프록시를 쓰지 않는 도구(일반 `ssh`, 대부분의 DB 클라이언트)는 **허용된 호스트에도 연결하지 못합니다.** `ping` 같은 TCP 외 통신(UDP, ICMP, QUIC)도 나갈 수 없습니다
- 허용 도메인 밖의 호스트에 처음 연결하면 **권한 모드에 따라** 처리됩니다.

| 권한 모드 | 허용 목록 밖 호스트 |
|---|---|
| `bypassPermissions` | 묻지 않고 허용 |
| 일반(manual), `acceptEdits` | **허가를 물음** ("Yes"면 이번 세션만, "Yes, and don't ask again"이면 로컬 설정에 규칙이 저장됨) |
| 자동(auto) 모드 | 명령이 호스트를 밝히고 분류기가 승인한 경우만 허용 |
| `dontAsk` | 거부 |

```json
{
  "sandbox": {
    "enabled": true,
    "network": {
      "allowedDomains": ["registry.npmjs.org", "github.com"]
    }
  }
}
```
> `github.com` 같은 **넓은 도메인**을 허용하면 데이터가 새어 나갈 길이 될 수 있습니다. 프록시는 TLS 내용을 검사하지 않고 **요청한 호스트 이름만** 보기 때문입니다. 위험을 줄이려면 **필요한 도메인만** 좁게 허용하세요.

`strictAllowlist`를 `true`로 두면 목록 밖 호스트를 묻지 않고 **거부**합니다. 이 값은 **사용자 설정·관리형 설정·`--settings`** 에서 정할 때만 적용되며, 저장소의 프로젝트 설정으로는 켤 수 없습니다.

## 샌드박스 없이 재시도(탈출구)
샌드박스에서 실패한 명령을 Claude가 분석한 뒤 `dangerouslyDisableSandbox`로 **샌드박스 없이 다시 실행**하려 할 수 있습니다. 누가 승인하는지는 권한 모드에 따릅니다.

| 권한 모드 | 재시도 |
|---|---|
| `bypassPermissions` | 묻지 않고 실행 |
| 일반, `acceptEdits` | **"Bash command (unsandboxed)"** 라는 허가 질문 |
| 자동 모드 | 분류기가 판단 |
| `dontAsk` | 거부 |

- 일치하는 **허용 규칙**(예: `Bash(curl *)`)이 있으면 재시도도 **묻지 않고** 승인됩니다
- `Bash(dangerouslyDisableSandbox:true)` **ask 규칙**을 두면 재시도마다 묻습니다

### 엄격 모드: 재시도 끄기
```json
{
  "sandbox": {
    "enabled": true,
    "allowUnsandboxedCommands": false
  }
}
```
이렇게 하면 `dangerouslyDisableSandbox`가 **무시**되어, Claude가 실행하는 명령은 `excludedCommands`가 아니면 항상 샌드박스 안에서 실행됩니다. 사용자·관리형 설정·`--settings`의 `false`는 프로젝트가 `true`로 덮어쓸 수 없습니다.

## 보호되는 경로
쓰기가 허용된 폴더 안에서도 **설정·코드를 읽어 들이는 파일**은 쓰기가 막혀 있습니다. 명령이 그 파일을 고쳐 **스스로 권한을 올리거나** 샌드박스 밖에서 도는 **훅·MCP 서버를 심는 것**을 막기 위해서입니다.

- 작업 폴더와 그 위쪽: `.claude` 설정 파일, `.claude\skills`·`agents`·`commands`·`hooks` 폴더, `.mcp.json`, `.claude\scheduled_tasks.json` 등
- 작업 폴더: `.bashrc`·`.zshrc` 같은 셸 시작 파일, `.gitconfig`, `.vscode`, `.idea`, `.git`의 `hooks`·`config`
- `~/.claude`의 대부분, `~/.claude.json`, `.credentials.json`

`allowWrite`나 Edit 허용 규칙을 더해도 보호는 **그대로**입니다. `/sandbox`의 **Config** 탭에서 내 컴퓨터에 적용된 경로를 볼 수 있습니다.

## 샌드박스, 권한 규칙, 권한 모드는 다른 층입니다
| | 무엇을 통제하나 | 언제 |
|---|---|---|
| **권한 규칙** | 어떤 **도구**를 쓸 수 있나 (Bash, Read, Edit, WebFetch, MCP…) | 도구가 **실행되기 전**, 명령 문자열을 보고 판단 |
| **샌드박스** | 셸 명령이 **실행되는 동안** 닿을 수 있는 파일·네트워크 | 운영체제가 **실행 중인 프로세스**에 강제. 모델이 무엇을 골랐든 유지 |
| **권한 모드** | 도구 호출을 **실행할지·물어볼지** | 호출 시 |

- `/sandbox`는 권한 모드가 **아닙니다.** 샌드박스의 **자동 허용**(경계가 막아 주니 묻지 않음)과 권한 모드의 **자동(auto) 모드**(분류기가 검토)는 **이름만 비슷한 별개** 기능이고, 함께 쓸 수 있습니다
- 샌드박스 설정과 권한 규칙의 **경로·도메인은 합쳐져** 최종 샌드박스 설정이 됩니다

## 조직에서 강제하기
관리형 설정으로 샌드박스를 **필수**로 하고 개발자가 풀지 못하게 잠글 수 있습니다. 샌드박스가 **관리자 필수(admin-required)** 가 되면 저장소 파일의 느슨하게 하는 설정은 무시됩니다. 자세한 내용은 [팀·조직 설정](#/level3/managed-settings)과 공식 문서의 "조직용 샌드박스 설정"을 참고하세요.

## 한계
샌드박스는 **위험을 줄이지만 완전한 격리 경계는 아닙니다.**
- **네트워크 필터링**은 호스트 이름만 봅니다 (도메인 프런팅 같은 기법으로 우회 가능성)
- **Unix 소켓 허용**(`allowUnixSockets`)은 위험합니다. `docker.sock`을 허용하면 사실상 호스트 접근 권한을 주는 것입니다
- **쓰기 범위를 너무 넓히면** (`PATH`의 실행 파일 폴더, 셸 설정 파일) 권한 상승으로 이어질 수 있습니다
- Linux의 `enableWeakerNestedSandbox`, `allowNestedUserNamespaces`는 보안을 **크게 낮춥니다**
- **서브에이전트**는 부모와 같은 프로세스·같은 샌드박스 설정을 씁니다
- 효과적이려면 **파일 격리와 네트워크 격리가 모두** 필요합니다. 네트워크가 열려 있으면 SSH 키 등이 새어 나갈 수 있고, 파일 격리가 없으면 시스템을 변조해 네트워크 접근을 얻을 수 있습니다

## 문제 해결
| 증상 | 확인할 것 |
|---|---|
| **host-not-allowed** 오류 | 묻는 창에서 호스트를 승인하거나 `allowedDomains`에 추가 |
| `jest`가 멈춤·실패 | `watchman`과 충돌. `jest --no-watchman` |
| `docker` 명령 실패 | `excludedCommands`에 `docker *` 추가 검토 (제외하면 제한이 사라짐) |
| DB 클라이언트·일반 `ssh`가 허용된 호스트에 못 붙음 | 프록시를 쓰지 않는 도구는 연결 불가. 제외하거나 다른 방법 |
| `git` 명령이 `unable to unlink old` 등으로 실패 | 보호 경로 때문. 공식 문서의 해당 항목 확인 |
| `Sandbox is required` 로 명령 거부 | 샌드박스가 필수인데 사용할 수 없는 상태. 의존성 점검 |
| 설정을 바꿨는데 효과 없음 | 관리자 필수 모드면 **프로젝트 설정의 완화 항목은 무시**됩니다. `%USERPROFILE%\.claude\settings.json`에 저장 |

## 확인 체크
- [ ] 내 환경(네이티브 Windows / WSL2 / macOS / Linux)에서 샌드박스를 쓸 수 있는지 알고 있다
- [ ] (WSL2·macOS·Linux) `/sandbox`를 열어 모드를 골랐다
- [ ] 샌드박스가 **셸 명령만** 감싼다는 것, 읽기는 **기본으로 넓게 열려 있다**는 것을 이해했다
- [ ] 지키고 싶은 파일·환경 변수를 `denyRead`나 `credentials`에 적을 수 있다

## 자주 하는 실수
- **네이티브 Windows**에서 샌드박스를 켰다고 **안전하다고 믿음** → 명령이 샌드박스 없이 실행됩니다
- 샌드박스를 켜면 **비밀 파일도 못 읽는다**고 생각함 → 읽기는 기본적으로 열려 있어 직접 막아야 합니다
- `denyRead`로 Read 도구까지 막힌다고 생각함 → Read 도구는 **권한 규칙**으로 막습니다
- 문제가 생기면 **일단 `excludedCommands`**에 추가 → 해당 명령은 보호가 전부 사라집니다
- `github.com` 같은 **넓은 도메인**을 허용 → 데이터 유출 경로가 될 수 있습니다

## 더 알아보기
- [공식 샌드박스 문서](https://code.claude.com/docs/ko/sandboxing)
- 허용·거부 규칙을 더 세밀하게 → [권한 규칙 심화](#/level3/permissions-deep)
- 기본 개념은 [권한 모드](#/level2/permissions)
