# 기획 문서

- CineWave 상담 코파일럿 · 자동 응대를 **서비스 기획 산출물 양식**으로 정리한 문서 세트
- 작성 방식: 구현·운영 중인 서비스를 기준으로 역정리(as-built). 실제 작업 순서는 설계 문서([design.md](../design.md), [auto-response-design.md](../auto-response-design.md)) → 구현 → 평가였고, 이 폴더는 그 결과를 기획 문서 체계로 다시 묶은 것
- 수치·기준값은 코드(`src/config.ts`, `src/core/triage.ts`)와 평가 기록 기준. 문서와 코드가 다르면 코드가 기준
- 회사·요금·정책·고객 문의는 모두 가상 데이터

## 문서 구성

| 문서 | 답하는 질문 | 주 독자 |
|---|---|---|
| [01 PRD](01-prd.md) | 왜 만들고, 누구를 위해, 무엇을 성공으로 보나 | 의사결정자, 전체 팀 |
| [02 기능정의서](02-functional-spec.md) | 기능마다 입력·처리 규칙·출력·예외는 무엇인가 | 개발, QA |
| [03 IA · 서비스 플로우](03-ia-and-flows.md) | 화면은 어떻게 구성되고, 사용자는 어떤 경로로 움직이나 | 디자인, 개발 |
| [04 화면설계서](04-screen-spec.md) | 화면의 각 영역은 무엇을 보여 주고 어떻게 동작하나 | 디자인, 개발, QA |
| [05 정책정의서](05-policy.md) | 판단 기준·상태·제한값은 무엇이고 왜 그 값인가 | 운영, 개발, QA |

## 관련 문서

- 설계와 결정 이유: [design.md](../design.md), [auto-response-design.md](../auto-response-design.md), [model-selection.md](../model-selection.md)
- 운영하며 겪은 문제와 수정: [lessons.md](../lessons.md)
- MCP 연결: [mcp.md](../mcp.md)
