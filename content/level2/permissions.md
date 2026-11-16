# 권한 모드와 /permissions

> Claude가 **어디까지 마음대로 해도 되는지** 정하는 안전장치입니다.

![권한 모드](assets/img/permission-modes.svg)

## 모드 바꾸기
- 실행 중 **`Shift+Tab`** → 화면 아래 줄에 현재 모드가 표시됩니다
- 시작할 때: `claude --permission-mode plan`
- 순환 순서: default → acceptEdits → plan → …

> **버전 주의:** 최신 버전(2.1.283 이상)에서는 대화형 터미널의 시작 모드가 `auto`입니다. `claude -p`는 default입니다. 내 버전은 `claude -v`로 확인하세요. `auto`에서 `Shift+Tab`을 **한 번** 누르면 매번 확인하는 `default`로 바뀝니다.

## 언제 어떤 모드?
| 상황 | 추천 |
|---|---|
| 처음 쓰거나 중요한 폴더 | **default** (매번 확인) |
| 글·문서를 많이 고칠 때 | **acceptEdits** |
| 큰 변경 전에 계획부터 | **plan** |
| 반복되는 안전한 작업 | **allow 규칙**으로 허용 |

## 규칙으로 세밀하게: /permissions
`/permissions`에서 허용(allow)·확인(ask)·거부(deny) 규칙을 관리합니다. **deny → ask → allow 순서**로 평가되고 첫 일치가 적용됩니다.

```json
{
  "permissions": {
    "allow": ["Bash(npm run lint)"],
    "ask":   ["Bash(git push *)"],
    "deny":  ["Read(./.env)", "Read(./secrets/**)"]
  }
}
```

> **`Bash(...)`가 뭔가요?** Claude가 **터미널 명령을 대신 실행**하는 도구의 이름입니다. 괄호 안이 실행할 명령이고, 명령을 실행하기 전에 확인 화면에도 `Bash(명령)`으로 표시됩니다. 위 규칙은 "이 명령은 허락/확인/금지"라는 뜻입니다. (Windows에서는 `PowerShell(...)`로 보이기도 하며 같은 뜻입니다.)

| 규칙 | 의미 |
|---|---|
| `Bash(npm run build)` | 정확히 이 명령 |
| `Bash(npm run *)` | `npm run`으로 시작하는 명령 |
| `Read(./.env)` | `.env` 읽기 |
| `WebFetch(domain:example.com)` | 해당 도메인 접근 |

<details>
<summary>이 JSON은 어디에 쓰나요?</summary>

위 JSON은 **`settings.json`이라는 설정 파일의 내용**입니다. 파일을 만들어 붙여 넣으면 규칙이 적용됩니다. 파일은 세 곳 중 하나에 둡니다.

| 위치 | 적용 범위 | 이럴 때 |
|---|---|---|
| `.claude\settings.local.json` (프로젝트 폴더 안) | 이 프로젝트, **나만** (git 제외) | **처음 해 볼 때 추천** |
| `.claude\settings.json` (프로젝트 폴더 안) | 이 프로젝트, 팀 공유 (git 커밋) | 팀 규칙으로 쓸 때 |
| `%USERPROFILE%\.claude\settings.json` | 내 모든 프로젝트 | 어디서나 `.env`를 막고 싶을 때 |

**따라 하기**
1. 프로젝트 폴더를 엽니다 (예: `my-project`)
2. 그 안에 `.claude` 폴더를 만들고, `settings.local.json` 파일을 만듭니다. 직접 만들기 어렵다면 Claude에게 시켜도 됩니다.
   ```text
   .claude\settings.local.json 파일을 만들고, .env 파일 읽기를 deny 규칙으로 막아 줘
   ```
3. 파일에 JSON을 붙여 넣고 저장합니다
4. `claude`를 새로 시작한 뒤 `/permissions`를 열어 규칙이 보이는지 확인합니다
5. `/status`의 **Setting sources** 줄에 그 파일이 보이면 읽힌 것입니다

**세 줄의 의미**
| 항목 | 의미 | 예시 |
|---|---|---|
| `allow` | 물어보지 않고 **바로 실행** | `npm run lint` |
| `ask` | **매번 물어봄** | `git push` |
| `deny` | **아예 금지** (가장 우선) | `.env`, `secrets` 폴더 읽기 |

**주의**
- 이미 파일이 있다면 **통째로 덮어쓰지 마세요.** 기존 내용 안에 `"permissions": { ... }` 부분만 합칩니다. `allow` 같은 배열은 여러 파일의 내용이 합쳐집니다.
- JSON에는 **주석(`//`)과 마지막 쉼표**를 쓸 수 없습니다.
- 설정 파일 전반은 [설정 파일 (settings.json)](#/level2/settings-json)에서 배웁니다.

</details>

## 위험한 옵션
**`--dangerously-skip-permissions`** (= `bypassPermissions`)는 모든 확인을 건너뜁니다. 공식 문서는 **인터넷이 차단된 컨테이너·VM 같은 격리 환경에서만** 쓰라고 경고합니다. 일반 PC에서는 사용하지 마세요.

## 확인 체크
- [ ] `Shift+Tab`으로 모드를 바꿔 봤다
- [ ] `/permissions`를 열어 규칙을 확인했다
- [ ] `.env` 같은 **비밀 파일은 deny**에 넣어야 한다는 것을 안다

## 자주 하는 실수
- 귀찮아서 **전부 허용** → 비밀·개인정보 파일이 있는 폴더에서는 특히 위험
- JSON에 **주석(`//`)이나 마지막 쉼표** → 설정 오류가 납니다
