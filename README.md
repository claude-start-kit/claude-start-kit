# Claude Code 학습 키트

링크 하나로 배우는 **Claude Code** 입문~고급 가이드 (Windows 기준).
모든 내용은 [Claude Code 공식 문서](https://code.claude.com/docs)를 근거로 하며, 이미지는 도식(SVG)과 **실제 실행 결과**로 구성했습니다.

> 코드 한 줄 몰라도 Claude Code로 이런 사이트를 만들 수 있다는 사례이기도 합니다.

## 바로 사용하기
배포된 주소로 접속하면 끝입니다. 설치할 것이 없습니다.

| 단계 | 내용 |
|---|---|
| 1단계 | 설치 · 로그인 · 첫 요청 (약 20분) |
| 2단계 | 터미널, 잘 시키기, 권한·플랜 모드, CLAUDE.md, git, MCP, 서브에이전트 (레슨 28개) |
| 3단계 | 심화 과정: 훅·헤드리스·예약 작업·GitHub Actions, 스킬·플러그인·서브에이전트·에이전트 팀, 샌드박스·권한·관리형 설정·환경 변수, Agent SDK·출력 스타일·모델 설정 (레슨 15개) |
| 스펙 레퍼런스 | 이미 써 본 분을 위한 찾아보기용 표. Commands · CLI reference · 오류 메시지 · Git · PowerShell · MCP · 서브에이전트(검색 가능) |

## 내 PC에서 실행해 보기
Node.js가 있으면 됩니다.
```powershell
node tools/serve.mjs
```
브라우저에서 `http://localhost:8080` 을 엽니다.
> `index.html`을 더블클릭하면 레슨이 로드되지 않습니다. 꼭 위 명령으로 실행하세요.

## 구조
```
index.html            화면 틀 (소개, 단계 선택, 3분할 학습 화면)
assets/               스타일, 스크립트, 도식(SVG), 실행 캡처(PNG)
content/curriculum.json   목차 (레슨 추가 = 여기에 한 줄 + .md 파일)
content/level1~3/*.md     레슨 본문 (마크다운)
content/reference/*.md    스펙 레퍼런스 (스크립트로 자동 생성, 직접 수정 금지)
tools/                점검·이미지 생성·문서 변경 감지 도구
.github/workflows/    배포와 자동 업데이트
```

## 스펙 레퍼런스 다시 만들기
공식 문서의 슬래시 명령·CLI 명령/플래그 표를 받아 한국어 표로 생성합니다.
```powershell
node tools/build-reference.mjs        # 슬래시 명령 → content/reference/slash-commands.md
node tools/build-cli-reference.mjs    # CLI 명령·플래그 → content/reference/cli.md
```
- 한국어 설명은 `tools/reference-ko/slash-commands.json`, `tools/reference-ko/cli-reference.json`에 있습니다. 새 항목이 생기면 경고가 나오니 여기에 설명을 추가하세요
- 오류 메시지 사전, Git, PowerShell, MCP, 서브에이전트 페이지(`content/reference/errors.md` 등)는 스크립트가 아니라 **직접 정리한 표**입니다. 공식 문서가 바뀌면 `docs-sync`가 알려 주고, 해당 페이지를 검토해 고칩니다
- 생성된 `content/reference/*.md`는 직접 고치지 마세요

## 준비 중인 레슨을 공개하기
`content/curriculum.json`에서 해당 레슨의 `"soon": true`와 `summary`를 지우고, `file`(`content/level3/….md`), `minutes`, `prompt`를 추가한 뒤 `node tools/check-content.mjs`로 점검합니다.

## 레슨 추가하기
1. `content/level2/새레슨.md` 작성
2. `content/curriculum.json`에 `id`, `title`, `file`, `minutes`, `docsUrl`, `prompt` 한 줄 추가
3. `node tools/check-content.mjs` 로 이미지·링크 점검

## 실행 결과 이미지 만들기
```powershell
node tools/make-shots.mjs            # tools/shots.json 의 모든 항목
node tools/make-shots.mjs git-basic  # 하나만
```
명령을 **실제로 실행**해 터미널 모양 PNG로 저장합니다. 개인 경로는 `C:\Users\me\...`로 치환됩니다.
> `claude -p` 항목은 실행할 때마다 Claude 사용량이 소모됩니다.

## 공식 문서가 바뀌면 (자동 업데이트)
매주 [`docs-sync`](.github/workflows/docs-sync.yml) 워크플로가 공식 문서를 확인합니다.
1. `tools/docs-sync.mjs` 가 각 레슨의 `docsUrl` 문서를 받아 이전 기준선(`content/.docs-hash.json`)과 비교
2. 바뀐 문서와 연결된 레슨만 골라 Claude Code가 수정
3. **Pull Request로 올립니다.** 사람이 검토하고 머지하면 자동 배포됩니다

자세한 설정은 [docs/SETUP.md](docs/SETUP.md) 참고.

## 주의
- 이 키트에는 **API 키와 개인정보가 없습니다.** 저장소에도 올리지 마세요
- 가격·한도 수치는 자주 바뀌므로 레슨에서 직접 다루지 않고 공식 페이지로 안내합니다
- Mac 버전은 추후 추가 예정
