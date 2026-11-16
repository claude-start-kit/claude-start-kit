# MCP로 외부 도구 연결하기

> **MCP**는 Claude Code에 **외부 서비스(문서·코드·DB)를 연결**하는 표준 규격입니다. 서버 하나를 추가하면 Claude가 그 도구를 직접 씁니다.

![MCP 개념](assets/img/mcp-concept.svg)

## 서버 추가하기
**원격(HTTP) 서버 — 권장**
```powershell
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

**내 PC에서 실행하는(stdio) 서버**
```powershell
claude mcp add --transport stdio airtable --env AIRTABLE_API_KEY=내키 -- npx -y airtable-mcp-server
```
`--` 앞은 Claude 옵션, 뒤는 서버를 실행하는 명령입니다.

## 관리 명령
| 명령 | 설명 |
|---|---|
| `claude mcp list` | 연결된 서버 목록 |
| `claude mcp get 이름` | 서버 상세 |
| `claude mcp remove 이름` | 제거 |
| `claude mcp login 이름` | 로그인(OAuth) |
| `/mcp` (세션 안) | 상태 확인 · 인증 · 켜고 끄기 |

`claude mcp list`는 서버마다 상태를 **Connected / Needs authentication / Failed to connect** 로 보여 줍니다.

## 범위(scope)
| 범위 | 옵션 | 저장 위치 | 공유 |
|---|---|---|---|
| local (기본) | — | 내 설정 | 나만 |
| project | `--scope project` | 프로젝트의 `.mcp.json` | 팀과 공유 |
| user | `--scope user` | 내 설정 | 내 모든 프로젝트 |

## 보안 수칙
- **출처가 확실한 서버만** 추가하세요
- 외부 내용을 가져오는 서버는 **프롬프트 주입** 위험이 있습니다
- DB는 **읽기 전용 계정**을 연결하세요
- 서버를 지워도 **토큰은 폐기되지 않습니다** → 먼저 `claude mcp logout 이름`
- 토큰·키를 **채팅이나 공유 파일에 붙여넣지 마세요**

## 확인 체크
- [ ] `claude mcp list`를 실행해 봤다
- [ ] `/mcp` 화면에서 상태를 확인했다

## 자주 하는 실수
- 쓰지 않는 서버를 **계속 켜 둠** → 컨텍스트를 차지합니다. `/mcp`에서 끄기
- 회사 계정·데이터를 연결하기 전에 **정책 확인**
