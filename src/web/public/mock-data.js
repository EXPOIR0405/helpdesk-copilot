// npm run mock 으로 생성. 직접 수정하지 말 것
window.MOCK = {
 "source": "data/logs/eval-2026-09-25T16-27-00-213Z.json",
 "answers": [
  {
   "question": "프리미엄 요금제는 동시에 몇 대까지 볼 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "프리미엄 요금제는 동시에 4대까지 시청할 수 있습니다.",
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
     "topScore": 0.5649256683482955,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.5649256683482955
      },
      {
       "chunkId": "plans#1",
       "docId": "plans",
       "score": 0.4924831319599303
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.40882924117078745
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.3978170550295343
      },
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.36105776941565415
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 프리미엄 요금제는 동시에 4대까지 시청하실 수 있습니다. 추가로 궁금하신 점이 있으면 말씀해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "결제 후 7일 이내에 시청 이력이 없으면 환불되나요?",
   "answer": {
    "status": "answered",
    "text": "네. 결제 후 7일 이내이고 시청 이력이 없으면 전액 환불됩니다.",
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
     "topScore": 0.5633870353436167,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "refund#0",
       "docId": "refund",
       "score": 0.5633870353436167
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.5557062626824981
      },
      {
       "chunkId": "refund#5",
       "docId": "refund",
       "score": 0.5005203548436632
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.4932369527424788
      },
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.47574595397309205
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의 주셔서 감사합니다.\n네, 결제 후 7일 이내이고 시청 이력이 없으면 전액 환불됩니다.\n시청 이력이 있으면 환불은 어렵고 해지만 가능합니다.\n환불이 되지 않는 경우에도 해지하시면 남은 결제 기간까지는 이용하실 수 있습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "결제 실패하면 언제까지 이용할 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "결제일에 실패해도 첫 실패일로부터 7일간은 정상 이용 가능합니다. 7일 안에 결제가 성공하지 않으면 이용이 정지됩니다.",
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
     "topScore": 0.6009303232772607,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.6009303232772607
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.47797978392070783
      },
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.4488546170613097
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.4234749169155218
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.4230494175376004
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 결제에 실패하셔도 첫 실패일로부터 7일간은 정상 이용 가능합니다.\n7일 안에 결제가 성공하지 않으면 이용이 정지됩니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "비밀번호 재설정 링크는 몇 분 동안 유효한가요?",
   "answer": {
    "status": "answered",
    "text": "발송 후 30분간 유효합니다.",
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
     "topScore": 0.685618173301249,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-security#1",
       "docId": "account-security",
       "score": 0.685618173301249
      },
      {
       "chunkId": "account-security#4",
       "docId": "account-security",
       "score": 0.5422716676632718
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.4571803219844322
      },
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.44931092402106665
      },
      {
       "chunkId": "account-security#0",
       "docId": "account-security",
       "score": 0.4148439596681872
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 비밀번호 재설정 링크는 발송 후 30분간 유효합니다.\n메일이 오지 않으면 스팸함도 확인해 주세요.\n가입하신 이메일 주소에 오타가 없는지도 함께 확인해 보시면 좋습니다.\n고객님 비밀번호를 고객센터에서 직접 변경해 드리거나 알려드리기는 어렵습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "CW-2003 오류는 어떻게 조치하나요?",
   "answer": {
    "status": "answered",
    "text": "CW-2003은 콘텐츠 보호(DRM) 오류입니다.\\n- 앱·브라우저를 업데이트해 주세요.\\n- 외부 모니터를 연결 중이면 해제한 뒤 다시 재생해 주세요.\\n- 화면 녹화·미러링 앱은 종료해 주세요.\\n- 루팅·탈옥 기기에서는 재생이 불가합니다.",
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
     "topScore": 0.5866704131075291,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.5866704131075291
      },
      {
       "chunkId": "playback-errors#0",
       "docId": "playback-errors",
       "score": 0.36675860122697435
      },
      {
       "chunkId": "account-sharing#1",
       "docId": "account-sharing",
       "score": 0.36290770367281144
      },
      {
       "chunkId": "playback-errors#3",
       "docId": "playback-errors",
       "score": 0.34264957106740784
      },
      {
       "chunkId": "playback-errors#2",
       "docId": "playback-errors",
       "score": 0.32799052234317516
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, CW-2003은 콘텐츠 보호(DRM) 오류입니다.\n1. 앱이나 브라우저를 최신 버전으로 업데이트해 주세요.\n2. 외부 모니터를 연결 중이라면 해제한 뒤 다시 재생해 주세요.\n3. 화면 녹화나 미러링 앱은 종료해 주세요.\n4. 루팅 또는 탈옥된 기기에서는 재생이 불가합니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "다운로드한 콘텐츠는 며칠 동안 보관되나요?",
   "answer": {
    "status": "answered",
    "text": "다운로드한 콘텐츠는 저장일로부터 30일간 보관됩니다. 단, 계속 보려면 30일에 한 번 이상 인터넷에 연결해 계정 확인이 필요합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "download#1",
      "docId": "download",
      "title": "다운로드(오프라인 저장)",
      "section": "저장 한도와 보관 기간",
      "excerpt": "- 기기당 최대 100편 저장\n- 저장한 콘텐츠는 저장일로부터 30일간 보관\n- 한 번 재생을 시작하면 48시간 안에 시청 완료 필요, 이후 자동 만료\n- 만료된 콘텐츠는 인터넷 연결 후 다시 다운로드 가능"
     },
     {
      "chunkId": "download#2",
      "docId": "download",
      "title": "다운로드(오프라인 저장)",
      "section": "오프라인 인증",
      "excerpt": "- 다운로드 콘텐츠를 계속 보려면 30일에 한 번 이상 인터넷에 연결해 계정 확인 필요"
     }
    ],
    "trace": {
     "topScore": 0.6918012172739869,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.6918012172739869
      },
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.6146523470210854
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.5863020916275322
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.5633705639855353
      },
      {
       "chunkId": "download#0",
       "docId": "download",
       "score": 0.4744012836383708
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의해 주셔서 감사합니다. 다운로드한 콘텐츠는 저장일로부터 30일간 보관됩니다. 계속 보시려면 30일에 한 번 이상 인터넷에 연결해 계정 확인을 해주셔야 합니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "쿠폰 두 장을 한 번에 적용할 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "아니요. 할인 쿠폰은 결제 1회에 1장만 적용되며, 중복 적용은 불가합니다.",
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
     "topScore": 0.5723278682240802,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.5723278682240802
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.4820902438034076
      },
      {
       "chunkId": "coupon-event#3",
       "docId": "coupon-event",
       "score": 0.4278706265624685
      },
      {
       "chunkId": "coupon-event#1",
       "docId": "coupon-event",
       "score": 0.40926785668749466
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.3885448254940171
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 할인 쿠폰은 결제 1회에 1장만 적용되며, 두 장을 함께 적용할 수는 없습니다. 필요한 경우 적용 가능한 쿠폰을 하나만 선택해 결제해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "키즈 프로필의 시청 등급을 바꿀 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "아니요. 키즈 프로필은 12세 이하 등급만 노출되며 변경할 수 없습니다.",
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
     "topScore": 0.5524670732847298,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "adult-verification#1",
       "docId": "adult-verification",
       "score": 0.5524670732847298
      },
      {
       "chunkId": "account-sharing#0",
       "docId": "account-sharing",
       "score": 0.4902712459466538
      },
      {
       "chunkId": "adult-verification#3",
       "docId": "adult-verification",
       "score": 0.4393848543975383
      },
      {
       "chunkId": "adult-verification#0",
       "docId": "adult-verification",
       "score": 0.4106708281613912
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.3712109352016554
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의 주셔서 감사합니다. 키즈 프로필은 12세 이하 등급만 노출되며, 시청 등급을 따로 변경할 수 없습니다. 참고로 프로필별 시청 등급은 마이페이지 > 프로필 관리 > 시청 등급에서 확인하실 수 있습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "해지하면 시청 기록은 얼마나 보관되나요?",
   "answer": {
    "status": "answered",
    "text": "해지하면 시청 기록은 이용 종료 후 12개월 보관됩니다. 12개월 안에 다시 구독하면 그대로 복원됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "cancel#3",
      "docId": "cancel",
      "title": "해지 안내",
      "section": "해지 후 데이터",
      "excerpt": "- 시청 기록, 찜 목록, 프로필은 이용 종료 후 12개월 보관\n- 12개월 안에 다시 구독하면 그대로 복원\n- 다운로드한 콘텐츠는 이용 기간 종료 시점에 재생 불가"
     }
    ],
    "trace": {
     "topScore": 0.609700554196658,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.609700554196658
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.4852265483819484
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.4814112644524101
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.4301459449188189
      },
      {
       "chunkId": "cancel#0",
       "docId": "cancel",
       "score": 0.3915059708141015
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 해지하시면 시청 기록은 이용 종료 후 12개월 동안 보관됩니다.\n12개월 안에 다시 구독하시면 시청 기록은 그대로 복원됩니다.\n참고로 다운로드한 콘텐츠는 이용 기간이 끝나면 재생할 수 없습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "판권이 끝나는 콘텐츠는 언제부터 표시되나요?",
   "answer": {
    "status": "answered",
    "text": "판권 종료 30일 전부터 상세 화면에 **\"공개 종료 예정\"**이 표시되고 종료일도 함께 노출됩니다.",
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
     "topScore": 0.5808657506389395,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "content-schedule#3",
       "docId": "content-schedule",
       "score": 0.5808657506389395
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.47455217792138615
      },
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.4347832800720365
      },
      {
       "chunkId": "content-schedule#2",
       "docId": "content-schedule",
       "score": 0.4298137552405308
      },
      {
       "chunkId": "refund#5",
       "docId": "refund",
       "score": 0.4294117654374476
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 판권이 종료되는 콘텐츠는 종료 30일 전부터 상세 화면에 “공개 종료 예정”이 표시되고, 종료일도 함께 보입니다.\n종료된 뒤에는 찜 목록에 남아 있어도 재생하실 수 없습니다.\n종료된 콘텐츠의 재공개 여부는 안내드리기 어렵습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "계정당 프로필은 몇 개까지 만들 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "계정당 최대 5개 프로필까지 만들 수 있습니다.",
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
     "topScore": 0.5350383811968686,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-sharing#0",
       "docId": "account-sharing",
       "score": 0.5350383811968686
      },
      {
       "chunkId": "adult-verification#1",
       "docId": "adult-verification",
       "score": 0.42187171191093875
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.3910478415070913
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.3720105066582056
      },
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.3624607009604115
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 계정당 최대 5개 프로필까지 만들 수 있습니다.\n프로필마다 시청 기록, 찜 목록, 추천이 따로 관리됩니다.\n프로필별 시청 등급 제한과 잠금은 별도 안내를 참고해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "결제일을 바꿀 수 있나요?",
   "answer": {
    "status": "answered",
    "text": "결제일 변경 기능은 없습니다. 결제일은 최초 구독 결제일 기준으로 매월 같은 날 자동 결제됩니다. 29일, 30일, 31일 가입자는 해당 날짜가 없는 달에는 그달 말일에 결제됩니다.",
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
     "topScore": 0.48441888641661035,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.48441888641661035
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.47264084098065534
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.44474854653181733
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.4180246299772055
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.40575506452385696
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 결제일은 변경하실 수 없습니다.\n결제는 최초 구독 결제일을 기준으로 매월 같은 날 자동 결제됩니다.\n29일, 30일, 31일에 가입하신 경우에는 해당 날짜가 없는 달에 한해 그달 말일에 결제됩니다.\n이용 중인 결제일은 이렇게 적용되는 점 참고해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "고객이 어제 결제했는데 드라마 한 편 봤대요. 돈 돌려받을 수 있어요?",
   "answer": {
    "status": "unanswerable",
    "text": "제공된 근거에는 환불 기준이 없어, 결제 후 1편을 시청한 경우 환불 가능한지 확인할 수 없습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.37268873286135507,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.37268873286135507
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.36016135154885154
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.35704155295917867
      },
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.34483794892998115
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.3300257952373745
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 문의하신 내용은 현재 확인된 정보만으로는 환불 가능 여부를 안내해 드리기 어렵습니다. 결제 후 1편 시청하신 경우의 환불 기준이 확인되지 않았습니다. 내용을 다시 확인한 뒤 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "4K로 안 나온다는데 뭐 확인해야 해요?",
   "answer": {
    "status": "answered",
    "text": "4K로 보려면 아래 3가지를 확인해 주세요.\n- 프리미엄 요금제인지\n- 4K 지원 기기·앱인지\n- 인터넷 속도가 25Mbps 이상인지\n\n이 중 하나라도 빠지면 FHD 이하로 재생됩니다. 또, 모든 콘텐츠가 4K는 아니어서 콘텐츠 상세 화면에 4K 표시가 있는 작품인지도 확인해 주세요. 네트워크 상태에 따라 화질이 자동 조절되니 설정 > 재생 화질에서 고정도 가능합니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "playback-errors#2",
      "docId": "playback-errors",
      "title": "재생 오류 조치",
      "section": "화질 관련 문의",
      "excerpt": "- 4K 재생 조건: 프리미엄 요금제 + 4K 지원 기기·앱 + 25Mbps 이상 속도 → 셋 중 하나라도 빠지면 FHD 이하로 재생\n- 모든 콘텐츠가 4K로 제공되지는 않음. 콘텐츠 상세 화면에 4K 표시가 있는 작품만 해당\n- 네트워크 상태에 따라 화질이 자동 조절됨. 설정 > 재생 화질에서 고정 가능"
     },
     {
      "chunkId": "plans#0",
      "docId": "plans",
      "title": "요금제 안내",
      "section": "요금제 비교",
      "excerpt": "| 요금제 | 월 요금 | 동시 시청 | 최대 화질 | 다운로드 |\n|---|---|---|---|---|\n| 베이직 | 7,900원 | 1대 | HD | 불가 |\n| 스탠다드 | 10,900원 | 2대 | FHD | 기기 2대 |\n| 프리미엄 | 13,900원 | 4대 | 4K | 기기 4대 |\n\n- 모든 요금제는 월 단위 정기결제\n- 연간 결제 상품은 없음\n- 모든 요금제에서 프로필은 최대 5개까지 생성 가능\n- 요금에는 부가세 포함"
     }
    ],
    "trace": {
     "topScore": 0.5740190626280652,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#2",
       "docId": "playback-errors",
       "score": 0.5740190626280652
      },
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.4014993482261673
      },
      {
       "chunkId": "playback-errors#0",
       "docId": "playback-errors",
       "score": 0.36202652658269563
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.3495362088966503
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.33554731187724923
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 4K 재생을 위해 아래 3가지를 먼저 확인해 주세요.\n1. 프리미엄 요금제인지\n2. 4K를 지원하는 기기와 앱인지\n3. 인터넷 속도가 25Mbps 이상인지\n\n위 조건 중 하나라도 빠지면 FHD 이하로 재생됩니다.\n또한 모든 콘텐츠가 4K는 아니어서, 콘텐츠 상세 화면에 4K 표시가 있는 작품인지도 확인해 주세요.\n네트워크 상태에 따라 화질이 자동으로 조절되며, 설정 > 재생 화질에서 고정하실 수도 있습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "와이프랑 동시에 보려는데 한 쪽이 끊긴대요",
   "answer": {
    "status": "answered",
    "text": "동시 시청 한도를 넘으면 한쪽 재생이 끊길 수 있습니다. 같은 프로필이라도 다른 기기에서 재생하면 각각 1대로 계산됩니다.\n- 베이직: 1대\n- 스탠다드: 2대\n- 프리미엄: 4대\n\n한도를 넘었다면 새로 재생하려는 기기에 ‘동시 시청 한도 초과’와 오류 코드 CW-3010이 표시됩니다. 해결하려면 이미 재생 중인 기기의 재생을 종료하거나 상위 요금제로 변경하면 됩니다.",
    "confidence": "low",
    "citations": [
     {
      "chunkId": "account-sharing#1",
      "docId": "account-sharing",
      "title": "프로필과 동시 시청",
      "section": "동시 시청 수",
      "excerpt": "- 베이직 1대, 스탠다드 2대, 프리미엄 4대\n- 같은 프로필이라도 다른 기기에서 재생하면 각각 1대로 계산\n- 한도를 넘으면 새로 재생하려는 기기에 \"동시 시청 한도 초과\" 안내와 오류 코드 CW-3010 표시\n- 이미 재생 중인 기기의 재생을 끝내거나, 상위 요금제로 변경하면 해결"
     },
     {
      "chunkId": "playback-errors#1",
      "docId": "playback-errors",
      "title": "재생 오류 조치",
      "section": "오류 코드별 조치",
      "excerpt": "### CW-1001 네트워크 연결 오류\n\n- 원인: 인터넷 연결 불안정, 속도 부족\n- 권장 속도: HD 3Mbps, FHD 5Mbps, 4K 25Mbps 이상\n- 조치: 공유기 재시작, 모바일 데이터와 Wi-Fi 전환해서 재시도\n\n### CW-2003 콘텐츠 보호(DRM) 오류\n\n- 원인: 기기·브라우저가 콘텐츠 보호 기술을 지원하지 않음, 외부 모니터가 HDCP 미지원\n- 조치: 앱·브라우저 업데이트, 외부 모니터 연결 해제 후 재생, 화면 녹화·미러링 앱 종료\n- 루팅·탈옥 기기에서는 재생 불가\n\n### CW-3010 동시 시청 한도 초과\n\n- 원인: 요금제의 동시 시청 수 초과\n- 조치: `account-sharing` 문서의 동시 시청 수 기준으로 안내\n\n### CW-4040 콘텐츠 이용 불가\n\n- 원인: 판권 종료로 내려간 콘텐츠, 또는 국내에서만 서비스되는 콘텐츠를 해외에서 재생 시도\n- 조치: 판권 종료 여부는 `content-schedule` 문서 기준으로 안내\n- 해외 재생 가능 여부에 대한 별도 정책 문서는 없음\n\n### CW-5000 서버 오류\n\n- 원인: 시네웨이브 서버 문제\n- 조치: 공지사항의 장애 공지 확인 안내\n- 같은 오류가 30분 이상 반복되면 기술지원 담당에게 이관 (고객 기기 정보, 발생 시각, 오류 코드 기록)"
     },
     {
      "chunkId": "plans#0",
      "docId": "plans",
      "title": "요금제 안내",
      "section": "요금제 비교",
      "excerpt": "| 요금제 | 월 요금 | 동시 시청 | 최대 화질 | 다운로드 |\n|---|---|---|---|---|\n| 베이직 | 7,900원 | 1대 | HD | 불가 |\n| 스탠다드 | 10,900원 | 2대 | FHD | 기기 2대 |\n| 프리미엄 | 13,900원 | 4대 | 4K | 기기 4대 |\n\n- 모든 요금제는 월 단위 정기결제\n- 연간 결제 상품은 없음\n- 모든 요금제에서 프로필은 최대 5개까지 생성 가능\n- 요금에는 부가세 포함"
     }
    ],
    "trace": {
     "topScore": 0.23101136459852226,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-sharing#1",
       "docId": "account-sharing",
       "score": 0.23101136459852226
      },
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.2077253483215685
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.20719417477293858
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.20005405488435263
      },
      {
       "chunkId": "playback-errors#3",
       "docId": "playback-errors",
       "score": 0.1791903889336179
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 동시에 시청 가능한 대수를 넘으면 한쪽 재생이 끊길 수 있습니다. 같은 프로필이라도 다른 기기에서 재생하면 각각 1대로 계산되며, 요금제별 동시 시청은 베이직 1대, 스탠다드 2대, 프리미엄 4대입니다. 한도를 넘은 경우에는 이미 재생 중인 기기의 재생을 종료하시거나 상위 요금제로 변경해 주세요. 새로 재생하려는 기기에는 ‘동시 시청 한도 초과’와 오류 코드 CW-3010이 표시될 수 있습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "아이폰에서 결제한 사람은 환불 어디서 해요?",
   "answer": {
    "status": "answered",
    "text": "아이폰에서 결제한 인앱결제는 앱마켓 환불 정책을 따르며, 상담원이 직접 환불 처리할 수 없습니다. 앱마켓 고객센터로 환불을 요청해 주세요.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "refund#3",
      "docId": "refund",
      "title": "환불 정책",
      "section": "인앱결제 환불",
      "excerpt": "- 앱마켓 인앱결제는 앱마켓 환불 정책을 따름\n- 상담원이 직접 환불 처리할 수 없음 → 앱마켓 고객센터로 환불 요청하도록 안내"
     }
    ],
    "trace": {
     "topScore": 0.5669164554620723,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "refund#3",
       "docId": "refund",
       "score": 0.5669164554620723
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.5170432708435712
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.5104687563473922
      },
      {
       "chunkId": "refund#1",
       "docId": "refund",
       "score": 0.4659489885359183
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.4612592689975771
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 아이폰에서 결제하신 인앱결제는 앱마켓 환불 정책을 따릅니다.\n고객센터에서 직접 환불 처리해 드리기 어렵습니다.\n앱마켓 고객센터로 환불을 요청해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "비번 까먹었다는데 상담원이 바꿔줘도 돼요?",
   "answer": {
    "status": "answered",
    "text": "아니요. 상담원이 비밀번호를 직접 바꾸거나 알려줄 수는 없습니다. 고객님께는 로그인 화면에서 **비밀번호 찾기**로 들어가 **가입 이메일로 재설정 링크**를 받도록 안내하세요. 메일이 안 오면 스팸함과 가입 이메일 오타도 확인하시면 됩니다.",
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
     "topScore": 0.3192138622221357,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.3192138622221357
      },
      {
       "chunkId": "adult-verification#2",
       "docId": "adult-verification",
       "score": 0.30221977651196463
      },
      {
       "chunkId": "account-security#1",
       "docId": "account-security",
       "score": 0.2892188478764885
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.2854966489781162
      },
      {
       "chunkId": "refund#3",
       "docId": "refund",
       "score": 0.2766207142193469
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 비밀번호는 고객센터에서 직접 바꾸거나 알려드릴 수 없습니다.\n로그인 화면에서 비밀번호 찾기로 들어가 가입하신 이메일로 재설정 링크를 받아 진행해 주세요.\n메일이 오지 않으면 스팸함을 확인해 주시고, 가입 이메일 주소에 오타가 없는지도 확인해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "오프라인으로 보던 게 갑자기 재생이 안 된대요",
   "answer": {
    "status": "answered",
    "text": "오프라인 다운로드본이 갑자기 안 재생되면 먼저 아래를 확인해 주세요.\n- 다운로드 콘텐츠는 30일에 한 번 이상 인터넷에 연결해 계정 확인이 필요합니다.\n- 이용 기간이 끝났거나 환불이 완료되면 다운로드본은 재생할 수 없습니다.\n- 판권 종료 예정 콘텐츠는 종료일에 다운로드본도 재생 불가입니다.\n\n그래도 안 되면 앱 최신 버전인지 확인하고, 앱 완전 종료 후 재실행/기기 재부팅을 해보세요. 다른 콘텐츠도 안 되면 기기·네트워크 문제일 수 있습니다.",
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
     "topScore": 0.27495782263353674,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#0",
       "docId": "playback-errors",
       "score": 0.27495782263353674
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.2545099835494949
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.24517062752011065
      },
      {
       "chunkId": "download#4",
       "docId": "download",
       "score": 0.24374739616363428
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.24266520376839468
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 오프라인 다운로드본이 갑자기 재생되지 않는 경우에는 먼저 인터넷에 연결해 계정 확인이 필요한 상태인지 확인해 주세요.\n\n1. 다운로드 콘텐츠는 30일에 한 번 이상 인터넷에 연결해 계정 확인이 필요합니다.\n2. 이용 기간이 끝났거나 환불이 완료된 경우, 또는 판권 종료 예정 콘텐츠의 종료일이 지난 경우에는 다운로드본을 재생할 수 없습니다.\n3. 그래도 안 되면 앱이 최신 버전인지 확인하고, 앱을 완전히 종료한 뒤 다시 실행하거나 기기를 재부팅해 보세요.\n\n다른 콘텐츠도 재생되지 않으면 기기나 네트워크 문제일 수 있습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "다음 시즌 언제 나오냐고 계속 물어보는데 뭐라고 해요?",
   "answer": {
    "status": "answered",
    "text": "“현재 공지된 다음 시즌 일정은 없습니다. 확정되면 공지사항과 알림으로 안내됩니다.”\n\n공식 공지사항이나 콘텐츠 상세 화면에 게시된 일정만 안내하고, 다음 시즌 제작 여부나 공개일은 추측해서 안내하지 않으면 됩니다.",
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
     "topScore": 0.2471044327199428,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.2471044327199428
      },
      {
       "chunkId": "content-schedule#1",
       "docId": "content-schedule",
       "score": 0.23960883930972918
      },
      {
       "chunkId": "content-schedule#0",
       "docId": "content-schedule",
       "score": 0.23663195164651815
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.21648956034958128
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.21615996060095038
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 현재 공지된 다음 시즌 일정은 없습니다.\n확정되면 공지사항과 알림으로 안내됩니다.\n공식 공지사항이나 콘텐츠 상세 화면에 게시된 일정만 확인해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "앱에서 쿠폰 번호 넣는 칸이 없대요",
   "answer": {
    "status": "answered",
    "text": "앱에서는 쿠폰 번호를 등록할 수 없습니다. 쿠폰은 웹에서만 등록 가능하며, 마이페이지 > 이용권·쿠폰 등록에서 입력하시면 됩니다.",
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
     "topScore": 0.46460394853236503,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "coupon-event#1",
       "docId": "coupon-event",
       "score": 0.46460394853236503
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.4033803129367793
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.40082992876405676
      },
      {
       "chunkId": "coupon-event#3",
       "docId": "coupon-event",
       "score": 0.3543841824812322
      },
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.3387915739728734
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 이용에 불편을 드려 죄송합니다. 앱에서는 쿠폰 번호를 등록하실 수 없습니다. 쿠폰은 웹에서만 등록 가능하며, 마이페이지 > 이용권·쿠폰 등록에서 입력해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "요금제 낮추면 차액 돌려주나요?",
   "answer": {
    "status": "answered",
    "text": "아니요. 요금제를 낮추더라도 차액 환불은 없습니다. 현재 결제 기간이 끝날 때까지는 기존 요금제가 유지되고, 다음 결제일부터 하위 요금제로 결제됩니다.",
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
     "topScore": 0.5346579159737496,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "plans#1",
       "docId": "plans",
       "score": 0.5346579159737496
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.5098086981757164
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.45880937169649094
      },
      {
       "chunkId": "plans#3",
       "docId": "plans",
       "score": 0.4380784091578772
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.4265474643077726
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의 주셔서 감사합니다.\n요금제를 낮추셔도 차액 환불은 되지 않습니다.\n현재 결제 기간이 끝날 때까지는 기존 요금제가 유지되고, 다음 결제일부터 하위 요금제로 결제됩니다.\n결제일 전까지는 변경 예약을 취소하실 수 있습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "모르는 폰이 로그인돼 있다고 불안해하세요",
   "answer": {
    "status": "answered",
    "text": "모르는 기기가 로그인된 게 의심되면 아래처럼 안내하세요.\n- 마이페이지 > 기기 관리 > 모든 기기에서 로그아웃\n- 비밀번호 즉시 변경\n- 2단계 인증 설정 권장\n\n본인이 하지 않은 결제가 있으면 결제 내역을 확인한 뒤 환불 접수 기준도 함께 안내하면 됩니다.",
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
     "topScore": 0.41403567266443053,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.41403567266443053
      },
      {
       "chunkId": "account-sharing#2",
       "docId": "account-sharing",
       "score": 0.4067566438796429
      },
      {
       "chunkId": "account-security#4",
       "docId": "account-security",
       "score": 0.40147553485498133
      },
      {
       "chunkId": "account-security#2",
       "docId": "account-security",
       "score": 0.36299476607792136
      },
      {
       "chunkId": "account-security#0",
       "docId": "account-security",
       "score": 0.3601553517993865
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 로그인된 기기가 걱정되시겠어요.\n1. 마이페이지 > 기기 관리에서 모든 기기에서 로그아웃해 주세요.\n2. 비밀번호를 바로 변경해 주시고, 가능하시면 2단계 인증도 설정해 주세요.\n3. 본인이 하지 않은 결제가 있다면 결제 내역을 확인해 주시면, 환불 접수 기준에 맞는지 함께 안내해 드리겠습니다.\n추가로 프로필 이름이나 결제 수단 등 변경된 내역이 있으면 함께 확인해 보시는 것이 좋습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "고객이 자기 가입 이메일 뭐였는지 알려달래요",
   "answer": {
    "status": "answered",
    "text": "본인 확인 전에는 가입 이메일을 그대로 알려드릴 수 없습니다. 확인 후에는 이메일 앞 2자리만 보이고 나머지는 가려서 안내합니다. 예: ab****@****.com",
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
     "topScore": 0.4695060039640675,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "account-security#0",
       "docId": "account-security",
       "score": 0.4695060039640675
      },
      {
       "chunkId": "account-security#2",
       "docId": "account-security",
       "score": 0.42610141739880947
      },
      {
       "chunkId": "account-security#1",
       "docId": "account-security",
       "score": 0.41938870776793774
      },
      {
       "chunkId": "cancel#1",
       "docId": "cancel",
       "score": 0.40564936999095386
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.3748428707848813
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 가입하신 이메일은 본인 확인 전에는 그대로 안내해 드릴 수 없습니다.\n본인 확인이 완료되면 이메일은 앞 2자리만 보이고 나머지는 가려서 안내해 드립니다.\n예를 들어 ab****@****.com 형태로 확인 가능합니다.\n본인 확인은 가입 이메일로 인증 링크를 받거나 휴대폰 본인인증으로 진행하실 수 있습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "카드 한도 초과로 결제 안 됐으면 자동으로 다시 긁히나요?",
   "answer": {
    "status": "answered",
    "text": "네. 결제일에 실패하면 3일 간격으로 최대 3회 자동 재시도합니다. 카드 한도 초과는 흔한 실패 원인으로 명시돼 있습니다.",
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
     "topScore": 0.5488625512469382,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.5488625512469382
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.49750991163958164
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.4790951035412813
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.4350757635545952
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.4122027698240616
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 카드 한도 초과로 결제가 실패하신 경우에도 결제일에 실패하면 3일 간격으로 최대 3회 자동으로 다시 결제됩니다. 카드 한도 초과는 흔한 결제 실패 원인에 포함됩니다. 결제가 7일 안에 성공하지 않으면 이용이 정지될 수 있고, 결제 수단을 갱신한 뒤 재결제하시면 즉시 이용이 재개됩니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "해지랑 환불이 뭐가 다른지 고객한테 설명해야 해요",
   "answer": {
    "status": "answered",
    "text": "고객님께는 이렇게 설명하시면 됩니다.\n- **해지**: 다음 정기결제를 멈추는 것\n- **환불**: 이미 결제한 금액을 돌려받는 것\n\n또한 해지를 해도 **이미 결제한 기간은 끝까지 이용 가능**하고, **해지는 환불이 아닙니다**.\n환불 가능 여부는 결제 후 경과일과 시청 이력, 그리고 예외 사유에 따라 따로 판단합니다.",
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
     "topScore": 0.5590086768271993,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "cancel#0",
       "docId": "cancel",
       "score": 0.5590086768271993
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.5161015965250072
      },
      {
       "chunkId": "refund#0",
       "docId": "refund",
       "score": 0.502976399824604
      },
      {
       "chunkId": "refund#1",
       "docId": "refund",
       "score": 0.47746181939032717
      },
      {
       "chunkId": "refund#3",
       "docId": "refund",
       "score": 0.4661351044615429
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 해지는 다음 정기결제를 멈추는 것이고, 환불은 이미 결제한 금액을 돌려받는 것입니다. 해지를 하셔도 이미 결제한 기간은 끝까지 이용하실 수 있고, 해지는 환불과는 다릅니다. 환불 가능 여부는 결제 후 경과일과 시청 이력에 따라 따로 판단됩니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "남은 기간 있는데 탈퇴하면 환불돼요?",
   "answer": {
    "status": "answered",
    "text": "회원 탈퇴를 하면 남은 이용 기간은 즉시 소멸합니다. 다만, 탈퇴 시 환불되는지는 주어진 근거에 명시되어 있지 않습니다.",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "cancel#4",
      "docId": "cancel",
      "title": "해지 안내",
      "section": "해지와 회원 탈퇴의 차이",
      "excerpt": "| 구분 | 해지 | 회원 탈퇴 |\n|---|---|---|\n| 정기결제 | 중단 | 중단 |\n| 남은 이용 기간 | 끝까지 이용 | 즉시 소멸 |\n| 시청 기록·찜 | 12개월 보관 | 즉시 삭제 |\n| 재가입 | 같은 계정으로 재구독 | 새 계정 가입 필요 |\n\n- 남은 기간이 있는데 탈퇴를 원하면 남은 기간이 소멸된다는 점을 반드시 안내\n- 탈퇴 후 30일 동안 같은 이메일로 재가입 불가"
     }
    ],
    "trace": {
     "topScore": 0.5273648904691438,
     "grounding": "partial",
     "retrieved": [
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.5273648904691438
      },
      {
       "chunkId": "refund#4",
       "docId": "refund",
       "score": 0.5024639010325901
      },
      {
       "chunkId": "refund#5",
       "docId": "refund",
       "score": 0.45237169381453407
      },
      {
       "chunkId": "refund#0",
       "docId": "refund",
       "score": 0.43397434762347475
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.39752993774554657
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 회원 탈퇴를 하시면 남은 이용 기간은 즉시 소멸됩니다.\n다만 탈퇴 시 환불되는지는 확인된 내용에 포함되어 있지 않아, 지금은 안내드리기 어렵습니다.\n필요하시면 탈퇴 전 이용 상태를 다시 확인하신 뒤 진행해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "본인이 안 한 결제가 있대요. 어떻게 처리해요?",
   "answer": {
    "status": "answered",
    "text": "확인된 경우에 따라 처리합니다.\n- 같은 결제 주기에 중복 결제면: 중복 결제분은 전액 환불합니다.\n- 회원이 요청하지 않은 요금제 변경 결제면: 해당 결제는 전액 환불합니다.\n- 계정 도용으로 인한 결제면: `account-security` 문서의 도용 처리 후 환불합니다.",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "payment#5",
      "docId": "payment",
      "title": "결제 안내",
      "section": "중복 결제",
      "excerpt": "- 같은 결제 주기에 두 번 이상 결제된 경우 `refund` 문서의 중복 결제 기준에 따라 처리"
     },
     {
      "chunkId": "refund#1",
      "docId": "refund",
      "title": "환불 정책",
      "section": "예외: 전액 환불",
      "excerpt": "- 같은 결제 주기에 중복 결제된 경우 → 중복 결제분 전액 환불, 시청 이력과 무관\n- 회원이 요청하지 않은 요금제 변경 결제가 확인된 경우 → 해당 결제 전액 환불\n- 계정 도용으로 인한 결제가 확인된 경우 → `account-security` 문서의 도용 처리 후 환불"
     }
    ],
    "trace": {
     "topScore": 0.47875963191502635,
     "grounding": "partial",
     "retrieved": [
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.47875963191502635
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.4690079025461722
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.4370787361334629
      },
      {
       "chunkId": "refund#1",
       "docId": "refund",
       "score": 0.4340497221698518
      },
      {
       "chunkId": "payment#4",
       "docId": "payment",
       "score": 0.4144993751769052
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 본인이 하지 않은 결제는 확인된 경우에 따라 처리해 드립니다.\n\n1. 같은 결제 주기에 중복으로 결제된 경우에는 중복 결제분을 전액 환불해 드립니다.\n2. 고객님이 요청하지 않은 요금제 변경 결제라면 해당 결제를 전액 환불해 드립니다.\n3. 계정 도용으로 인한 결제라면 도용 여부를 확인한 뒤 환불해 드립니다.\n\n결제 내역을 확인해 주시면 해당 경우에 맞춰 안내해 드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "서버 장애로 하루 넘게 못 봤으면 보상 있나요?",
   "answer": {
    "status": "answered",
    "text": "네. 시네웨이브 귀책의 전체 서비스 장애가 24시간 이상 연속되면 보상 대상입니다. 다만 보상은 환불이 아니라 장애 시간만큼 이용 기간을 연장해 드립니다. 개별 기기·네트워크 문제로 못 본 경우는 보상 대상이 아닙니다.",
    "confidence": "medium",
    "citations": [
     {
      "chunkId": "refund#2",
      "docId": "refund",
      "title": "환불 정책",
      "section": "예외: 서비스 장애 보상",
      "excerpt": "- 시네웨이브 귀책의 전체 서비스 장애가 24시간 이상 연속될 때만 보상\n- 보상은 환불이 아니라 장애 시간만큼 이용 기간 연장\n- 개별 기기·네트워크 문제로 인한 재생 불가는 보상 대상 아님 (`playback-errors` 문서로 조치 안내)"
     },
     {
      "chunkId": "playback-errors#3",
      "docId": "playback-errors",
      "title": "재생 오류 조치",
      "section": "보상 문의",
      "excerpt": "- 개별 기기·네트워크 문제는 보상 대상 아님\n- 전체 서비스 장애 보상 기준은 `refund` 문서 참고"
     }
    ],
    "trace": {
     "topScore": 0.49551899000610167,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "refund#2",
       "docId": "refund",
       "score": 0.49551899000610167
      },
      {
       "chunkId": "playback-errors#3",
       "docId": "playback-errors",
       "score": 0.4503348691919575
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.30573225527895587
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.2889311143583789
      },
      {
       "chunkId": "payment#3",
       "docId": "payment",
       "score": 0.28121322129960474
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 네, 시네웨이브 귀책의 전체 서비스 장애가 24시간 이상 연속되면 보상 대상입니다.\n보상은 환불이 아니라 장애 시간만큼 이용 기간을 연장해 드립니다.\n다만 개별 기기나 네트워크 문제로 보지 못한 경우는 보상 대상이 아닙니다.\n해당 내용에 해당하는지 확인해 보시고, 맞다면 보상 안내를 도와드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "베이직 쓰는데 다운로드 하고 싶대요",
   "answer": {
    "status": "answered",
    "text": "베이직 요금제는 다운로드가 불가합니다. 다운로드는 모바일·태블릿 앱에서만 가능하고, PC 웹과 TV 앱에서는 불가합니다.",
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
     "topScore": 0.5296836394525478,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "download#0",
       "docId": "download",
       "score": 0.5296836394525478
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.40629798194000977
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.38710419752240266
      },
      {
       "chunkId": "download#4",
       "docId": "download",
       "score": 0.3674011003759996
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.3657621585291813
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의해 주셔서 감사합니다. 베이직 요금제는 다운로드가 불가합니다. 다운로드는 모바일·태블릿 앱에서만 가능하며, PC 웹과 TV 앱에서는 이용하실 수 없습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "찜해둔 영화가 CW-4040 뜨면서 안 나와요",
   "answer": {
    "status": "answered",
    "text": "CW-4040는 콘텐츠 이용 불가입니다. 보통 **판권 종료로 내려간 경우**이거나 **국내 서비스 콘텐츠를 해외에서 재생하려는 경우**에 뜹니다. 또 **찜 목록에 남아 있어도 판권 종료 후에는 재생이 불가**합니다. 판권 종료 여부는 상세 화면/안내 기준으로 확인해 주세요.",
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
     "topScore": 0.40939993752717,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "playback-errors#1",
       "docId": "playback-errors",
       "score": 0.40939993752717
      },
      {
       "chunkId": "playback-errors#2",
       "docId": "playback-errors",
       "score": 0.3266524099876
      },
      {
       "chunkId": "account-sharing#1",
       "docId": "account-sharing",
       "score": 0.31114698530123186
      },
      {
       "chunkId": "content-schedule#3",
       "docId": "content-schedule",
       "score": 0.29888492241090936
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.281063319525483
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 고객님. CW-4040은 콘텐츠를 이용할 수 없을 때 표시되는 오류입니다.\n1. 보통 판권이 종료되어 내려간 경우이거나, 국내 서비스 콘텐츠를 해외에서 재생하려는 경우에 발생합니다.\n2. 찜 목록에 남아 있어도 판권이 종료되면 재생은 불가능합니다.\n3. 판권 종료 여부는 상세 화면의 안내를 확인해 주세요.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "이용권 쓰는 중에 정기결제 신청하면 바로 돈 나가요?",
   "answer": {
    "status": "answered",
    "text": "아니요. 이용권 사용 중에 정기결제를 신청해도 바로 결제되지 않고, 이용권 기간이 끝난 다음 날부터 결제가 시작됩니다.",
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
     "topScore": 0.5052729112771727,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.5052729112771727
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.4795149896296839
      },
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.44810635007691474
      },
      {
       "chunkId": "payment#5",
       "docId": "payment",
       "score": 0.44627273307570864
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.4415296437721567
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 이용권을 사용 중에 정기결제를 신청하셔도 바로 결제되지는 않습니다.\n이용권 기간이 끝난 다음 날부터 정기결제가 시작됩니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "광고형 요금제는 얼마예요?",
   "answer": {
    "status": "pending_policy",
    "text": "광고형 요금제는 도입을 검토 중이며, 가격은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내됩니다.",
    "confidence": "high",
    "citations": [
     {
      "chunkId": "ad-plan#1",
      "docId": "ad-plan",
      "title": "광고형 요금제",
      "section": "상담 응대 기준",
      "excerpt": "- \"광고형 요금제는 도입을 검토하고 있으며, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내됩니다.\"로 안내\n- 예상 가격, 예상 출시 시기를 추측해서 말하지 않음\n- 사전 신청이나 대기 명단은 없음\n- 기존 요금제에 광고가 붙는지 묻는 문의에는 \"현재 요금제에는 광고가 없습니다\"까지만 안내"
     },
     {
      "chunkId": "ad-plan#0",
      "docId": "ad-plan",
      "title": "광고형 요금제",
      "section": "현재 상태",
      "excerpt": "- 도입 검토 중이며 확정된 내용 없음\n- 가격, 출시일, 광고 빈도, 제공 화질, 다운로드 여부 모두 미정"
     },
     {
      "chunkId": "plans#4",
      "docId": "plans",
      "title": "요금제 안내",
      "section": "광고형 요금제",
      "excerpt": "- 현재 판매하지 않음\n- 도입 관련 문의는 `ad-plan` 문서 기준으로 안내"
     }
    ],
    "trace": {
     "topScore": 0.6501983010900555,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.6501983010900555
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.6078929109952929
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.6019639967983741
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.45358941369767464
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.4182470595039962
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 광고형 요금제는 현재 도입을 검토 중이며, 가격은 아직 정해지지 않았습니다.\n확정되는 내용은 공지사항으로 안내드릴 예정입니다.\n현재 판매 중인 요금제는 아닙니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "광고 보는 대신 싼 요금제 언제 나와요?",
   "answer": {
    "status": "pending_policy",
    "text": "광고형 요금제는 현재 도입을 검토 중이고, 가격과 출시 일정은 아직 정해지지 않았습니다. 확정되면 공지사항으로 안내됩니다. 현재는 판매하지 않습니다.",
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
     "topScore": 0.548856999200251,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.548856999200251
      },
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.5365182638331399
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.5078774383345782
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.38108637896771963
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.3687581104729386
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의 주셔서 감사합니다. 광고형 요금제는 현재 도입을 검토 중이며, 가격과 출시 일정은 아직 정해지지 않았습니다. 현재는 판매하고 있지 않고, 확정되면 공지사항으로 안내드릴 예정입니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "광고형 요금제 사전 신청 받나요?",
   "answer": {
    "status": "pending_policy",
    "text": "아니요. 광고형 요금제는 사전 신청이나 대기 명단이 없습니다. 현재는 도입을 검토 중이며, 확정되면 공지사항으로 안내됩니다.",
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
     "topScore": 0.672084276219071,
     "grounding": "full",
     "retrieved": [
      {
       "chunkId": "ad-plan#1",
       "docId": "ad-plan",
       "score": 0.672084276219071
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.608466925864568
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.5870897379069325
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.43224573880664785
      },
      {
       "chunkId": "plans#3",
       "docId": "plans",
       "score": 0.4015220514651944
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 광고형 요금제는 사전 신청이나 대기 명단이 없습니다.\n현재는 도입을 검토 중이며, 확정되면 공지사항으로 안내드릴 예정입니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "학생 할인 있나요?",
   "answer": {
    "status": "unanswerable",
    "text": "제공된 근거에는 학생 할인 여부가 확인되지 않습니다. 현재 안내 가능한 할인 규정은 할인 쿠폰 관련 내용뿐입니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.3910946737952515,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.3910946737952515
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.38633106410888485
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.30899822723132236
      },
      {
       "chunkId": "coupon-event#3",
       "docId": "coupon-event",
       "score": 0.30690263410166163
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.2985522230588307
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 문의하신 학생 할인 여부는 현재 확인된 내용이 없어 안내드리기 어렵습니다.\n지금 안내 가능한 할인 내용은 할인 쿠폰 관련 사항뿐입니다.\n학생 할인에 대한 내용은 확인되는 대로 다시 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "회사에서 직원 복지로 단체 구독하고 싶대요",
   "answer": {
    "status": "unanswerable",
    "text": "단체 구독 가능 여부나 회사 복지용 구독 절차는 제공된 근거에서 확인되지 않습니다. 관련 안내가 있는지 별도 확인이 필요합니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.4085585838257613,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.4085585838257613
      },
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.36445736441591114
      },
      {
       "chunkId": "adult-verification#0",
       "docId": "adult-verification",
       "score": 0.3488033988661875
      },
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.3474395008347228
      },
      {
       "chunkId": "account-security#2",
       "docId": "account-security",
       "score": 0.32155687004617334
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 문의 주셔서 감사합니다.\n회사 복지용 단체 구독 가능 여부와 신청 방법은 현재 확인된 내용이 없습니다.\n관련 안내가 있는지 확인한 뒤 다시 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "통신사 결합 할인 되나요?",
   "answer": {
    "status": "unanswerable",
    "text": "제공된 근거에는 통신사 결합 할인 가능 여부가 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.37045677935086385,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.37045677935086385
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.36283527198780113
      },
      {
       "chunkId": "payment#0",
       "docId": "payment",
       "score": 0.3271133920158776
      },
      {
       "chunkId": "plans#0",
       "docId": "plans",
       "score": 0.3041180257224986
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.30252463980176597
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 문의하신 통신사 결합 할인 가능 여부는 현재 확인된 내용이 없습니다.\n내용을 다시 확인한 뒤 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "자막 싱크가 안 맞는 걸 신고하고 싶대요",
   "answer": {
    "status": "unanswerable",
    "text": "자막 싱크 문제 신고 방법은 근거 조각에서 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.3107532397469277,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "content-schedule#4",
       "docId": "content-schedule",
       "score": 0.3107532397469277
      },
      {
       "chunkId": "content-schedule#0",
       "docId": "content-schedule",
       "score": 0.295226751240035
      },
      {
       "chunkId": "coupon-event#4",
       "docId": "coupon-event",
       "score": 0.29103056330329086
      },
      {
       "chunkId": "account-security#3",
       "docId": "account-security",
       "score": 0.287956688533269
      },
      {
       "chunkId": "content-schedule#3",
       "docId": "content-schedule",
       "score": 0.28257054020721684
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 불편을 겪고 계시군요.\n현재는 자막 싱크 문제를 신고하는 방법을 확인할 수 없어 바로 안내해 드리기 어렵습니다.\n문의 내용을 확인한 뒤 다시 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "해외 출장 가서도 볼 수 있어요?",
   "answer": {
    "status": "unanswerable",
    "text": "해외 출장 중 시청 가능 여부는 제공된 근거에 없습니다. 해외 이용 가능 여부를 확인할 수 있는 안내가 필요합니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.24538134765228864,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.24538134765228864
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.22636390714580146
      },
      {
       "chunkId": "cancel#4",
       "docId": "cancel",
       "score": 0.22500045592487558
      },
      {
       "chunkId": "plans#4",
       "docId": "plans",
       "score": 0.224115411969517
      },
      {
       "chunkId": "ad-plan#0",
       "docId": "ad-plan",
       "score": 0.22175600353209365
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요. 해외 출장 중 시청 가능 여부는 현재 확인된 내용이 없습니다.\n지금으로서는 해외에서 이용 가능한지 안내드리기 어렵습니다.\n문의 내용을 확인한 뒤 다시 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "스포츠 경기 생중계도 해요?",
   "answer": {
    "status": "unanswerable",
    "text": "스포츠 경기 생중계 제공 여부는 근거에서 확인되지 않습니다. 안내된 내용은 TV 방송 연계 콘텐츠의 업로드 기준뿐입니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.2607505494558095,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "content-schedule#0",
       "docId": "content-schedule",
       "score": 0.2607505494558095
      },
      {
       "chunkId": "coupon-event#4",
       "docId": "coupon-event",
       "score": 0.25680492003380556
      },
      {
       "chunkId": "cancel#2",
       "docId": "cancel",
       "score": 0.2498558037333228
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.24387972879086883
      },
      {
       "chunkId": "content-schedule#2",
       "docId": "content-schedule",
       "score": 0.23817807777937858
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의 주셔서 감사합니다.\n현재 확인된 내용으로는 스포츠 경기 생중계 제공 여부를 안내드리기 어렵습니다.\n확인된 내용은 TV 방송 연계 콘텐츠의 업로드 기준뿐이라, 관련 내용을 다시 확인해 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "TV 앱에서 다운로드 기능이 언제 생기나요?",
   "answer": {
    "status": "unanswerable",
    "text": "TV 앱 다운로드 기능의 도입 시점은 확인되지 않습니다. 현재 기준으로는 TV 앱에서는 다운로드가 불가합니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.48222685117970077,
     "grounding": "partial",
     "retrieved": [
      {
       "chunkId": "download#0",
       "docId": "download",
       "score": 0.48222685117970077
      },
      {
       "chunkId": "download#1",
       "docId": "download",
       "score": 0.37572138871183913
      },
      {
       "chunkId": "download#2",
       "docId": "download",
       "score": 0.3595608447861151
      },
      {
       "chunkId": "download#3",
       "docId": "download",
       "score": 0.3513175476240227
      },
      {
       "chunkId": "cancel#3",
       "docId": "cancel",
       "score": 0.32802138821023086
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의 주셔서 감사합니다. 현재 TV 앱에서 다운로드 기능은 사용할 수 없습니다. 다만 다운로드 기능의 도입 시점은 아직 확인되지 않아 안내드리기 어렵습니다. 확인되는 내용이 있으면 안내해 드리겠습니다.",
    "unsupportedNumbers": []
   }
  },
  {
   "question": "연간 결제하면 할인해 주나요?",
   "answer": {
    "status": "unanswerable",
    "text": "연간 결제 시 할인 여부는 근거 조각에서 확인되지 않습니다.",
    "confidence": "low",
    "citations": [],
    "trace": {
     "topScore": 0.5051847038483133,
     "grounding": "none",
     "retrieved": [
      {
       "chunkId": "payment#1",
       "docId": "payment",
       "score": 0.5051847038483133
      },
      {
       "chunkId": "coupon-event#2",
       "docId": "coupon-event",
       "score": 0.49645802710038067
      },
      {
       "chunkId": "plans#1",
       "docId": "plans",
       "score": 0.4697071131655694
      },
      {
       "chunkId": "coupon-event#0",
       "docId": "coupon-event",
       "score": 0.45166645912001474
      },
      {
       "chunkId": "plans#2",
       "docId": "plans",
       "score": 0.4424711245805232
      }
     ]
    }
   },
   "reply": {
    "text": "안녕하세요, 문의 주셔서 감사합니다. 연간 결제 시 할인 여부는 현재 확인된 내용이 없어 안내드리기 어렵습니다. 문의 내용을 다시 확인한 뒤 안내드리겠습니다.",
    "unsupportedNumbers": []
   }
  }
 ],
 "ops": {
  "syncedAt": "2026-09-25T16:25:13.594Z",
  "models": {
   "embedding": "text-embedding-3-small",
   "generation": "gpt-5.4-mini"
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
   "at": "2026-09-25T16:25:13.594Z",
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
      "at": "2026-09-26T01:02:13.594Z",
      "question": "스포츠 경기 생중계도 해요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.2607505494558095,
      "nearestDocId": "content-schedule"
     },
     {
      "at": "2026-09-25T23:28:13.594Z",
      "question": "자막 싱크가 안 맞는 걸 신고하고 싶대요",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.3107532397469277,
      "nearestDocId": "content-schedule"
     },
     {
      "at": "2026-09-25T18:46:13.594Z",
      "question": "비번 까먹었다는데 상담원이 바꿔줘도 돼요?",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.3192138622221357,
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
      "at": "2026-09-26T00:15:13.594Z",
      "question": "해외 출장 가서도 볼 수 있어요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.24538134765228864,
      "nearestDocId": "coupon-event"
     },
     {
      "at": "2026-09-25T22:41:13.594Z",
      "question": "통신사 결합 할인 되나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.37045677935086385,
      "nearestDocId": "coupon-event"
     },
     {
      "at": "2026-09-25T21:07:13.594Z",
      "question": "학생 할인 있나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.3910946737952515,
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
      "at": "2026-09-26T02:36:13.594Z",
      "question": "연간 결제하면 할인해 주나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.5051847038483133,
      "nearestDocId": "payment"
     },
     {
      "at": "2026-09-25T17:12:13.594Z",
      "question": "고객이 어제 결제했는데 드라마 한 편 봤대요. 돈 돌려받을 수 있어요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.37268873286135507,
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
      "at": "2026-09-25T21:54:13.594Z",
      "question": "회사에서 직원 복지로 단체 구독하고 싶대요",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.4085585838257613,
      "nearestDocId": "cancel"
     },
     {
      "at": "2026-09-25T20:20:13.594Z",
      "question": "다음 시즌 언제 나오냐고 계속 물어보는데 뭐라고 해요?",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.2471044327199428,
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
      "at": "2026-09-26T01:49:13.594Z",
      "question": "TV 앱에서 다운로드 기능이 언제 생기나요?",
      "status": "unanswerable",
      "confidence": "low",
      "topScore": 0.48222685117970077,
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
      "at": "2026-09-25T19:33:13.594Z",
      "question": "오프라인으로 보던 게 갑자기 재생이 안 된대요",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.27495782263353674,
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
      "at": "2026-09-25T17:59:13.594Z",
      "question": "와이프랑 동시에 보려는데 한 쪽이 끊긴대요",
      "status": "answered",
      "confidence": "low",
      "topScore": 0.23101136459852226,
      "nearestDocId": "account-sharing"
     }
    ]
   }
  ]
 }
};
