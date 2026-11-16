# 막힐 때 FAQ

> 문제가 생기면 **증상 → 해결** 순서로 찾으세요. 대부분 3개 명령으로 풀립니다.

## 먼저 이 3개
```text
claude doctor    # 터미널에서: 설치·설정 진단 (세션 없이 실행)
/doctor          # 세션 안에서 진단 + 수정안 제안
/status          # 버전·모델·계정·적용된 설정 파일
```

## 증상별 해결
| 증상 | 원인 → 해결 |
|---|---|
| `'claude' is not recognized` | PATH 문제. **새 터미널**을 열고 `%USERPROFILE%\.local\bin`이 PATH에 있는지 확인 |
| `irm is not recognized` | CMD에서 PowerShell 명령을 실행함 → **PowerShell**에서 실행 |
| 로그인 오류 (OAuth·403) | `ANTHROPIC_API_KEY` 환경 변수가 남아 있는지 확인, `/status`로 인증 방식 확인 |
| 브라우저 로그인이 안 됨 | `claude auth login` |
| 업데이트 후 `claude`가 안 열림 | 오래된 Claude Desktop이 우선 실행될 수 있음 → Desktop 업데이트 |
| 대화가 느려지고 엉뚱한 답 | 컨텍스트가 가득 참 → `/context` 확인 후 `/clear` 또는 `/compact` |
| "session limit" 메시지 | 구독 한도 → 시간이 지나면 재설정, 또는 다른 모델로 `/model` 전환 |
| 한글이 `????`로 깨져서 전달됨 | Windows PowerShell 5.1에서 한글을 **파이프(`\|`)로 `claude`에 넘기면 깨질 수 있습니다**. 파이프 대신 `claude -p "meeting.txt 파일을 읽고 …"`처럼 **파일 이름을 알려 주세요** |
| 설정이 적용 안 됨 | JSON 문법(주석·쉼표) 확인, `/status`의 Setting sources 확인 |
| 이상한 동작 원인을 모르겠음 | `claude --safe-mode`로 플러그인·MCP·훅 끄고 비교 |

## 업데이트
```powershell
claude update
```
네이티브 설치는 백그라운드에서 **자동 업데이트**됩니다. 하단에 `Auto-update failed`가 뜨면 `claude doctor`를 실행하세요.

## 로그 위치
- 디버그 로그: `%USERPROFILE%\.claude\debug\` (`claude --debug`로 시작했을 때)
- 대화 기록: `%USERPROFILE%\.claude\projects\`

## 확인 체크
- [ ] `claude doctor`를 실행해 봤다
- [ ] 내 버전과 최신 문서가 맞는지 확인하는 방법을 안다

## 도움을 요청할 때
`/feedback` (별칭 `/bug`)로 문제를 보낼 수 있습니다. 대화 내용이 포함될 수 있으니 **개인정보·비밀 값이 없는지** 먼저 확인하세요.
