# 배포와 자동 업데이트 설정 가이드

이 문서는 사이트를 **GitHub Pages로 공개**하고, **공식 문서 변경을 자동 반영**하도록 설정하는 순서입니다. 처음 한 번만 하면 됩니다.

## 0. 먼저 확인할 것 (공개 범위)
- GitHub Pages는 무료 계정이면 **공개 저장소**여야 하고, 사이트 주소는 누구나 접속할 수 있습니다.
- 계정 이름과 저장소 이름은 사이트 주소에 그대로 들어갑니다. 공개해도 되는 이름인지 확인하세요.
- 커밋 기록에는 `user.name` / `user.email`이 남습니다. 공개할 이름·이메일만 설정하세요.
  ```powershell
  git config user.name "공개해도 되는 이름"
  git config user.email "공개해도 되는 이메일"
  ```
  (GitHub의 "Keep my email addresses private" 설정을 켜면 `숫자+아이디@users.noreply.github.com` 주소를 쓸 수 있습니다.)
- 저장소에는 **API 키와 개인정보가 없어야** 합니다. 올리기 전에 한 번 더 확인하세요.

## 1. 저장소 만들고 올리기
1. GitHub에서 **New repository** → 이름 입력 → **Public** → (README/gitignore 추가 체크 해제) → Create
2. 프로젝트 폴더에서
   ```powershell
   git init -b main
   git add .
   git status        # reference/, practice/ 가 목록에 없는지 확인
   git commit -m "Claude Code 학습 키트 첫 버전"
   git remote add origin https://github.com/<계정>/<저장소>.git
   git push -u origin main
   ```

## 2. GitHub Pages 켜기
1. 저장소 **Settings → Pages**
2. **Build and deployment → Source** 를 **GitHub Actions** 로 선택
3. **Actions** 탭에서 `Deploy to GitHub Pages` 실행이 성공하면 `https://<계정>.github.io/<저장소>/` 로 접속됩니다

## 3. 자동 업데이트 켜기
### 3-1. API 키 등록
1. [Claude Console](https://platform.claude.com)에서 API 키 발급 (구독과 **별도 과금**입니다)
2. Console에서 **월 사용 한도**를 설정
3. 저장소 **Settings → Secrets and variables → Actions → New repository secret**
   - 이름: `ANTHROPIC_API_KEY`
   - 값: 발급한 키
> 키는 **채팅·코드·문서에 붙여넣지 마세요.** 노출되면 바로 폐기하고 새로 발급하세요.

### 3-2. PR 생성 허용
**Settings → Actions → General → Workflow permissions** 에서
- **Read and write permissions** 선택
- **Allow GitHub Actions to create and approve pull requests** 체크

### 3-3. 시험 실행
**Actions → Docs sync → Run workflow**
- 문서 변경이 없으면 "변경 0건"으로 끝납니다 (정상)
- 변경이 있으면 Claude가 레슨을 고치고 `docs-sync/update` 브랜치로 **PR**이 열립니다

## 4. 평소 운영
| 상황 | 할 일 |
|---|---|
| 자동 PR이 열림 | 변경된 레슨을 **직접 읽고 검토** 후 머지 → 자동 배포 |
| `Detect doc changes` 실패 | 공식 문서 주소가 바뀌었을 수 있음 → `content/curriculum.json`의 `docsUrl` 수정 |
| 레슨 직접 추가·수정 | `main`에 푸시하면 자동 배포 |
| 새 문서를 감시 대상에 추가 | 레슨에 `docsUrl`을 넣고 `"watch": true`를 추가한 뒤 `node tools/docs-sync.mjs --init` 실행 후 커밋. **`"watch": true`인 레슨만 감시합니다** (비용과 검토량을 줄이기 위해 핵심 레슨만 지정: 설치·로그인·계정·권한·플랜 모드·설정·모델, 그리고 스크립트가 만드는 Commands·CLI 표) |

## 5. 비용·안전 장치
- 워크플로는 **30분 제한**, Claude는 **최대 30턴**, 허용 도구는 읽기·수정뿐입니다 (터미널 명령 없음)
- **자동 머지는 스크립트가 만드는 레퍼런스 표(Commands, CLI)에만 적용됩니다.** 사람이 쓴 레슨이 바뀌어야 하면 PR만 열리고 머지는 사람이 합니다
  - 자동 머지 조건: ① 바뀐 문서가 모두 스크립트 생성 페이지 ② 번역 누락·낡은 번역 키·파싱 실패·항목 20% 이상 급감이 없음(`--strict`) ③ `check-content` 통과 ④ PR이 `slash-commands.md`·`cli.md`·`.docs-hash.json`만 변경
  - 하나라도 어긋나면 PR이 열린 채로 남습니다. 새 명령이 생겨 번역이 없을 때가 대표적입니다. `tools/reference-ko/*.json`에 설명을 추가해 직접 머지하세요
  - 자동 머지를 끄려면 `docs-sync.yml`의 `Auto-merge` 단계를 지우면 됩니다
  - 저장소 설정: 브랜치 보호에서 "머지 전 리뷰 필수"를 켜 두면 자동 머지가 막힙니다. 이 기능을 쓰려면 꺼 두세요
- 문서 변경이 없는 주에는 Claude를 호출하지 않아 **API 비용이 0**입니다 (GitHub Actions 분만 소량 사용)
- 공개 저장소는 60일간 활동이 없으면 예약 실행이 멈출 수 있습니다. 멈추면 Actions에서 다시 활성화하세요

## 알아 둘 점 (확인되지 않은 부분)
- 구독(Pro/Max) 토큰(`CLAUDE_CODE_OAUTH_TOKEN`)으로 실행하는 방식은 공식 지원되지만, **자동화에 써도 되는지 약관 조항은 확인하지 못했습니다.** 그래서 이 가이드는 API 키 방식을 기준으로 합니다
- PR 생성에는 서드파티 액션(`peter-evans/create-pull-request`)을 씁니다. Claude 공식 문서에서 권장한다고 확인된 방식은 아닙니다
- 이 워크플로는 실제 GitHub에서 아직 실행해 보지 않았습니다. 3-3의 시험 실행으로 먼저 확인하세요
