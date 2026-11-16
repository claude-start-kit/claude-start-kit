# PowerShell 명령

> Windows에서 Claude Code를 쓰면 터미널(PowerShell)에서 **파일·폴더를 다루는 명령**을 알아야 할 때가 많습니다. 자주 쓰는 명령만 골라 정리했습니다. 위 검색창에 명령이나 하고 싶은 일(예: `복사`, `찾기`, `환경 변수`)을 입력하세요. 다른 터미널(cmd, bash)에서 오셨다면 아래 **대응표**부터 보세요.

## 읽는 법
- PowerShell 명령은 **`동사-명사`** 모양입니다 (`Get-ChildItem`, `Remove-Item`). 대소문자는 구분하지 않습니다
- **별칭**은 짧게 쓰는 이름입니다. `ls`, `cd`, `cat`처럼 익숙한 이름이 대부분 별칭으로 들어 있습니다
- ⚠ 표시는 **파일을 지우거나 덮어쓰는 위험한 명령**입니다
- 이 표의 명령과 별칭은 이 프로젝트를 만든 PC의 **Windows PowerShell 5.1**에서 실제로 있는지 확인했습니다. PowerShell 7은 일부 동작이 다릅니다
- 모르는 명령은 `Get-Help <명령>`으로 설명을 볼 수 있고, 공식 문서는 [learn.microsoft.com/powershell](https://learn.microsoft.com/powershell/)에 있습니다

## 위치·폴더·파일 (11)
| 명령 | 설명 | 별칭·비고 |
| :- | :- | :- |
| `Get-Location` | 현재 폴더 위치 보기 | 별칭 `pwd` |
| `Set-Location <경로>` | 폴더 이동 | 별칭 `cd`. `cd ..`는 한 단계 위로 |
| `Get-ChildItem` | 현재 폴더의 파일·폴더 목록 | 별칭 `ls`, `dir`. 숨김 파일까지는 `-Force`, 하위 폴더까지는 `-Recurse` |
| `New-Item -ItemType Directory <이름>` | 새 폴더 만들기 | `mkdir <이름>`(함수)도 같은 역할 |
| `New-Item -ItemType File <이름>` | 빈 파일 만들기 | ⚠ 이미 있는 파일에 `-Force`를 붙이면 내용이 지워짐 |
| `Copy-Item <원본> <대상>` | 파일·폴더 복사 | 별칭 `cp`, `copy`. 폴더는 `-Recurse` |
| `Move-Item <원본> <대상>` | 이동 (이름 바꾸기도 가능) | 별칭 `mv`, `move` |
| `Rename-Item <이전> <새이름>` | 이름 바꾸기 | 별칭 `ren` |
| `Remove-Item <경로>` | 파일·폴더 삭제 | ⚠ 별칭 `rm`, `del`. **휴지통을 거치지 않음**. 폴더와 그 안은 `-Recurse -Force` |
| `Test-Path <경로>` | 그 경로가 있는지 확인 (`True`/`False`) | |
| `Resolve-Path <경로>` | 상대 경로를 전체 경로로 바꾸기 | 별칭 `rvpa` |

## 파일 내용 읽기·쓰기 (6)
| 명령 | 설명 | 별칭·비고 |
| :- | :- | :- |
| `Get-Content <파일>` | 파일 내용 출력 | 별칭 `cat`, `type`, `gc`. 앞 5줄은 `-TotalCount 5`, 뒤 5줄은 `-Tail 5` |
| `Set-Content <파일> <내용>` | 파일에 내용을 쓰기 | ⚠ 기존 내용을 덮어씀. 5.1에서는 `-Encoding utf8`을 직접 지정 권장 |
| `Add-Content <파일> <내용>` | 파일 끝에 내용 덧붙이기 | |
| `Out-File <파일>` | 출력을 파일로 저장 | 리디렉션 `>`(덮어쓰기), `>>`(덧붙이기)도 비슷한 역할 |
| `Select-String <패턴> <파일>` | 파일에서 **글자 찾기** (grep과 비슷) | 하위 폴더는 `Get-ChildItem -Recurse`와 함께 사용 |
| `Get-ChildItem -Recurse -Filter *.md` | 하위 폴더까지 `.md` 파일 찾기 | 파일 이름 검색 |

## 결과 다듬기 (파이프 `|`) (8)
| 명령 | 설명 | 별칭·비고 |
| :- | :- | :- |
| `Where-Object { $_.Length -gt 1MB }` | 조건에 맞는 것만 남기기 | 별칭 `where`, `?` |
| `Select-Object -First 5` | 앞의 5개만 | 별칭 `select`. `-Last 5`는 뒤의 5개 |
| `Sort-Object <속성>` | 정렬 | 별칭 `sort`. 내림차순은 `-Descending` |
| `Measure-Object` | 개수·합계 세기 | 별칭 `measure`. 줄 수는 `-Line` |
| `ForEach-Object { ... }` | 항목마다 같은 작업 반복 | 별칭 `foreach`, `%` |
| `Format-Table` | 표 모양으로 출력 | 별칭 `ft` |
| `Format-List` | 항목마다 세로로 출력 | 별칭 `fl` |
| `Out-String` | 출력을 하나의 문자열로 | |

## 도움말·정보 (6)
| 명령 | 설명 | 별칭·비고 |
| :- | :- | :- |
| `Get-Help <명령>` | 명령 설명 보기 | 별칭 `man`, `help`. 예시는 `-Examples` |
| `Get-Command <이름>` | 그 명령이 **어디에 있는지**(설치 확인) | `which`와 같은 용도. 예: `Get-Command claude` |
| `Get-Member` | 결과 객체가 가진 속성·메서드 보기 | 별칭 `gm` |
| `Get-History` | 입력했던 명령 기록 | 별칭 `h`, `history` |
| `Clear-Host` | 화면 지우기 | 별칭 `cls`, `clear` |
| `$PSVersionTable.PSVersion` | PowerShell 버전 확인 | |

## 환경 변수·프로세스·실행 정책 (10)
| 명령 | 설명 | 별칭·비고 |
| :- | :- | :- |
| `$env:PATH` | 환경 변수 `PATH` 값 보기 | `$env:이름`으로 어떤 변수든 읽음 |
| `$env:NAME = "값"` | 환경 변수 설정 | **현재 PowerShell 창에서만** 유효 |
| `Get-ChildItem Env:` | 모든 환경 변수 목록 | 이름 일부로 거르기: `Get-ChildItem Env:ANTHROPIC*` |
| `[Environment]::SetEnvironmentVariable('NAME', '값', 'User')` | 환경 변수를 **영구 저장** (사용자 범위) | 새 터미널을 열어야 반영 |
| `Get-Process` | 실행 중인 프로세스 목록 | 별칭 `ps`, `gps` |
| `Stop-Process -Name <이름>` | 프로세스 종료 | ⚠ 별칭 `kill`, `spps` |
| `Start-Process <프로그램>` | 프로그램 실행 | 별칭 `start`, `saps` |
| `Get-Service` | Windows 서비스 목록 | 별칭 `gsv` |
| `Get-ExecutionPolicy` | 스크립트 실행 정책 보기 | `.ps1` 실행이 막혔을 때 확인 |
| `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` | 내 계정에서 로컬 스크립트 실행 허용 | `running scripts is disabled` 오류의 공식 해결책 중 하나 |

## 웹·데이터 (6)
| 명령 | 설명 | 별칭·비고 |
| :- | :- | :- |
| `Invoke-WebRequest <주소>` | 웹 페이지를 받아 오기 | **5.1에서는 `curl`, `wget`이 이 명령의 별칭**입니다. 진짜 curl은 `curl.exe` |
| `Invoke-RestMethod <주소>` | API 응답(JSON 등)을 받아 오기 | 별칭 `irm`. 설치 명령 `irm ... \| iex`의 `irm`이 이것 |
| `Invoke-Expression` | 문자열을 명령으로 실행 | 별칭 `iex`. ⚠ **내용을 모르는 글을 실행하지 마세요** |
| `Test-NetConnection <주소> -Port 443` | 그 주소·포트로 연결되는지 확인 | 네트워크 문제 확인용 |
| `ConvertFrom-Json` | JSON 글자를 객체로 | |
| `ConvertTo-Json` | 객체를 JSON 글자로 | 깊은 구조는 `-Depth` 지정 |

## cmd·bash 사용자를 위한 대응표 (19)
| 하고 싶은 일 | cmd | bash | PowerShell |
| :- | :- | :- | :- |
| 현재 위치 | `cd` | `pwd` | `Get-Location` (`pwd`) |
| 목록 | `dir` | `ls` | `Get-ChildItem` (`ls`, `dir`) |
| 내용 보기 | `type` | `cat` | `Get-Content` (`cat`, `type`) |
| 복사 | `copy` | `cp` | `Copy-Item` (`cp`, `copy`) |
| 이동 | `move` | `mv` | `Move-Item` (`mv`, `move`) |
| 삭제 | `del` | `rm` | `Remove-Item` (`rm`, `del`) |
| 폴더 만들기 | `mkdir` | `mkdir` | `New-Item -ItemType Directory` (`mkdir`) |
| 화면 지우기 | `cls` | `clear` | `Clear-Host` (`cls`, `clear`) |
| 글자 찾기 | `findstr` | `grep` | `Select-String` |
| 프로그램 위치 | `where` | `which` | `Get-Command` |
| 환경 변수 읽기 | `%PATH%` | `$PATH` | `$env:PATH` |
| 환경 변수 설정 | `set NAME=값` | `export NAME=값` | `$env:NAME = "값"` |
| 앞 5줄 | | `head -n 5 파일` | `Get-Content 파일 -TotalCount 5` |
| 뒤 5줄 | | `tail -n 5 파일` | `Get-Content 파일 -Tail 5` |
| 줄 수 세기 | | `wc -l 파일` | `(Get-Content 파일 \| Measure-Object -Line).Lines` |
| 폴더째 삭제 | `rmdir /s /q 폴더` | `rm -rf 폴더` | `Remove-Item -Recurse -Force 폴더` (⚠) |
| 프로세스 목록 | `tasklist` | `ps` | `Get-Process` (`ps`) |
| 프로세스 종료 | `taskkill /IM 이름.exe` | `kill` | `Stop-Process -Name 이름` |
| 명령 이어 쓰기 | `A && B` | `A && B` | **5.1은 `A; B`** (`&&`는 PowerShell 7 이상) |

## Claude Code와 함께 쓸 때 주의 (5)
| 증상·상황 | 설명 | 비고 |
| :- | :- | :- |
| `curl`이 이상하게 동작한다 | Windows PowerShell 5.1에서 `curl`은 `Invoke-WebRequest`의 별칭이라 `-fsSL` 같은 옵션이 먹지 않습니다. 진짜 curl은 **`curl.exe`** 로 실행하세요 | 설치 문제 해결 공식 문서에도 같은 안내 |
| `A && B`가 오류 (`The token '&&' is not a valid statement separator`) | Windows PowerShell 5.1은 `&&`를 지원하지 않습니다. `A; B`로 이어 쓰거나 PowerShell 7 이상을 사용 | |
| 한글을 파이프(`\|`)로 넘기면 글자가 `????`로 깨진다 | 이 프로젝트를 만든 PC(Windows PowerShell 5.1)에서 직접 확인한 현상입니다. 한글 문장을 파이프로 넘기지 말고 **파일 이름을 지정**하는 방식(`claude -p "meeting.txt 파일을 읽고 …"`)을 쓰세요 | 환경에 따라 다를 수 있음 |
| `running scripts is disabled on this system` | 실행 정책이 `.ps1`을 막은 것입니다. `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` | [오류 메시지 사전](#/ref/errors) |
| 환경 변수를 `$env:NAME = "값"`으로 정했는데 새 창에서 사라진다 | 이 방식은 **현재 창에서만** 유효합니다. 영구 저장은 `[Environment]::SetEnvironmentVariable(...)` | |

---

**출처:** [Microsoft PowerShell 문서](https://learn.microsoft.com/powershell/) · 2026-11-14에 Windows PowerShell 5.1에서 명령과 별칭의 존재를 확인하며 정리했습니다. 이 표는 **자주 쓰는 명령을 고른 것**이라 PowerShell 전체를 다루지 않습니다. 설명은 한국어로 옮긴 것이며, 다른 점이 있으면 공식 문서를 기준으로 하세요.
