# VS Code 설치 & 세팅

> VS Code는 **코드 에디터와 터미널을 함께 쓰는 IDE(통합 개발 환경)** 입니다. 파일 목록을 보면서 같은 창 안에서 Claude Code를 실행합니다.
>
> 다른 IDE를 쓰고 싶다고요? **터미널을 지원하는 도구라면 문제없습니다.** (Cursor, Antigravity, IntelliJ 등) 이 레슨은 VS Code 기준입니다.

## 1. VS Code 설치 (Windows)
1. [code.visualstudio.com](https://code.visualstudio.com)에서 Windows용 설치 파일을 받습니다. 공식 문서는 관리자 권한이 필요 없는 **User setup**을 대부분의 사람에게 권장합니다.
2. 설치 파일을 실행합니다. 마법사는 **기본값으로 Next**를 누릅니다.
   - **Select Additional Tasks** 화면의 **Add to PATH**는 체크된 채로 둡니다.
3. 설치가 끝나면 PowerShell을 **새로 열고** 확인합니다.

   ```powershell
   code --version
   ```

## 2. 가입·로그인
**VS Code 설치와 사용에는 가입이 필요하지 않습니다.** 이 단계는 건너뛰세요.

> GitHub 계정과 Copilot은 VS Code 자체의 AI 기능용입니다. 이 키트는 Claude Code를 쓰므로 필요 없습니다. Claude Code 로그인은 [로그인과 첫 실행](#/level1/login-first-run)에서 한 대로 합니다.

## 3. 작업 폴더 열기
1. VS Code 메뉴에서 **File → Open Folder...**를 선택합니다
2. [프로젝트 폴더](#/level2/project-folder)에서 만든 폴더(예: `my-project`)를 고릅니다
3. 이 폴더를 믿을 수 있는지 묻는 안내가 나오면 내가 만든 폴더이므로 **Trust**를 선택합니다

## 4. 터미널 열기
- 메뉴에서 **View → Terminal**
- 또는 단축키 `` Ctrl+` `` (숫자 1 왼쪽의 백틱 키)

창 아래쪽에 터미널이 열립니다. 새 터미널이 더 필요하면 **Terminal → New Terminal**을 선택합니다.

## 5. Claude 실행
```powershell
pwd        # 열어 둔 폴더가 맞는지 확인
claude
```

처음이라면 브라우저 로그인 화면이 나옵니다. 이후는 [로그인과 첫 실행](#/level1/login-first-run)과 같습니다.

<details>
<summary>선택: Claude Code 확장 프로그램으로 쓰기</summary>

터미널 대신 편집기 화면에서 대화와 변경 비교를 보고 싶을 때 씁니다.

1. `Ctrl+Shift+X` (확장 보기)
2. **Claude Code**를 검색하고, 게시자가 **Anthropic**인지 확인한 뒤 **Install**
3. VS Code **1.94.0 이상**이 필요합니다
4. 편집기 우측 상단의 Claude 아이콘이나 명령 팔레트의 `Claude Code: Open in New Tab`으로 엽니다

| 기능 | 확장 | 터미널 |
|---|---|---|
| 대화·변경 비교 | ✔ | ✔ |
| 모든 슬래시 명령·스킬 | 일부 | **전체** |
| `!` 셸 단축 입력 | ✘ | ✔ |

외부 터미널에서 `claude`를 실행한 뒤 `/ide`를 입력하면 편집기와 연결됩니다.

</details>

## 확인 체크
- [ ] `code --version`에 버전이 나온다
- [ ] 폴더를 열고 **View → Terminal**로 터미널을 열었다
- [ ] 그 터미널에서 `claude`를 실행해 시작 화면을 봤다
- [ ] VS Code에서 <img class="vsicon" src="assets/img/icons/vscode-files.svg" alt="탐색기 아이콘">(탐색기)를 클릭해서 내 프로젝트 구조를 한눈에 볼 수 있다
- [ ] <img class="vsicon" src="assets/img/icons/vscode-search.svg" alt="검색 아이콘">(검색)을 클릭해서 내 프로젝트의 내용을 검색할 수 있다

## 자주 하는 실수
- **폴더를 열지 않고** 터미널을 엶 → 엉뚱한 위치에서 `claude`가 시작됩니다. 먼저 **Open Folder**, 그다음 `pwd`로 확인
- 설치 직후 **기존 터미널**에서 `code`를 찾음 → PowerShell을 새로 여세요
- 비슷한 이름의 다른 확장 설치 → **게시자(Anthropic)** 확인

<small>아이콘: [VS Code Codicons](https://github.com/microsoft/vscode-codicons) (CC BY 4.0)</small>
