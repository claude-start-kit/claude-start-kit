# MCP 참고

> **MCP(Model Context Protocol)** 서버를 Claude Code에 연결할 때 찾아보는 표입니다. 추가·관리 명령, 연결 방식, 저장 범위, 설정 파일 형식, 상태 표시, 시간·크기 제한을 정리했습니다. 위 검색창에 `add`, `scope`, `timeout`, `Failed`처럼 입력하세요. 처음이라면 먼저 [MCP 레슨](#/level2/mcp)을 보세요.

## 읽는 법
- `<이름>`은 직접 채울 값, `[옵션]`은 선택 값입니다
- 터미널에서 쓰는 `claude mcp ...` 명령과, 세션 안에서 쓰는 `/mcp` 패널은 **같은 서버 목록**을 다룹니다
- 서버 설정에 비밀 키(토큰)를 직접 적으면 **파일이나 저장소에 노출될 수 있습니다.** 공유하는 `.mcp.json`에는 아래의 `${변수}` 방식을 쓰세요
- 여기에 없는 내용은 공식 문서 [MCP](https://code.claude.com/docs/en/mcp)에서 찾으세요

## 터미널 명령 (claude mcp) (15)
| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `claude mcp add --transport http <이름> <주소>` | **원격 HTTP 서버** 추가 | 원격 서버에 **권장**되는 방식. 예: `claude mcp add --transport http notion https://mcp.notion.com/mcp` |
| `claude mcp add --transport http <이름> <주소> --header "Authorization: Bearer <토큰>"` | 인증 헤더가 필요한 HTTP 서버 추가 | ⚠ 토큰이 설정 파일에 저장됨 |
| `claude mcp add --transport sse <이름> <주소>` | 원격 SSE 서버 추가 | **더 이상 권장되지 않음.** 가능하면 HTTP 사용 |
| `claude mcp add [옵션] <이름> -- <명령> [인자...]` | **내 PC에서 실행되는 서버(stdio)** 추가 | `--`가 Claude의 옵션과 서버 명령을 구분. 예: `claude mcp add --env AIRTABLE_API_KEY=키 --transport stdio airtable -- npx -y airtable-mcp-server` |
| `claude mcp add --scope <local\|project\|user> ...` | 서버를 저장할 **범위** 지정 | 기본값은 `local`. 아래 범위 표 참고 |
| `claude mcp add --env KEY=값 ...` | 서버 프로세스에 환경 변수 전달 | 여러 쌍 가능. **서버 이름 바로 앞에는 쓰지 말고** `--transport stdio` 같은 다른 옵션을 사이에 두세요 |
| `claude mcp add-json <이름> '<json>'` | JSON 설정을 그대로 넣어 서버 추가 | 셸에서 따옴표를 알맞게 이스케이프. `--scope user`로 사용자 범위에 추가 가능 |
| `claude mcp add-from-claude-desktop` | Claude Desktop에 설정된 서버를 가져오기 | |
| `claude mcp list` | 설정된 서버 목록과 연결 상태 | `✔ Connected`, `! Needs authentication`, `✘ Failed to connect` 등 |
| `claude mcp get <이름>` | 서버 하나의 자세한 설정 | 연결 실패 시 `Issue:` 줄에 원인이 표시됨 |
| `claude mcp remove <이름>` | 서버 삭제 | 원격 서버라면 저장된 OAuth 토큰·등록 정보도 함께 삭제 |
| `claude mcp login <이름>` | 대화형 `/mcp` 패널 없이 OAuth 로그인 | SSH에서는 `--no-browser`로 인증 URL만 출력 |
| `claude mcp logout <이름>` | 저장된 OAuth 인증 정보 삭제 | |
| `claude mcp reset-project-choices` | `.mcp.json` 서버에 대해 내렸던 **승인 선택을 초기화** | 프로젝트 범위 서버는 처음 쓸 때 승인을 묻습니다 |
| `claude mcp serve` | **Claude Code 자체를 MCP 서버(stdio)로** 실행 | 시작해도 아무것도 출력하지 않는 것이 정상(클라이언트를 기다리는 중) |

## 세션 안에서 (3)
| 명령 | 설명 | 비고 |
| :- | :- | :- |
| `/mcp` | MCP 패널: 서버 상태 확인, 다시 연결, 켜기·끄기, 인증 | 서버를 지우지 않고 **끄기**만 할 수 있음(설정은 유지) |
| `@서버:프로토콜://리소스/경로` | MCP 서버가 제공하는 **리소스**를 대화에 참조 | 프롬프트에서 `@`를 치면 목록이 나옴. 예: `@github:issue://123` |
| `/mcp__<서버>__<프롬프트> [인자]` | MCP 서버가 제공하는 **프롬프트**를 명령처럼 실행 | `/`를 치면 `/서버:프롬프트 (MCP)`로 표시됨. 인자는 공백으로 구분. 예: `/mcp__github__pr_review 456` |

## 연결 방식 (전송 방식) (4)
| 방식 | 용도 | 비고 |
| :- | :- | :- |
| `http` | 원격(클라우드) 서버 | **권장.** 설정 JSON에서는 `streamable-http`도 같은 뜻으로 인정 |
| `sse` | 원격 서버 (옛 방식) | **더 이상 권장되지 않음.** `http`로 추가하면 HTTP를 먼저 시도하고 필요할 때 SSE로 전환 |
| `stdio` | 내 PC에서 프로그램으로 실행되는 서버 | 시스템 접근이 필요하거나 직접 만든 스크립트에 적합. 종료 시 Windows에서는 서버의 입력을 먼저 닫고, 300밀리초 뒤에도 실행 중이면 프로세스 트리를 끝냄 |
| `ws` (WebSocket) | 서버가 Claude에게 먼저 이벤트를 보내야 할 때 | `claude mcp add-json` 또는 `.mcp.json`으로만 설정. 인증은 헤더 방식만 가능 |

## 저장 범위 (scope) (3)
| 범위 | 적용 대상 | 팀과 공유 | 저장 위치 |
| :- | :- | :- | :- |
| `local` (기본값) | **현재 프로젝트에서만** | 아니오 | `~/.claude.json` (그 프로젝트 항목 안) |
| `project` | 현재 프로젝트에서만 | **예** (버전 관리로 공유) | 프로젝트 루트의 `.mcp.json` |
| `user` | **내 모든 프로젝트** | 아니오 | `~/.claude.json` |

- `local`은 일반 설정의 `settings.local.json`과 **다른 개념**입니다 (MCP의 `local`은 홈 폴더의 `~/.claude.json`에 저장됨)
- `project` 범위 서버는 **처음 쓸 때 사용자에게 승인을 묻습니다.** 승인 선택을 되돌리려면 `claude mcp reset-project-choices`

## 설정 파일 형식 (`.mcp.json`) (7)
| 항목 | 설명 | 비고 |
| :- | :- | :- |
| `{ "mcpServers": { "이름": { ... } } }` | 최상위 구조 | `claude mcp add --scope project`가 이 파일을 만들거나 갱신 |
| `"type": "http"` + `"url"` | HTTP 서버 항목 | **`url`만 있고 `type`이 없으면 오류**: `type`이 없는 항목은 stdio 서버로 읽혀서 해당 서버를 건너뜀 |
| `"type": "stdio"` + `"command"`, `"args"`, `"env"` | 내 PC에서 실행하는 서버 항목 | |
| `"headers": { ... }` | 요청에 붙일 헤더 | 값에 토큰을 직접 쓰지 말고 `${변수}` 사용 |
| `"timeout": <밀리초>` | 이 서버의 도구 호출 제한 시간 | 1000 미만 값은 무시됨 |
| `${VAR}` | 환경 변수 값으로 치환 | `command`, `args`, `env`, `url`, `headers`에서 사용 가능 |
| `${VAR:-기본값}` | 변수가 없을 때 기본값을 사용 | 기본값이 없는데 변수도 없으면 경고가 나오고 `${VAR}` 그대로 쓰임 |

## 상태 표시 (claude mcp list) (8)
| 표시 | 뜻 | 비고 |
| :- | :- | :- |
| `✔ Connected` | 연결됨 | |
| `! Needs authentication` | 로그인이 필요함 | `/mcp`에서 인증하거나 `claude mcp login <이름>` |
| `✘ Failed to connect` | 연결하지 못함 | 상세 원인이 같은 줄에 붙음. `claude mcp get <이름>`의 `Issue:` 줄도 확인 |
| `⏸ Pending approval (run claude to approve)` | `.mcp.json`의 프로젝트 서버를 아직 승인하지 않음 | `claude`를 대화형으로 실행해 승인 |
| `✘ Rejected (see disabledMcpjsonServers in settings)` | 설정의 `disabledMcpjsonServers`가 거부한 서버 | |
| `⊘ Disabled for this project (re-enable via /mcp)` | 이 프로젝트에서 꺼 둔 서버 | `/mcp`에서 다시 켬 |
| `✘ Blocked by enterprise managed policy` | 조직 정책이 막은 서버 | 관리자에게 문의 |
| `not configured` | 원격 서버 설정의 `url`이 비어 있음 | 연결을 시도하지 않음 |

## 시간·크기 제한 (7)
| 항목 | 기본값·설명 | 비고 |
| :- | :- | :- |
| `MCP_TIMEOUT` | 서버 **시작** 대기 시간(밀리초) | 예: `MCP_TIMEOUT=10000 claude`는 10초. `-p`로 실행할 때 연결을 기다리는 기본값은 30초 |
| `MCP_TOOL_TIMEOUT` | 도구 한 번 호출의 최대 시간(모든 서버 공통) | 서버별 `timeout`이 있으면 그 서버는 이 값을 덮어씀 |
| `CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT` | 응답·진행 알림이 없을 때 호출을 중단하기까지 시간 | 기본 5분. `0`이면 검사 끔 |
| `MAX_MCP_OUTPUT_TOKENS` | MCP 도구 출력의 최대 토큰 | **기본 25,000.** 10,000을 넘으면 경고. 넘는 결과는 파일로 저장되고 대화에는 경로가 들어감 |
| 텍스트 결과 50,000자 | 이보다 긴 성공 결과는 파일로 저장 | 도구가 `anthropic/maxResultSizeChars`를 선언하면 그 값을 사용 |
| HTTP·SSE 응답 16 MiB | 넘으면 읽기를 멈추고 요청 실패 | WebSocket 메시지 하나도 16 MiB 제한 |
| `MCP_OAUTH_CALLBACK_PORT` | OAuth 로그인 콜백에 쓸 고정 포트 | 포트가 이미 사용 중일 때 [오류 메시지 사전](#/ref/errors) 참고 |

---

**출처:** [공식 문서 MCP](https://code.claude.com/docs/en/mcp) · 2026-11-14 기준 Claude Code 2.1.323 문서에서 골라 한국어로 정리했습니다. 이 표는 **자주 찾는 항목을 고른 것**이라 문서 전체를 다루지 않으며, 한국어 설명이 원문과 다르면 원문을 기준으로 하세요.
