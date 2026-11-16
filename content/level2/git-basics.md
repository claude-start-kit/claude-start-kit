# git 기초

> **작업 폴더 → 스테이징 → 저장소.** 이 한 줄의 흐름만 이해하면 됩니다.

![git 흐름](assets/img/git-flow.svg)

## 실제 실행해 보기
![git 기초 실행 결과](assets/img/shots/git-basic.png)

직접 따라 해 보세요.

```powershell
cd ~
mkdir git-demo; cd git-demo
git init -b main
Set-Content notes.md "첫 메모"
git add notes.md
git commit -m "첫 번째 저장"
git log --oneline
```

## 꼭 알아야 할 명령 6개
| 명령 | 의미 |
|---|---|
| `git status` | 지금 무엇이 바뀌었는지 |
| `git add 파일` | 저장할 변경을 골라 담기 |
| `git commit -m "메시지"` | 저장(기록 남기기) |
| `git log --oneline` | 저장 이력 보기 |
| `git diff` | 아직 담지 않은 변경 내용 비교 |
| `git restore 파일` | 저장하지 않은 변경 버리기 |

## 커밋 메시지 요령
- **무엇을 했는지** 한 줄로: "로그인 오류 수정"
- "수정", "작업" 같은 모호한 말은 피하기

## 확인 체크
- [ ] 폴더에서 `git init`을 했다
- [ ] 커밋을 만들고 `git log`로 확인했다

## 자주 하는 실수
- `commit`만 하고 `add`를 빼먹음 → 변경이 저장되지 않습니다
- `git restore`는 **되돌릴 수 없습니다** (저장하지 않은 변경이 사라짐)
- `user.name`·`user.email`을 설정하지 않아 오류 → [git 설치](#/level2/git-install) 참고
