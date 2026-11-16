# 로그인과 첫 실행

> 프로젝트 폴더에서 `claude`를 입력하면 **처음 한 번 로그인**을 요구합니다.

![로그인 흐름](assets/img/login-flow.svg)

## 따라하기
```powershell
cd ~
mkdir test-project
cd test-project
claude
```

![폴더 만들고 claude 실행](assets/img/shots/first-run-folder.png)

> `claude`는 **실행한 폴더의 파일을 읽고 고칩니다.** 연습은 새 폴더에서 하세요.

1. 브라우저가 열리면 계정으로 로그인
2. 터미널에 `Login successful`이 보이면 완료
3. 보안 안내(Security guide) 선택 화면이 나오면 **Yes, I trust this folder**를 선택합니다
4. 세션 시작 화면에 **버전, 현재 모델, 작업 폴더**가 표시됩니다

![Claude Code 시작 화면](assets/img/shots/claude-start.png)

이런 화면이 보이면 잘 따라온 것입니다. (버전·모델·폴더 이름은 사람마다 다릅니다)

<details>
<summary>로그인이 막힐 때</summary>

| 증상 | 해결 |
|---|---|
| 브라우저가 안 열림 | 터미널 안내대로 `c` 키로 주소를 복사해 직접 열기 |
| 붙여넣기가 안 됨 | `claude auth login` |
| 계정을 바꾸고 싶음 | 세션 안에서 `/login`, 로그아웃은 `/logout` |
| 인증 오류(403 등) | 환경 변수 `ANTHROPIC_API_KEY`가 남아 있는지 확인 |

</details>

## 확인 체크
- [ ] `Login successful`을 봤다
- [ ] 세션 시작 화면에 작업 폴더가 표시된다

## 자주 하는 실수
- **엉뚱한 폴더**에서 실행 → 시작 화면의 작업 폴더를 꼭 확인
- 무료 계정으로 로그인 → Claude Code 사용 불가 ([요금·계정](#/level1/plans-accounts) 참고)
