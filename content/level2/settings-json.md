# 설정 파일 (settings.json)

> 권한, 환경 변수, 모델 같은 설정을 **파일에 저장**해 두면 매번 다시 지정하지 않아도 됩니다.

![설정 파일 우선순위](assets/img/settings-scopes.svg)

## 어느 파일을 고칠까
| 범위 | 위치 | 용도 |
|---|---|---|
| 사용자 | `%USERPROFILE%\.claude\settings.json` | 나의 모든 프로젝트 |
| 공유 프로젝트 | `.claude\settings.json` | 팀 공통 (git 커밋) |
| 프로젝트 로컬 | `.claude\settings.local.json` | 나만 (git 제외) |

**우선순위:** 관리형 > 명령줄 `--settings` > 프로젝트 로컬 > 공유 프로젝트 > 사용자.
`permissions.allow` 같은 **배열은 덮어쓰지 않고 합쳐집니다.**

## 예시
```json
{
  "permissions": {
    "allow": ["Bash(npm run lint)"],
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  },
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe"
  },
  "autoUpdatesChannel": "stable"
}
```

<details>
<summary>예시 읽는 법</summary>

| 항목 | 쉬운 설명 |
|---|---|
| `permissions` | Claude가 **무엇을 해도 되는지** 정하는 규칙 묶음 ([권한 모드](#/level2/permissions)) |
| `allow` | 물어보지 않고 **바로 실행**해도 되는 것 |
| `deny` | **아예 못 하게** 막는 것 |
| `"Bash(npm run lint)"` | `Bash`는 Claude가 터미널 명령을 실행하는 도구, 괄호 안은 그 명령입니다. 뜻은 "**`npm run lint`라는 명령은 물어보지 않고 실행해도 좋다**" |
| `"Read(./.env)"` | `Read`는 파일 읽기 도구입니다. 뜻은 "**`.env` 파일은 읽지 마라**". `.env`에는 비밀번호·키가 들어 있는 경우가 많습니다 |
| `"Read(./.env.*)"` | `*`는 "아무 글자나"라는 뜻이라 `.env.local`, `.env.production` 같은 파일도 막습니다 |
| `env` | **환경 변수**. 프로그램이 실행될 때 함께 전달되는 **이름=값 설정**입니다. 여기에 적으면 Claude Code를 켤 때마다 자동으로 적용됩니다 |
| `CLAUDE_CODE_GIT_BASH_PATH` | Windows에서 Claude Code가 쓰는 **Git Bash 프로그램의 위치**를 알려 주는 환경 변수입니다. 설치 위치가 기본과 다를 때만 필요하며, 보통은 쓰지 않아도 됩니다 |
| `autoUpdatesChannel` | 자동 업데이트를 어떤 속도로 받을지 정합니다. `"stable"`은 **조금 늦게, 더 검증된 버전**, `"latest"`는 최신 버전을 바로 받습니다 |

> `{ }`로 감싼 이름과 값의 묶음이 중첩된 구조입니다. 이 예시는 "`permissions` 안에 `allow`와 `deny`가 있다"로 읽으면 됩니다.

</details>

## 쉽게 바꾸는 방법
- **`/config`** — 테마, 에디터 모드, 상세 출력 같은 개인 옵션을 화면에서 변경 (모든 설정 키가 나오는 것은 아닙니다)
- **`/config verbose=true`** 처럼 직접 지정도 가능

## 적용됐는지 확인
`/status`의 **Setting sources** 줄에 읽어 들인 파일이 표시됩니다.

## 확인 체크
- [ ] 내 사용자 설정 파일 위치를 찾았다
- [ ] `/status`로 어떤 설정 파일이 적용됐는지 봤다

## 자주 하는 실수
- JSON에 **`//` 주석이나 마지막 쉼표** → 오류
- Windows 경로의 `\`는 JSON에서 **`\\`로 두 번** 써야 합니다
- `~/.claude.json`은 앱 상태 파일입니다. **직접 편집하지 마세요**
