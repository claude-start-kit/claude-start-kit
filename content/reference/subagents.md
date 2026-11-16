# 서브에이전트 참고

> **서브에이전트**를 만들고 호출할 때 찾아보는 표입니다. 기본 제공 서브에이전트, 파일을 두는 위치와 우선순위, 파일 안의 설정 항목(frontmatter), 호출 방법, 제한을 정리했습니다. 위 검색창에 `model`, `tools`, `worktree`, `@`처럼 입력하세요. 처음이라면 먼저 [서브에이전트 레슨](#/level2/subagents)을 보세요.

## 읽는 법
- 서브에이전트는 **자기만의 컨텍스트(작업 공간)에서 일하고 결과만 돌려주는** 보조 에이전트입니다. 파일 하나(`.md`)로 정의합니다
- 설정 항목 이름은 **대소문자까지 표와 정확히 같아야** 합니다(`maxTurns`, `disallowedTools`처럼 camelCase). 알 수 없는 항목은 **오류 없이 무시**됩니다
- 여기에 없는 내용은 공식 문서 [Create custom subagents](https://code.claude.com/docs/en/sub-agents)에서 찾으세요

## 기본 제공 서브에이전트 (6)
| 이름 | 하는 일 | 비고 |
| :- | :- | :- |
| `Explore` | 코드를 **읽기만 하면서** 빠르게 찾고 분석 (파일 탐색, 코드 검색) | 읽기 전용 도구만 사용 (Write·Edit 거부). 호출 시 철저함 수준 **quick / medium / very thorough** 중 선택 |
| `Plan` | 플랜 모드에서 계획을 세우기 전에 코드베이스를 조사 | 읽기 전용 도구만 사용. 메인 대화의 모델을 따름 |
| `general-purpose` | 탐색과 수정이 모두 필요한 복잡한 다단계 작업 | 서브에이전트가 쓸 수 있는 **모든 도구**를 사용 |
| `claude` | 더 구체적인 에이전트가 맞지 않을 때의 만능 에이전트 | 모든 도구 사용 가능 |
| `statusline-setup` | `/statusline`으로 상태줄을 설정할 때 사용 | 모델 Sonnet |
| `claude-code-guide` | Claude Code 기능에 대한 질문에 답할 때 사용 | 모델 Haiku |

- `Explore`와 `Plan`은 **CLAUDE.md와 git 상태 정보 없이** 시작해서 빠르고 저렴합니다
- 내가 같은 이름(`Explore` 등)으로 서브에이전트를 만들면 **내 것이 기본 제공을 대체**합니다 (예: `model: haiku`로 탐색 비용 절감)

## 저장 위치와 우선순위 (5)
같은 이름이 여러 곳에 있으면 **번호가 작은(우선순위가 높은) 위치**의 것이 쓰입니다.

| 위치 | 적용 범위 | 우선순위 | 만드는 법 |
| :- | :- | :- | :- |
| 관리형 설정 | 조직 전체 | 1 (가장 높음) | 관리자가 배포 |
| `--agents` CLI 플래그 | 현재 세션 | 2 | 실행할 때 JSON 전달 |
| `.claude/agents/` | 현재 프로젝트 | 3 | Claude에게 시키거나 파일을 직접 만듦 |
| `~/.claude/agents/` | 내 모든 프로젝트 | 4 | Claude에게 시키거나 파일을 직접 만듦 |
| 플러그인의 `agents/` 폴더 | 플러그인을 켠 곳 | 5 (가장 낮음) | 플러그인으로 설치 |

- 프로젝트 서브에이전트(`.claude/agents/`)는 **버전 관리에 올려 팀과 공유**하기 좋습니다
- 하위 폴더(`agents/review/` 등)로 정리해도 되며, 폴더 경로는 서브에이전트 이름에 영향을 주지 않습니다
- 실행 중에 파일을 추가·수정하면 몇 초 안에 반영됩니다. 다만 세션 시작 때 **없던 `agents` 폴더에 처음 만든 경우**, `--add-dir`로 추가한 폴더의 경우, `--disable-slash-commands`로 시작한 경우에는 **재시작**이 필요합니다

## 파일 형식
```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---
You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```
- `---` 사이가 **설정(frontmatter)**, 그 아래 본문이 **서브에이전트의 시스템 프롬프트**입니다
- 서브에이전트는 이 시스템 프롬프트와 작업 폴더 같은 기본 환경 정보만 받습니다
- `/agents` 명령은 새로 만드는 화면이 아니라 **"Claude에게 시키거나 `.claude/agents/`, `~/.claude/agents/`를 직접 편집하라"는 안내**를 출력합니다 (이 문서 기준)

## 설정 항목 (frontmatter) (19)
`name`과 `description`만 필수이고, 나머지는 선택입니다.

| 항목 | 필수 | 설명 |
| :- | :- | :- |
| `name` | **예** | 고유 이름(256자 이하). 예: `code-reviewer`. 파일 이름과 같을 필요는 없음. `:`는 플러그인 이름 구분용이라 쓸 수 없음 |
| `description` | **예** | **Claude가 언제 이 서브에이전트에게 맡길지** 판단하는 설명 |
| `tools` | 아니오 | 쓸 수 있는 도구 목록(쉼표로 구분한 글자 또는 YAML 목록). **생략하면 서브에이전트가 쓸 수 있는 모든 도구를 상속**. 목록의 항목이 하나도 도구로 해석되지 않으면 시작하지 못할 수 있음 |
| `disallowedTools` | 아니오 | 상속·지정된 목록에서 **뺄 도구**. 범위를 붙여도(`Bash(git push *)`) 그 도구 전체가 제거됨 |
| `model` | 아니오 | `sonnet`, `opus`, `haiku`, `fable`, 전체 모델 ID, 또는 `inherit`(메인 대화와 같은 모델). 생략하면 아래 모델 선택 순서를 따름 |
| `permissionMode` | 아니오 | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, 또는 `default`의 별칭 `manual`. 플러그인 서브에이전트에서는 무시 |
| `maxTurns` | 아니오 | 서브에이전트가 멈추기 전의 **최대 턴 수**. 한도에 닿으면 결과가 '부분 결과'로 표시되고 Claude가 이어서 재개할 수 있음(표시는 v2.1.246 이상) |
| `autoCompactWindow` | 아니오 | 이 서브에이전트의 자동 compact 창을 `100000`~`1000000` 토큰으로 낮춤. v2.1.296 이상 |
| `skills` | 아니오 | 시작할 때 **컨텍스트에 미리 넣을 스킬**(설명만이 아니라 전체 내용이 주입됨). 나열하지 않은 스킬도 Skill 도구로 호출 가능 |
| `mcpServers` | 아니오 | 이 서브에이전트가 쓸 MCP 서버. 이미 설정된 서버 이름으로 참조하거나 설정을 인라인으로 정의 |
| `hooks` | 아니오 | 이 서브에이전트에만 적용되는 훅. 플러그인 서브에이전트에서는 무시 |
| `memory` | 아니오 | 세션을 넘나드는 **지속 메모리 범위**: `user`, `project`, `local` |
| `background` | 아니오 | `true`면 Claude가 기다리라고 해도 백그라운드로 유지. (기본적으로 메인 대화가 만드는 서브에이전트는 이미 백그라운드로 시작함) |
| `omitClaudeMd` | 아니오 | `true`면 사용자·프로젝트·로컬 CLAUDE.md 없이 시작 (관리형 정책 파일은 계속 로드) |
| `effort` | 아니오 | 이 서브에이전트가 활성일 때의 노력도: `low`, `medium`, `high`, `xhigh`, `max` (모델에 따라 가능한 수준이 다름). 환경 변수 `CLAUDE_CODE_EFFORT_LEVEL`은 덮어쓰지 못함 |
| `isolation` | 아니오 | `worktree`로 두면 **임시 git worktree**(저장소의 격리된 사본)에서 실행 |
| `color` | 아니오 | 작업 목록·기록에서 쓸 색: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan` |
| `initialPrompt` | 아니오 | 이 에이전트가 **메인 세션 에이전트**로 실행될 때(`--agent` 또는 `agent` 설정) 첫 사용자 턴으로 자동 제출됨 |
| `experimental` | 아니오 | 실험 옵션 모음. `cacheTtl`을 `5m` 또는 `1h`로 두어 프롬프트 캐시 유지 시간을 정함 |

## 권한 모드 (`permissionMode`) (6)
| 값 | 동작 | 비고 |
| :- | :- | :- |
| `default` | 수동 모드: 권한을 물어봄 | 별칭 `manual` |
| `acceptEdits` | 작업 폴더 안의 파일 수정과 일반적인 파일 시스템 명령을 자동 승인 | |
| `auto` | 백그라운드 분류기가 명령과 보호 폴더 쓰기를 검토 | 자동 모드 |
| `dontAsk` | 물어봐야 하는 호출은 **자동 거부**. 명시적으로 허용한 도구는 동작 | |
| `bypassPermissions` | 권한 확인 건너뛰기 | ⚠ 서브에이전트는 **메인 대화가 이 모드일 때만** 이 모드로 실행됨 |
| `plan` | 플랜 모드 (읽기 전용 탐색) | |

## 모델 선택 순서 (4)
서브에이전트가 쓸 모델은 아래 순서로 **먼저 맞는 것**이 정해집니다.

| 순서 | 기준 | 비고 |
| :- | :- | :- |
| 1 | Claude가 호출할 때 넘기는 `model` 값 | 별칭만 가능: `sonnet`, `opus`, `haiku`, `fable` |
| 2 | 서브에이전트 정의의 `model` | `inherit`면 메인 대화의 모델 |
| 3 | 환경 변수 `CLAUDE_CODE_SUBAGENT_MODEL` | 별칭 또는 모델 ID |
| 4 | 메인 대화의 모델 | |

## 메모리 범위 (`memory`) (3)
| 값 | 저장 위치 | 언제 |
| :- | :- | :- |
| `user` | `~/.claude/agent-memory/<에이전트 이름>/` | 모든 프로젝트에서 배운 것을 기억해야 할 때 |
| `project` | `.claude/agent-memory/<에이전트 이름>/` | 프로젝트에 한정된 지식이고 **버전 관리로 공유**해도 될 때 |
| `local` | `.claude/agent-memory-local/<에이전트 이름>/` | 프로젝트 한정이지만 **버전 관리에 올리면 안 될** 때 |

## 호출하는 방법 (6)
| 방법 | 사용법 | 비고 |
| :- | :- | :- |
| 자동 위임 | 설정의 `description`에 맞는 일이면 Claude가 알아서 맡김 | `description`을 구체적으로 쓸수록 잘 맡김 |
| 말로 지정 | `Use the test-runner subagent to fix failing tests` | 특별한 문법 없이 이름을 말함. Claude가 맡길지 판단 |
| `@` 멘션 | `@"code-reviewer (agent)" look at the auth changes` | **이번 작업에 그 서브에이전트가 반드시 실행**되도록 보장. `@`를 치고 목록에서 고르거나 `@agent-<이름>`으로 직접 입력 |
| 세션 전체를 그 에이전트로 | `claude --agent code-reviewer` | 메인 대화가 그 서브에이전트의 도구 제한·모델을 가짐. 사용자 정의 서브에이전트의 프롬프트는 기본 시스템 프롬프트를 **통째로 대체**(프롬프트가 비어 있지 않을 때) |
| 세션 한정 정의 | `claude --agents '{ ... }'` | 저장하지 않고 이번 세션에만. 자세한 필드는 [CLI 레퍼런스](#/ref/cli-all)의 `--agents` |
| 플러그인 서브에이전트 | `@agent-my-plugin:code-reviewer` | `플러그인:이름` 형식의 이름 |

## 제한·끄는 방법 (6)
| 항목 | 설명 | 비고 |
| :- | :- | :- |
| 동시 실행 수 | 한 세션에서 **20개**가 실행 중이면 새 서브에이전트를 만들 때 `Concurrent subagent limit reached`로 실패 | 실행 수가 줄면 다시 가능 |
| 특정 서브에이전트 끄기 | 설정 `permissions.deny`에 `"Agent(Explore)"`, `"Agent(my-custom-agent)"` 추가 | 한 번만 쓰려면 `claude --disallowedTools "Agent(Explore)"` |
| 모든 위임 막기 | `permissions.deny`에 `Agent` 도구 자체를 추가 | |
| `Explore`·`Plan`만 끄기 | 환경 변수 `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS=1` | Claude가 파일을 직접 읽고 탐색 |
| 다른 서브에이전트를 부를 수 있는 에이전트 제한 | `claude --agent`로 실행되는 에이전트의 `tools`에 `Agent(worker, researcher)`처럼 허용 목록 지정 | 서브에이전트 정의 안에서 `Agent`를 나열하면 그 서브에이전트가 자기 서브에이전트를 만들 수 있게 됨 |
| 모든 서브에이전트에 텍스트 추가 | `-p` 실행에서 `--append-subagent-system-prompt` | [CLI 레퍼런스](#/ref/cli-all) 참고 |

## 서브에이전트에 붙이는 훅 (5)
| 훅 이벤트 | 일치 대상 | 시점 |
| :- | :- | :- |
| `PreToolUse` | 도구 이름 | 서브에이전트가 도구를 쓰기 전 |
| `PostToolUse` | 도구 이름 | 서브에이전트가 도구를 쓴 뒤 |
| `Stop` | (없음) | 서브에이전트가 끝날 때 (실행 중에는 `SubagentStop`으로 변환) |
| `SubagentStart` | 에이전트 종류 이름 | 서브에이전트가 시작할 때 (`settings.json`의 훅에서 사용) |
| `SubagentStop` | 에이전트 종류 이름 | 서브에이전트가 끝났을 때 (`settings.json`의 훅에서 사용) |

---

**출처:** [공식 문서 Create custom subagents](https://code.claude.com/docs/en/sub-agents) · 2026-11-14 기준 Claude Code 2.1.323 문서에서 골라 한국어로 정리했습니다. 이 표는 **자주 찾는 항목을 고른 것**이라 문서 전체를 다루지 않으며, 한국어 설명이 원문과 다르면 원문을 기준으로 하세요.
