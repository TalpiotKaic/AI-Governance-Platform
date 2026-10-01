# NIST AI 200-3 — ARIA Evaluation Planning Manual (Sept 2026) — 정독 노트

## 개요
- ARIA = Assessing Risks and Impacts of AI. NIST AI RMF의 MEASURE 기능을 수행하는 평가 기법.
- 3가지 테스트 데이터를 결합해 "실제 사람에 대한 위험·영향"을 측정: Model Testing(자동), Red Teaming(인간 적대), User Testing(인간 실사용).
- 5요소: Scope / Design / Materials / Infrastructure / Implementation (Fig.1). 각 요소마다 워크시트(Appendix B) 존재 → K-VeriAI의 "평가 계획서" 스키마로 그대로 차용 가능.

## 1. Scope (B.1)
- AI Application(s): 평가 대상 시스템(단일 또는 복수 비교)
- Sector: Healthcare, Manufacturing, Education, Cybersecurity, Finance 등
- Use Cases: 섹터 내 구체 사용 방식 (소수 권장, 범용 AI는 더 많이 필요)
- Target Concept: 측정할 개념 (NIST AI RMF 신뢰성 특성과 정렬: Valid&Reliable, Safe, Secure&Resilient, Accountable&Transparent, Explainable&Interpretable, Privacy-Enhanced, Fair)
- 표기: Sector-Concept (예: Healthcare-Privacy, Manufacturing-Safety)

## 2. Design (B.2)
- Automated(Model Testing): 확장 용이, 사전 정의 프롬프트, 일관·반복
- Human(Red Teaming, User Testing): 실제 맥락, 비예측 프롬프트, 동적
- Model Testing: 평가자가 정의한 프롬프트 → 응답 → 어노테이터가 라벨링
- Red Teaming: 적대적 상호작용 지시 (부정적 결과 유도)
- User Testing: 의도된 맥락에서의 성능. 모집 → 지시 → 상호작용 → 설문
- Distribution of Testers: Within-subjects / Between-subjects / Mixed. 파워 분석으로 표본 크기 결정

## 3. Materials (B.3)
- Scenarios: use case의 구체 인스턴스. NIST 시나리오 방법론 구성요소: use case, sector, user(직접/간접), intended outcomes, expected impacts(+/-), KPI & metrics
- Prompt Sets: 기존 벤치마크(MMLU, HumanEval, LiveBench)는 오염 문제 → 커스텀 프롬프트 권장. "세션" 단위로 분할
- Instructions: 테스터 지시문 (목적, 행동, 저장/제출 방법). 소규모 파일럿 권장
- Questionnaires: General(표본 특성) + Scenario-specific(인식/경험)
- Annotation Schema: 어노테이터용 질문+라벨. LLM-as-judge 가능(검증 필요)

## 4. Infrastructure (B.4)
- Evaluation API (대상 앱이 구현): OpenConnection(), CloseConnection(), StartSession(), GetResponse(text)
- Data Schema
  - Identifiers: SessionID(PK), Date/Time, TesterID, ApplicationID, ScenarioID, TestingType
  - Logs: Dialogues(P1,R1,...Pn,Rn), Questionnaires(Q1..Qx), Annotations(Q1..Qy; 조건부/턴 단위 가능)
- Testing Platform: Prompt Delivery, Dialogue Collection / Tester Assignment, Instruction Display, Interaction(Chat) Interface, Questionnaire Administration
- Annotation Tool: Annotator Assignment, Dialogue Display & Annotation Interface, Instruction Display, Questionnaire Administration
- Scoring Tool: Data Input, Aggregation Techniques(measurement trees 등), Visualization

## 5. Implementation (B.5)
- Recruiting Human Testers: sampling frame, eligibility, sample size; IRB/동의 필요
- Recruiting Annotators: 도메인 전문성; 다중 어노테이션 + 조정(adjudication)
- LLM-as-judge: 입출력 검증, 추론 설정 튜닝, 모델 선택, 다중 실행으로 변동성 측정, 일부 인간 검증
- Data Collection: Model Testing은 스크립트 실행; 인간 테스트는 모집 채널 → 동의 → 세션 기록
- Data Analysis: 기술통계, 추론통계, measurement trees, 심각도 가중 비율, 다중비교 보정
- Reporting Results: 워크시트 자체가 방법론 보고 양식 (투명성·재현성)

## Appendix C 예시 (K-VeriAI 시나리오 템플릿으로 재사용)
- C.1 Healthcare-Privacy: PHI 미공개/과잉수집 금지/부적절 요청 거부. 어노테이션: PHI 존재(None/Own/Third-party), 부적절 공개(Y/N,유형), 과잉 요청(Y/N), 거부 적절성(Over/Appropriate/Under), 심각도(1-5). 레드팀 20-40명, 유저 ~100/앱, 어노테이터 3-5.
- C.2 Manufacturing-Safety: 안전 단계(PPE, LOTO, 가딩) 누락/위험 지름길. 어노테이션: 필수 단계(All/Some missing/Critical missing), 위험 권고(Y/N), 우회 승인(Y/N), 심각도(1-5), 적절 거부(Y/N).

## K-VeriAI 설계 시사점
1. "평가 계획(Evaluation Plan)" 객체 = B.1~B.5 워크시트 필드 그대로 → NIST 증적 자동 생성
2. 세션/대화/설문/어노테이션 데이터 스키마를 NIST 식별자 체계와 1:1 호환 → Agent 환경에서는 Dialogue 로그를 tool-call 트레이스까지 확장
3. 3종 테스트 모두 플랫폼 기능으로: 자동 프롬프트 러너(모델/에이전트 어댑터 = Evaluation API), 레드팀 콘솔, 유저 테스트 설문
4. 어노테이션 도구 + LLM-as-judge(인간 검증 샘플링 포함)
5. 스코어링: 심각도 가중, measurement tree 시각화
6. 리포트: 방법론(워크시트) + 결과(지표) → 증적 패키지로 ISO42001/EU AI Act 조항에 매핑
