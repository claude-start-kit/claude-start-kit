# 모델·노력도 설정 심화

> 2단계에서 `/model`로 모델을 고르는 법을 배웠습니다. 이번에는 **모델을 정하는 여러 방법의 우선순위**, **노력도(effort)**, **확장 컨텍스트**, **자동 압축**, **대체 모델(fallback)** 을 다룹니다. 먼저 [모델 고르기](#/level2/model-choice)와 [모델 선택과 비용 확인](#/level2/model-cost)을 읽고 오세요.

> **이 문서의 모델 이름·버전·기본값은 자주 바뀝니다.** 아래 내용은 공식 문서의 현재 내용을 정리한 것이므로 내 환경과 다를 수 있습니다. 내 환경에서 지금 무엇이 적용 중인지는 `/model`, `/status`로 확인하세요.

## 모델은 어떻게 지정하나
`model` 설정에는 **별칭(alias)** 이나 **모델 이름**을 쓸 수 있습니다. (Anthropic API는 전체 모델 이름, Amazon Bedrock은 추론 프로파일 ARN, Microsoft Foundry는 배포 이름, Google Cloud는 버전 이름)

### 별칭
| 별칭 | 동작 |
|---|---|
| **`default`** | 모델 지정을 **지우고** 내 계정의 기본값으로 돌아감 (별칭이라기보다 특수 값) |
| **`best`** | `opus`와 같은 모델 |
| **`fable`** | 가장 어렵고 오래 걸리는 작업용 **Fable 모델** |
| **`sonnet`** | 일상 코딩용 최신 Sonnet |
| **`opus`** | 복잡한 추론용 최신 Opus |
| **`haiku`** | 빠르고 효율적인 Haiku. 간단한 작업용 |
| **`sonnet[1m]`**, **`opus[1m]`** | **100만 토큰** 컨텍스트 창 (이미 기본이 100만인 모델에는 효과 없음) |
| **`opusplan`** | **플랜 모드에서는 `opus`, 실행에서는 `sonnet`** 을 자동 전환 |

- **별칭은 시간이 지나며 권장 버전으로 바뀝니다.** 특정 버전에 **고정**하려면 전체 모델 이름(예: `claude-opus-5-5`)이나 `ANTHROPIC_DEFAULT_OPUS_MODEL` 같은 환경 변수를 쓰세요
- 공급자에 따라 같은 별칭이 **다른 버전**을 가리킵니다 (Anthropic API가 가장 최신, Bedrock·Google Cloud·Foundry는 더 이전 버전일 수 있음). 최신 모델을 쓰려면 전체 모델 이름을 지정하거나 환경 변수로 고정하세요
- 최신 모델은 **최소 Claude Code 버전**이 필요합니다. 오래된 버전에서 실패하면 `claude update`

### `default`는 무엇인가
계정 종류에 따라 다릅니다. 공식 문서 기준으로 Pro·Max·Ultra·Team·Enterprise와 Anthropic API는 **Opus 5.5**, Microsoft Foundry는 **Sonnet 4.5**입니다. 관리자가 **조직 기본 모델**을 정했다면 그 모델이 우선합니다. **Fable 모델은 어느 플랜에서도 기본이 아니고** 직접 골라야 합니다.

### 지정하는 곳과 우선순위
**위쪽이 우선**합니다.
| 순위 | 방법 | 설명 |
|---|---|---|
| 1 | **세션 중** `/model <별칭\|이름>` | 바로 전환. 인자 없이 `/model`이면 선택기 |
| 2 | **시작할 때** `claude --model <별칭\|이름>` | 그 세션만 |
| 3 | **환경 변수** `ANTHROPIC_MODEL` | 그 세션만 |
| 4 | **설정 파일**의 `model` | 영구 |
| 5 | **새 세션 기본값** `ANTHROPIC_DEFAULT_MODEL` | 위 어느 것도 없을 때만 |

```powershell
claude --model opus
```
```text
/model sonnet
```

**`/model`은 선택을 기본값으로 저장합니다** (사용자 설정의 `model`). 선택기에서:
- `Enter` — 전환하고 **기본값으로 저장**
- `s` — **이번 세션만** 전환 (기본값은 그대로)

`/model 이름`을 직접 입력하면 `Enter`처럼 저장합니다. 이번 세션만 바꾸려면 `/model`로 선택기를 열어 `s`를 누르세요. `--model`·`ANTHROPIC_MODEL`은 **그 세션에만** 적용되므로, 터미널마다 **다른 모델**을 쓰려면 각각 `--model`로 시작하세요.

설정 파일 예:
```json
{
  "model": "opus"
}
```

- `-p`(헤드리스)에서 `/model`로 바꾼 값은 **그 세션에만** 적용되고 저장되지 않습니다
- `/model`로 바꾸면 **메인 대화의 모델을 물려받는 서브에이전트**도 바뀝니다. 연구·테스트를 맡기기 전에 Opus로 바꾸면 그 작업도 Opus로 돕니다 ([서브에이전트 심화](#/level3/subagents-advanced))
- **모델 이름을 잘못 써도** 시작할 때는 거부되지 않고 **첫 요청에서 오류**가 납니다. 이름이 비슷하면 "혹시 ○○인가요?" 경고가 나옵니다
- 프로젝트나 관리형 설정이 모델을 정한 경우 **시작 화면에 어느 파일이 정했는지** 나옵니다. `/model`로 바꿔도 새 세션에서는 다시 그 설정이 적용됩니다

### 이어 한 세션은 어떤 모델로?
`claude --resume`·`--continue`로 이어 가면 **저장된 모델**을 유지합니다. 단, 별칭 변수를 설정했거나, 저장된 모델이 퇴역했거나 `availableModels`에서 제외됐거나, 공급자가 자체 배포 ID를 쓰거나(Bedrock·Google Cloud·Foundry), `model` 설정이 `haiku`·`opusplan`일 때는 우선순위 규칙을 따릅니다. 원하는 모델로 이어 가려면 `--model`이나 `ANTHROPIC_MODEL`을 쓰세요.

### 환경 변수로 별칭 고정하기
| 변수 | 설명 |
|---|---|
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | `opus` 별칭이 가리킬 모델 ID. `opusplan`의 플랜 모드에도 사용 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `sonnet` 별칭이 가리킬 모델. `opusplan`의 실행 단계에도 사용 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `haiku` 별칭이 가리킬 모델. **백그라운드 기능**에도 사용 |
| `ANTHROPIC_DEFAULT_FABLE_MODEL` | `fable` 별칭이 가리킬 모델 |
| `ANTHROPIC_DEFAULT_MODEL` | 새 세션의 기본 모델 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 서브에이전트·팀원·워크플로 에이전트의 기본 모델 |

더 많은 변수는 [환경 변수와 키 바인딩](#/level3/env-keybindings)에 있습니다.

### 커스텀 모델 항목 추가
`ANTHROPIC_CUSTOM_MODEL_OPTION`으로 `/model` 선택기에 **항목 하나**를 추가할 수 있습니다 (게이트웨이 배포, 시험용 모델 ID). 이름과 설명은 `…_NAME`, `…_DESCRIPTION` 변수로 정합니다. 모델 ID는 **검증 없이** 그대로 사용되고, `availableModels`가 설정돼 있으면 목록에도 추가해야 합니다. 여러 모델을 내 순서·이름으로 보이려면 `modelPicker` 설정을 쓰세요.

## `opusplan`: 계획은 Opus, 실행은 Sonnet
| 단계 | 모델 |
|---|---|
| **플랜 모드** | `opus` — 복잡한 추론과 설계 |
| **실행 모드** | `sonnet` — 코드 생성과 구현 |

Opus의 추론력과 Sonnet의 효율을 함께 얻습니다. ([플랜 모드](#/level2/plan-mode)) 100만 컨텍스트가 필요하면 `opusplan[1m]`을 씁니다. Claude가 작업 도중 스스로 두 번째 모델에게 자문하게 하는 방식은 공식 문서의 **advisor** 도구를 참고하세요.

## Fable 모델
**Fable**은 Claude Code에서 가장 능력이 높은 모델로, **한 번에 끝나지 않는 큰 작업**에 어울립니다. 긴 자율 세션을 이어 가고, 행동하기 전에 조사하고, 작은 모델보다 자주 결과를 **검증**합니다. 기본값이 아니므로 직접 고릅니다.

```text
/model fable
```
```powershell
claude --model fable
```

**잘 쓰는 법**
- **단계가 아니라 결과를 설명**하세요. 원하는 결과를 주고 경로는 맡깁니다
- **모호한 문제**에 쓰세요. 근본 원인 조사, 장애 디버깅, 아키텍처 결정에서 추가 조사·검증이 값을 합니다
- **검증 알림을 생략**하세요. 스스로 검증하므로 "테스트해 봐" 같은 알림은 대체로 필요 없습니다

> 사이버 보안·생물학 같은 분야에서 안전 분류기가 요청을 표시하면 **자동 모델 대체**가 일어납니다 (아래).

## 노력도(effort)
**노력도**는 모델이 **얼마나 깊이 생각할지**를 정합니다. 낮으면 빠르고 저렴하고, 높으면 어려운 문제에 깊은 추론을 합니다.

### 단계
| 모델 | 지원 단계 |
|---|---|
| Fable 모델, Opus 5.5, Sonnet 5.5, Haiku 5.5, Opus 5, Sonnet 5, Opus 4.8, Opus 4.7 | `low` `medium` `high` `xhigh` `max` |
| Opus 4.6, Sonnet 4.6 | `low` `medium` `high` `max` |

모델이 지원하지 않는 단계를 지정하면 **그 아래에서 가장 높은 지원 단계**로 대체됩니다. (예: Opus 4.6에서 `xhigh`는 `high`로 실행)

| 단계 | 언제 |
|---|---|
| `low` | 결과를 일일이 확인하는 **짧은 대화**: 브레인스토밍, 초안, 이름 바꾸기 같은 작은 변경 |
| `medium` | 범위가 분명한 **일상 개발**(새 기능 구현). 최신 모델들의 **기본값** |
| `high` | 검증이 중요하거나 **경계 사례**가 많은 일: 기존 코드베이스의 버그 수정 |
| `xhigh` | 더 깊은 추론, 더 많은 토큰 |
| `max` | Claude가 **혼자 끝까지 파고들어야** 하는 어려운 문제(보안 취약점 찾기). **과한 사고**로 수확 체감이 날 수 있으니 널리 쓰기 전에 시험 |

- **단계 이름이 모델마다 같은 값을 뜻하지 않습니다.** 모델별로 보정됩니다
- 높은 단계에서는 더 많은 경계 사례를 시험하고 더 많이 검증하며 **더 많은 판단을 스스로** 합니다. 낮은 단계는 **시작점을 빨리** 돌려줘서 내가 일일이 보고 조정하는 일에 맞습니다
- **Opus 5.5는 기본이 `medium`**(Opus 5는 `high`)입니다. 공식 설명에 따르면 Opus 5.5의 `medium`이 Opus 5의 `high`와 비슷하거나 더 낫습니다. 모델을 바꿀 때 이전 단계를 그대로 가져가지 말고 `medium`에서 시작하세요

### 어떻게 정하나 (우선순위)
**먼저 맞는 것**이 적용됩니다.
1. 환경 변수 `CLAUDE_CODE_EFFORT_LEVEL`
2. 세션에서 고른 단계 (`/effort`, `/model` 선택기)
3. 시작할 때 `--effort`
4. 설정 파일에 저장한 단계 (모델별 `modelSettings`, 또는 `effortLevel`)
5. 모델의 기본 단계 (조직이 정했다면 그 값)

### 바꾸는 방법
| 방법 | 설명 |
|---|---|
| **`/effort`** | 인자 없이 → 슬라이더. `/effort high`처럼 직접 지정. `/effort auto`는 이 모델에 저장한 값을 지움 |
| **`/model`** | 모델을 고르면서 **좌우 화살표**로 슬라이더 조정 |
| `--effort` 플래그 | 이번 세션만 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 모든 방법보다 **우선** |
| 설정 | 모델별 `modelSettings`, 또는 `effortLevel`(`low`·`medium`·`high`·`xhigh`) |
| 스킬·서브에이전트 frontmatter | `effort`로 **그 스킬·서브에이전트가 실행될 때만** 덮어씀 |

- 슬라이더에서 `Enter`는 **저장**, `s`는 **이번 세션만**입니다
- 저장은 **모델별**입니다. 각 모델이 자기 단계를 기억합니다
- `max`는 `CLAUDE_CODE_EFFORT_LEVEL`로 지정하지 않는 한 **그 세션에만** 적용되고, `modelSettings`·`effortLevel`에는 **저장할 수 없습니다**
- 바꾼 뒤 **다음 메시지부터** 새 단계로 실행됩니다. 작업 중이라면 `keep going` 같은 메시지를 `Enter`로 대기열에 넣으면 작업이 끝난 도구 호출 뒤에 반영됩니다
- 현재 상태는 `/effort status`로 확인합니다
- 조직이나 내 설정의 `maxEffortLevel`이 **상한**이 됩니다

### `ultrathink`: 한 번만 깊게
프롬프트 **어디에나** `ultrathink`를 넣으면 **그 턴만** 더 깊이 추론하도록 요청합니다 (세션의 노력도 설정은 그대로). 터미널 프롬프트에서 이 단어가 **무지개색**으로 보이면 그 턴이 `xhigh`로 올라가는 것입니다. `think`, `think hard` 같은 다른 표현은 키워드가 아니라 **일반 글**로 취급됩니다. 끄려면 `CLAUDE_CODE_DISABLE_ULTRATHINK=1`.

### Ultracode
`/effort` 슬라이더에는 **Ultracode** 스위치가 있습니다. 노력도 **단계가 아니라 Claude Code의 설정**으로, 켜면 Claude가 의미 있는 작업을 **동적 워크플로**로 계획해 실행합니다. `/effort ultracode`로 켜고 `/effort ultracode off`로 끕니다. `claude --effort ultracode`로 시작하면 `xhigh`로 시작합니다. 워크플로가 꺼져 있거나 모델이 `xhigh`를 지원하지 않으면 쓸 수 없습니다.

### 노력도를 보내지 않기
Claude Code가 아무 단계도 보내지 않게 하면 **API의 기본값**이 적용됩니다. `CLAUDE_CODE_EFFORT_LEVEL`을 `auto`나 `unset`으로 두세요.
```powershell
$env:CLAUDE_CODE_EFFORT_LEVEL = "auto"
claude
```
`/effort status`가 `Effort level: auto`면 아무 단계도 보내지 않는 상태입니다.

## 확장 사고(extended thinking)
모델이 답하기 전에 **생각하는 과정**입니다. `MAX_THINKING_TOKENS`로 고정 토큰 예산을 정합니다 (최소 1,024이고 요청의 최대 출력 토큰보다 1 작게 제한). 최신 모델에는 **적응형 추론**이 있어 **모델이 단계마다 얼마나 생각할지 스스로 정합니다.** 이 경우 일반적으로 노력도로 조절합니다.

## 확장 컨텍스트(100만 토큰)
큰 코드베이스를 오래 다룰 때 **100만 토큰 컨텍스트 창**을 쓸 수 있습니다.
- **Fable 모델, Sonnet 5 이상, Haiku 5.5, Opus 4.7 이상**은 100만 창이 **기본**이라 `[1m]`이 필요 없습니다
- **Opus 4.6·Sonnet 4.6**은 `[1m]` 변형으로만 100만에 닿고, 사용 가능 여부는 **플랜**에 따릅니다 (Max·Ultra·Team·Enterprise는 Opus 4.6이 구독에 포함, 그 외는 추가 사용량 크레딧이 필요할 수 있음)
```text
/model opus[1m]
/model claude-sonnet-4-6[1m]
```
- Anthropic API에서는 100만 창도 **표준 요금**(200K 초과 할증 없음). 단 **Haiku 5.5는 프롬프트가 100K를 넘으면** 토큰당 비용이 더 듭니다
- **100만 창을 끄려면** `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`. 이 경우 세션은 200K 경계에서 **자동 압축**되고, 자동 압축을 끄면 한계에서 **오류**로 멈춥니다
- **LLM 게이트웨이**(`ANTHROPIC_BASE_URL`)가 200K를 넘는 요청을 거절한다면 `CLAUDE_CODE_AUTO_COMPACT_WINDOW=200000`을 설정하세요. Claude Code는 게이트웨이의 하위 제한을 **알 수 없습니다**

## 컨텍스트 창과 자동 압축
**자동 압축 창**은 컨텍스트가 **얼마나 찼을 때** 대화를 압축할지입니다. ([컨텍스트와 토큰](#/level2/context-tokens))

| 설정 방법 | 범위 |
|---|---|
| **`/autocompact 500k`** | **현재 모델**, 이번과 이후 세션 (사용자 설정의 모델별 `modelSettings`에 저장) |
| `autoCompactWindow` (설정 파일) | **모든 모델** (`"autoCompactWindow": 200000`). 단 `/autocompact`로 저장한 값이 그 모델에서는 우선 |
| `--autocompact` 플래그 | **이번 실행만** |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | 스크립트·클라우드 환경. **명령·플래그·설정보다 우선** |
| 서브에이전트 | `autoCompactWindow` frontmatter ([서브에이전트 심화](#/level3/subagents-advanced)) |

- 값 형식: `200000` 같은 토큰 수, `500k`·`1M` 같은 접미사, 100~1000 사이 숫자(천 단위, `200` = 200,000)
- **100K 토큰 이상**이어야 하고, 모델의 컨텍스트 창보다 크게 정해도 **창 크기로 제한**됩니다
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`(1~100)는 압축을 **더 일찍** 시작하게만 할 수 있습니다
- 자동 압축을 끄려면 `DISABLE_AUTO_COMPACT=1` (`/compact`는 계속 가능)

## 장애에 대비한 대체 모델
### 대체 모델 체인(availability fallback)
주 모델이 **과부하이거나 사용할 수 없거나** 재시도할 수 없는 서버 오류를 낼 때 **다음 모델**로 넘어갑니다. 인증·결제·속도 제한·요청 크기 오류는 대체하지 않습니다.
```powershell
claude --fallback-model sonnet,haiku
```
설정 파일에 영구로:
```json
{
  "fallbackModel": ["claude-sonnet-5", "claude-haiku-5-5"]
}
```
- 순서대로 시도하며 **최대 3개**(중복 제거 후)
- 전환은 **그 턴에만** 적용됩니다. 다음 메시지는 다시 주 모델부터
- 대체가 일어나기 전에는 **`/status`에 표시되지 않으며** 시작할 때 확인도 하지 않습니다. 전환 알림이 처음 보이는 신호입니다
- `availableModels`에서 허용되지 않은 항목, 압축할 때 **컨텍스트 창이 더 작은** 모델은 제외됩니다
- `--fallback-model`이 `fallbackModel` 설정보다 우선합니다. 서브에이전트에도 적용됩니다

### 자동 모델 대체(content fallback)
Fable 모델, Opus 5.5, Sonnet 5.5, Opus 5는 **안전 분류기**로 요청을 검사합니다. 주로 사이버 보안·생물학 내용에서 표시되면 다른 모델로 **다시 실행**합니다. 대체 모델은 어떤 모델이 거절했느냐에 따라 다릅니다.
- 알림이 대화 기록에 표시됩니다. **먼저 물어보게** 할 수도 있습니다
- 대체 뒤에는 **그 모델로 계속**됩니다. 원래 모델로 돌아가려면 `/model`
- 대체되는 동안 **노력도는 유지**됩니다
- 대체 모델이 `availableModels`에서 막혀 있으면 대체되지 않고 **일반 오류**로 표시됩니다
- 세션의 **첫 요청**에서도 대체가 일어날 수 있습니다. 첫 요청에 `CLAUDE.md`와 git 상태가 함께 가기 때문에 **보안·생물학 자료가 든 저장소**는 그 맥락만으로도 분류기에 걸릴 수 있습니다

## 조직이 모델을 제한할 때
관리자는 관리형 설정으로 모델을 제한할 수 있습니다 ([팀·조직 설정](#/level3/managed-settings)).
| 설정 | 효과 |
|---|---|
| `availableModels` | **고를 수 있는 모델 허용 목록**. 목록에 없으면 선택기에서 빠지고 `--model`로도 거부됨 |
| 조직 기본 모델 | `default`가 가리킬 모델 |
| 조직 노력도 제한 | 모델별 노력도 상한 |
| `enforceAvailableModels` | 기본(Default) 모델에도 허용 목록 강제 |

- 관리형 `model`은 **기본값**일 뿐 잠금이 아닙니다. `--model`과 `ANTHROPIC_MODEL`로 바꿀 수 있으므로 선택을 막으려면 `availableModels`를 쓰세요
- `availableModels`가 설정돼 있을 때 커스텀 모델 ID도 **목록에 넣어야** 선택할 수 있습니다

## 확인하기
```text
/model          # 선택기와 현재 모델
/status         # 계정 정보와 모델
/effort status  # 노력도 상태
```
[상태줄](#/level2/statusline)을 설정했다면 거기에도 모델이 표시됩니다.

## 확인 체크
- [ ] `/model`에서 `Enter`와 `s`의 차이(저장 vs 이번 세션만)를 안다
- [ ] 모델 지정의 우선순위(`/model` > `--model` > `ANTHROPIC_MODEL` > 설정 파일)를 설명할 수 있다
- [ ] `/effort`로 노력도를 바꾸고 `/effort status`로 확인했다
- [ ] `opusplan`이 하는 일을 안다
- [ ] 자동 압축 창을 `/autocompact`나 `autoCompactWindow`로 정할 수 있다

## 자주 하는 실수
- `/model 이름`으로 바꿨는데 **기본값이 저장되는 줄 몰랐다**가, 다음 세션에서 같은 모델이 나와 놀람 → 이번만 바꾸려면 선택기에서 `s`
- 환경 변수 `ANTHROPIC_MODEL`을 **설정해 둔 채** `/model` 저장값을 기대 → 다음 실행에서는 그 변수의 모델로 돌아갑니다
- 노력도를 **항상 `max`** 로 둠 → 토큰을 많이 쓰고 과하게 생각할 수 있습니다. 필요한 작업에만
- 모델을 바꿀 때 **이전 노력도를 그대로** 가져감 → 모델마다 단계 보정이 다릅니다
- `fallbackModel`이 **설정돼 있는지 확인할 수 없다**고 놀람 → `/status`에 표시되지 않습니다
- **`availableModels` 없이** 관리형 `model`만 두고 선택이 막혔다고 믿음 → 플래그·변수로 바꿀 수 있습니다
- 문서에 있는 **모델 이름을 그대로 외움** → 이 문서의 이름·버전·기본값은 바뀝니다. `/model`로 확인하세요

## 더 알아보기
- [공식 모델 설정 문서](https://code.claude.com/docs/ko/model-config)
- 비용: [모델 선택과 비용 확인](#/level2/model-cost), 컨텍스트: [컨텍스트와 토큰](#/level2/context-tokens)
- 환경 변수: [환경 변수와 키 바인딩](#/level3/env-keybindings), 조직 제한: [팀·조직 설정](#/level3/managed-settings)
