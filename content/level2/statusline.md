# 상태 표시줄 (/statusline)

> 화면 아래에 **모델, 폴더, 컨텍스트 사용률, 비용**을 항상 보여 줍니다. 한눈에 상태를 파악하세요.

![상태 표시줄 예시](assets/img/statusline-mock.svg)

## 가장 쉬운 설정
```text
/statusline 모델 이름, 현재 폴더, git 브랜치, 컨텍스트 사용률을 보여 줘
```
Claude가 스크립트를 만들고 설정까지 바꿔 줍니다. 인자 없이 `/statusline`만 입력하면 셸 프롬프트를 기준으로 자동 구성합니다.

## 표시할 수 있는 정보
모델 · 작업 폴더 · git 저장소 · **컨텍스트 사용률** · 세션 비용 · 세션 시간 · 변경한 줄 수 · 속도 제한 · 노력도 · worktree 등

## 끄기
```text
/statusline delete
```

## 직접 설정하기 (Windows)
`settings.json`에 아래처럼 씁니다.
```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -File C:/Users/me/.claude/statusline.ps1"
  }
}
```
- `me`는 **내 사용자 이름**으로 바꾸세요
- **경로는 `/`(슬래시)** 로 쓰세요. 백슬래시는 Git Bash에서 오류가 납니다

## 확인 체크
- [ ] `/statusline`으로 상태 표시줄을 만들었다
- [ ] 컨텍스트 사용률이 보인다

## 자주 하는 실수
- 폴더 **신뢰(trust)를 수락하기 전**에는 비어 있습니다
- 안 보이면 `claude --debug`로 스크립트 오류를 확인
