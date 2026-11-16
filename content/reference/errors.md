# 오류 메시지 사전

> 화면에 뜬 **오류 메시지를 검색**해서 뜻과 해결 방법을 찾는 표입니다. 위 검색창에 메시지의 일부(예: `429`, `not recognized`, `/login`)를 입력하세요. Windows에서 자주 만나는 오류를 공식 문서에서 골라 한국어로 정리했습니다.

## 읽는 법
- 메시지는 **영어 원문 그대로** 적었습니다. 화면에 보이는 문장과 비교하세요 (`<name>`, `...` 부분은 상황마다 달라집니다)
- **해결 방법은 위에서부터 차례로** 시도하세요
- 여기에 없는 메시지는 공식 문서 [Error reference](https://code.claude.com/docs/en/errors)의 "Find your error" 표(메시지 약 470개)에서 찾을 수 있습니다
- 막힐 때 가장 먼저 해 볼 것: `claude doctor`(설치·설정 점검), `/status`(어떤 인증을 쓰는지 확인), `claude -v`(버전 확인)

## 설치·실행이 안 될 때 (12)
| 메시지 | 뜻과 해결 | 비고 |
| :- | :- | :- |
| `'claude' is not recognized as an internal or external command` (CMD)<br>`claude : The term 'claude' is not recognized as the name of a cmdlet` (PowerShell) | 설치는 됐는데 `claude`를 못 찾는 경우로, 설치 폴더 `%USERPROFILE%\.local\bin`이 PATH에 없는 경우가 많습니다.<br>1. `Test-Path "$env:USERPROFILE\.local\bin\claude.exe"` 가 `True`인지 확인 (`False`면 설치부터 다시)<br>2. `$env:PATH -split ';' \| Select-String '\.local\\bin'` 에 아무것도 안 나오면 PATH에 추가: `$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')` 다음 `[Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')`<br>3. **터미널을 껐다 다시 열고** `claude -v` 확인<br>에디터(VS Code 등) 안의 터미널이면 에디터를 완전히 종료했다가 다시 여세요 | 설치 문제 해결 |
| 업데이트 직후 `'claude' is not recognized` (Windows) | 업데이트 중 기존 `claude.exe`를 `claude.exe.old.<숫자>`라는 백업 이름으로 바꿔 두고 새 파일을 옮기는데, 이 이동이 실패하고 백업 복구도 못 한 경우입니다. `%USERPROFILE%\.local\bin`에 `claude.exe`가 있는지 확인하세요. 없고 `claude.exe.old.*` 백업이 있으면 가장 최근 백업의 이름을 `claude.exe`로 되돌립니다(공식 문서에 PowerShell 명령이 있음). 백업이 없거나 그래도 안 되면 `irm https://claude.ai/install.ps1 \| iex`로 다시 설치 | 설치 문제 해결 |
| `'irm' is not recognized` | CMD에서 PowerShell 명령을 입력했습니다. 시작 메뉴에서 **PowerShell**을 열어 `irm https://claude.ai/install.ps1 \| iex`를 실행하거나, CMD에서는 `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` 를 실행 | 설치 문제 해결 |
| `The token '&&' is not a valid statement separator` | PowerShell에서 CMD용 설치 명령을 실행했습니다. PowerShell에서는 `irm https://claude.ai/install.ps1 \| iex` 를 사용 | 설치 문제 해결 |
| `A parameter cannot be found that matches parameter name 'fsSL'`<br>`'bash' is not recognized as the name of a cmdlet` | macOS/Linux용 설치 명령(`curl -fsSL ... \| bash`)을 Windows에서 실행했습니다. PowerShell에서 `curl`은 `Invoke-WebRequest`의 별칭이라 `-fsSL` 옵션을 받지 못합니다. PowerShell용 `irm https://claude.ai/install.ps1 \| iex` 를 사용 | 설치 문제 해결 |
| 설치 명령이 **스크립트 글자만 출력**하고 설치되지 않음 | 다운로드 부분(`irm https://claude.ai/install.ps1`)만 실행한 것입니다. 뒤에 `\| iex`까지 붙여 **한 줄 전체**를 실행하세요. CMD에서 `-o` 없이 `curl`만 실행해도 같은 증상이 납니다 | 설치 문제 해결 |
| `File ...npm.ps1 cannot be loaded because running scripts is disabled on this system` (`claude.ps1`도 같음) | npm으로 설치했을 때 PowerShell 실행 정책이 `.ps1` 실행기를 막는 것입니다. 해결 방법 셋: ① `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` ② `npm.cmd`/`claude.cmd`처럼 `.cmd`로 호출 ③ npm 대신 PowerShell 설치 명령 사용(스크립트 파일이 아니라 영향 없음) | 설치 문제 해결 |
| `Failed to download binary: The process cannot access the file ... because it is being used by another process` | `%USERPROFILE%\.claude\downloads`에 쓰지 못한 것으로, 이전 설치가 아직 실행 중이거나 백신이 받다 만 파일을 검사 중일 때 생깁니다. 다른 PowerShell 설치 창을 닫고 백신 검사가 끝나길 기다린 뒤 `Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\downloads"` 를 실행하고 설치를 다시 | 설치 문제 해결 |
| `Claude Code on Windows requires either Git for Windows (for bash) or PowerShell` | Git for Windows는 **선택 사항**이고, Git Bash가 없으면 PowerShell 도구를 쓰는데 둘 다 못 찾은 것입니다. PowerShell 기본 위치 `C:\Windows\System32\WindowsPowerShell\v1.0\`를 PATH에 추가하거나 PowerShell 7(`pwsh`)을 설치하세요. 또는 git-scm.com/downloads/win에서 Git for Windows를 설치(설치 중 "Add to PATH" 선택)하고 터미널을 다시 엽니다 | 설치 문제 해결 |
| `claude`를 입력했더니 **Claude Desktop 앱**이 열림 | 오래된 Claude Desktop이 `WindowsApps`에 `Claude.exe`를 등록해 PATH에서 우선하는 경우입니다. Claude Desktop을 최신 버전으로 업데이트 | 설치 문제 해결 |
| `Auto-update failed · Run claude doctor` (화면 하단 빨간 줄) | 백그라운드 자동 업데이트가 설치되지 않았다는 뜻이며, **그대로 작업해도 됩니다.** 셸에서 `claude update`를 직접 실행하면 업데이트를 마치거나 실패 원인을 볼 수 있습니다 | 설치 문제 해결 |
| `Could not create SSL/TLS secure channel`<br>`Could not establish trust relationship for the SSL/TLS secure channel`<br>`schannel: next InitializeSecurityContext failed`<br>`curl: (35) TLS connect error` | 설치 중 TLS 핸드셰이크가 실패한 것입니다. **Windows PowerShell 5.1이면 TLS 1.2를 켜야 합니다**(공식 문서 해결 방법 2번에 명령이 있음). `CRYPT_E_NO_REVOCATION_CHECK`, `CRYPT_E_REVOCATION_OFFLINE`가 보이면 문서의 4단계를 따르세요 | 설치 문제 해결 |

## 로그인·인증 (9)
| 메시지 | 뜻과 해결 | 비고 |
| :- | :- | :- |
| `Not logged in · Please run /login` | 유효한 인증 정보가 없습니다. `/login`을 실행하세요. 환경 변수로 인증할 생각이었다면 `claude`를 실행한 **같은 셸**에서 `ANTHROPIC_API_KEY`가 설정돼 있는지 확인하고, 자동화(CI)에서는 `apiKeyHelper` 스크립트로 키를 가져오게 설정하세요 | Authentication errors |
| `Login expired · Please run /login` | 저장된 로그인을 갱신하려다 거부당해 저장된 인증 정보를 지운 상태입니다. 이후 모든 요청이 이 메시지에서 멈추니 **`/login`으로 다시 로그인**해야 합니다(그냥 재시도해도 같음). `-p` 실행이라면 같은 환경에서 `claude`로 `/login`을 마친 뒤 다시 실행하고, 자동화는 `ANTHROPIC_API_KEY` 또는 `claude setup-token`으로 만든 장기 토큰을 사용 | Authentication errors |
| `OAuth token revoked · Please run /login`<br>`Please run /login · API Error: 401 OAuth token has expired ...` | 저장된 로그인이 더는 유효하지 않습니다(모든 곳에서 로그아웃했거나 관리자가 권한을 회수했거나, 자동 갱신이 실패). `/login`으로 다시 로그인하세요. `-p`·SDK 자동화는 `ANTHROPIC_API_KEY` 또는 `claude setup-token`을 사용 | Authentication errors |
| `Invalid API key · Fix external API key` | `ANTHROPIC_API_KEY`나 `apiKeyHelper`가 준 키를 API가 거부했거나, Claude Code가 보내기 전에 막았습니다. ① 오타·폐기 여부 확인 ② PowerShell에서 `Get-ChildItem Env:ANTHROPIC*`로 환경 변수 확인(프로젝트 `.env`를 읽는 도구나 IDE 터미널이 오래된 키를 넣었을 수 있음) ③ `ANTHROPIC_API_KEY`를 해제하고 `/login`으로 구독 로그인 사용 ④ `/status`로 실제 어떤 인증을 쓰는지 확인 | Authentication errors |
| `Your ANTHROPIC_API_KEY belongs to a disabled organization · Unset the environment variable to use your subscription instead`<br>`API Error: 400 ... This organization has been disabled` | 비활성화된 Console 조직의 **오래된 `ANTHROPIC_API_KEY`가 구독 로그인보다 우선**해서 생기는 문제입니다. 현재 셸에서 변수를 해제하고 셸 프로필에서도 지운 뒤 `claude`를 다시 실행하고, `/status`로 구독 인증인지 확인하세요. 메시지가 `Update or unset`이면 대신 쓸 저장된 로그인이 없으니 해제 후 `/login`(또는 활성 조직의 키로 교체) | Authentication errors |
| `OAuth error: Invalid code. Please make sure the full code was copied` | 로그인 코드가 만료됐거나 복사하다 잘린 것입니다. Enter로 다시 시도해 브라우저가 열리면 **빨리** 마치고, 브라우저가 안 열리면 `c`를 눌러 URL 전체를 복사하세요. SSH 같은 원격 세션이면 브라우저가 엉뚱한 컴퓨터에서 열릴 수 있으니 터미널의 URL을 내 컴퓨터 브라우저에서 여세요 | 로그인 문제 해결 |
| `API Error: 403 Request not allowed` (로그인 직후) | Pro/Max/Ultra는 claude.ai/settings에서 구독이 활성인지, Console 사용자는 계정에 "Claude Code" 또는 "Developer" 역할이 있는지(관리자가 Console의 Members 페이지에서 부여) 확인하세요. 회사 프록시가 API 요청을 방해하는 경우도 있습니다 | 로그인 문제 해결 |
| 원인을 모르겠는데 로그인이 계속 실패 | ① `/logout` ② Claude Code 종료 ③ `claude`를 다시 시작해 로그인. 브라우저가 안 열리면 `c`로 OAuth URL을 복사해 브라우저에 붙여 넣으세요 | 로그인 문제 해결 |
| 브라우저가 안 열리거나, 로그인 후 `localhost` 연결 오류가 뜸 (WSL2·SSH·컨테이너) | 로그인 프롬프트에서 `c`로 **별도 로그인 URL**을 복사해 내 컴퓨터 브라우저에서 로그인하면, `localhost`로 돌아가는 대신 **코드**가 표시됩니다. 그 코드를 터미널의 `Paste code here` 프롬프트에 붙여 넣으세요 | 로그인 문제 해결 |

## 사용량·요금 (4)
| 메시지 | 뜻과 해결 | 비고 |
| :- | :- | :- |
| `You've hit your session limit · resets 3:45pm`<br>`You've hit your weekly limit · resets Mon 12:00am`<br>`You've hit your Opus limit` / `Sonnet limit` | 구독 플랜의 사용량이 소진됐습니다. **표시된 재설정 시각까지 기다리세요.** 세션·주간 한도는 모든 모델이 공유해서 모델을 바꿔도 풀리지 않고, Opus/Sonnet 한도는 그 모델 계열에만 적용되므로 `/model`로 다른 계열로 바꾸면 계속 쓸 수 있습니다. `/usage`로 각 한도와 재설정 시각을 확인하세요 | Usage limits |
| `You've hit your monthly spend limit · raise it at ...`<br>`You've hit your individual spend limit`<br>`You've hit your org's monthly spend limit` | 플랜에 포함된 사용량으로는 이 요청을 처리할 수 없고, 대신 쓰는 **사용 크레딧이 지출 한도에 도달**했습니다. Pro/Max/Ultra는 claude.ai의 **Settings > Usage**에서 한도를 올리거나 `/usage-credits`를 실행하세요. Team/Enterprise는 **Organization settings > Usage**에서 올리거나(결제 관리자) 관리자에게 요청하세요(`/usage-credits`가 관리자 요청을 대신 보내 줌) | Usage limits |
| `Credit balance is too low` | Console 조직의 선불 크레딧이 떨어졌거나, **구독을 쓰려 했는데 Console API 키로 요청이 가고 있는** 경우입니다. 구독 사용자라면 `/status`의 `API key` 행을 확인하고, 환경 변수 `ANTHROPIC_API_KEY`를 해제(셸 프로필에서도 삭제)한 뒤 `claude`를 다시 실행하세요(필요하면 `/login`). API 사용자는 platform.claude.com/settings/billing에서 크레딧을 충전하세요 | Usage limits |
| `API Error: Request rejected (429) · this may be a temporary capacity issue` | API 키·Amazon Bedrock·Google Cloud 프로젝트에 설정된 **요청 한도**에 도달했습니다. ① `/status`로 실제 쓰는 인증이 맞는지 확인(엉뚱한 `ANTHROPIC_API_KEY`가 낮은 등급 키로 연결하는 경우가 있음) ② 제공자 콘솔에서 한도 확인 ③ 병렬 서브에이전트를 줄이거나 `/model`로 작은 모델 사용 | Usage limits |

## 서버·네트워크 (7)
| 메시지 | 뜻과 해결 | 비고 |
| :- | :- | :- |
| `API Error: 500 Internal server error` | API 서버 쪽의 일시적인 장애로, **내 프롬프트·설정·계정 때문이 아닙니다.** 잠시 뒤 다시 시도하고, 계속되면 status.claude.com을 확인하세요 | Server errors |
| `API Error: Repeated 529 Overloaded errors` | API가 모든 사용자에게 일시적으로 용량 초과 상태입니다(Claude Code가 이미 여러 번 재시도한 뒤 표시). **내 사용 한도와 무관하고 사용량에도 포함되지 않습니다.** status.claude.com 확인 → 몇 분 뒤 재시도 → `/model`로 다른 모델 선택(용량은 모델별로 관리) | Server errors |
| `Request timed out` | 연결 제한 시간(기본 10분) 안에 API가 응답하지 않았습니다. 다시 시도하고, 느린 네트워크·프록시 때문이면 `API_TIMEOUT_MS`를 늘리세요. `API_TIMEOUT_MS`를 `0`으로 했는데 모든 요청이 이 메시지로 실패하면 `claude -v`을 확인해 v2.1.305 이전이면 업데이트하거나 양수로 바꾸세요 | Server errors |
| `API Error: No response from API (waited 3m, then 10m on the retry)` | 응답 헤더가 첫 바이트 마감 시간 안에 오지 않아 중단된 것입니다. 회사 프록시·게이트웨이가 응답을 끝까지 붙잡고 있는 환경이라면 `API_TIMEOUT_MS` 또는 `CLAUDE_STREAM_FIRST_BYTE_TIMEOUT_MS`를 늘려 더 기다리게 하세요 | Server errors |
| `API Error: Connection lost mid-response. The response above may be incomplete.`<br>(`Server error mid-response`, `Your computer went to sleep mid-response`, `The response stopped arriving` 등 변형이 여럿) | 응답을 받는 도중 스트리밍이 끊겼다는 뜻입니다. 다시 보내면 같은 도구 호출이 두 번 실행될 수 있어서, Claude Code는 이미 끝난 부분을 **그대로 남기고** 이 안내만 덧붙입니다. 위쪽 응답이 **불완전할 수 있으니** 결과를 확인하세요 | Server errors |
| `Unable to connect to API. Check your internet connection`<br>(`ConnectionRefused`, `ENOTFOUND` 같은 코드가 괄호로 붙음) | API로 가는 연결이 실패했습니다. PowerShell에서 `curl.exe -I https://api.anthropic.com`로 연결을 확인하세요(**`curl.exe`**라고 써야 내장 별칭 `Invoke-WebRequest`가 아닌 진짜 curl이 실행됨). 회사 프록시 뒤라면 실행 전에 `HTTPS_PROXY`를 설정하고, LLM 게이트웨이를 쓴다면 `ANTHROPIC_BASE_URL`을 그 주소로 설정하세요 | Network errors |
| `Unable to connect to API: SSL certificate verification failed (UNABLE_TO_GET_ISSUER_CERT_LOCALLY)` | 회사 프록시·보안 장비가 **자체 인증서로 TLS를 가로채는데** Claude Code가 그 인증서를 믿지 않는 것입니다. 조직의 CA 번들을 내보내 `NODE_EXTRA_CA_CERTS=경로`로 지정하세요. **`NODE_TLS_REJECT_UNAUTHORIZED=0`은 인증서 검증을 완전히 끄므로 쓰지 마세요** | Network errors |

## 요청·모델 (5)
| 메시지 | 뜻과 해결 | 비고 |
| :- | :- | :- |
| `Prompt is too long` | 대화와 첨부 파일이 모델의 컨텍스트 창을 넘었습니다. `/compact`로 앞 대화를 요약하거나 `/clear`로 새로 시작하세요. `/compact`가 `Not enough messages to compact.`라고 하면 한 번의 입력 자체가 공간을 차지한 것이니, `/clear` 후 붙여 넣는 글·첨부를 줄여서 다시 보내세요. `/context`로 무엇이 공간을 쓰는지 볼 수 있습니다 | Request errors |
| `Request too large (max 32MB)` | 요청 본문이 API 한도 32MB를 넘었습니다(큰 붙여넣기, 도구 결과, 첨부 등. 컨텍스트 창 한도와는 **별개**). `/compact`를 실행해 쌓인 이미지·첨부를 정리하세요. 메시지에 `compacting cannot make it fit`가 있으면 `Esc`를 두 번 눌러 큰 내용이 들어간 턴 이전으로 되돌리거나 `/clear`를 쓰세요. 큰 파일은 붙여 넣지 말고 **경로로 알려 주세요** | Request errors |
| `Image was too large. Double press esc to go back and try again with a smaller image.` | 이미지가 크기·해상도 한도를 넘었습니다. 이미지 한 장은 긴 변 **8000픽셀 이하**(컨텍스트에 이미지가 20장을 넘으면 3000픽셀)로 줄이고, 전체 화면 대신 필요한 부분만 캡처하세요 | Request errors |
| `There's an issue with the selected model (...). It may not exist or you may not have access to it.` | 설정한 모델 이름을 못 알아보거나 계정에 권한이 없습니다. 대화형에서는 `/model`로 고르고, `-p`에서는 `--model`에 올바른 별칭이나 ID를 주거나 `ANTHROPIC_MODEL`을 설정하세요 | Request errors |
| `Model '...' not found` | 이름으로 모델을 바꿨는데 그런 모델을 확인하지 못했습니다. `/model`을 인자 없이 실행해 내 계정에서 쓸 수 있는 모델을 고르거나, `sonnet` 같은 **별칭**을 쓰세요. 전체 ID를 직접 입력했다면 제공자의 모델 목록과 대조하세요(새 모델이 내 제공자·리전에 아직 없을 수 있음) | Request errors |

## 세션·설정 (6)
| 메시지 | 뜻과 해결 | 비고 |
| :- | :- | :- |
| `No conversation found with session ID: <session-id>` | `claude --resume <ID>`에 맞는 저장 기록이 없습니다. `claude --resume`으로 선택기를 열고 `Ctrl+A`를 눌러 이 컴퓨터의 **모든 프로젝트**로 넓혀 보세요. `claude -p`나 Agent SDK로 만든 세션은 선택기에 나오지 않으니, 처음 실행이 출력한 `session_id`와 대조하세요 | Command-line errors |
| `Failed to resume the conversation. Run claude --resume <session-id> to retry, or claude to start a new session.` | 선택한 세션의 저장 기록을 읽거나 처리하지 못했습니다. 안내된 `claude --resume <ID>`로 다시 시도하고, v2.1.285 이전 버전에서 같은 식으로 실패하면 `claude update` 후 다시 열어 보세요. 그래도 안 되면 `claude`로 새 세션을 시작 | Command-line errors |
| `Unknown command: /hepl. Did you mean /help?` | 이 세션에 없는 `/` 이름을 입력했습니다. 제안된 이름을 실행하거나 `/` 뒤에 글자 일부를 쳐서 사용 가능한 명령을 보세요. 문서에 있는 명령인데 모른다고 나오면 [Commands 레퍼런스](#/ref/slash-all)에서 그 명령의 필요 조건(플랜·플랫폼·버전)을 확인하세요 | Command-line errors |
| `Error: Input must be provided either through stdin or as a prompt argument when using --print` | `claude`는 출력이 터미널일 때만 대화형 화면을 엽니다. 출력이 리디렉션됐거나 PowerShell ISE·일부 IDE 출력창처럼 진짜 터미널이 아니면 비대화형(`-p`)으로 실행되어 생기는 오류입니다. **Windows Terminal이나 PowerShell 콘솔(ISE 아님)** 에서 `claude`를 실행하고, 한 번만 쓸 때는 `claude -p "질문"` 또는 `echo "질문" \| claude -p`를 사용하세요 | Command-line errors |
| `Claude configuration file at ... is corrupted: ...`<br>(`~/.claude.json`) | 계정 정보·MCP 서버·프로젝트별 상태를 담은 `~/.claude.json`을 해석하지 못했습니다. 출력에 `cp` 줄이 있으면 **PowerShell에서 그 줄을 실행**하세요. 없거나 오류가 다시 나면 JSON을 직접 고치거나 `~/.claude/backups/`의 `.claude.json.backup.<시각>` 파일을 복사해 덮어쓰세요. 파일이 아예 없으면 기본 설정으로 시작하지만 파일에 있던 설정은 사라집니다 | Command-line errors |
| `The current directory no longer exists (it was deleted or moved). Start Claude Code from an existing directory.` | 삭제되거나 옮겨진 폴더에서 `claude`를 실행했습니다. 존재하는 폴더(홈이나 프로젝트 폴더)로 `cd`한 뒤 다시 실행하세요 | Command-line errors |

## MCP·도구 (7)
| 메시지 | 뜻과 해결 | 비고 |
| :- | :- | :- |
| `MCP server "<name>" needs you to sign in again (run /mcp to re-authenticate)` | 원격 MCP 서버가 작업 도중 인증 정보를 거부했습니다(로그인·토큰 만료, 또는 도구에 필요한 권한이 토큰에 없음). `/mcp`를 열어 그 서버에서 다시 인증하세요 | Authentication errors |
| `MCP server "<name>" is disabled — re-enable it via /mcp to use its tools` | 꺼 둔 MCP 서버의 도구를 Claude가 호출하려 했습니다. 일부러 껐다면 할 일이 없고, 그 도구가 필요하면 `/mcp`에서 다시 켜세요 | Tool errors |
| `Can't read .mcp.json: it isn't a regular file or is larger than 2097152 bytes. Fix or remove it, then run the command again.` | 현재 폴더의 `.mcp.json`이 일반 파일이 아니거나 2 MiB를 넘습니다. 프로젝트 범위 형식의 평범한 JSON 파일로 바꾸거나 삭제한 뒤 명령을 다시 실행하세요 | Command-line errors |
| `OAuth callback port <port> is already in use` | MCP 서버 OAuth 로그인을 받으려고 여는 로컬 포트를 다른 프로그램이 쓰고 있습니다. 그 프로세스를 끝내거나 기다리세요(메시지에 나온 `lsof` 명령은 macOS/Linux용입니다). 그 포트를 계속 써야 한다면 서버에 다른 리디렉션 URI를 등록하고 `MCP_OAUTH_CALLBACK_PORT` 또는 `--callback-port`로 포트를 지정한 뒤 `/mcp`에서 다시 로그인하세요 | Command-line errors |
| `File is covered by a Read deny rule in your permission settings and cannot be edited.` | Edit·Write 도구가 `Read` 거부 규칙에 걸린 경로를 수정하려 했습니다(읽을 수 없는 파일은 쓸 수도 없음). 수정이 필요하면 `/permissions`나 설정에서 해당 `Read` 거부 규칙을 없애거나 범위를 좁히세요. 건드리면 안 되는 파일이면 규칙을 두고, NotebookEdit까지 막으려면 같은 경로에 `Edit` 거부 규칙을 추가하세요 | Tool errors |
| `WebFetch cannot fetch localhost or other hostnames without a dot. To reach a local server, use Bash with curl instead.` | 호스트 이름에 점이 없는 주소(`http://localhost:3000`, 회사 위키 이름 등)는 WebFetch가 가져오지 않습니다. 보통 **할 일이 없습니다.** Claude가 안내대로 Bash의 `curl`로 로컬·사내 서버에 접근합니다 | Tool errors |
| `Error: command contains the invisible character U+FEFF (byte order mark) or U+180E ... and was not run.` | PowerShell 도구가 보이지 않는 문자(BOM 등)가 든 명령을 실행하지 않고 거부한 것입니다. Claude가 쓴 명령이면 고칠 것이 없습니다(메시지가 다시 쓰는 방법을 안내함). 내가 만든 스킬·명령 파일에서 나온 것이면 그 문자를 지우세요 | Tool errors |

---

**출처:** [공식 문서 Error reference](https://code.claude.com/docs/en/errors) · [Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install) (2026-11-14 기준 Claude Code 2.1.323 문서). 이 표는 **자주 만나는 오류를 골라** 한국어로 옮긴 것이라 문서의 모든 오류를 담고 있지 않습니다. 표의 '비고'는 원문에서 해당 오류가 있는 구역 이름입니다. 한국어 설명이 원문과 다르면 원문을 기준으로 하세요.
