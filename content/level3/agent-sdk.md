# Agent SDK

> **Agent SDK**는 Claude Code의 **에이전트 엔진(도구·에이전트 루프·컨텍스트 관리)을 내 프로그램 안에 라이브러리로** 넣어 쓰게 해 줍니다. Python 또는 TypeScript 코드로 "파일을 읽고, 명령을 실행하고, 코드를 고치는" 에이전트를 만듭니다.

> 이 레슨은 **개발자용**입니다. Python이나 Node.js를 다룰 수 있어야 하고, **API 키**가 필요합니다. 코드를 쓰지 않고 스크립트에서 쓰려면 먼저 [헤드리스 모드](#/level3/headless)(`claude -p`)를 보세요.

## 무엇이 다른가: 무엇을 써야 할까
| 하고 싶은 일 | 쓸 것 | 특징 |
|---|---|---|
| **내 Python·TypeScript 앱 안에** Claude Code의 에이전트를 넣기 | **Agent SDK** | 기본 도구·권한·세션·훅을 가진 라이브러리. 내가 운영하는 프로세스에서 실행 |
| 터미널에서 대화하며 개발하거나 일회성 작업 | **Claude Code CLI** | 매일 쓰는 터미널 화면 |
| Claude API를 **직접** 호출 | **Client SDK** | 모든 지원 언어에서 API 접근. 도구 루프를 **직접** 만들거나 도구 실행기(tool runner) 사용 |
| **Anthropic이 에이전트를 호스팅** | **Managed Agents** | 관리형 클라우드 샌드박스에서 에이전트 루프를 실행 |

Python·TypeScript가 아닌 언어에서는 **CLI를 하위 프로세스로 실행**(`-p`와 `--output-format json`)하는 방법이 있습니다 ([헤드리스 모드](#/level3/headless)).

## SDK가 주는 기능
| 기능 | 하는 일 |
|---|---|
| **기본 도구** | 파일 읽기·쓰기·수정, 명령 실행, 웹 검색 |
| **훅** | 에이전트 수명 주기의 핵심 지점에서 내 코드 실행 ([훅](#/level3/hooks)) |
| **서브에이전트** | 좁은 하위 작업을 맡는 전문 에이전트 ([서브에이전트 심화](#/level3/subagents-advanced)) |
| **MCP** | 외부 도구·데이터 연결 ([MCP](#/level2/mcp)) |
| **권한** | 어떤 도구는 자동, 어떤 것은 승인 ([권한 규칙 심화](#/level3/permissions-deep)) |
| **세션** | 대화 맥락 유지, 나중에 이어서 하거나 갈라서 시도 |
| **스킬·명령·메모리** | 프로젝트의 `.claude\`와 `~\.claude\`에서 Claude Code처럼 자동 로드 ([스킬](#/level3/skills)) |
| **플러그인** | 스킬·에이전트·훅·MCP를 묶어 로컬 경로로 로드 ([플러그인](#/level3/plugins)) |

> **인증 주의:** 사전에 승인받지 않은 한, 제3자 개발자는 Agent SDK로 만든 제품에서 **claude.ai 로그인이나 요금 한도를 제공할 수 없습니다.** **API 키 인증**을 쓰세요.

## 준비물
- **Node.js 18.14 이상** 또는 **Python 3.10 이상**
- Anthropic 계정과 **API 키** ([Claude Console](https://platform.claude.com/)에서 발급)

> SDK는 **Claude Code 실행 파일을 함께 가지고** 있어 대부분의 설치에서 Claude Code를 따로 설치하지 않아도 됩니다. 예외: ARM64 Windows처럼 pip이 소스 배포본을 설치하는 경우, `npm ci --omit=optional`처럼 선택 의존성을 건너뛴 경우에는 Claude Code를 따로 설치해야 합니다.

## 첫 에이전트: 버그를 찾아 고치기 (퀵스타트)
**1. 폴더 만들기**
```powershell
mkdir my-agent
cd my-agent
```

**2. SDK 설치** — 하나를 고르세요.

*TypeScript*
```powershell
npm init -y
npm pkg set type=module
npm install @anthropic-ai/claude-agent-sdk
npm install --save-dev tsx
```
`"type": "module"`은 최상위 `await`를 쓰게 하고, `tsx`는 TypeScript 파일을 바로 실행합니다.

*Python (pip, Windows)*
```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install claude-agent-sdk
```
`py` 명령이 없다면 `python -m venv .venv`로 바꿔 쓰세요. PowerShell이 `Activate.ps1`을 실행정책 오류로 막으면 먼저 `Set-ExecutionPolicy -Scope Process RemoteSigned`를 실행하세요 (그 창에서만 적용).

**3. API 키 설정** — 에이전트를 실행할 **같은 창**에서
```powershell
$env:ANTHROPIC_API_KEY = "여기에-내-API-키"
```
SDK는 **`.env` 파일을 자동으로 읽지 않습니다.** `.env`에 키를 둔다면 `dotenv` 같은 도구로 직접 불러오세요. 키를 코드나 채팅에 **그대로 쓰지 마세요.**

**4. 버그가 든 파일 만들기** — `utils.py`
```python
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

def get_user_name(user):
    return user["name"].upper()
```
버그 두 개: 빈 리스트면 **0으로 나누기** 오류, `None`이면 **TypeError**.

**5. 에이전트 작성**

*Python — `agent.py`*
```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage

async def main():
    # 에이전트 루프: Claude가 일하는 동안 메시지가 흘러나옵니다
    async for message in query(
        prompt="utils.py에서 충돌을 일으킬 버그를 찾아 고쳐 줘.",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Edit", "Glob"],  # 이 도구는 자동 승인
            permission_mode="acceptEdits",           # 파일 수정도 자동 승인
        ),
    ):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):
                    print(block.text)              # Claude의 설명
                elif hasattr(block, "name"):
                    print(f"Tool: {block.name}")   # 호출한 도구
        elif isinstance(message, ResultMessage):
            print(f"Done: {message.subtype}")      # 최종 결과

asyncio.run(main())
```

*TypeScript — `agent.ts`*
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "utils.py에서 충돌을 일으킬 버그를 찾아 고쳐 줘.",
  options: {
    allowedTools: ["Read", "Edit", "Glob"], // 이 도구는 자동 승인
    permissionMode: "acceptEdits"           // 파일 수정도 자동 승인
  }
})) {
  if (message.type === "assistant" && message.message?.content) {
    for (const block of message.message.content) {
      if ("text" in block) console.log(block.text);            // Claude의 설명
      else if ("name" in block) console.log(`Tool: ${block.name}`); // 호출한 도구
    }
  } else if (message.type === "result") {
    console.log(`Done: ${message.subtype}`);                   // 최종 결과
  }
}
```

**6. 실행**
```powershell
npx tsx agent.ts          # TypeScript
python agent.py           # Python (가상환경이 켜진 상태)
```
도구 호출이 출력되다가 `Done: success`로 끝납니다. 열어 보면 `utils.py`에 빈 리스트와 `None`을 처리하는 코드가 들어갔습니다. 에이전트가 스스로 **파일을 읽고 → 문제를 분석하고 → 고쳤습니다.**

<details>
<summary>코드 읽는 법</summary>

| 부분 | 쉬운 설명 |
|---|---|
| **`query`** | 에이전트 루프를 시작하는 **진입점**. 비동기 반복자라 Claude가 일하는 동안 메시지가 하나씩 흘러나옵니다 (`async for` / `for await`) |
| **`prompt`** | Claude에게 시킬 일. 어떤 도구를 쓸지는 Claude가 정합니다 |
| **`options`** | 에이전트 설정. 여기서는 허용 도구와 권한 모드 |
| `allowed_tools` / `allowedTools` | **미리 승인**할 도구. (이 도구만 쓸 수 있게 **제한**하는 것이 아닙니다. 제한하려면 `tools`) |
| `permission_mode="acceptEdits"` | 파일 수정을 묻지 않고 승인 |
| `AssistantMessage` | Claude의 답(텍스트 한 조각이나 도구 호출 하나) |
| `ResultMessage` | **루프의 끝.** 최종 결과·비용·세션 ID |
| **메시지 필터링** | 걸러 내지 않으면 시스템 초기화·내부 상태까지 모두 보입니다. 디버깅에는 유용하지만 평소에는 소란스럽습니다 |

> TypeScript에서는 `AssistantMessage`가 원래 API 메시지를 `.message`로 감싸므로 내용은 `message.message.content`에 있습니다.

</details>

**다른 프롬프트로 시험해 보기:** "`utils.py`의 모든 함수에 독스트링을 달아 줘" / "타입 힌트를 달아 줘" / "`README.md`로 함수를 설명해 줘". `Bash`를 허용하면 "단위 테스트를 쓰고 실행해서 실패를 고쳐 줘"도 가능합니다.

**옵션 바꿔 보기**
```python
# 웹 검색 추가
options = ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Glob", "WebSearch"], permission_mode="acceptEdits")

# 시스템 프롬프트 지정
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Edit", "Glob"],
    permission_mode="acceptEdits",
    system_prompt="당신은 시니어 Python 개발자입니다. 항상 PEP 8 스타일을 따르세요.",
)

# 터미널 명령 실행 허용
options = ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Glob", "Bash"], permission_mode="acceptEdits")
```

## 핵심 개념: 도구와 권한
**도구**가 에이전트가 할 수 있는 일을 정합니다.
| 도구 묶음 | 할 수 있는 일 |
|---|---|
| `Read`, `Glob`, `Grep` | **읽기 전용** 분석 |
| `Read`, `Edit`, `Glob` | 분석 + **코드 수정** |
| `Read`, `Edit`, `Bash`, `Glob`, `Grep` | **전체 자동화** |

- 사용할 수 있는 내장 도구를 **제한**하려면 `tools`에 목록을 넘깁니다
- `allowedTools`에 적는 것은 **미리 승인**일 뿐이라 에이전트는 다른 도구도 (권한 규칙에 따라) 부를 수 있습니다

**권한 모드**가 사람의 감독 수준을 정합니다.
| 모드 | 동작 | 쓰는 곳 |
|---|---|---|
| `default` | 승인이 필요한 호출은 `canUseTool` 콜백으로 감. 콜백이 없으면 **거부** | 승인 화면을 직접 만드는 앱 |
| `acceptEdits` | 파일 수정과 `mkdir`·`touch`·`mv`·`cp`를 작업 폴더 안에서 자동 승인 | 개발 PC에서 코드 수정 |
| `plan` | 탐색·계획만. 수정은 콜백으로 | 큰 변경 전 계획 |
| `dontAsk` | 묻지 않음. 미리 허용한 것만 실행, 나머지는 **거부** | 잠가 둔 실행 |
| `auto` | 모델 분류기가 동작을 검토 | 안전장치가 있는 자율 에이전트 |
| `bypassPermissions` | 승인 없이 실행 | **CI·컨테이너 같은 격리 환경에서만** |

### 권한이 평가되는 순서 (SDK)
1. **훅** — 거부할 수 있음. 훅의 `allow`는 아래 deny·ask 규칙을 건너뛰지 못함
2. **deny 규칙** — 맞으면 거부 (`bypassPermissions`에서도, 콜백 호출 없이)
3. **ask 규칙** — 맞으면 콜백으로 (`bypassPermissions`에서도)
4. **권한 모드** 적용
5. **allow 규칙** — 맞으면 승인 (작업 폴더 안 읽기, 읽기 전용 명령은 규칙 없이도 통과)
6. **`canUseTool` 콜백** — 앞에서 결정되지 않은 호출을 내가 판단

`rm -rf ~` 같은 **중요 경로 삭제**는 allow 규칙으로 승인되지 않습니다.

## 에이전트 루프가 돌아가는 방식
모든 세션은 같은 순환을 따릅니다.
1. **프롬프트 받기** — Claude가 프롬프트, 시스템 프롬프트, 도구 정의, 대화 기록을 받음 (`SystemMessage`의 `init`)
2. **판단·응답** — 텍스트, 도구 호출 요청, 또는 둘 다 (`AssistantMessage`)
3. **도구 실행** — SDK가 도구를 실행하고 결과를 Claude에게 돌려줌 (이 사이에 훅으로 가로채기·수정·차단 가능)
4. **반복** — 도구 호출이 없는 응답이 나올 때까지
5. **결과 반환** — 최종 텍스트와 함께 비용·사용량·세션 ID가 든 `ResultMessage`

**턴(turn)** 은 이 순환을 한 번 도는 것입니다. 예: "auth.ts의 실패하는 테스트를 고쳐 줘"는
- 턴 1: `npm test` 실행(3개 실패) → 턴 2: 파일 읽기 → 턴 3: 수정하고 테스트 재실행(통과) → 마지막 턴: 텍스트로 보고

### 메시지 종류
| 종류 | 설명 |
|---|---|
| `SystemMessage` | 세션 생명 주기 (`init`, `compact_boundary` 등) |
| `AssistantMessage` | Claude 응답의 내용 조각마다 하나 |
| `UserMessage` | 도구 실행 뒤 Claude에게 돌려주는 결과 |
| `StreamEvent` | **부분 메시지**를 켰을 때만. 글자 단위 실시간 스트리밍 |
| `ResultMessage` | **루프의 끝.** 결과·비용·사용량·세션 ID |

- **최종 결과만** 필요하면 `ResultMessage`만 처리
- **진행 상황**은 `AssistantMessage`
- **실시간 스트리밍**은 `include_partial_messages`(Python) / `includePartialMessages`(TypeScript)
- `ResultMessage` 뒤에도 몇몇 마무리 이벤트가 올 수 있으니 **스트림을 끝까지 반복**하세요

### 실행을 통제하는 옵션
| 옵션 | 설명 | 기본 |
|---|---|---|
| `max_turns` / `maxTurns` | 최대 턴 수 (도구 호출 턴 + 마지막 응답 턴 1) | 제한 없음 |
| `max_budget_usd` / `maxBudgetUsd` | 예상 비용이 이 값에 닿으면 중단. **서브에이전트 비용도 포함** | 제한 없음 |
| `effort` | 추론 깊이 `low` `medium` `high` `xhigh` `max` | Claude Code가 결정 |
| `permission_mode` / `permissionMode` | 승인 방식 | `default` |
| `model` | 사용할 모델 | |

> **운영용 에이전트는 예산과 턴 제한을 두는 것이 좋은 기본값**입니다. 제한이 없으면 "코드베이스를 개선해 줘" 같은 열린 요청은 오래 달릴 수 있습니다. 제한에 닿은 응답은 이미 완료되었으므로 `total_cost_usd`에 **조금 넘게** 잡힐 수 있습니다.

### 결과 확인하기
`ResultMessage`의 **`subtype`** 으로 어떻게 끝났는지 확인합니다.
| subtype | 의미 | `result` 사용 가능 |
|---|---|---|
| `success` | 정상 완료 | 예 |
| `error_max_turns` | 턴 한도 도달 | 아니오 |
| `error_max_budget_usd` | 예산 한도 도달 | 아니오 |
| `error_during_execution` | 도중 오류 (요청 취소 등) | 아니오 |
| `error_max_structured_output_retries` | 구조화 출력을 만들지 못함 | 아니오 |

- **`result`는 `success`일 때만** 있으니 **먼저 subtype을 확인**하세요
- 모든 결과에 `total_cost_usd`, `usage`, `num_turns`, `session_id`가 있습니다 (Python에서는 `None`일 수 있어 확인 필요)
- 오류로 끝나면 단발 `query()`는 **마지막 결과를 내보낸 뒤 예외를 발생**시킵니다. 계속 진행해야 하면 `try`로 감싸세요
- `usage`는 **메인 루프**만 집계합니다. 서브에이전트까지 포함한 전체는 `modelUsage`(`model_usage`)

## 세션
**세션**은 에이전트가 일하는 동안 쌓이는 **대화 기록**(프롬프트, 도구 호출, 결과, 응답)이며 SDK가 **디스크에 자동 저장**합니다. 이어서 질문하거나 중단에서 복구하거나 다른 접근을 갈라서 시도할 수 있습니다. (세션은 **대화**를 저장할 뿐 파일 변경을 되돌리지는 않습니다. 파일은 **파일 체크포인트** 기능을 쓰세요.)

| 만드는 것 | 쓸 것 |
|---|---|
| 한 번 시키고 끝 | 추가 처리 없음 (`query()` 한 번) |
| 한 프로세스 안의 여러 턴 대화 | Python `ClaudeSDKClient` / TypeScript `continue: true` |
| 프로세스를 다시 켠 뒤 이어서 | `continue_conversation=True` / `continue: true` (그 폴더의 **가장 최근** 세션) |
| **특정** 과거 세션 | 세션 ID를 잡아 `resume`에 전달 |
| 원본을 두고 **다른 방법** 시도 | **포크(fork)** — 원본의 기록을 복사한 새 세션 |
| 디스크에 남기고 싶지 않음 | `persistSession: false` (TypeScript) |

## 나만의 도구 만들기
**커스텀 도구**로 내 함수·API·DB를 Claude가 부르게 할 수 있습니다. SDK 안의 **프로세스 내 MCP 서버**를 씁니다. 도구는 네 부분입니다.
- **이름**: Claude가 부르는 고유 식별자
- **설명**: 언제 쓸지 Claude가 판단하는 근거
- **입력 스키마**: TypeScript는 Zod, Python은 `{"latitude": float}` 같은 딕셔너리
- **핸들러**: 호출될 때 실행되는 비동기 함수. `content`(결과 조각 배열), 선택적으로 `structuredContent`, `isError`를 반환

`create_sdk_mcp_server`(Python) / `createSdkMcpServer`(TypeScript)로 서버를 만들어 `query()`의 `mcpServers`에 넘기고, 허용 목록에도 추가합니다. 부작용이 없는 도구에는 `readOnlyHint: true`를 달면 Claude가 **병렬 호출**할 수 있습니다. 실패는 `isError: true`로 알려 주면 Claude가 대응합니다. 자세한 코드는 공식 문서를 보세요.

## 운영할 때 알아 둘 것
- **비용**: 에이전트는 도구를 여러 번 부르며 토큰을 씁니다. `max_budget_usd`·`max_turns`를 두고 `total_cost_usd`를 기록하세요
- **권한**: 사용자 입력이 에이전트에 닿는다면 `bypassPermissions`를 피하고 `tools`로 도구를 **좁게** 주세요
- **설정 로드**: SDK는 Claude Code처럼 프로젝트 설정·스킬·메모리를 불러올 수 있습니다. 남의 저장소를 다룰 때는 무엇이 로드되는지 확인하세요 ([권한 규칙 심화](#/level3/permissions-deep)의 "폴더 신뢰")
- **관리형 설정**: SDK 세션도 `settingSources`가 사용자·프로젝트·로컬을 제외해도 **관리형 설정은 로드**합니다 ([팀·조직 설정](#/level3/managed-settings))
- **인증 오류**(`Not logged in`, `Invalid API key`): `ANTHROPIC_API_KEY`가 **에이전트를 실행하는 같은 셸**에 설정됐는지 확인
- **배포**: Docker·클라우드·CI/CD 호스팅 방법은 공식 문서의 호스팅 페이지

## 확인 체크
- [ ] 폴더를 만들고 SDK를 설치했다
- [ ] `$env:ANTHROPIC_API_KEY`를 설정했다 (키는 코드에 쓰지 않았다)
- [ ] 퀵스타트 에이전트를 실행하고 `Done: success`를 확인했다
- [ ] `max_turns`나 `max_budget_usd`를 넣어 보고 `ResultMessage`의 `subtype`을 출력했다

## 자주 하는 실수
- `allowed_tools`를 **제한**으로 오해 → 미리 승인일 뿐입니다. 제한은 `tools`
- `result`를 **`subtype` 확인 없이** 읽음 → `success`가 아니면 없습니다
- **예산·턴 제한 없이** 열린 요청을 시킴 → 오래 달리고 비용이 커집니다
- `.env`에 둔 키가 **자동으로 읽힌다고** 생각함 → 직접 불러와야 합니다
- 사용자 입력을 받는 앱에서 **`bypassPermissions`** → 격리된 환경에서만
- `ResultMessage`에서 **스트림을 끊음** → 뒤따르는 이벤트를 놓칩니다. 끝까지 반복하세요
- 구독 로그인(claude.ai)을 **제품에 제공**하려 함 → 허용되지 않습니다. API 키 인증 사용

## 더 알아보기
- [공식 Agent SDK 개요](https://code.claude.com/docs/ko/agent-sdk/overview) · [퀵스타트](https://code.claude.com/docs/ko/agent-sdk/quickstart) · [에이전트 루프](https://code.claude.com/docs/ko/agent-sdk/agent-loop)
- 권한·훅·세션·MCP·호스팅·비용 추적 등은 공식 문서의 Agent SDK 항목
- [예제 에이전트 모음](https://github.com/anthropics/claude-agent-sdk-demos)
- 명령줄에서 같은 일을: [헤드리스 모드](#/level3/headless)
