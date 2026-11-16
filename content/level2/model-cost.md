# 모델 선택과 비용 확인

> 쉬운 일은 가볍게, 어려운 일은 강하게. **작업에 맞는 모델**을 쓰면 빠르고 쌉니다.

![모델 선택](assets/img/model-ladder.svg)

## 모델 바꾸기
```text
/model              # 선택기 열기
/model sonnet       # 바로 전환
```
```powershell
claude --model haiku    # 시작할 때 지정
```

선택기에서 **Enter**는 기본값으로 저장, **s**는 이번 세션에만 적용합니다.

## 사용 가능한 별칭
`sonnet` · `opus` · `haiku` · `opusplan`(계획은 opus, 실행은 sonnet) · `default`(계정 기본값으로 복귀)

## 노력도(effort)
같은 모델이라도 **얼마나 깊게 생각할지** 조절합니다.
```text
/effort          # 슬라이더
/effort high     # 직접 지정 (low · medium · high · xhigh · max)
```
- 모델마다 지원하는 범위가 다릅니다
- 프롬프트에 `ultrathink`를 넣으면 **그 한 번만** 더 깊게 추론합니다

## 사용량·비용 확인
`/usage` (별칭 `/cost`) — 세션 비용, 플랜 한도, 활동 통계

| 계정 | 보이는 것 |
|---|---|
| API(Console) | 세션 **총 비용** (추정치) |
| 구독(Pro·Max·Team 등) | 플랜 **사용량 막대**와 소비 분석 |

- "session limit", "weekly limit" 메시지는 **구독 한도**에 도달했다는 뜻입니다
- 모델별 한도 메시지가 뜨면 **다른 모델로 `/model` 전환** 후 계속할 수 있습니다

## 절약 공식
1. 기본은 **Sonnet**, 복잡한 설계에만 Opus
2. 주제 바뀌면 `/clear`
3. 단순 반복은 서브에이전트 + `haiku`

## 확인 체크
- [ ] `/model`로 현재 모델을 확인했다
- [ ] `/usage`를 실행해 봤다

## 자주 하는 실수
- 항상 가장 큰 모델로 **모든 작업** → 한도가 빨리 소진됩니다
- API 비용 숫자를 **청구액으로 착각** → 추정치이며, 구독자에게는 청구와 무관합니다
