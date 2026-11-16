# Windows에 설치하기

> **PowerShell(터미널)에 명령 한 줄**이면 끝. 관리자 권한은 필요 없습니다.

## 설치 (권장: 네이티브)
1. 시작 메뉴 → **PowerShell** 실행 (Windows PowerShell 일반 창)
2. 아래 한 줄을 **끝까지** 복사해서 붙여넣고 Enter

```powershell
irm https://claude.ai/install.ps1 | iex
```

> CMD(명령 프롬프트)를 쓴다면 명령이 다릅니다. PowerShell 명령을 CMD에 넣으면 오류가 납니다.

> Claude 다운로드 명령어는 자주 바뀝니다. [Claude Code 공식 문서](https://code.claude.com/docs/en/overview)의 **Windows PowerShell** 명령어를 참고하세요.

## 설치 확인
**터미널을 새로 열고** 아래를 입력하세요.

```powershell
claude -v
```

![설치 확인 결과](assets/img/shots/install-check.png)

버전이 나오면 성공입니다.

<details>
<summary>다른 설치 방법</summary>

| 방법 | 명령 | 참고 |
|---|---|---|
| 네이티브 (권장) | `irm https://claude.ai/install.ps1 \| iex` | 자동 업데이트 |
| WinGet | `winget install Anthropic.ClaudeCode` | 수동 업그레이드 필요 |
| npm | `npm install -g @anthropic-ai/claude-code` | Node.js 22 이상 필요 |

</details>

<details>
<summary>정상 설치가 안 되었을 때</summary>

**새 터미널**에서 `claude -v`를 입력했을 때 `'claude' is not recognized`가 나오면, 설치된 폴더가 **PATH**(터미널이 명령을 찾는 폴더 목록)에 없는 것입니다. 아래 순서로 확인하세요.

1. 설치 파일이 있는지 확인합니다. `True`가 나오면 설치는 된 것입니다.

   ```powershell
   Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
   ```

2. 그 폴더를 PATH에 추가합니다. (PowerShell, 한 번만)

   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
   [Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')
   ```

3. 터미널을 **완전히 닫고 새로 열어** `claude -v`를 다시 입력합니다.

- VS Code 같은 편집기 안의 터미널을 쓴다면 편집기도 **완전히 종료한 뒤 다시 실행**하세요.
- CMD에서는 위 명령이 없습니다. 시스템 설정의 **환경 변수**에서 사용자 PATH에 `%USERPROFILE%\.local\bin`을 추가하세요.
- 그래도 안 되면 `where.exe claude`로 어떤 파일이 실행되는지 확인하고, `claude doctor`로 진단해 보세요.

</details>

## 시스템 요구사항
- Windows 10 (1809 이상) 또는 Windows Server 2019 이상, RAM 4GB 이상
- 64비트(x64) 또는 ARM64 (32비트 Windows 미지원)

## 확인 체크
- [ ] `claude -v`에 버전이 출력된다

## 자주 하는 실수
- 명령을 일부만 복사 → 스크립트 텍스트만 출력되고 설치가 안 됩니다
- 진단이 필요하면 `claude doctor`
