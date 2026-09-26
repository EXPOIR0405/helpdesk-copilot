-- 정책 문서 탭용: 문서 원문을 동기화 때 함께 저장
-- 상담원이 보는 문서 = 코파일럿이 근거로 쓰는 문서가 되도록 같은 동기화 경로로만 씀
alter table docs add column body text not null default '';
