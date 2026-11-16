# 브랜치와 worktree

> **브랜치**는 평행 세계, **worktree**는 그 평행 세계를 **별도 폴더**로 펼친 것입니다. 여러 작업을 동시에 맡길 때 씁니다.

## 실제 실행 화면
![브랜치와 worktree](assets/img/shots/git-branch.png)

`git worktree list`에 **폴더 2개 = 브랜치 2개**가 나란히 보입니다.

## 브랜치
```powershell
git switch -c feature-login   # 새 브랜치를 만들고 이동
git branch                    # 목록 (* 가 현재)
git switch main               # 돌아가기
```
- 새 기능은 **브랜치에서** 작업하고, 마음에 들면 합칩니다
- 망쳐도 `main`은 안전합니다

## worktree — Claude 두 개를 동시에
```powershell
claude --worktree feature-auth
```
- 격리된 작업 폴더가 만들어지고 그 안에서 Claude Code가 시작됩니다
- **다른 터미널에서 다른 이름**으로 또 실행하면 두 작업이 서로 간섭하지 않습니다
- 저장소에 **커밋이 최소 1개** 있어야 합니다
- `.gitignore`에 있는 파일(예: 설정)을 새 worktree에도 복사하려면 `.worktreeinclude` 파일을 사용

## 언제 쓰나
| 상황 | 방법 |
|---|---|
| 새 기능을 안전하게 실험 | 브랜치 |
| 기능 A와 B를 **동시에** 맡기기 | worktree 2개 |
| 서브에이전트를 격리해 실행 | 에이전트 설정 `isolation: worktree` |

## 확인 체크
- [ ] 브랜치를 만들고 이동해 봤다
- [ ] `git worktree list`를 실행해 봤다

## 자주 하는 실수
- 커밋이 없는 저장소에서 `--worktree` → 오류. 먼저 첫 커밋을 만드세요
- worktree를 **폴더째 삭제** → `git worktree remove`로 정리해야 목록이 깨끗합니다
