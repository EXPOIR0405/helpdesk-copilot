# MCP 서버

- 시네웨이브 헬프데스크를 **MCP 도구**로 공개: Claude Desktop · Claude Code · Claude.ai 커스텀 커넥터 등에서 정책 질문, 문의함 처리, 운영 현황 조회
- 코드: [`src/mcp/server.ts`](../src/mcp/server.ts) (도구 정의), [`src/mcp/stdio.ts`](../src/mcp/stdio.ts) (로컬), `/api/mcp` (원격)

## 도구

| 도구 | 하는 일 | 성격 |
|---|---|---|
| `ask_policy` | 정책 질문 → 상태(확정·준비 중·근거 없음)·답변·인용 근거·확신도·answerId | 읽기 |
| `draft_customer_reply` | answerId로 고객 답장 초안, 근거 밖 숫자 경고 | 읽기 (초안만) |
| `list_policy_docs` | 정책 문서 목록 + 섹션 이름 | 읽기 |
| `get_policy_doc` | 정책 문서 원문, 섹션 하나만도 | 읽기 |
| `list_tickets` | 문의함 (상담원 대기 · 자동 응답 · 처리 완료) | 읽기 |
| `get_ticket` | 문의 한 건의 맥락: 넘김 사유, AI 판단, 가까운 문서, 비슷한 과거 처리, 초안, 기록 | 읽기 |
| `reply_to_ticket` | 대기 문의에 답장하고 종결 | **되돌릴 수 없음** (`destructiveHint`) |
| `get_ops_report` | 품질 지표, 오늘 비용·예산, 7일 호출·대체·실패, 자동 응대 현황, 보강할 문서 | 읽기 |

- 리소스: `policy://<문서 id>` — 정책 문서 원문을 클라이언트에서 직접 첨부
- 서버 안내문(instructions): "status가 answered가 아니면 추측해서 보완하지 말 것", "reply_to_ticket은 사용자 확인 후에만"

## 연결

### 로컬 (stdio) — Claude Code

```bash
claude mcp add cinewave-helpdesk -- node /절대경로/helpdesk-copilot/src/mcp/stdio.ts
```

### 로컬 (stdio) — Claude Desktop

`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cinewave-helpdesk": {
      "command": "node",
      "args": ["C:/절대경로/helpdesk-copilot/src/mcp/stdio.ts"],
      "env": { "HELPDESK_API_URL": "https://helpdesk-copilot.vercel.app" }
    }
  }
}
```

- Node 22.18 이상 (`.ts`를 그대로 실행), 저장소에서 `npm install` 한 번
- `HELPDESK_API_URL`로 대상 변경 (로컬 개발 서버면 `http://localhost:3000`). 생략하면 공개 데모
- 로컬에 모델 API 키가 필요 없음: 배포된 API를 부름

### 원격 (Streamable HTTP)

- 주소: `https://helpdesk-copilot.vercel.app/api/mcp`
- Claude.ai → 설정 → 커넥터 → 커스텀 커넥터 추가에 이 주소
- 무상태(세션 없음), JSON 응답. 인증 없음 — 공개 데모 화면과 같은 범위의 기능·데이터

## 설계

- **도구 정의는 하나, 호출 경로만 바꿔 끼움**
  - 도구는 `HelpdeskFetch(path, init)` 하나에만 의존
  - stdio: 배포 주소로 `fetch` / 원격: 같은 API 핸들러(`createApi`)를 내부에서 직접 호출
  - SDK의 `WebStandardStreamableHTTPServerTransport`가 웹 표준 `Request`/`Response`를 써서 기존 핸들러에 경로 하나로 붙음 → Vercel 함수 수도 그대로 1개
- **MCP로 API의 안전장치를 우회하지 않음**
  - 도구가 DB·모델을 직접 부르지 않고 API를 거침 → 호출 제한, 질문 길이·인코딩 검사, 캐시, 사용량·비용 기록, 알림이 그대로
  - 원격은 호출자 IP(`x-forwarded-for`)를 내부 요청에 넘겨 IP별 제한도 그대로 (테스트: 분당 3회 제한에서 4번째가 막히고 다른 IP는 통과)
- **오류는 던지지 않고 도구 결과로**: 호출 한도·없는 티켓·연결 실패를 `isError` 결과로 돌려줌 → 모델이 읽고 "나중에 다시" 같은 대응
- **되돌릴 수 없는 도구는 표시**: `reply_to_ticket`에 `destructiveHint: true` → 클라이언트가 실행 전 확인을 받게. 설명에도 "사용자 확인 후에만"
- **응답 크기 관리**: 문서는 섹션 단위, 운영 현황의 미답변은 문서별 건수 + 최근 3개만 → 컨텍스트를 아낌

## 사용 예

- 실제 시연 기록: [mcp-demo.md](mcp-demo.md)

- "환불 정책에서 인앱결제 부분만 보여 줘" → `get_policy_doc(refund, 인앱결제 환불)`
- "문의함에 오래 기다린 거 있어? 맥락 보고 답장 초안 다듬어 줘" → `list_tickets(escalated)` → `get_ticket` → 초안 수정 → 사용자 확인 → `reply_to_ticket`
- "오늘 운영 상황 요약해 줘. 어떤 문서를 보강해야 해?" → `get_ops_report`

## 확인

- 단위 테스트 10개 (`test/mcp.test.ts`): SDK 클라이언트 + 메모리 연결로 도구 호출, 입력 검사, 오류 처리, 리소스, 원격 경로의 JSON-RPC·IP별 제한·405
- stdio 서버를 실제로 띄워 공개 데모 API에 연결: 도구 8개·문서 12개·리소스 12개, 정책 질문 answered·high
