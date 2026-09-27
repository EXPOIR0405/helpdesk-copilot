// npm run mock 으로 생성. 직접 수정하지 말 것
window.MOCK = {
 "source": "data/logs/eval-gemini-3.8-flash-2026-09-27T13-00-43-168Z.json",
 "docs": [
  {
   "id": "account-security",
   "title": "계정 보안",
   "status": "confirmed",
   "updatedAt": "2026-08-04",
   "body": "\n# 계정 보안\n\n## 본인 확인 원칙\n\n- 본인 확인 전에는 계정 정보를 알려주지 않음\n- 이메일은 앞 2자리만 노출하고 나머지는 가려서 안내 (예: ab****@****.com)\n- 결제 수단은 카드사명과 끝 4자리까지만 안내\n- 본인 확인 방법: 가입 이메일로 인증 링크 발송, 또는 휴대폰 본인인증\n\n## 비밀번호 재설정\n\n- 로그인 화면 > 비밀번호 찾기 > 가입 이메일로 재설정 링크 발송\n- 링크는 발송 후 30분간 유효\n- 메일이 오지 않으면 스팸함 확인, 가입 이메일 오타 여부 확인\n- 상담원이 비밀번호를 직접 바꾸거나 알려줄 수 없음\n\n## 가입 이메일 변경\n\n- 웹: 마이페이지 > 계정 정보 > 이메일 변경\n- 변경 전 휴대폰 본인인증 필요\n- 기존 이메일에 접근할 수 없는 경우에도 휴대폰 본인인증으로 변경 가능\n\n## 계정 도용 의심\n\n1. 마이페이지 > 기기 관리 > 모든 기기에서 로그아웃 안내\n2. 비밀번호 즉시 변경 안내\n3. 2단계 인증 설정 권장\n4. 본인이 하지 않은 결제가 있으면 결제 내역 확인 후 `refund` 문서의 도용 결제 기준으로 환불 접수\n5. 프로필 이름 변경, 결제 수단 변경 등 이상 변경 내역을 상담 기록에 남김\n\n## 2단계 인증\n\n- 로그인 시 비밀번호와 함께 휴대폰 인증번호 입력\n- 웹: 마이페이지 > 보안 설정 > 2단계 인증\n- 선택 사항이며 도용 의심 문의 시 설정을 권장\n"
  },
  {
   "id": "account-sharing",
   "title": "프로필과 동시 시청",
   "status": "confirmed",
   "updatedAt": "2026-08-11",
   "body": "\n# 프로필과 동시 시청\n\n## 프로필\n\n- 모든 요금제에서 계정당 최대 5개 프로필 생성 가능\n- 프로필마다 시청 기록, 찜 목록, 추천이 따로 관리됨\n- 프로필별 시청 등급 제한과 잠금은 `adult-verification` 문서 참고\n\n## 동시 시청 수\n\n- 베이직 1대, 스탠다드 2대, 프리미엄 4대\n- 같은 프로필이라도 다른 기기에서 재생하면 각각 1대로 계산\n- 한도를 넘으면 새로 재생하려는 기기에 \"동시 시청 한도 초과\" 안내와 오류 코드 CW-3010 표시\n- 이미 재생 중인 기기의 재생을 끝내거나, 상위 요금제로 변경하면 해결\n\n## 로그인 기기 수\n\n- 계정당 동시에 로그인해 둘 수 있는 기기는 최대 10대\n- 11번째 기기에서 로그인하면 가장 오래전에 사용한 기기가 자동 로그아웃\n- 웹: 마이페이지 > 기기 관리에서 기기별 로그아웃 가능\n\n## 계정 공유 정책\n\n- 이용약관상 계정은 가입자와 같은 가구 구성원만 함께 사용 가능\n- 가구 외 공유를 위한 추가 요금 상품은 없음\n- 가구 외 공유가 의심된다는 이유만으로 상담원이 계정을 정지하지 않음\n- 모르는 기기가 로그인되어 있다는 문의는 `account-security` 문서의 도용 의심 절차로 처리\n"
  },
  {
   "id": "ad-plan",
   "title": "광고형 요금제",
   "status": "pending",
   "updatedAt": "2026-09-20",
   "body": "\n# 광고형 요금제\n\n## 현재 상태\n\n- 도입 검토 중이며 확정된 내용 없음\n- 가격, 출시일, 광고 빈도, 제공 화질, 다운로드 여부 모두 미정\n\n## 상담 응대 기준\n\n- \"광고형 요금제는 도입을 검토하고 있으며, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내됩니다.\"로 안내\n- 예상 가격, 예상 출시 시기를 추측해서 말하지 않음\n- 사전 신청이나 대기 명단은 없음\n- 기존 요금제에 광고가 붙는지 묻는 문의에는 \"현재 요금제에는 광고가 없습니다\"까지만 안내\n"
  },
  {
   "id": "adult-verification",
   "title": "성인 인증과 시청 등급 설정",
   "status": "confirmed",
   "updatedAt": "2026-07-14",
   "body": "\n# 성인 인증과 시청 등급 설정\n\n## 성인 인증\n\n- 청소년 관람불가 콘텐츠를 보려면 성인 인증 필요\n- 인증 방법: 휴대폰 본인인증\n- 인증은 1년간 유효. 1년이 지나면 재인증 요청\n- 성인 인증 명의와 결제자 명의가 달라도 됨\n- 인증은 계정 단위로 적용되지만, 프로필별 시청 등급 제한이 우선\n\n## 프로필별 시청 등급 제한\n\n- 프로필마다 볼 수 있는 최대 등급 설정 가능: 전체, 12세, 15세, 청소년 관람불가\n- 키즈 프로필은 12세 이하 등급만 노출되며 변경 불가\n- 설정 경로: 마이페이지 > 프로필 관리 > 시청 등급\n\n## 프로필 잠금\n\n- 프로필마다 4자리 PIN 잠금 설정 가능\n- PIN을 잊은 경우 계정 비밀번호를 입력해 재설정\n- 상담원이 PIN을 확인하거나 대신 해제할 수 없음\n\n## 청소년 보호\n\n- 만 19세 미만 명의로는 성인 인증 불가\n- 보호자가 자녀의 시청을 제한하려면 키즈 프로필 또는 프로필 잠금을 안내\n"
  },
  {
   "id": "cancel",
   "title": "해지 안내",
   "status": "confirmed",
   "updatedAt": "2026-08-25",
   "body": "\n# 해지 안내\n\n## 해지의 의미\n\n- 해지는 **다음 정기결제를 멈추는 것**\n- 해지해도 이미 결제한 기간 끝까지 정상 이용 가능\n- 해지는 환불이 아님. 환불 조건은 `refund` 문서 기준\n\n## 해지 절차\n\n- 웹: 마이페이지 > 이용권 관리 > 정기결제 해지\n- 앱마켓 인앱결제 가입자: 앱마켓의 구독 관리 메뉴에서 해지 (시네웨이브 웹에서는 해지 불가)\n- 해지 완료 시 가입 이메일로 해지 확인 메일 발송\n\n## 해지 취소\n\n- 이용 기간이 끝나기 전이라면 해지 취소 가능\n- 웹: 마이페이지 > 이용권 관리 > 해지 취소\n- 해지 취소 시 기존 결제일에 정상 결제\n\n## 해지 후 데이터\n\n- 시청 기록, 찜 목록, 프로필은 이용 종료 후 12개월 보관\n- 12개월 안에 다시 구독하면 그대로 복원\n- 다운로드한 콘텐츠는 이용 기간 종료 시점에 재생 불가\n\n## 해지와 회원 탈퇴의 차이\n\n| 구분 | 해지 | 회원 탈퇴 |\n|---|---|---|\n| 정기결제 | 중단 | 중단 |\n| 남은 이용 기간 | 끝까지 이용 | 즉시 소멸 |\n| 시청 기록·찜 | 12개월 보관 | 즉시 삭제 |\n| 재가입 | 같은 계정으로 재구독 | 새 계정 가입 필요 |\n\n- 남은 기간이 있는데 탈퇴를 원하면 남은 기간이 소멸된다는 점을 반드시 안내\n- 탈퇴 후 30일 동안 같은 이메일로 재가입 불가\n"
  },
  {
   "id": "content-schedule",
   "title": "콘텐츠 공개·종료 안내",
   "status": "confirmed",
   "updatedAt": "2026-09-15",
   "body": "\n# 콘텐츠 공개·종료 안내\n\n## 공개 일정 안내 원칙\n\n- 공식 공지사항이나 콘텐츠 상세 화면에 게시된 일정만 안내\n- 공지되지 않은 공개일, 다음 시즌 제작 여부는 추측해서 안내하지 않음\n- 응대 문구 예: \"현재 공지된 일정이 없습니다. 확정되면 공지사항과 알림으로 안내됩니다.\"\n\n## 오리지널 콘텐츠\n\n- 시네웨이브 오리지널 시리즈 신규 회차는 매주 금요일 오후 6시 공개가 기본\n- 작품별로 다를 수 있으므로 상세 화면의 공개 일정 우선\n\n## 방송 연계 콘텐츠\n\n- TV 방송과 함께 서비스하는 콘텐츠는 본방송 종료 1시간 뒤 업로드가 기본\n- 방송사 사정으로 지연될 수 있음. 지연 사유는 안내하지 않음\n\n## 판권 종료(공개 종료)\n\n- 판권 종료 30일 전부터 상세 화면에 \"공개 종료 예정\" 표시와 종료일 노출\n- 종료 후에는 찜 목록에 남아 있어도 재생 불가 (오류 코드 CW-4040)\n- 종료된 콘텐츠의 재공개 여부는 안내 불가\n\n## 콘텐츠 요청\n\n- 고객이 원하는 작품 추가를 요청하면 상담 기록에 작품명을 남겨 콘텐츠 담당에게 전달\n- 반영 여부와 결과는 고객에게 따로 회신하지 않는다고 안내\n"
  },
  {
   "id": "coupon-event",
   "title": "이용권·쿠폰·이벤트",
   "status": "confirmed",
   "updatedAt": "2026-09-05",
   "body": "\n# 이용권·쿠폰·이벤트\n\n## 종류\n\n- 이용권: 정해진 기간(1개월, 3개월 등) 동안 결제 없이 이용하는 상품. 제휴사 혜택이나 선물로 지급\n- 할인 쿠폰: 정기결제 금액을 깎아 주는 쿠폰\n\n## 등록 방법\n\n- 이용권·쿠폰 코드는 영문과 숫자 16자리\n- 웹에서만 등록 가능: 마이페이지 > 이용권·쿠폰 등록\n- 앱에서는 등록 불가 (앱마켓 정책)\n\n## 적용 규칙\n\n- 할인 쿠폰은 결제 1회에 1장만 적용, 중복 적용 불가\n- 신규 가입 할인 쿠폰은 첫 결제에만 적용\n- 이용권 사용 중에 정기결제를 신청하면 이용권 기간이 끝난 다음 날부터 결제 시작\n- 인앱결제 가입자에게는 할인 쿠폰 적용 불가 (이용권은 인앱결제 해지 후 사용 가능)\n\n## 유효기간\n\n- 이용권·쿠폰마다 등록 유효기간이 있음. 코드 발급 안내문에 표시\n- 유효기간이 지난 코드는 복구·연장 불가\n- 등록한 이용권은 등록 즉시 이용 기간 시작\n\n## 이벤트\n\n- 이벤트 참여 조건과 경품 지급 일정은 각 이벤트 페이지의 공지 기준으로 안내\n- 이벤트 페이지에 없는 내용(당첨 여부 사전 확인, 경품 교환)은 안내 불가\n- 경품 미수령 문의는 이벤트 담당에게 이관\n"
  },
  {
   "id": "download",
   "title": "다운로드(오프라인 저장)",
   "status": "confirmed",
   "updatedAt": "2026-06-20",
   "body": "\n# 다운로드(오프라인 저장)\n\n## 요금제별 다운로드\n\n- 베이직: 다운로드 불가\n- 스탠다드: 기기 2대까지\n- 프리미엄: 기기 4대까지\n- 다운로드는 모바일·태블릿 앱에서만 가능. PC 웹과 TV 앱은 불가\n\n## 저장 한도와 보관 기간\n\n- 기기당 최대 100편 저장\n- 저장한 콘텐츠는 저장일로부터 30일간 보관\n- 한 번 재생을 시작하면 48시간 안에 시청 완료 필요, 이후 자동 만료\n- 만료된 콘텐츠는 인터넷 연결 후 다시 다운로드 가능\n\n## 오프라인 인증\n\n- 다운로드 콘텐츠를 계속 보려면 30일에 한 번 이상 인터넷에 연결해 계정 확인 필요\n\n## 다운로드 불가 콘텐츠\n\n- 일부 콘텐츠는 판권 조건상 다운로드 불가. 상세 화면에 다운로드 버튼이 없음\n- 판권 종료 예정 콘텐츠는 종료일에 다운로드본도 재생 불가\n\n## 해지·환불 시\n\n- 해지: 이용 기간 종료 시점에 다운로드본 재생 불가\n- 환불: 환불 완료 즉시 재생 불가\n"
  },
  {
   "id": "payment",
   "title": "결제 안내",
   "status": "confirmed",
   "updatedAt": "2026-07-30",
   "body": "\n# 결제 안내\n\n## 결제 수단\n\n- 신용카드, 체크카드\n- 휴대폰 소액결제\n- 간편결제 (카드 등록형)\n- 앱마켓 인앱결제 (iOS, Android)\n- 계좌이체와 무통장입금은 지원하지 않음\n\n## 결제일\n\n- 최초 구독 결제일 기준으로 매월 같은 날 자동 결제\n- 29일, 30일, 31일에 가입한 경우 해당 날짜가 없는 달에는 그달 말일에 결제\n- 결제일 변경 기능은 없음\n\n## 결제 수단 변경\n\n- 웹: 마이페이지 > 결제 수단 관리\n- 변경한 결제 수단은 다음 결제일부터 적용\n- 인앱결제 가입자는 앱마켓 계정의 결제 수단을 바꿔야 함 (시네웨이브에서 변경 불가)\n\n## 결제 실패\n\n- 결제일에 결제가 실패하면 3일 간격으로 최대 3회 자동 재시도\n- 첫 실패일로부터 7일간은 유예 기간으로 정상 이용 가능\n- 7일 안에 결제가 성공하지 않으면 이용 정지\n- 이용 정지 후 결제 수단을 갱신하고 재결제하면 즉시 이용 재개, 결제일은 재결제한 날로 변경\n- 흔한 실패 원인: 카드 한도 초과, 카드 유효기간 만료, 휴대폰 결제 월 한도 초과\n\n## 영수증과 결제 내역\n\n- 웹: 마이페이지 > 결제 내역에서 카드 영수증 출력 가능\n- 인앱결제 영수증은 앱마켓에서 발급\n- 현금영수증 발급 대상 결제 수단이 없어 현금영수증은 발급하지 않음\n\n## 중복 결제\n\n- 같은 결제 주기에 두 번 이상 결제된 경우 `refund` 문서의 중복 결제 기준에 따라 처리\n"
  },
  {
   "id": "plans",
   "title": "요금제 안내",
   "status": "confirmed",
   "updatedAt": "2026-08-18",
   "body": "\n# 요금제 안내\n\n## 요금제 비교\n\n| 요금제 | 월 요금 | 동시 시청 | 최대 화질 | 다운로드 |\n|---|---|---|---|---|\n| 베이직 | 7,900원 | 1대 | HD | 불가 |\n| 스탠다드 | 10,900원 | 2대 | FHD | 기기 2대 |\n| 프리미엄 | 13,900원 | 4대 | 4K | 기기 4대 |\n\n- 모든 요금제는 월 단위 정기결제\n- 연간 결제 상품은 없음\n- 모든 요금제에서 프로필은 최대 5개까지 생성 가능\n- 요금에는 부가세 포함\n\n## 요금제 올리기 (업그레이드)\n\n- 변경 즉시 상위 요금제 적용\n- 남은 이용 기간에 대한 차액을 일할 계산해 즉시 결제\n- 다음 결제일은 바뀌지 않음\n- 예: 스탠다드 이용 중 결제 주기 중간에 프리미엄으로 변경 → 월 요금 차액 3,000원을 남은 일수만큼 일할 계산해 결제\n\n## 요금제 내리기 (다운그레이드)\n\n- 현재 결제 기간이 끝날 때까지 기존 요금제 유지\n- 다음 결제일부터 하위 요금제 요금으로 결제\n- 결제일 전까지는 변경 예약 취소 가능\n- 차액 환불은 없음\n\n## 요금제 변경 경로\n\n- 웹: 마이페이지 > 이용권 관리 > 요금제 변경\n- 앱마켓 인앱결제로 가입한 경우 앱 안에서 요금제 변경 가능, 결제 처리는 앱마켓 기준\n\n## 광고형 요금제\n\n- 현재 판매하지 않음\n- 도입 관련 문의는 `ad-plan` 문서 기준으로 안내\n"
  },
  {
   "id": "playback-errors",
   "title": "재생 오류 조치",
   "status": "confirmed",
   "updatedAt": "2026-09-10",
   "body": "\n# 재생 오류 조치\n\n## 공통 1차 조치\n\n- 앱 최신 버전 업데이트\n- 앱 완전 종료 후 재실행, 기기 재부팅\n- 다른 콘텐츠도 재생되지 않는지 확인 → 특정 콘텐츠만 안 되면 콘텐츠 문제, 전부 안 되면 기기·네트워크 문제\n\n## 오류 코드별 조치\n\n### CW-1001 네트워크 연결 오류\n\n- 원인: 인터넷 연결 불안정, 속도 부족\n- 권장 속도: HD 3Mbps, FHD 5Mbps, 4K 25Mbps 이상\n- 조치: 공유기 재시작, 모바일 데이터와 Wi-Fi 전환해서 재시도\n\n### CW-2003 콘텐츠 보호(DRM) 오류\n\n- 원인: 기기·브라우저가 콘텐츠 보호 기술을 지원하지 않음, 외부 모니터가 HDCP 미지원\n- 조치: 앱·브라우저 업데이트, 외부 모니터 연결 해제 후 재생, 화면 녹화·미러링 앱 종료\n- 루팅·탈옥 기기에서는 재생 불가\n\n### CW-3010 동시 시청 한도 초과\n\n- 원인: 요금제의 동시 시청 수 초과\n- 조치: `account-sharing` 문서의 동시 시청 수 기준으로 안내\n\n### CW-4040 콘텐츠 이용 불가\n\n- 원인: 판권 종료로 내려간 콘텐츠, 또는 국내에서만 서비스되는 콘텐츠를 해외에서 재생 시도\n- 조치: 판권 종료 여부는 `content-schedule` 문서 기준으로 안내\n- 해외 재생 가능 여부에 대한 별도 정책 문서는 없음\n\n### CW-5000 서버 오류\n\n- 원인: 시네웨이브 서버 문제\n- 조치: 공지사항의 장애 공지 확인 안내\n- 같은 오류가 30분 이상 반복되면 기술지원 담당에게 이관 (고객 기기 정보, 발생 시각, 오류 코드 기록)\n\n## 화질 관련 문의\n\n- 4K 재생 조건: 프리미엄 요금제 + 4K 지원 기기·앱 + 25Mbps 이상 속도 → 셋 중 하나라도 빠지면 FHD 이하로 재생\n- 모든 콘텐츠가 4K로 제공되지는 않음. 콘텐츠 상세 화면에 4K 표시가 있는 작품만 해당\n- 네트워크 상태에 따라 화질이 자동 조절됨. 설정 > 재생 화질에서 고정 가능\n\n## 보상 문의\n\n- 개별 기기·네트워크 문제는 보상 대상 아님\n- 전체 서비스 장애 보상 기준은 `refund` 문서 참고\n"
  },
  {
   "id": "refund",
   "title": "환불 정책",
   "status": "confirmed",
   "updatedAt": "2026-09-02",
   "body": "\n# 환불 정책\n\n## 기본 원칙\n\n- 환불 여부는 **결제 후 경과일**과 **시청 이력** 두 가지로 판단\n- 시청 이력: 해당 결제 이후 콘텐츠를 1분 이상 재생한 기록 (예고편 제외)\n\n| 조건 | 처리 |\n|---|---|\n| 결제 후 7일 이내, 시청 이력 없음 | 전액 환불 |\n| 결제 후 7일 이내, 시청 이력 있음 | 환불 불가, 해지만 가능 |\n| 결제 후 7일 경과 | 환불 불가, 해지만 가능 |\n\n- 환불 불가인 경우에도 해지하면 남은 결제 기간 끝까지 이용 가능 (`cancel` 문서 참고)\n- 부분 환불(남은 일수 일할 환불)은 하지 않음\n\n## 예외: 전액 환불\n\n- 같은 결제 주기에 중복 결제된 경우 → 중복 결제분 전액 환불, 시청 이력과 무관\n- 회원이 요청하지 않은 요금제 변경 결제가 확인된 경우 → 해당 결제 전액 환불\n- 계정 도용으로 인한 결제가 확인된 경우 → `account-security` 문서의 도용 처리 후 환불\n\n## 예외: 서비스 장애 보상\n\n- 시네웨이브 귀책의 전체 서비스 장애가 24시간 이상 연속될 때만 보상\n- 보상은 환불이 아니라 장애 시간만큼 이용 기간 연장\n- 개별 기기·네트워크 문제로 인한 재생 불가는 보상 대상 아님 (`playback-errors` 문서로 조치 안내)\n\n## 인앱결제 환불\n\n- 앱마켓 인앱결제는 앱마켓 환불 정책을 따름\n- 상담원이 직접 환불 처리할 수 없음 → 앱마켓 고객센터로 환불 요청하도록 안내\n\n## 환불 처리 기간\n\n- 신용카드: 취소 후 3~5영업일 (카드사에 따라 다음 달 청구서에서 차감)\n- 체크카드·간편결제: 취소 후 3~5영업일 안에 계좌 입금\n- 휴대폰 소액결제: 결제한 달 안에는 결제 취소, 다음 달 이후에는 본인 명의 계좌로 환불\n\n## 환불 후 처리\n\n- 환불이 완료되면 해당 결제 기간의 이용권은 즉시 종료\n- 다운로드한 콘텐츠도 즉시 재생 불가\n"
  }
 ],
 "answers": [
  {
   "question": "프리미엄 요금제는 동시에 몇 대까지 볼 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "프리미엄 요금제는 최대 4대까지 동시 시청이 가능합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "plans#0",
      "docId": "plans",
      "title": "요금제 안내",
      "section": "요금제 비교",
      "excerpt": "| 요금제 | 월 요금 | 동시 시청 | 최대 화질 | 다운로드 |\n|---|---|---|---|---|\n| 베이직 | 7,900원 | 1대 | HD | 불가 |\n| 스탠다드 | 10,900원 | 2대 | FHD | 기기 2대 |\n| 프리미엄 | 13,900원 | 4대 | 4K | 기기 4대 |\n\n- 모든 요금제는 월 단위 정기결제\n- 연간 결제 상품은 없음\n- 모든 요금제에서 프로필은 최대 5개까지 생성 가능\n- 요금에는 부가세 포함"
     }
    ],
    "trace": {
     "topScore": 0.564925436768635,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.564925436768635
      },
      {
       "chunkId": "plans#1",
       "docId": "plans",
       "score": 0.492482859478302
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.408828994657347
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.397803820098076
      },
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.361057694440394
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1062,
      "cachedInputTokens": 0,
      "outputTokens": 65,
      "latencyMs": 2065
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n프리미엄 요금제는 최대 4대까지 동시 시청이 가능합니다. 추가로 프리미엄 요금제는 월 13,900원이며, 최대 4K 화질과 기기 4대 다운로드를 지원합니다. 이용에 참고해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 740,
     "cachedInputTokens": 0,
     "outputTokens": 76,
     "latencyMs": 1927
    }
   }
  },
  {
   "question": "결제 후 7일 이내에 시청 이력이 없으면 환불되나요?",
   "answer": {
    "status": "answered",
    "text": "결제 후 7일 이내이며 시청 이력이 없는 경우 전액 환불이 가능합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "refund#0",
      "docId": "refund",
      "title": "환불 정책",
      "section": "기본 원칙",
      "excerpt": "- 환불 여부는 **결제 후 경과일**과 **시청 이력** 두 가지로 판단\n- 시청 이력: 해당 결제 이후 콘텐츠를 1분 이상 재생한 기록 (예고편 제외)\n\n| 조건 | 처리 |\n|---|---|\n| 결제 후 7일 이내, 시청 이력 없음 | 전액 환불 |\n| 결제 후 7일 이내, 시청 이력 있음 | 환불 불가, 해지만 가능 |\n| 결제 후 7일 경과 | 환불 불가, 해지만 가능 |\n\n- 환불 불가인 경우에도 해지하면 남은 결제 기간 끝까지 이용 가능 (`cancel` 문서 참고)\n- 부분 환불(남은 일수 일할 환불)은 하지 않음"
     }
    ],
    "trace": {
     "topScore": 0.564286540443905,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "refund#0",
       "docId": "refund",
       "score": 0.564286540443905
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.555756049409458
      },
      {
       "chunkId": "refund#5",
       "docId": "refund",
       "score": 0.500475324807671
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.493194231970487
      },
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.47574200438566
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1093,
      "cachedInputTokens": 0,
      "outputTokens": 67,
      "latencyMs": 1592
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n결제 후 7일 이내이며 시청 이력이 없는 경우 전액 환불이 가능합니다. 시청 이력은 해당 결제 이후 예고편을 제외한 콘텐츠를 1분 이상 재생한 기록을 의미합니다. 결제 후 7일이 지났거나 시청 이력이 있는 경우에는 환불이 불가하며 해지만 신청하실 수 있습니다. 남은 일수에 대한 부분 환불은 진행되지 않으니 참고해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 760,
     "cachedInputTokens": 0,
     "outputTokens": 107,
     "latencyMs": 1930
    }
   }
  },
  {
   "question": "결제 실패하면 언제까지 이용할 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "결제 실패 시 첫 실패일로부터 7일간은 유예 기간으로 정상 이용이 가능하며, 7일 안에 결제가 성공하지 않으면 이용이 정지됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "payment#3",
      "docId": "payment",
      "title": "결제 안내",
      "section": "결제 실패",
      "excerpt": "- 결제일에 결제가 실패하면 3일 간격으로 최대 3회 자동 재시도\n- 첫 실패일로부터 7일간은 유예 기간으로 정상 이용 가능\n- 7일 안에 결제가 성공하지 않으면 이용 정지\n- 이용 정지 후 결제 수단을 갱신하고 재결제하면 즉시 이용 재개, 결제일은 재결제한 날로 변경\n- 흔한 실패 원인: 카드 한도 초과, 카드 유효기간 만료, 휴대폰 결제 월 한도 초과"
     }
    ],
    "trace": {
     "topScore": 0.600904405330663,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.600904405330663
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.477934048204642
      },
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.448775981388768
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.423128146298741
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.422913644998715
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 969,
      "cachedInputTokens": 0,
      "outputTokens": 76,
      "latencyMs": 1763
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n결제에 실패하더라도 첫 실패일로부터 7일간은 유예 기간이 적용되어 정상적으로 이용하실 수 있습니다. 결제는 3일 간격으로 최대 3회 자동 재시도되며, 7일 안에 결제가 성공하지 않으면 서비스 이용이 정지됩니다. 이용이 정지된 이후 결제 수단을 갱신하여 재결제하시면 즉시 다시 이용하실 수 있습니다. 카드 한도 초과나 유효기간 만료 등 결제 수단에 이상이 없는지 확인해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 715,
     "cachedInputTokens": 0,
     "outputTokens": 125,
     "latencyMs": 1929
    }
   }
  },
  {
   "question": "비밀번호 재설정 링크는 몇 분 동안 유효한가요?",
   "answer": {
    "status": "answered",
    "text": "비밀번호 재설정 링크는 발송 후 30분간 유효합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "account-security#1",
      "docId": "account-security",
      "title": "계정 보안",
      "section": "비밀번호 재설정",
      "excerpt": "- 로그인 화면 > 비밀번호 찾기 > 가입 이메일로 재설정 링크 발송\n- 링크는 발송 후 30분간 유효\n- 메일이 오지 않으면 스팸함 확인, 가입 이메일 오타 여부 확인\n- 상담원이 비밀번호를 직접 바꾸거나 알려줄 수 없음"
     }
    ],
    "trace": {
     "topScore": 0.685647378967462,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-security#1",
       "docId": "account-security",
       "score": 0.685647378967462
      },
      {
       "chunkId": "account-security#4",
       "docId": "account-security",
       "score": 0.542257430483316
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.457180181174896
      },
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.449126165498039
      },
      {
       "chunkId": "account-security#0",
       "docId": "account-security",
       "score": 0.414848900552328
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 987,
      "cachedInputTokens": 0,
      "outputTokens": 66,
      "latencyMs": 16599
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n비밀번호 재설정 링크는 발송 후 30분간 유효합니다.\n재설정 링크는 로그인 화면에서 비밀번호 찾기를 진행하시면 가입하신 이메일로 발송됩니다.\n메일이 오지 않는다면 스팸함을 확인하시거나 가입 이메일에 오타가 없는지 확인해 주시기 바랍니다.\n고객센터에서 비밀번호를 직접 변경해 드리거나 알려드릴 수 없는 점 양해 부탁드립니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 656,
     "cachedInputTokens": 0,
     "outputTokens": 108,
     "latencyMs": 1582
    }
   }
  },
  {
   "question": "CW-2003 오류는 어떻게 조치하나요?",
   "answer": {
    "status": "answered",
    "text": "CW-2003 오류는 기기·브라우저의 콘텐츠 보호 기술 미지원 또는 외부 모니터의 HDCP 미지원으로 인해 발생합니다. 앱 및 브라우저 업데이트, 외부 모니터 연결 해제 후 재생, 화면 녹화 및 미러링 앱 종료를 안내해 주시기 바랍니다. 단, 루팅이나 탈옥 기기에서는 재생이 불가합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "playback-errors#1",
      "docId": "playback-errors",
      "title": "재생 오류 조치",
      "section": "오류 코드별 조치",
      "excerpt": "### CW-1001 네트워크 연결 오류\n\n- 원인: 인터넷 연결 불안정, 속도 부족\n- 권장 속도: HD 3Mbps, FHD 5Mbps, 4K 25Mbps 이상\n- 조치: 공유기 재시작, 모바일 데이터와 Wi-Fi 전환해서 재시도\n\n### CW-2003 콘텐츠 보호(DRM) 오류\n\n- 원인: 기기·브라우저가 콘텐츠 보호 기술을 지원하지 않음, 외부 모니터가 HDCP 미지원\n- 조치: 앱·브라우저 업데이트, 외부 모니터 연결 해제 후 재생, 화면 녹화·미러링 앱 종료\n- 루팅·탈옥 기기에서는 재생 불가\n\n### CW-3010 동시 시청 한도 초과\n\n- 원인: 요금제의 동시 시청 수 초과\n- 조치: `account-sharing` 문서의 동시 시청 수 기준으로 안내\n\n### CW-4040 콘텐츠 이용 불가\n\n- 원인: 판권 종료로 내려간 콘텐츠, 또는 국내에서만 서비스되는 콘텐츠를 해외에서 재생 시도\n- 조치: 판권 종료 여부는 `content-schedule` 문서 기준으로 안내\n- 해외 재생 가능 여부에 대한 별도 정책 문서는 없음\n\n### CW-5000 서버 오류\n\n- 원인: 시네웨이브 서버 문제\n- 조치: 공지사항의 장애 공지 확인 안내\n- 같은 오류가 30분 이상 반복되면 기술지원 담당에게 이관 (고객 기기 정보, 발생 시각, 오류 코드 기록)"
     }
    ],
    "trace": {
     "topScore": 0.586670153635372,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.586670153635372
      },
      {
       "chunkId": "playback-errors#0",
       "docId": "playback-errors",
       "score": 0.366758515066073
      },
      {
       "chunkId": "account-sharing#1",
       "docId": "account-sharing",
       "score": 0.362953977317576
      },
      {
       "chunkId": "playback-errors#3",
       "docId": "playback-errors",
       "score": 0.342649526479139
      },
      {
       "chunkId": "playback-errors#2",
       "docId": "playback-errors",
       "score": 0.327990412439087
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1264,
      "cachedInputTokens": 0,
      "outputTokens": 129,
      "latencyMs": 1698
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\nCW-2003 오류는 기기나 브라우저의 콘텐츠 보호 기술 미지원 또는 외부 모니터의 HDCP 미지원으로 인해 발생합니다. 오류 해결을 위해 아래 조치 방법을 순서대로 진행해 주시기 바랍니다.\n1. 사용 중인 앱 또는 브라우저를 최신 버전으로 업데이트합니다.\n2. 외부 모니터 연결을 해제한 후 재생합니다.\n3. 실행 중인 화면 녹화 및 미러링 앱을 종료합니다.\n루팅이나 탈옥된 기기에서는 콘텐츠 재생이 불가하니 이용에 참고해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 992,
     "cachedInputTokens": 0,
     "outputTokens": 137,
     "latencyMs": 1660
    }
   }
  },
  {
   "question": "다운로드한 콘텐츠는 며칠 동안 보관되나요?",
   "answer": {
    "status": "answered",
    "text": "다운로드한 콘텐츠는 저장일로부터 30일간 보관됩니다. 단, 재생을 시작하면 48시간 이내에 시청을 완료해야 하며, 이후에는 자동 만료됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "download#1",
      "docId": "download",
      "title": "다운로드(오프라인 저장)",
      "section": "저장 한도와 보관 기간",
      "excerpt": "- 기기당 최대 100편 저장\n- 저장한 콘텐츠는 저장일로부터 30일간 보관\n- 한 번 재생을 시작하면 48시간 안에 시청 완료 필요, 이후 자동 만료\n- 만료된 콘텐츠는 인터넷 연결 후 다시 다운로드 가능"
     }
    ],
    "trace": {
     "topScore": 0.691800884540007,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.691800884540007
      },
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.614720365052314
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.586486028167343
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.563370132845687
      },
      {
       "chunkId": "download#0",
       "docId": "download",
       "score": 0.474401178985744
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 880,
      "cachedInputTokens": 0,
      "outputTokens": 88,
      "latencyMs": 1562
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n다운로드한 콘텐츠는 저장한 날로부터 30일 동안 보관됩니다. 다만 다운로드한 콘텐츠의 재생을 시작하시면 48시간 이내에 시청을 완료하셔야 하며, 해당 시간이 지나면 자동으로 만료됩니다. 만료된 콘텐츠는 인터넷이 연결된 상태에서 다시 다운로드하실 수 있습니다. 추가로 기기당 최대 100편까지 저장이 가능합니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 676,
     "cachedInputTokens": 0,
     "outputTokens": 96,
     "latencyMs": 1665
    }
   }
  },
  {
   "question": "쿠폰 두 장을 한 번에 적용할 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "할인 쿠폰은 결제 1회에 1장만 적용할 수 있으며, 중복 적용은 불가합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "coupon-event#2",
      "docId": "coupon-event",
      "title": "이용권·쿠폰·이벤트",
      "section": "적용 규칙",
      "excerpt": "- 할인 쿠폰은 결제 1회에 1장만 적용, 중복 적용 불가\n- 신규 가입 할인 쿠폰은 첫 결제에만 적용\n- 이용권 사용 중에 정기결제를 신청하면 이용권 기간이 끝난 다음 날부터 결제 시작\n- 인앱결제 가입자에게는 할인 쿠폰 적용 불가 (이용권은 인앱결제 해지 후 사용 가능)"
     }
    ],
    "trace": {
     "topScore": 0.572317009430275,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.572317009430275
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.482123949236634
      },
      {
       "chunkId": "coupon-event#3",
       "docId": "coupon-event",
       "score": 0.427452863958347
      },
      {
       "chunkId": "coupon-event#1",
       "docId": "coupon-event",
       "score": 0.409497397122776
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.388490957589746
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 915,
      "cachedInputTokens": 0,
      "outputTokens": 73,
      "latencyMs": 1604
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n할인 쿠폰은 결제 1회에 1장만 적용하실 수 있으며, 쿠폰 2장의 중복 적용은 불가합니다. 결제 시 보유하신 쿠폰 중 원하시는 1장을 선택하여 이용해 주시기 바랍니다. 추가로 궁금한 점이 있으시면 언제든 문의해 주세요.",
    "unsupportedNumbers": [
     "2"
    ],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 683,
     "cachedInputTokens": 0,
     "outputTokens": 76,
     "latencyMs": 1931
    }
   }
  },
  {
   "question": "키즈 프로필의 시청 등급을 바꿀 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "키즈 프로필은 12세 이하 등급만 노출되며 시청 등급을 변경할 수 없습니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "adult-verification#1",
      "docId": "adult-verification",
      "title": "성인 인증과 시청 등급 설정",
      "section": "프로필별 시청 등급 제한",
      "excerpt": "- 프로필마다 볼 수 있는 최대 등급 설정 가능: 전체, 12세, 15세, 청소년 관람불가\n- 키즈 프로필은 12세 이하 등급만 노출되며 변경 불가\n- 설정 경로: 마이페이지 > 프로필 관리 > 시청 등급"
     }
    ],
    "trace": {
     "topScore": 0.552466879217092,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "adult-verification#1",
       "docId": "adult-verification",
       "score": 0.552466879217092
      },
      {
       "chunkId": "account-sharing#0",
       "docId": "account-sharing",
       "score": 0.490246638970576
      },
      {
       "chunkId": "adult-verification#3",
       "docId": "adult-verification",
       "score": 0.439384693343676
      },
      {
       "chunkId": "adult-verification#0",
       "docId": "adult-verification",
       "score": 0.410670720711023
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.371210784854766
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 961,
      "cachedInputTokens": 0,
      "outputTokens": 72,
      "latencyMs": 1748
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n키즈 프로필은 12세 이하 등급 콘텐츠만 노출되도록 고정되어 있어 시청 등급을 변경할 수 없습니다. 시청 등급 제한은 일반 프로필에서만 변경이 가능하며, 전체, 12세, 15세, 청소년 관람불가 중 선택할 수 있습니다. 일반 프로필의 시청 등급 설정을 원하실 경우 마이페이지의 프로필 관리에서 시청 등급 메뉴를 이용해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 667,
     "cachedInputTokens": 0,
     "outputTokens": 114,
     "latencyMs": 2387
    }
   }
  },
  {
   "question": "해지하면 시청 기록은 얼마나 보관되나요?",
   "answer": {
    "status": "answered",
    "text": "해지 시 시청 기록은 이용 종료 후 12개월 동안 보관되며, 12개월 내에 다시 구독하면 그대로 복원됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "cancel#3",
      "docId": "cancel",
      "title": "해지 안내",
      "section": "해지 후 데이터",
      "excerpt": "- 시청 기록, 찜 목록, 프로필은 이용 종료 후 12개월 보관\n- 12개월 안에 다시 구독하면 그대로 복원\n- 다운로드한 콘텐츠는 이용 기간 종료 시점에 재생 불가"
     },
     {
      "chunkId": "cancel#4",
      "docId": "cancel",
      "title": "해지 안내",
      "section": "해지와 회원 탈퇴의 차이",
      "excerpt": "| 구분 | 해지 | 회원 탈퇴 |\n|---|---|---|\n| 정기결제 | 중단 | 중단 |\n| 남은 이용 기간 | 끝까지 이용 | 즉시 소멸 |\n| 시청 기록·찜 | 12개월 보관 | 즉시 삭제 |\n| 재가입 | 같은 계정으로 재구독 | 새 계정 가입 필요 |\n\n- 남은 기간이 있는데 탈퇴를 원하면 남은 기간이 소멸된다는 점을 반드시 안내\n- 탈퇴 후 30일 동안 같은 이메일로 재가입 불가"
     }
    ],
    "trace": {
     "topScore": 0.609786012733665,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.609786012733665
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.485150960682525
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.481411062852109
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.430573774273307
      },
      {
       "chunkId": "cancel#0",
       "docId": "cancel",
       "score": 0.391585379285137
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 970,
      "cachedInputTokens": 0,
      "outputTokens": 76,
      "latencyMs": 1433
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n서비스를 해지하시더라도 시청 기록, 찜 목록, 프로필 정보는 이용 종료 후 12개월 동안 보관됩니다. 12개월 이내에 같은 계정으로 다시 구독하시면 기존 시청 기록이 그대로 복원됩니다. 다만, 해지가 아닌 회원 탈퇴를 진행하실 경우에는 시청 기록이 즉시 삭제되니 유의해 주시기 바랍니다. 다운로드하신 콘텐츠는 이용 기간이 종료되는 시점부터 재생이 불가합니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 783,
     "cachedInputTokens": 0,
     "outputTokens": 109,
     "latencyMs": 1773
    }
   }
  },
  {
   "question": "판권이 끝나는 콘텐츠는 언제부터 표시되나요?",
   "answer": {
    "status": "answered",
    "text": "판권 종료 30일 전부터 콘텐츠 상세 화면에 '공개 종료 예정' 표시와 종료일이 노출됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "content-schedule#3",
      "docId": "content-schedule",
      "title": "콘텐츠 공개·종료 안내",
      "section": "판권 종료(공개 종료)",
      "excerpt": "- 판권 종료 30일 전부터 상세 화면에 \"공개 종료 예정\" 표시와 종료일 노출\n- 종료 후에는 찜 목록에 남아 있어도 재생 불가 (오류 코드 CW-4040)\n- 종료된 콘텐츠의 재공개 여부는 안내 불가"
     }
    ],
    "trace": {
     "topScore": 0.580447306280345,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "content-schedule#3",
       "docId": "content-schedule",
       "score": 0.580447306280345
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.474344703265933
      },
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.434736367010844
      },
      {
       "chunkId": "content-schedule#2",
       "docId": "content-schedule",
       "score": 0.429663341328188
      },
      {
       "chunkId": "refund#5",
       "docId": "refund",
       "score": 0.429366601560303
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 857,
      "cachedInputTokens": 0,
      "outputTokens": 74,
      "latencyMs": 6492
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n판권 종료 30일 전부터 콘텐츠 상세 화면에 '공개 종료 예정' 표시와 함께 종료일이 노출됩니다.\n공개가 종료된 콘텐츠는 찜 목록에 남아 있더라도 재생할 수 없으며, 오류 코드 CW-4040이 발생합니다.\n또한 종료된 콘텐츠의 재공개 여부는 미리 안내해 드리기 어려운 점 양해 부탁드립니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 658,
     "cachedInputTokens": 0,
     "outputTokens": 95,
     "latencyMs": 1597
    }
   }
  },
  {
   "question": "계정당 프로필은 몇 개까지 만들 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "모든 요금제에서 계정당 최대 5개까지 프로필을 생성할 수 있습니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "account-sharing#0",
      "docId": "account-sharing",
      "title": "프로필과 동시 시청",
      "section": "프로필",
      "excerpt": "- 모든 요금제에서 계정당 최대 5개 프로필 생성 가능\n- 프로필마다 시청 기록, 찜 목록, 추천이 따로 관리됨\n- 프로필별 시청 등급 제한과 잠금은 `adult-verification` 문서 참고"
     }
    ],
    "trace": {
     "topScore": 0.534989147487043,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-sharing#0",
       "docId": "account-sharing",
       "score": 0.534989147487043
      },
      {
       "chunkId": "adult-verification#1",
       "docId": "adult-verification",
       "score": 0.421871564990639
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.391198847643226
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.372010418770201
      },
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.362531997303004
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 981,
      "cachedInputTokens": 0,
      "outputTokens": 62,
      "latencyMs": 1658
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n시네웨이브는 모든 요금제에서 계정당 최대 5개까지 프로필을 생성하실 수 있습니다. 프로필마다 시청 기록, 찜 목록, 추천 콘텐츠가 각각 따로 관리됩니다. 프로필별로 시청 등급 제한과 잠금 설정도 이용하실 수 있습니다. 추가로 궁금한 점이 있으시면 언제든 문의해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 641,
     "cachedInputTokens": 0,
     "outputTokens": 89,
     "latencyMs": 1851
    }
   }
  },
  {
   "question": "결제일을 바꿀 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "결제일 변경 기능은 지원하지 않습니다. 최초 구독 결제일을 기준으로 매월 같은 날짜에 자동 결제되며, 29~31일 결제 건은 해당 날짜가 없는 달의 경우 말일에 결제됩니다.",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "payment#1",
      "docId": "payment",
      "title": "결제 안내",
      "section": "결제일",
      "excerpt": "- 최초 구독 결제일 기준으로 매월 같은 날 자동 결제\n- 29일, 30일, 31일에 가입한 경우 해당 날짜가 없는 달에는 그달 말일에 결제\n- 결제일 변경 기능은 없음"
     }
    ],
    "trace": {
     "topScore": 0.484365167441975,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.484365167441975
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.472497703136963
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.444294489621841
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.418073770298033
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.405847470807205
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 871,
      "cachedInputTokens": 0,
      "outputTokens": 97,
      "latencyMs": 1746
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n시네웨이브에서는 결제일 변경 기능을 지원하지 않습니다. 최초 구독 결제일을 기준으로 매월 같은 날짜에 자동 결제가 진행됩니다. 결제일이 29일, 30일, 31일인 경우 해당 날짜가 없는 달에는 그달 말일에 결제됩니다. 서비스 이용에 참고해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 663,
     "cachedInputTokens": 0,
     "outputTokens": 85,
     "latencyMs": 1304
    }
   }
  },
  {
   "question": "고객이 어제 결제했는데 드라마 한 편 봤대요. 돈 돌려받을 수 있어요?",
   "answer": {
    "status": "unanswerable",
    "text": "제공된 근거에 결제 후 시청 이력이 있는 경우의 환불 가능 여부 및 정책이 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.372618094686955,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.372618094686955
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.3601994627572
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.357069435592727
      },
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.344834131435749
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.33002560750763
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1089,
      "cachedInputTokens": 0,
      "outputTokens": 64,
      "latencyMs": 1513
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n결제 후 콘텐츠를 시청하신 경우의 환불 가능 여부에 대해 문의해 주셨습니다.\n해당 문의 내용은 관련 기준을 확인한 후 다시 안내해 드리겠습니다.\n정확한 안내를 위해 확인 중이니 잠시만 기다려 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 592,
     "cachedInputTokens": 0,
     "outputTokens": 67,
     "latencyMs": 1498
    }
   }
  },
  {
   "question": "4K로 안 나온다는데 뭐 확인해야 해요?",
   "answer": {
    "status": "answered",
    "text": "다음 4가지 조건을 확인해야 합니다.\n1. 요금제: 프리미엄 요금제 이용 여부\n2. 기기/앱: 4K 지원 기기 및 앱 사용 여부\n3. 네트워크: 인터넷 속도 25Mbps 이상 여부 (설정 > 재생 화질에서 고정 가능)\n4. 콘텐츠: 콘텐츠 상세 화면에 4K 표시가 있는 작품인지 여부 (셋 중 하나라도 빠지거나 4K 미지원 작품이면 FHD 이하로 재생됩니다)",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "playback-errors#2",
      "docId": "playback-errors",
      "title": "재생 오류 조치",
      "section": "화질 관련 문의",
      "excerpt": "- 4K 재생 조건: 프리미엄 요금제 + 4K 지원 기기·앱 + 25Mbps 이상 속도 → 셋 중 하나라도 빠지면 FHD 이하로 재생\n- 모든 콘텐츠가 4K로 제공되지는 않음. 콘텐츠 상세 화면에 4K 표시가 있는 작품만 해당\n- 네트워크 상태에 따라 화질이 자동 조절됨. 설정 > 재생 화질에서 고정 가능"
     }
    ],
    "trace": {
     "topScore": 0.574018898984181,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#2",
       "docId": "playback-errors",
       "score": 0.574018898984181
      },
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.401499250830263
      },
      {
       "chunkId": "playback-errors#0",
       "docId": "playback-errors",
       "score": 0.362026453175876
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.349536132776055
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.335547174783635
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1315,
      "cachedInputTokens": 0,
      "outputTokens": 160,
      "latencyMs": 2836
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n4K 화질로 시청하시려면 아래 조건을 모두 충족해야 합니다.\n\n1. 프리미엄 요금제 이용 여부 확인\n2. 4K 지원 기기 및 앱 사용 여부 확인\n3. 인터넷 속도 25Mbps 이상 여부 확인 (설정 > 재생 화질에서 고정 가능)\n4. 콘텐츠 상세 화면의 4K 표시 여부 확인\n\n위 조건 중 하나라도 충족되지 않거나 4K 미지원 작품인 경우 FHD 이하 화질로 재생됩니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 766,
     "cachedInputTokens": 0,
     "outputTokens": 121,
     "latencyMs": 1771
    }
   }
  },
  {
   "question": "와이프랑 동시에 보려는데 한 쪽이 끊긴대요",
   "answer": {
    "status": "answered",
    "text": "요금제별 동시 시청 한도(베이직 1대, 스탠다드 2대, 프리미엄 4대)를 초과하면 오류 코드 CW-3010과 함께 재생이 제한됩니다. 같은 프로필이어도 기기가 다르면 각각 1대로 계산되므로, 현재 이용 중인 요금제를 확인해 다른 기기의 재생을 종료하거나 상위 요금제로 변경해 이용해 주시기 바랍니다.",
    "confidence": "low",
    "citations": [
     {
      "chunkId": "account-sharing#1",
      "docId": "account-sharing",
      "title": "프로필과 동시 시청",
      "section": "동시 시청 수",
      "excerpt": "- 베이직 1대, 스탠다드 2대, 프리미엄 4대\n- 같은 프로필이라도 다른 기기에서 재생하면 각각 1대로 계산\n- 한도를 넘으면 새로 재생하려는 기기에 \"동시 시청 한도 초과\" 안내와 오류 코드 CW-3010 표시\n- 이미 재생 중인 기기의 재생을 끝내거나, 상위 요금제로 변경하면 해결"
     }
    ],
    "trace": {
     "topScore": 0.231104463737458,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-sharing#1",
       "docId": "account-sharing",
       "score": 0.231104463737458
      },
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.207725242230487
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.207106394473526
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.20005390897497
      },
      {
       "chunkId": "playback-errors#3",
       "docId": "playback-errors",
       "score": 0.179190359582689
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1333,
      "cachedInputTokens": 0,
      "outputTokens": 144,
      "latencyMs": 2098
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n시네웨이브는 요금제별로 동시 시청 가능한 기기 수가 정해져 있어, 이를 초과할 경우 재생이 제한되며 오류 코드 CW-3010이 표시됩니다. 같은 프로필을 사용하더라도 서로 다른 기기에서 재생하면 각각 1대로 계산됩니다. 동시 시청 한도는 베이직 1대, 스탠다드 2대, 프리미엄 4대입니다. 이용을 원하실 경우 다른 기기의 재생을 종료하시거나, 더 많은 동시 시청을 지원하는 상위 요금제로 변경해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 760,
     "cachedInputTokens": 0,
     "outputTokens": 137,
     "latencyMs": 1799
    }
   }
  },
  {
   "question": "아이폰에서 결제한 사람은 환불 어디서 해요?",
   "answer": {
    "status": "answered",
    "text": "아이폰 등 앱마켓 인앱결제 건은 시네웨이브 상담원이 직접 환불 처리할 수 없으므로, 해당 앱마켓(애플) 고객센터로 환불을 요청하도록 안내해야 합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "refund#3",
      "docId": "refund",
      "title": "환불 정책",
      "section": "인앱결제 환불",
      "excerpt": "- 앱마켓 인앱결제는 앱마켓 환불 정책을 따름\n- 상담원이 직접 환불 처리할 수 없음 → 앱마켓 고객센터로 환불 요청하도록 안내"
     },
     {
      "chunkId": "payment#0",
      "docId": "payment",
      "title": "결제 안내",
      "section": "결제 수단",
      "excerpt": "- 신용카드, 체크카드\n- 휴대폰 소액결제\n- 간편결제 (카드 등록형)\n- 앱마켓 인앱결제 (iOS, Android)\n- 계좌이체와 무통장입금은 지원하지 않음"
     }
    ],
    "trace": {
     "topScore": 0.566910319666066,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "refund#3",
       "docId": "refund",
       "score": 0.566910319666066
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.517040950280751
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.510542673504563
      },
      {
       "chunkId": "refund#1",
       "docId": "refund",
       "score": 0.465948843319352
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.46078113108771
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 942,
      "cachedInputTokens": 0,
      "outputTokens": 99,
      "latencyMs": 1640
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n아이폰을 통해 앱마켓에서 인앱결제하신 건은 시네웨이브 고객센터에서 직접 환불 처리해 드리기 어렵습니다. 앱마켓 인앱결제는 해당 앱마켓의 환불 정책을 따르고 있으므로, 결제하신 애플 고객센터로 환불을 요청해 주셔야 합니다. 직접 도움을 드리지 못해 양해를 부탁드립니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 719,
     "cachedInputTokens": 0,
     "outputTokens": 92,
     "latencyMs": 1429
    }
   }
  },
  {
   "question": "비번 까먹었다는데 상담원이 바꿔줘도 돼요?",
   "answer": {
    "status": "answered",
    "text": "상담원이 직접 비밀번호를 바꾸거나 알려줄 수 없습니다. 고객이 로그인 화면의 '비밀번호 찾기'를 통해 가입 이메일로 재설정 링크를 발송받아 직접 변경하도록 안내해야 합니다.",
    "confidence": "low",
    "citations": [
     {
      "chunkId": "account-security#1",
      "docId": "account-security",
      "title": "계정 보안",
      "section": "비밀번호 재설정",
      "excerpt": "- 로그인 화면 > 비밀번호 찾기 > 가입 이메일로 재설정 링크 발송\n- 링크는 발송 후 30분간 유효\n- 메일이 오지 않으면 스팸함 확인, 가입 이메일 오타 여부 확인\n- 상담원이 비밀번호를 직접 바꾸거나 알려줄 수 없음"
     }
    ],
    "trace": {
     "topScore": 0.319194527447558,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.319194527447558
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.302219718323759
      },
      {
       "chunkId": "account-security#1",
       "docId": "account-security",
       "score": 0.28920182230313
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.285489895218819
      },
      {
       "chunkId": "refund#3",
       "docId": "refund",
       "score": 0.276648309635989
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 865,
      "cachedInputTokens": 0,
      "outputTokens": 97,
      "latencyMs": 1830
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n비밀번호는 계정 보안을 위해 고객센터에서 직접 변경해 드리거나 알려드릴 수 없습니다. 아래 순서에 따라 비밀번호 재설정을 직접 진행해 주시기 바랍니다.\n\n1. 로그인 화면에서 '비밀번호 찾기'를 선택합니다.\n2. 가입한 이메일 주소를 입력해 재설정 링크를 발송받습니다.\n3. 수신된 이메일의 링크를 통해 비밀번호를 새로 설정합니다.\n\n재설정 링크는 발송 후 30분간 유효합니다. 메일이 오지 않는다면 스팸함을 확인해 주시거나 가입 시 입력한 이메일 주소에 오타가 없는지 확인해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 683,
     "cachedInputTokens": 0,
     "outputTokens": 163,
     "latencyMs": 1861
    }
   }
  },
  {
   "question": "오프라인으로 보던 게 갑자기 재생이 안 된대요",
   "answer": {
    "status": "answered",
    "text": "다운로드 콘텐츠를 계속 재생하려면 30일에 한 번 이상 인터넷에 연결하여 계정 확인을 진행해야 합니다. 또한, 판권이 종료되었거나 이용권 해지(이용 기간 종료) 또는 환불이 완료된 경우 다운로드본 재생이 불가합니다. 지속될 경우 앱 최신 버전 업데이트 및 기기 재부팅 등 1차 조치를 안내해 주세요.",
    "confidence": "low",
    "citations": [
     {
      "chunkId": "playback-errors#0",
      "docId": "playback-errors",
      "title": "재생 오류 조치",
      "section": "공통 1차 조치",
      "excerpt": "- 앱 최신 버전 업데이트\n- 앱 완전 종료 후 재실행, 기기 재부팅\n- 다른 콘텐츠도 재생되지 않는지 확인 → 특정 콘텐츠만 안 되면 콘텐츠 문제, 전부 안 되면 기기·네트워크 문제"
     },
     {
      "chunkId": "download#2",
      "docId": "download",
      "title": "다운로드(오프라인 저장)",
      "section": "오프라인 인증",
      "excerpt": "- 다운로드 콘텐츠를 계속 보려면 30일에 한 번 이상 인터넷에 연결해 계정 확인 필요"
     },
     {
      "chunkId": "download#4",
      "docId": "download",
      "title": "다운로드(오프라인 저장)",
      "section": "해지·환불 시",
      "excerpt": "- 해지: 이용 기간 종료 시점에 다운로드본 재생 불가\n- 환불: 환불 완료 즉시 재생 불가"
     },
     {
      "chunkId": "download#3",
      "docId": "download",
      "title": "다운로드(오프라인 저장)",
      "section": "다운로드 불가 콘텐츠",
      "excerpt": "- 일부 콘텐츠는 판권 조건상 다운로드 불가. 상세 화면에 다운로드 버튼이 없음\n- 판권 종료 예정 콘텐츠는 종료일에 다운로드본도 재생 불가"
     }
    ],
    "trace": {
     "topScore": 0.274957783502684,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#0",
       "docId": "playback-errors",
       "score": 0.274957783502684
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.254509943297806
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.245130314332167
      },
      {
       "chunkId": "download#4",
       "docId": "download",
       "score": 0.243730118972599
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.242658343861898
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 852,
      "cachedInputTokens": 0,
      "outputTokens": 150,
      "latencyMs": 1768
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n다운로드한 콘텐츠를 오프라인에서 계속 시청하시려면 30일에 한 번 이상 인터넷에 연결해 계정 확인을 진행해 주셔야 합니다. 또한, 해당 콘텐츠의 판권이 종료되었거나 이용권 이용 기간 종료 또는 환불이 완료된 경우 재생이 불가합니다. 위의 경우에 해당하지 않는데도 재생 오류가 지속된다면 아래 방법으로 조치를 진행해 보시기 바랍니다.\n1. 시네웨이브 앱을 최신 버전으로 업데이트합니다.\n2. 앱을 완전히 종료한 후 재실행하거나 기기를 재부팅합니다.\n3. 다른 다운로드 콘텐츠도 동일하게 재생되지 않는지 확인합니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 833,
     "cachedInputTokens": 0,
     "outputTokens": 150,
     "latencyMs": 1682
    }
   }
  },
  {
   "question": "다음 시즌 언제 나오냐고 계속 물어보는데 뭐라고 해요?",
   "answer": {
    "status": "answered",
    "text": "공지되지 않은 공개일과 다음 시즌 제작 여부는 추측해서 안내하지 않으며, 공식 공지사항이나 상세 화면에 게시된 일정만 안내해야 합니다. \"현재 공지된 일정이 없습니다. 확정되면 공지사항과 알림으로 안내됩니다.\"라고 응대하시면 됩니다.",
    "confidence": "low",
    "citations": [
     {
      "chunkId": "content-schedule#0",
      "docId": "content-schedule",
      "title": "콘텐츠 공개·종료 안내",
      "section": "공개 일정 안내 원칙",
      "excerpt": "- 공식 공지사항이나 콘텐츠 상세 화면에 게시된 일정만 안내\n- 공지되지 않은 공개일, 다음 시즌 제작 여부는 추측해서 안내하지 않음\n- 응대 문구 예: \"현재 공지된 일정이 없습니다. 확정되면 공지사항과 알림으로 안내됩니다.\""
     }
    ],
    "trace": {
     "topScore": 0.247359751859171,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.247359751859171
      },
      {
       "chunkId": "content-schedule#1",
       "docId": "content-schedule",
       "score": 0.239560366661272
      },
      {
       "chunkId": "content-schedule#0",
       "docId": "content-schedule",
       "score": 0.236527508291056
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.216502399876401
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.216159924719236
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 953,
      "cachedInputTokens": 0,
      "outputTokens": 110,
      "latencyMs": 1428
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의하신 작품의 다음 시즌은 현재 공지된 일정이 없습니다.\n공식적으로 공개 일정이 확정되면 공지사항과 알림을 통해 안내해 드릴 예정입니다.\n정확한 소식을 바로 전해드리지 못해 양해 부탁드립니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 695,
     "cachedInputTokens": 0,
     "outputTokens": 66,
     "latencyMs": 1416
    }
   }
  },
  {
   "question": "앱에서 쿠폰 번호 넣는 칸이 없대요",
   "answer": {
    "status": "answered",
    "text": "앱마켓 정책으로 인해 앱에서는 쿠폰 등록이 불가합니다. 웹 브라우저에서 '마이페이지 > 이용권·쿠폰 등록' 메뉴를 통해 등록해 주시기 바랍니다.",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "coupon-event#1",
      "docId": "coupon-event",
      "title": "이용권·쿠폰·이벤트",
      "section": "등록 방법",
      "excerpt": "- 이용권·쿠폰 코드는 영문과 숫자 16자리\n- 웹에서만 등록 가능: 마이페이지 > 이용권·쿠폰 등록\n- 앱에서는 등록 불가 (앱마켓 정책)"
     }
    ],
    "trace": {
     "topScore": 0.464953284433282,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "coupon-event#1",
       "docId": "coupon-event",
       "score": 0.464953284433282
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.403413693961645
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.40080554598294
      },
      {
       "chunkId": "coupon-event#3",
       "docId": "coupon-event",
       "score": 0.354634745307511
      },
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.338782853900826
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 953,
      "cachedInputTokens": 0,
      "outputTokens": 87,
      "latencyMs": 1499
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n앱마켓 정책으로 인해 앱 내에서는 쿠폰 등록이 불가합니다. 쿠폰은 웹 브라우저를 통해 시네웨이브 웹사이트에 접속하신 후 등록해 주셔야 합니다. '마이페이지 > 이용권·쿠폰 등록' 메뉴에서 영문과 숫자로 이루어진 16자리 코드를 입력해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 650,
     "cachedInputTokens": 0,
     "outputTokens": 83,
     "latencyMs": 1576
    }
   }
  },
  {
   "question": "요금제 낮추면 차액 돌려주나요?",
   "answer": {
    "status": "answered",
    "text": "요금제를 낮추실 경우 차액 환불은 제공되지 않습니다. 현재 결제 기간이 끝날 때까지 기존 요금제가 유지되며, 다음 결제일부터 하위 요금제로 결제 및 적용됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "plans#2",
      "docId": "plans",
      "title": "요금제 안내",
      "section": "요금제 내리기 (다운그레이드)",
      "excerpt": "- 현재 결제 기간이 끝날 때까지 기존 요금제 유지\n- 다음 결제일부터 하위 요금제 요금으로 결제\n- 결제일 전까지는 변경 예약 취소 가능\n- 차액 환불은 없음"
     }
    ],
    "trace": {
     "topScore": 0.53465787683518,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "plans#1",
       "docId": "plans",
       "score": 0.53465787683518
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.509808559633845
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.458801695517831
      },
      {
       "chunkId": "plans#3",
       "docId": "plans",
       "score": 0.438078165781964
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.426547165321153
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1006,
      "cachedInputTokens": 0,
      "outputTokens": 85,
      "latencyMs": 1634
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n요금제를 낮추실 경우 차액 환불은 제공되지 않습니다. 현재 이용 중이신 요금제는 이번 결제 기간이 끝날 때까지 그대로 유지되며, 다음 결제일부터 변경하신 하위 요금제로 결제 및 적용됩니다. 요금제 변경 예약은 다음 결제일 전까지 취소하실 수 있습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 667,
     "cachedInputTokens": 0,
     "outputTokens": 82,
     "latencyMs": 1497
    }
   }
  },
  {
   "question": "모르는 폰이 로그인돼 있다고 불안해하세요",
   "answer": {
    "status": "answered",
    "text": "1. '마이페이지 > 기기 관리'에서 '모든 기기에서 로그아웃'을 진행하도록 안내해 주세요. 2. 비밀번호를 즉시 변경하도록 안내합니다. 3. '마이페이지 > 보안 설정 > 2단계 인증' 설정을 권장해 주세요. 4. 본인이 하지 않은 결제가 있는지 확인하고, 도용 결제가 있다면 환불을 접수합니다. 5. 프로필 이름이나 결제 수단 등 이상 변경 내역이 있는지 확인하여 상담 기록에 남깁니다.",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "account-security#3",
      "docId": "account-security",
      "title": "계정 보안",
      "section": "계정 도용 의심",
      "excerpt": "1. 마이페이지 > 기기 관리 > 모든 기기에서 로그아웃 안내\n2. 비밀번호 즉시 변경 안내\n3. 2단계 인증 설정 권장\n4. 본인이 하지 않은 결제가 있으면 결제 내역 확인 후 `refund` 문서의 도용 결제 기준으로 환불 접수\n5. 프로필 이름 변경, 결제 수단 변경 등 이상 변경 내역을 상담 기록에 남김"
     },
     {
      "chunkId": "account-security#4",
      "docId": "account-security",
      "title": "계정 보안",
      "section": "2단계 인증",
      "excerpt": "- 로그인 시 비밀번호와 함께 휴대폰 인증번호 입력\n- 웹: 마이페이지 > 보안 설정 > 2단계 인증\n- 선택 사항이며 도용 의심 문의 시 설정을 권장"
     }
    ],
    "trace": {
     "topScore": 0.414068575381456,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.414068575381456
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.406821579126873
      },
      {
       "chunkId": "account-security#4",
       "docId": "account-security",
       "score": 0.40151139519307
      },
      {
       "chunkId": "account-security#2",
       "docId": "account-security",
       "score": 0.362490976405598
      },
      {
       "chunkId": "account-security#0",
       "docId": "account-security",
       "score": 0.360141705082581
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 970,
      "cachedInputTokens": 0,
      "outputTokens": 172,
      "latencyMs": 1927
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n모르는 기기의 접속이 확인된 경우 계정 보호를 위해 즉시 조치를 진행해 주셔야 합니다.\n\n1. 마이페이지의 '기기 관리'에서 '모든 기기에서 로그아웃'을 진행해 주세요.\n2. 계정 비밀번호를 즉시 변경해 주세요.\n3. 추가 피해 예방을 위해 마이페이지의 '보안 설정'에서 '2단계 인증'을 설정해 주시기 바랍니다.\n\n직접 진행하지 않은 결제 내역이나 프로필 이름, 결제 수단 등의 변경 사항이 있는지 확인해 주시기 바랍니다. 본인이 하지 않은 도용 결제가 확인되면 고객센터로 말씀해 주시면 환불 접수를 도와드리겠습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 821,
     "cachedInputTokens": 0,
     "outputTokens": 161,
     "latencyMs": 1788
    }
   }
  },
  {
   "question": "고객이 자기 가입 이메일 뭐였는지 알려달래요",
   "answer": {
    "status": "answered",
    "text": "본인 확인 전에는 계정 정보를 안내할 수 없으며, 본인 확인(가입 이메일 인증 링크 또는 휴대폰 본인인증) 완료 후 이메일 앞 2자리만 노출하고 나머지는 가려서 안내할 수 있습니다(예: ab****@****.com).",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "account-security#0",
      "docId": "account-security",
      "title": "계정 보안",
      "section": "본인 확인 원칙",
      "excerpt": "- 본인 확인 전에는 계정 정보를 알려주지 않음\n- 이메일은 앞 2자리만 노출하고 나머지는 가려서 안내 (예: ab****@****.com)\n- 결제 수단은 카드사명과 끝 4자리까지만 안내\n- 본인 확인 방법: 가입 이메일로 인증 링크 발송, 또는 휴대폰 본인인증"
     }
    ],
    "trace": {
     "topScore": 0.469424048278368,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-security#0",
       "docId": "account-security",
       "score": 0.469424048278368
      },
      {
       "chunkId": "account-security#2",
       "docId": "account-security",
       "score": 0.424038283822933
      },
      {
       "chunkId": "account-security#1",
       "docId": "account-security",
       "score": 0.419368629236134
      },
      {
       "chunkId": "cancel#1",
       "docId": "cancel",
       "score": 0.405733007090924
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.374740979092242
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1046,
      "cachedInputTokens": 0,
      "outputTokens": 111,
      "latencyMs": 1509
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n고객님의 계정 정보 보호를 위해 본인 확인이 완료된 후에 가입 이메일을 안내해 드릴 수 있습니다.\n본인 확인은 가입 이메일로 발송되는 인증 링크를 확인하시거나 휴대폰 본인인증을 통해 진행하실 수 있습니다.\n본인 확인이 완료되면 이메일은 앞 2자리만 노출되고 나머지는 마스킹 처리되어 안내됩니다(예: ab****@****.com).\n원하시는 본인 확인 방법을 말씀해 주시면 확인을 도와드리겠습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 712,
     "cachedInputTokens": 0,
     "outputTokens": 124,
     "latencyMs": 1586
    }
   }
  },
  {
   "question": "카드 한도 초과로 결제 안 됐으면 자동으로 다시 긁히나요?",
   "answer": {
    "status": "answered",
    "text": "결제일에 카드 한도 초과 등으로 결제가 실패하면 3일 간격으로 최대 3회 자동 재시도됩니다. 첫 실패일로부터 7일간은 유예 기간으로 정상 이용이 가능하며, 7일 이내에 결제가 성공하지 않으면 이용이 정지됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "payment#3",
      "docId": "payment",
      "title": "결제 안내",
      "section": "결제 실패",
      "excerpt": "- 결제일에 결제가 실패하면 3일 간격으로 최대 3회 자동 재시도\n- 첫 실패일로부터 7일간은 유예 기간으로 정상 이용 가능\n- 7일 안에 결제가 성공하지 않으면 이용 정지\n- 이용 정지 후 결제 수단을 갱신하고 재결제하면 즉시 이용 재개, 결제일은 재결제한 날로 변경\n- 흔한 실패 원인: 카드 한도 초과, 카드 유효기간 만료, 휴대폰 결제 월 한도 초과"
     }
    ],
    "trace": {
     "topScore": 0.548842844317557,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.548842844317557
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.497536704358319
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.47895139457598
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.434893433134693
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.412089212950467
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 976,
      "cachedInputTokens": 0,
      "outputTokens": 109,
      "latencyMs": 1733
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n카드 한도 초과 등으로 결제에 실패한 경우, 결제일로부터 3일 간격으로 최대 3회까지 자동 재시도됩니다.\n첫 실패일로부터 7일간은 유예 기간이 적용되어 서비스를 정상적으로 이용하실 수 있습니다.\n다만 7일 이내에 결제가 성공하지 않으면 서비스 이용이 정지됩니다.\n이용이 정지된 이후에는 결제 수단을 갱신하여 다시 결제하시면 즉시 이용이 재개되며, 결제일은 재결제하신 날로 변경됩니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 748,
     "cachedInputTokens": 0,
     "outputTokens": 130,
     "latencyMs": 1592
    }
   }
  },
  {
   "question": "해지랑 환불이 뭐가 다른지 고객한테 설명해야 해요",
   "answer": {
    "status": "answered",
    "text": "해지는 다음 정기결제를 멈추는 것으로, 이미 결제된 이용 기간 끝까지 정상 이용할 수 있습니다. 반면 환불은 이미 결제된 금액을 돌려받는 것으로, 결제 후 7일 이내이면서 시청 이력(1분 이상 재생)이 없을 때 전액 환불이 가능합니다. 결제 후 7일이 지났거나 시청 이력이 있으면 환불은 불가하며 해지만 가능합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "cancel#0",
      "docId": "cancel",
      "title": "해지 안내",
      "section": "해지의 의미",
      "excerpt": "- 해지는 **다음 정기결제를 멈추는 것**\n- 해지해도 이미 결제한 기간 끝까지 정상 이용 가능\n- 해지는 환불이 아님. 환불 조건은 `refund` 문서 기준"
     },
     {
      "chunkId": "refund#0",
      "docId": "refund",
      "title": "환불 정책",
      "section": "기본 원칙",
      "excerpt": "- 환불 여부는 **결제 후 경과일**과 **시청 이력** 두 가지로 판단\n- 시청 이력: 해당 결제 이후 콘텐츠를 1분 이상 재생한 기록 (예고편 제외)\n\n| 조건 | 처리 |\n|---|---|\n| 결제 후 7일 이내, 시청 이력 없음 | 전액 환불 |\n| 결제 후 7일 이내, 시청 이력 있음 | 환불 불가, 해지만 가능 |\n| 결제 후 7일 경과 | 환불 불가, 해지만 가능 |\n\n- 환불 불가인 경우에도 해지하면 남은 결제 기간 끝까지 이용 가능 (`cancel` 문서 참고)\n- 부분 환불(남은 일수 일할 환불)은 하지 않음"
     }
    ],
    "trace": {
     "topScore": 0.55917891628448,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "cancel#0",
       "docId": "cancel",
       "score": 0.55917891628448
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.515625439782816
      },
      {
       "chunkId": "refund#0",
       "docId": "refund",
       "score": 0.503855780584571
      },
      {
       "chunkId": "refund#1",
       "docId": "refund",
       "score": 0.477461659238371
      },
      {
       "chunkId": "refund#3",
       "docId": "refund",
       "score": 0.466205122668906
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1018,
      "cachedInputTokens": 0,
      "outputTokens": 151,
      "latencyMs": 1543
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n해지는 다음 정기결제를 멈추는 것으로, 이미 결제된 이용 기간 끝까지 정상적으로 서비스를 이용하실 수 있습니다. 반면 환불은 이미 결제된 금액을 돌려받는 절차입니다. 환불은 결제 후 7일 이내이면서 콘텐츠를 1분 이상 재생한 시청 이력이 없을 때만 전액 환불이 가능합니다. 결제 후 7일이 지났거나 시청 이력이 있는 경우에는 환불이 불가하며 해지만 진행하실 수 있습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 890,
     "cachedInputTokens": 0,
     "outputTokens": 121,
     "latencyMs": 1415
    }
   }
  },
  {
   "question": "남은 기간 있는데 탈퇴하면 환불돼요?",
   "answer": {
    "status": "answered",
    "text": "회원 탈퇴 시 남은 이용 기간은 즉시 소멸되며, 남은 일수에 대한 부분 환불(일할 환불)은 되지 않습니다. 환불은 결제 후 7일 이내이면서 시청 이력이 없는 경우에만 전액 환불이 가능합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "cancel#4",
      "docId": "cancel",
      "title": "해지 안내",
      "section": "해지와 회원 탈퇴의 차이",
      "excerpt": "| 구분 | 해지 | 회원 탈퇴 |\n|---|---|---|\n| 정기결제 | 중단 | 중단 |\n| 남은 이용 기간 | 끝까지 이용 | 즉시 소멸 |\n| 시청 기록·찜 | 12개월 보관 | 즉시 삭제 |\n| 재가입 | 같은 계정으로 재구독 | 새 계정 가입 필요 |\n\n- 남은 기간이 있는데 탈퇴를 원하면 남은 기간이 소멸된다는 점을 반드시 안내\n- 탈퇴 후 30일 동안 같은 이메일로 재가입 불가"
     },
     {
      "chunkId": "refund#0",
      "docId": "refund",
      "title": "환불 정책",
      "section": "기본 원칙",
      "excerpt": "- 환불 여부는 **결제 후 경과일**과 **시청 이력** 두 가지로 판단\n- 시청 이력: 해당 결제 이후 콘텐츠를 1분 이상 재생한 기록 (예고편 제외)\n\n| 조건 | 처리 |\n|---|---|\n| 결제 후 7일 이내, 시청 이력 없음 | 전액 환불 |\n| 결제 후 7일 이내, 시청 이력 있음 | 환불 불가, 해지만 가능 |\n| 결제 후 7일 경과 | 환불 불가, 해지만 가능 |\n\n- 환불 불가인 경우에도 해지하면 남은 결제 기간 끝까지 이용 가능 (`cancel` 문서 참고)\n- 부분 환불(남은 일수 일할 환불)은 하지 않음"
     }
    ],
    "trace": {
     "topScore": 0.527423723283056,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.527423723283056
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.502465187783352
      },
      {
       "chunkId": "refund#5",
       "docId": "refund",
       "score": 0.452305869047302
      },
      {
       "chunkId": "refund#0",
       "docId": "refund",
       "score": 0.435004707630989
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.397529744823755
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1103,
      "cachedInputTokens": 0,
      "outputTokens": 114,
      "latencyMs": 1402
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n회원 탈퇴를 진행하시면 남은 이용 기간은 즉시 소멸되며, 남은 일수에 대한 부분 환불은 되지 않습니다. 환불은 결제 후 7일 이내이면서 시청 이력이 없는 경우에만 전액 환불이 가능합니다. 탈퇴 시 시청 기록과 찜 목록도 즉시 삭제되며 탈퇴 후 30일 동안 같은 이메일로 재가입이 불가합니다. 남은 기간 끝까지 이용을 원하시면 탈퇴 대신 정기결제 해지를 이용해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 934,
     "cachedInputTokens": 0,
     "outputTokens": 127,
     "latencyMs": 1598
    }
   }
  },
  {
   "question": "본인이 안 한 결제가 있대요. 어떻게 처리해요?",
   "answer": {
    "status": "answered",
    "text": "본인이 요청하지 않은 결제 유형에 따라 아래와 같이 처리됩니다.\n- 회원이 요청하지 않은 요금제 변경 결제가 확인된 경우: 해당 결제분 전액 환불\n- 계정 도용으로 인한 결제가 확인된 경우: 계정 도용 처리(account-security 문서 기준) 진행 후 환불",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "refund#1",
      "docId": "refund",
      "title": "환불 정책",
      "section": "예외: 전액 환불",
      "excerpt": "- 같은 결제 주기에 중복 결제된 경우 → 중복 결제분 전액 환불, 시청 이력과 무관\n- 회원이 요청하지 않은 요금제 변경 결제가 확인된 경우 → 해당 결제 전액 환불\n- 계정 도용으로 인한 결제가 확인된 경우 → `account-security` 문서의 도용 처리 후 환불"
     }
    ],
    "trace": {
     "topScore": 0.478794646405277,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.478794646405277
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.468960551093513
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.437029064328473
      },
      {
       "chunkId": "refund#1",
       "docId": "refund",
       "score": 0.434049708112404
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.41449574202115
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 917,
      "cachedInputTokens": 0,
      "outputTokens": 117,
      "latencyMs": 1839
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n직접 진행하지 않은 결제 건은 확인되는 결제 유형에 따라 처리 및 환불이 진행됩니다.\n요청하지 않은 요금제 변경으로 결제된 사실이 확인되면 해당 결제분 전액이 환불됩니다.\n계정 도용으로 인한 결제로 확인될 경우에는 도용 관련 확인 절차를 거친 후 환불을 진행해 드립니다.\n고객센터로 상세 결제 내역과 함께 문의해 주시면 확인 후 신속히 도움을 드리겠습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 716,
     "cachedInputTokens": 0,
     "outputTokens": 117,
     "latencyMs": 1839
    }
   }
  },
  {
   "question": "서버 장애로 하루 넘게 못 봤으면 보상 있나요?",
   "answer": {
    "status": "answered",
    "text": "시네웨이브 귀책의 전체 서비스 장애가 24시간 이상 연속될 경우 보상이 제공됩니다. 보상은 환불이 아니며 장애 시간만큼 이용 기간이 연장됩니다. (단, 개별 기기나 네트워크 문제로 인한 재생 불가는 보상 대상에서 제외됩니다.)",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "refund#2",
      "docId": "refund",
      "title": "환불 정책",
      "section": "예외: 서비스 장애 보상",
      "excerpt": "- 시네웨이브 귀책의 전체 서비스 장애가 24시간 이상 연속될 때만 보상\n- 보상은 환불이 아니라 장애 시간만큼 이용 기간 연장\n- 개별 기기·네트워크 문제로 인한 재생 불가는 보상 대상 아님 (`playback-errors` 문서로 조치 안내)"
     }
    ],
    "trace": {
     "topScore": 0.495518726012118,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "refund#2",
       "docId": "refund",
       "score": 0.495518726012118
      },
      {
       "chunkId": "playback-errors#3",
       "docId": "playback-errors",
       "score": 0.45033473360504
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.305645114057017
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.288978803622033
      },
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.281228173220838
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 962,
      "cachedInputTokens": 0,
      "outputTokens": 108,
      "latencyMs": 1478
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n시네웨이브 귀책으로 인한 전체 서비스 장애가 24시간 이상 연속으로 발생한 경우 보상이 제공됩니다. 보상은 환불 형태가 아니며, 발생한 장애 시간만큼 이용 기간이 연장됩니다. 다만 개별 기기나 네트워크 문제로 인해 재생되지 않은 경우는 보상 대상에서 제외됩니다. 추가로 궁금한 점이 있으시면 언제든 문의해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 696,
     "cachedInputTokens": 0,
     "outputTokens": 94,
     "latencyMs": 8737
    }
   }
  },
  {
   "question": "베이직 쓰는데 다운로드 하고 싶대요",
   "answer": {
    "status": "answered",
    "text": "베이직 요금제는 다운로드를 이용하실 수 없습니다. 다운로드 기능을 이용하시려면 스탠다드나 프리미엄 요금제로 변경하셔야 합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "download#0",
      "docId": "download",
      "title": "다운로드(오프라인 저장)",
      "section": "요금제별 다운로드",
      "excerpt": "- 베이직: 다운로드 불가\n- 스탠다드: 기기 2대까지\n- 프리미엄: 기기 4대까지\n- 다운로드는 모바일·태블릿 앱에서만 가능. PC 웹과 TV 앱은 불가"
     }
    ],
    "trace": {
     "topScore": 0.529683315216644,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "download#0",
       "docId": "download",
       "score": 0.529683315216644
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.406297799741701
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.387276977772155
      },
      {
       "chunkId": "download#4",
       "docId": "download",
       "score": 0.36740714182671
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.365762054836979
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 862,
      "cachedInputTokens": 0,
      "outputTokens": 81,
      "latencyMs": 1659
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n현재 이용 중이신 베이직 요금제는 다운로드 기능을 지원하지 않습니다. 콘텐츠 다운로드를 이용하시려면 스탠다드나 프리미엄 요금제로 변경해 주셔야 합니다. 스탠다드 요금제는 최대 2대, 프리미엄 요금제는 최대 4대까지 다운로드가 가능합니다. 다운로드 기능은 모바일 및 태블릿 앱에서만 이용하실 수 있으며, PC 웹과 TV 앱에서는 지원되지 않으니 이용에 참고해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 657,
     "cachedInputTokens": 0,
     "outputTokens": 118,
     "latencyMs": 2042
    }
   }
  },
  {
   "question": "찜해둔 영화가 CW-4040 뜨면서 안 나와요",
   "answer": {
    "status": "answered",
    "text": "CW-4040 오류는 판권이 종료되어 내려간 콘텐츠이거나, 국내 전용 콘텐츠를 해외에서 재생 시도했을 때 발생합니다. 판권이 종료된 경우 찜 목록에 남아 있더라도 재생이 불가하며, 재공개 여부는 안내가 어렵습니다.",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "playback-errors#1",
      "docId": "playback-errors",
      "title": "재생 오류 조치",
      "section": "오류 코드별 조치",
      "excerpt": "### CW-1001 네트워크 연결 오류\n\n- 원인: 인터넷 연결 불안정, 속도 부족\n- 권장 속도: HD 3Mbps, FHD 5Mbps, 4K 25Mbps 이상\n- 조치: 공유기 재시작, 모바일 데이터와 Wi-Fi 전환해서 재시도\n\n### CW-2003 콘텐츠 보호(DRM) 오류\n\n- 원인: 기기·브라우저가 콘텐츠 보호 기술을 지원하지 않음, 외부 모니터가 HDCP 미지원\n- 조치: 앱·브라우저 업데이트, 외부 모니터 연결 해제 후 재생, 화면 녹화·미러링 앱 종료\n- 루팅·탈옥 기기에서는 재생 불가\n\n### CW-3010 동시 시청 한도 초과\n\n- 원인: 요금제의 동시 시청 수 초과\n- 조치: `account-sharing` 문서의 동시 시청 수 기준으로 안내\n\n### CW-4040 콘텐츠 이용 불가\n\n- 원인: 판권 종료로 내려간 콘텐츠, 또는 국내에서만 서비스되는 콘텐츠를 해외에서 재생 시도\n- 조치: 판권 종료 여부는 `content-schedule` 문서 기준으로 안내\n- 해외 재생 가능 여부에 대한 별도 정책 문서는 없음\n\n### CW-5000 서버 오류\n\n- 원인: 시네웨이브 서버 문제\n- 조치: 공지사항의 장애 공지 확인 안내\n- 같은 오류가 30분 이상 반복되면 기술지원 담당에게 이관 (고객 기기 정보, 발생 시각, 오류 코드 기록)"
     },
     {
      "chunkId": "content-schedule#3",
      "docId": "content-schedule",
      "title": "콘텐츠 공개·종료 안내",
      "section": "판권 종료(공개 종료)",
      "excerpt": "- 판권 종료 30일 전부터 상세 화면에 \"공개 종료 예정\" 표시와 종료일 노출\n- 종료 후에는 찜 목록에 남아 있어도 재생 불가 (오류 코드 CW-4040)\n- 종료된 콘텐츠의 재공개 여부는 안내 불가"
     }
    ],
    "trace": {
     "topScore": 0.409399788116595,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.409399788116595
      },
      {
       "chunkId": "playback-errors#2",
       "docId": "playback-errors",
       "score": 0.326652367079177
      },
      {
       "chunkId": "account-sharing#1",
       "docId": "account-sharing",
       "score": 0.311197179571225
      },
      {
       "chunkId": "content-schedule#3",
       "docId": "content-schedule",
       "score": 0.29909452096673
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.281063225296587
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1289,
      "cachedInputTokens": 0,
      "outputTokens": 117,
      "latencyMs": 1326
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의하신 CW-4040 오류는 판권이 종료되어 서비스가 내려간 콘텐츠이거나, 국내 전용 콘텐츠를 해외에서 재생하려고 할 때 발생합니다. 판권이 종료된 콘텐츠는 기존에 찜해두셨더라도 목록에서 재생할 수 없습니다. 또한 서비스가 종료된 콘텐츠의 재공개 여부는 안내해 드리기 어려운 점 양해 부탁드립니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 1055,
     "cachedInputTokens": 0,
     "outputTokens": 91,
     "latencyMs": 1504
    }
   }
  },
  {
   "question": "이용권 쓰는 중에 정기결제 신청하면 바로 돈 나가요?",
   "answer": {
    "status": "answered",
    "text": "이용권 사용 중에 정기결제를 신청하시면 바로 결제되지 않고, 이용권 기간이 끝난 다음 날부터 결제가 시작됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "coupon-event#2",
      "docId": "coupon-event",
      "title": "이용권·쿠폰·이벤트",
      "section": "적용 규칙",
      "excerpt": "- 할인 쿠폰은 결제 1회에 1장만 적용, 중복 적용 불가\n- 신규 가입 할인 쿠폰은 첫 결제에만 적용\n- 이용권 사용 중에 정기결제를 신청하면 이용권 기간이 끝난 다음 날부터 결제 시작\n- 인앱결제 가입자에게는 할인 쿠폰 적용 불가 (이용권은 인앱결제 해지 후 사용 가능)"
     }
    ],
    "trace": {
     "topScore": 0.505185857254913,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.505185857254913
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.479485381192036
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.448029122892288
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.446218343938098
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.441502841668053
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 923,
      "cachedInputTokens": 0,
      "outputTokens": 77,
      "latencyMs": 1863
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n이용권 사용 중에 정기결제를 신청하셔도 바로 결제되지 않습니다. 현재 이용 중이신 이용권 기간이 모두 끝난 다음 날부터 정기결제가 시작됩니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 688,
     "cachedInputTokens": 0,
     "outputTokens": 50,
     "latencyMs": 1432
    }
   }
  },
  {
   "question": "광고형 요금제는 얼마예요?",
   "answer": {
    "status": "pending_policy",
    "text": "광고형 요금제는 도입을 검토하고 있으며, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내될 예정입니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "ad-plan#1",
      "docId": "ad-plan",
      "title": "광고형 요금제",
      "section": "상담 응대 기준",
      "excerpt": "- \"광고형 요금제는 도입을 검토하고 있으며, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내됩니다.\"로 안내\n- 예상 가격, 예상 출시 시기를 추측해서 말하지 않음\n- 사전 신청이나 대기 명단은 없음\n- 기존 요금제에 광고가 붙는지 묻는 문의에는 \"현재 요금제에는 광고가 없습니다\"까지만 안내"
     }
    ],
    "trace": {
     "topScore": 0.65019809449185,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.65019809449185
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.607892858717239
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.601899161475516
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.453589326626681
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.41824684520707
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 998,
      "cachedInputTokens": 0,
      "outputTokens": 86,
      "latencyMs": 1664
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n광고형 요금제는 현재 도입을 검토하고 있는 단계입니다. 요금제의 가격과 출시 일정은 아직 정해지지 않았습니다. 향후 관련 내용이 확정되면 공지사항을 통해 안내해 드릴 예정입니다. 서비스 이용에 참고해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 692,
     "cachedInputTokens": 0,
     "outputTokens": 69,
     "latencyMs": 1781
    }
   }
  },
  {
   "question": "광고 보는 대신 싼 요금제 언제 나와요?",
   "answer": {
    "status": "pending_policy",
    "text": "광고형 요금제는 도입을 검토하고 있으며, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내될 예정입니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "plans#4",
      "docId": "plans",
      "title": "요금제 안내",
      "section": "광고형 요금제",
      "excerpt": "- 현재 판매하지 않음\n- 도입 관련 문의는 `ad-plan` 문서 기준으로 안내"
     },
     {
      "chunkId": "ad-plan#1",
      "docId": "ad-plan",
      "title": "광고형 요금제",
      "section": "상담 응대 기준",
      "excerpt": "- \"광고형 요금제는 도입을 검토하고 있으며, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내됩니다.\"로 안내\n- 예상 가격, 예상 출시 시기를 추측해서 말하지 않음\n- 사전 신청이나 대기 명단은 없음\n- 기존 요금제에 광고가 붙는지 묻는 문의에는 \"현재 요금제에는 광고가 없습니다\"까지만 안내"
     }
    ],
    "trace": {
     "topScore": 0.548839734629314,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.548839734629314
      },
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.53651815810603
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.507877293293668
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.381086298989048
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.368758034369262
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1001,
      "cachedInputTokens": 0,
      "outputTokens": 93,
      "latencyMs": 1472
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의하신 광고형 요금제는 현재 도입을 검토하고 있는 단계입니다. 가격과 출시 일정은 아직 정해지지 않았습니다. 세부 사항이 확정되면 공지사항을 통해 안내해 드릴 예정입니다. 서비스 이용에 참고해 주시기 바랍니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 728,
     "cachedInputTokens": 0,
     "outputTokens": 66,
     "latencyMs": 1691
    }
   }
  },
  {
   "question": "광고형 요금제 사전 신청 받나요?",
   "answer": {
    "status": "pending_policy",
    "text": "광고형 요금제는 도입 검토 중으로, 사전 신청이나 대기 명단은 운영하지 않습니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "ad-plan#1",
      "docId": "ad-plan",
      "title": "광고형 요금제",
      "section": "상담 응대 기준",
      "excerpt": "- \"광고형 요금제는 도입을 검토하고 있으며, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내됩니다.\"로 안내\n- 예상 가격, 예상 출시 시기를 추측해서 말하지 않음\n- 사전 신청이나 대기 명단은 없음\n- 기존 요금제에 광고가 붙는지 묻는 문의에는 \"현재 요금제에는 광고가 없습니다\"까지만 안내"
     }
    ],
    "trace": {
     "topScore": 0.672083974002728,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.672083974002728
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.608466839337228
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.58707405237992
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.432245551113247
      },
      {
       "chunkId": "plans#3",
       "docId": "plans",
       "score": 0.401521898591267
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 890,
      "cachedInputTokens": 0,
      "outputTokens": 73,
      "latencyMs": 1614
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의하신 광고형 요금제는 현재 도입을 검토 중인 단계로, 사전 신청이나 대기 명단은 운영하지 않고 있습니다. 가격과 출시 일정을 포함한 구체적인 내용은 아직 정해지지 않았습니다. 향후 관련 내용이 확정되면 공지사항을 통해 안내해 드릴 예정입니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 680,
     "cachedInputTokens": 0,
     "outputTokens": 77,
     "latencyMs": 1585
    }
   }
  },
  {
   "question": "학생 할인 있나요?",
   "answer": {
    "status": "unanswerable",
    "text": "학생 할인 정책에 대한 정보가 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.391166276415236,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.391166276415236
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.386367500659345
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.308899325423744
      },
      {
       "chunkId": "coupon-event#3",
       "docId": "coupon-event",
       "score": 0.307088474343838
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.298552022089019
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1007,
      "cachedInputTokens": 0,
      "outputTokens": 48,
      "latencyMs": 2646
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의하신 학생 할인 혜택에 대해 현재 확인 중에 있습니다.\n해당 내용을 정확히 확인한 후 다시 안내해 드리겠습니다.\n문의해 주셔서 감사합니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 558,
     "cachedInputTokens": 0,
     "outputTokens": 185,
     "latencyMs": 1859
    }
   }
  },
  {
   "question": "회사에서 직원 복지로 단체 구독하고 싶대요",
   "answer": {
    "status": "unanswerable",
    "text": "직원 복지 단체 구독에 대한 정책이나 안내 사항이 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.408478781474766,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.408478781474766
      },
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.364547235710139
      },
      {
       "chunkId": "adult-verification#0",
       "docId": "adult-verification",
       "score": 0.348803298354208
      },
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.347490289988657
      },
      {
       "chunkId": "adult-verification#3",
       "docId": "adult-verification",
       "score": 0.321373505241176
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 984,
      "cachedInputTokens": 0,
      "outputTokens": 54,
      "latencyMs": 1565
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의해 주신 직원 복지 목적의 단체 구독과 관련하여 현재 바로 안내해 드릴 수 있는 내용을 확인하기 어렵습니다. 해당 문의 사항은 관련 부서를 통해 확인한 후 다시 안내해 드리겠습니다. 이용에 불편을 드려 죄송합니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 572,
     "cachedInputTokens": 0,
     "outputTokens": 64,
     "latencyMs": 1767
    }
   }
  },
  {
   "question": "통신사 결합 할인 되나요?",
   "answer": {
    "status": "unanswerable",
    "text": "통신사 결합 할인 제공 여부는 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.370512721363783,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.370512721363783
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.3628200386069
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.327123567529984
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.304117982563712
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.302483032605091
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 1123,
      "cachedInputTokens": 0,
      "outputTokens": 49,
      "latencyMs": 1309
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의해 주신 통신사 결합 할인 제공 여부에 대해 현재 확인 중입니다. 관련 내용을 정확히 확인한 후 다시 안내해 드리겠습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 564,
     "cachedInputTokens": 0,
     "outputTokens": 41,
     "latencyMs": 1591
    }
   }
  },
  {
   "question": "자막 싱크가 안 맞는 걸 신고하고 싶대요",
   "answer": {
    "status": "unanswerable",
    "text": "제공된 근거에 자막 싱크 오류 신고나 접수 방법에 대한 내용이 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.310733452051502,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.310733452051502
      },
      {
       "chunkId": "content-schedule#0",
       "docId": "content-schedule",
       "score": 0.295195171411689
      },
      {
       "chunkId": "coupon-event#4",
       "docId": "coupon-event",
       "score": 0.291055116373592
      },
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.28823834279903
      },
      {
       "chunkId": "content-schedule#3",
       "docId": "content-schedule",
       "score": 0.282595947154473
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 967,
      "cachedInputTokens": 0,
      "outputTokens": 59,
      "latencyMs": 3826
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의해 주신 자막 싱크 오류 접수 방법에 대해 현재 정확한 확인을 진행하고 있습니다. 관련 내용을 확인한 뒤 다시 안내해 드리겠습니다. 서비스 이용에 불편을 드려 죄송합니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 578,
     "cachedInputTokens": 0,
     "outputTokens": 53,
     "latencyMs": 1563
    }
   }
  },
  {
   "question": "해외 출장 가서도 볼 수 있어요?",
   "answer": {
    "status": "unanswerable",
    "text": "해외에서의 서비스 이용 가능 여부에 대한 내용이 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.245411355922849,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.245411355922849
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.226363789135404
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.225016192394294
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.224088355241712
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.221755944675816
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 930,
      "cachedInputTokens": 0,
      "outputTokens": 51,
      "latencyMs": 2033
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의해 주신 해외에서의 서비스 이용 가능 여부에 대해 안내해 드립니다.\n해당 내용은 현재 바로 확인이 어려워 추가 확인을 진행하고 있습니다.\n관련 내용을 확인한 뒤 다시 안내해 드리겠습니다.\n문의해 주셔서 감사합니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 566,
     "cachedInputTokens": 0,
     "outputTokens": 63,
     "latencyMs": 1999
    }
   }
  },
  {
   "question": "스포츠 경기 생중계도 해요?",
   "answer": {
    "status": "unanswerable",
    "text": "스포츠 경기 생중계 제공 여부에 대한 내용은 근거 조각에서 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.260790597871276,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "content-schedule#0",
       "docId": "content-schedule",
       "score": 0.260790597871276
      },
      {
       "chunkId": "coupon-event#4",
       "docId": "coupon-event",
       "score": 0.256821741514069
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.250368449395337
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.243927571657673
      },
      {
       "chunkId": "content-schedule#2",
       "docId": "content-schedule",
       "score": 0.238178018535413
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 902,
      "cachedInputTokens": 0,
      "outputTokens": 55,
      "latencyMs": 1573
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의해 주신 스포츠 경기 생중계 제공 여부에 대해 안내해 드립니다.\n해당 내용은 현재 바로 확인이 어려워, 관련 부서를 통해 확인한 후 다시 안내해 드리겠습니다.\n궁금하신 점에 대해 바로 답변드리지 못해 양해 부탁드립니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 569,
     "cachedInputTokens": 0,
     "outputTokens": 69,
     "latencyMs": 1557
    }
   }
  },
  {
   "question": "TV 앱에서 다운로드 기능이 언제 생기나요?",
   "answer": {
    "status": "unanswerable",
    "text": "현재 TV 앱은 다운로드가 불가하며, 다운로드 기능 도입 시점이나 계획은 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.482226495741491,
     "grounding": "partial",
     "retrieved": [
      {
       "chunkId": "download#0",
       "docId": "download",
       "score": 0.482226495741491
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.375721149244947
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.359560614957171
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.351665862452021
      },
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.328180144947232
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 878,
      "cachedInputTokens": 0,
      "outputTokens": 63,
      "latencyMs": 1847
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n현재 TV 앱에서는 다운로드 기능을 이용하실 수 없습니다. 문의해 주신 TV 앱 다운로드 기능의 도입 여부 및 시점에 대해서는 확인된 내용이 없어 정확한 답변을 드리기 어렵습니다. 해당 내용은 관련 부서를 통해 확인한 후 다시 안내해 드리겠습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 577,
     "cachedInputTokens": 0,
     "outputTokens": 68,
     "latencyMs": 1579
    }
   }
  },
  {
   "question": "연간 결제하면 할인해 주나요?",
   "answer": {
    "status": "unanswerable",
    "text": "연간 결제 요금제 제공 여부 및 연간 결제 시 할인 혜택에 대한 정책이 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.505008328577235,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.505008328577235
      },
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.496489303950079
      },
      {
       "chunkId": "plans#1",
       "docId": "plans",
       "score": 0.469706986423858
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.451628738484703
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.442470928227937
      }
     ],
     "usage": {
      "model": "gemini-3.8-flash",
      "inputTokens": 987,
      "cachedInputTokens": 0,
      "outputTokens": 64,
      "latencyMs": 1843
     }
    }
   },
   "reply": {
    "text": "안녕하세요. 시네웨이브입니다.\n문의해 주신 연간 결제 및 할인 혜택에 대해 안내해 드립니다.\n해당 내용과 관련하여 현재 확인된 정책이 없어, 문의하신 내용을 확인한 뒤 다시 안내해 드리겠습니다.\n이용에 불편을 드려 죄송하며, 확인되는 대로 안내해 드리겠습니다.",
    "unsupportedNumbers": [],
    "usage": {
     "model": "gemini-3.8-flash",
     "inputTokens": 580,
     "cachedInputTokens": 0,
     "outputTokens": 75,
     "latencyMs": 1497
    }
   }
  }
 ],
 "ops": {
  "syncedAt": "2026-09-27T13:23:49.583Z",
  "models": {
   "embedding": "text-embedding-3-small",
   "generation": "gemini-3.8-flash",
   "fallback": "gpt-5.4-mini"
  },
  "docs": [
   {
    "id": "ad-plan",
    "title": "광고형 요금제",
    "status": "pending",
    "updatedAt": "2026-09-20",
    "chunks": 2
   },
   {
    "id": "content-schedule",
    "title": "콘텐츠 공개·종료 안내",
    "status": "confirmed",
    "updatedAt": "2026-09-15",
    "chunks": 5
   },
   {
    "id": "playback-errors",
    "title": "재생 오류 조치",
    "status": "confirmed",
    "updatedAt": "2026-09-10",
    "chunks": 4
   },
   {
    "id": "coupon-event",
    "title": "이용권·쿠폰·이벤트",
    "status": "confirmed",
    "updatedAt": "2026-09-05",
    "chunks": 5
   },
   {
    "id": "refund",
    "title": "환불 정책",
    "status": "confirmed",
    "updatedAt": "2026-09-02",
    "chunks": 6
   },
   {
    "id": "cancel",
    "title": "해지 안내",
    "status": "confirmed",
    "updatedAt": "2026-08-25",
    "chunks": 5
   },
   {
    "id": "plans",
    "title": "요금제 안내",
    "status": "confirmed",
    "updatedAt": "2026-08-18",
    "chunks": 5
   },
   {
    "id": "account-sharing",
    "title": "프로필과 동시 시청",
    "status": "confirmed",
    "updatedAt": "2026-08-11",
    "chunks": 4
   },
   {
    "id": "account-security",
    "title": "계정 보안",
    "status": "confirmed",
    "updatedAt": "2026-08-04",
    "chunks": 5
   },
   {
    "id": "payment",
    "title": "결제 안내",
    "status": "confirmed",
    "updatedAt": "2026-07-30",
    "chunks": 6
   },
   {
    "id": "adult-verification",
    "title": "성인 인증과 시청 등급 설정",
    "status": "confirmed",
    "updatedAt": "2026-07-14",
    "chunks": 4
   },
   {
    "id": "download",
    "title": "다운로드(오프라인 저장)",
    "status": "confirmed",
    "updatedAt": "2026-06-20",
    "chunks": 5
   }
  ],
  "eval": {
   "at": "2026-09-27T13:23:49.583Z",
   "total": 42,
   "retrievalHit": {
    "n": 34,
    "d": 35
   },
   "statusAccuracy": {
    "n": 40,
    "d": 42
   },
   "wrongAnswer": {
    "n": 0,
    "d": 10
   },
   "overRefusal": {
    "n": 2,
    "d": 32
   }
  },
  "unanswered": [
   {
    "docId": "content-schedule",
    "count": 3,
    "questions": [
     "스포츠 경기 생중계도 해요?",
     "자막 싱크가 안 맞는 걸 신고하고 싶대요",
     "비번 까먹었다는데 상담원이 바꿔줘도 돼요?"
    ],
    "entries": [
     {
      "at": "2026-09-27T22:00:49.583Z",
      "question": "스포츠 경기 생중계도 해요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.260790597871276,
      "nearestDocId": "content-schedule"
     },
     {
      "at": "2026-09-27T20:26:49.583Z",
      "question": "자막 싱크가 안 맞는 걸 신고하고 싶대요",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.310733452051502,
      "nearestDocId": "content-schedule"
     },
     {
      "at": "2026-09-27T15:44:49.583Z",
      "question": "비번 까먹었다는데 상담원이 바꿔줘도 돼요?",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.319194527447558,
      "nearestDocId": "content-schedule"
     }
    ]
   },
   {
    "docId": "coupon-event",
    "count": 3,
    "questions": [
     "해외 출장 가서도 볼 수 있어요?",
     "통신사 결합 할인 되나요?",
     "학생 할인 있나요?"
    ],
    "entries": [
     {
      "at": "2026-09-27T21:13:49.583Z",
      "question": "해외 출장 가서도 볼 수 있어요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.245411355922849,
      "nearestDocId": "coupon-event"
     },
     {
      "at": "2026-09-27T19:39:49.583Z",
      "question": "통신사 결합 할인 되나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.370512721363783,
      "nearestDocId": "coupon-event"
     },
     {
      "at": "2026-09-27T18:05:49.583Z",
      "question": "학생 할인 있나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.391166276415236,
      "nearestDocId": "coupon-event"
     }
    ]
   },
   {
    "docId": "payment",
    "count": 2,
    "questions": [
     "연간 결제하면 할인해 주나요?",
     "고객이 어제 결제했는데 드라마 한 편 봤대요. 돈 돌려받을 수 있어요?"
    ],
    "entries": [
     {
      "at": "2026-09-27T23:34:49.583Z",
      "question": "연간 결제하면 할인해 주나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.505008328577235,
      "nearestDocId": "payment"
     },
     {
      "at": "2026-09-27T14:10:49.583Z",
      "question": "고객이 어제 결제했는데 드라마 한 편 봤대요. 돈 돌려받을 수 있어요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.372618094686955,
      "nearestDocId": "payment"
     }
    ]
   },
   {
    "docId": "cancel",
    "count": 2,
    "questions": [
     "회사에서 직원 복지로 단체 구독하고 싶대요",
     "다음 시즌 언제 나오냐고 계속 물어보는데 뭐라고 해요?"
    ],
    "entries": [
     {
      "at": "2026-09-27T18:52:49.583Z",
      "question": "회사에서 직원 복지로 단체 구독하고 싶대요",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.408478781474766,
      "nearestDocId": "cancel"
     },
     {
      "at": "2026-09-27T17:18:49.583Z",
      "question": "다음 시즌 언제 나오냐고 계속 물어보는데 뭐라고 해요?",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.247359751859171,
      "nearestDocId": "cancel"
     }
    ]
   },
   {
    "docId": "download",
    "count": 1,
    "questions": [
     "TV 앱에서 다운로드 기능이 언제 생기나요?"
    ],
    "entries": [
     {
      "at": "2026-09-27T22:47:49.583Z",
      "question": "TV 앱에서 다운로드 기능이 언제 생기나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.482226495741491,
      "nearestDocId": "download"
     }
    ]
   },
   {
    "docId": "playback-errors",
    "count": 1,
    "questions": [
     "오프라인으로 보던 게 갑자기 재생이 안 된대요"
    ],
    "entries": [
     {
      "at": "2026-09-27T16:31:49.583Z",
      "question": "오프라인으로 보던 게 갑자기 재생이 안 된대요",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.274957783502684,
      "nearestDocId": "playback-errors"
     }
    ]
   },
   {
    "docId": "account-sharing",
    "count": 1,
    "questions": [
     "와이프랑 동시에 보려는데 한 쪽이 끊긴대요"
    ],
    "entries": [
     {
      "at": "2026-09-27T14:57:49.583Z",
      "question": "와이프랑 동시에 보려는데 한 쪽이 끊긴대요",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.231104463737458,
      "nearestDocId": "account-sharing"
     }
    ]
   }
  ]
 }
};
