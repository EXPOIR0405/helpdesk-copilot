# 합성 데이터

- 시네웨이브(CineWave)는 가상의 OTT 회사
- 이 폴더의 문서·요금·정책·오류 코드는 전부 데모용으로 새로 지어낸 내용
- 실존 서비스의 정책과 무관

## 구성

- `docs/` — 고객센터 상담원이 참고하는 정책 문서 12개
  - frontmatter의 `status`: `confirmed`(확정) 또는 `pending`(준비 중)
  - 해지와 환불, 동시 시청과 재생 오류처럼 일부 문서는 경계가 겹치게 작성 → 검색 난이도 확보
- `eval/questions.jsonl` — 평가 질문셋
  - `expected_status`: `answered` / `pending_policy` / `unanswerable`
  - `expected_docs`: 답의 근거가 되어야 하는 문서 id
  - `type`: `direct`(문서 표현 그대로), `paraphrase`(구어체·다른 표현), `cross`(문서 두 개 이상 필요), `pending`(준비 중 정책), `unanswerable`(어떤 문서에도 없음)
