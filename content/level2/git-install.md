# git 설치

> 파일 변경 이력을 기록하는 도구. Claude Code가 고친 내용을 **되돌리고 비교**할 때 필요합니다.

![git 흐름](assets/img/git-flow.svg)

## 설치 (Windows)
1. [git-scm.com/download/win](https://git-scm.com/download/win) 에서 설치 파일 받기
2. 마법사는 **기본값으로 Next**
3. PowerShell을 **새로 열고** 확인

   ```powershell
   git -v
   ```

4. [GitHub](https://github.com)에서 오른쪽 위 **Sign up**으로 계정 만들기
5. git에 이름과 이메일 등록 (**필수**, 처음 한 번만)

   ```powershell
   git config --global user.name "본인 이름"
   git config --global user.email "본인 이메일"
   ```

> 이메일은 4번에서 GitHub에 가입할 때 쓴 주소와 같게 하면 나중에 편합니다.

## 확인 체크
- [ ] `git -v`에 버전이 나온다
- [ ] GitHub 계정을 만들었다
- [ ] 이름·이메일을 설정했다

## 자주 하는 실수
- 설치 후 터미널을 **다시 열지 않음** → `git`을 못 찾습니다
