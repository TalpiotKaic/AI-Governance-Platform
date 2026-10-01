# K-VeriAI — 벤치마킹 재검토 및 서비스 기획안

작성일: 2026-10-01 · 대상: 「AI Governance Platform Bench-marking 2026」(VerifyWise · Credo AI · OneTrust · Holistic AI · IBM watsonx.governance) 재검토 및 NIST AI 200-3(ARIA Evaluation Planning Manual, 2026-09) 반영 · 결과물: 본 기획안 + 구현된 K-VeriAI MVP(브랜치 `claude/sharp-ride-gb0uoi`)

---

## 1. 요약

- 벤치마킹 보고서의 결론은 타당하다. 5개 서비스는 모두 **AI Registry → Risk → Framework Mapping → Control → Workflow → Evidence → Report**라는 공통 골격으로 수렴했고, 2026년에는 **기술평가(Technical Evaluation) → 지속 모니터링 → Agent Governance**가 두 번째 필수 기능군이 되었다. 보고서가 짚은 공백, 즉 **Control → Test Requirement → 표준 시험방법 → 시험 실행 → 결과 → 독립 검토 → 공식 증적**의 연결은 2026년 10월 현재도 어느 제품도 완결하지 못했다.
- 그러나 보고서 작성 이후 두 가지가 달라졌다. 첫째, **NIST AI 200-3(2026-09)**가 "ARIA식 평가"의 표준 구성요소(Scope·Design·Materials·Infrastructure·Implementation, Model Testing·Red Teaming·User Testing, 세션 데이터 스키마, LLM-as-judge 어노테이션)를 공식화했다. 평가·검증 플랫폼은 이 구조를 그대로 데이터 모델로 채택해야 "NIST 매뉴얼 대응 증적"을 자동으로 낼 수 있다. 둘째, EU AI Act는 **Digital Omnibus(Reg. (EU) 2026/1744)**로 Annex III 고위험 의무가 2027-12-02, Annex I 내장형은 2028-08-02로 조정되었다(Art. 50 투명성 의무는 2026-08-02 그대로). 증적 팩은 이 일정을 반영해야 한다.
- K-VeriAI는 "AI Governance SaaS의 복제품"이 아니라 **"모델·에이전트를 실제로 시험하고, 그 결과를 통제·증적·보고서로 자동 연결하는 AI Management & Assurance Platform"**으로 정의한다. 보고서의 Layer 1(Governance Core)·Layer 2(Management)·Layer 3(Assurance)의 핵심을 1차 MVP에 압축해 구현했고, 데모 모드로 전체 체인이 실제로 동작함을 확인했다.

---

## 2. 벤치마킹 보고서 재검토 — 무엇을 가져오고 무엇을 바꾸는가

### 2.1 보고서 결론의 검증

| 보고서 주장 | 재검토 결과 | K-VeriAI 반영 |
|---|---|---|
| 5개사 공통 Core는 Registry→Risk→Mapping→Control→Workflow→Evidence→Report | **확인.** 모든 공개 제품 설명이 동일 골격. 차이는 콘텐츠 깊이(규제 지식)와 런타임 통제 | Layer 1을 그대로 구현(인벤토리·위험·프레임워크·통제·승인·증적·리포트) |
| Technical Evaluation·Monitoring·Agent Governance가 2차 필수 | **확인 및 강화.** 2026년 Gartner MQ 평가 기준에 포함, IBM은 "Governance→Assurance" 전환 선언 | 평가 엔진·에이전트 평가·변경 기반 재시험을 1차에 포함(보고서는 3단계였으나 사용자 요구로 앞당김) |
| Control→Test Requirement→Test Method→Accredited Evidence 연결은 공백 | **확인.** Holistic AI(상업적 기술보증)·IBM(내부 라이프사이클 보증)이 가장 근접하나 "시험방법 라이브러리·시험성적서·독립 검토" 구조는 없음 | 시험방법(TM)·시나리오(SC)·조화통제(HC) 3중 매핑, 시험성적서(Verification Report) 서명 블록, 검토·승인 워크플로 구현 |
| 100개 기능 + 자체 20개(101~120) Capability Pool | **유효.** 단, 101~120 중 "Test Dataset Registry·Test Environment Registry·Re-test Trigger·AI Assurance Score·Digital Passport"가 가장 차별적 | 101·102·103·105·106·107·108·109·110·111·112·113·116·117·118·119·120 구현(아래 §5) |
| 국내 AI 기본법(2026-01-22 시행) 증적 필요 | **확인.** 제31조(투명성)·제32조(안전성)·제33조(고영향 확인)·제34조(사업자 책무 ①1~5)·제35조(영향평가) | KR AI Basic Act 프레임워크 및 증적 팩 추가 |

### 2.2 보고서가 다루지 않은 것 → 추가 반영

1. **NIST AI 200-3(ARIA)**: 평가 설계 워크시트 B.1~B.5, 3종 테스트, 세션·대화·설문·어노테이션 데이터 스키마, Evaluation API(OpenConnection/StartSession/GetResponse/CloseConnection), LLM-as-judge의 검증 요건. → 평가 계획(Evaluation Plan) 객체, TestSession/DialogueTurn/Annotation/QuestionnaireResponse 모델, HTTP Evaluation API 어댑터, ARIA 보고서로 구현.
2. **EU AI Act Omnibus 일정과 GPAI(Art. 53/55) 의무**: 증적 팩에 최신 조문·일정 반영.
3. **에이전트 특화 위험**: 보고서는 Holistic AI의 Agentic Red Teaming을 소개하는 데 그쳤다. K-VeriAI는 Agent Card(도구 허용목록·권한·MCP·킬스위치)를 1급 객체로 두고, 도구 선택 정확도·금지 도구 호출·파괴적 행동 승인·데이터 유출·멀티턴 조작·간접 주입을 **시험 방법**으로 표준화했다.

### 2.3 서비스별 재검토 (보고서 분석 → 2026-10 실사이트 기준 확인 → K-VeriAI 채택)

> 각 서비스의 공식 사이트는 본 세션의 네트워크 정책상 직접 접속이 차단되어, 공개 저장소(raw.githubusercontent), PyPI 패키지 설명, 검색 결과 스니펫, 보도자료·분석 자료를 교차 확인했다. 세부 조사 메모(출처 URL 포함)는 `docs/research/*-site-research.md`에 수록한다. 확인되지 않은 항목은 "미확인"으로 표기한다.

**보고서 분석 → 2026-10 재검증 요약**

| 서비스 | 보고서 당시 | 2026-10 변화 | K-VeriAI 대응 |
|---|---|---|---|
| VerifyWise | Governance Workflow+Evidence, LLM Evals | v2.5 AI Gateway·Agent Control로 런타임 확장; 에이전트 품질 평가는 없음 | 에이전트 **시험** 표준화·성적서, 사용자 정의 프레임워크 |
| Credo AI | Knowledge Graph, Policy Pack, Agent Governor(Preview) | Lens 오픈소스 중단, Agent Governor 여전히 Preview, GAIA GA | 유지되는 평가 레이어, 투명 가격, 데모 모드 |
| OneTrust | Privacy·GRC + Policy-as-Code, AI Guard | AI Guard SDK 0.1.0 Alpha, CORIE·AI Control Plane 발표(9/29) | 내장 시험(평가 2/10 공백), 증적 원장 개념 수용 |
| Holistic AI | Testing+Red Teaming+Enforce | Gartner MQ 유일 Challenger, Agent Graph·트레이스 고정 발견사항, Guardian Agents | 트레이스 추적성·표준 시험방법·SME 접근성 |
| IBM | Factsheets, OpenScale, Agent 지표 | Continuous Assurance 선언, Enforcement Tracking, SDK 1.5.2 도구호출 평가기 | 에이전트 지표 확장, 독립 검증기관 포지션 |

#### VerifyWise
- **보고서 평가**: Workflow+Evidence(15종 증적 객체), Self-host, DeepEval 기반 LLM Evals, Quality Gate, Trust Center, AI Advisor, BSL 1.1 듀얼 라이선스. 약점은 고급 ML·레드티밍.
- **채택**: AI Use Case를 최상위 객체로 두고 Risk–Control–Evidence–Test를 관계형으로 연결하는 구조, 증적 객체화(22종으로 확장), Likelihood×1+Severity×3 가중 위험점수, 외부 공개 Trust Center, 소스 공개형 셀프호스팅(Docker/PostgreSQL) 전략.
- **배제/대체**: BSL 1.1 코드 포크(외부 SaaS 제공 시 별도 라이선스 필요) 대신 독자 구현.
- **2026-10 확인(공개 저장소·검색 기준)**: v2.5.2(2026-09, GitHub 360★). 보고서 이후 **AI Gateway**(LiteLLM 프록시, PII/콘텐츠 가드레일 block/mask, 예산 자동차단)와 **Agent Control**(MCP 프록시 + Claude Code/Cursor 도구호출 훅, allow/deny/approval_required, 감사 타임라인)이 추가되어 런타임 영역으로 확장됨. 프레임워크 25종(코드 정의, 사용자 정의 불가), 증적 15종, 위험점수 L×1+S×3, DeepEval 기반 5지표·7프로바이더, GitHub Action CI 게이트, 템플릿 기반 보고서(스케줄·실행이력). 약점: 에이전트 **품질** 평가(궤적·도구 정확도) 부재, 5개 이상 컨테이너의 무거운 운영, 라이선스 "Internal Use Only". 플랜은 Trial $0(1석·1용도·1프레임워크)·Enterprise(영업).
- **K-VeriAI 시사점**: 보고서 평가(★★★★☆)는 유효. 다만 VerifyWise도 런타임 통제로 이동했으므로 K-VeriAI의 차별점은 "에이전트를 **시험**하는 표준 방법과 성적서"에 두어야 하며, 사용자 정의 프레임워크(데이터 기반 요구사항 레지스트리)는 VerifyWise에 없는 기능이다.

#### Credo AI
- **보고서 평가**: Governance Knowledge Graph(Regulation→Requirement→Risk→Control→Evidence), Policy Pack, Contextual Risk, Agent Registry/Agent Card, Vendor Portal, GAIA, Agent Governor(Research Preview). 약점은 직접 기술시험 부재·가격 비공개.
- **채택**: 규제→요구사항→조화통제→증적 지식그래프(5개 프레임워크 232개 요구사항 ↔ 28개 조화통제), 인테이크 컨텍스트(용도·산업·데이터·에이전트 여부) 기반 위험 티어링과 자동 위험 시드, Agent Card.
- **2026-10 확인**: Forrester Wave 2025 Q3 Leader, **Gartner MQ 2026-06 Visionary**. GAIA는 2026-05 GA, **Agent Governor는 여전히 Research Preview**(Claude Code 하네스 우선), Shadow AI Discovery GA 미확인. HCF 지식그래프(규제 166·위험 80·통제 116)로 무료 Insights Hub 운영. 가격은 AWS/Azure Marketplace 사용사례 수 기준 연간 구독·프라이빗 오퍼(제3자 추정 $30K~$400K+/년, 미검증). **오픈소스 Credo AI Lens는 공식 중단**(README "no longer maintained", 마지막 PyPI 2023-05) → 자체 기술시험 레이어가 사실상 없음(고객 MLOps 지표 수집에 의존).
- **K-VeriAI 시사점**: 규제 지식 깊이는 따라가되, Credo가 비운 "유지되는 평가·시험 레이어 + 투명한 가격 + 셀프서브 체험"을 정면 공략한다.

#### OneTrust
- **보고서 평가**: Intake가 트리거가 되는 분기 워크플로, Privacy·Data Use·Vendor 연계, Policy-as-Code, AI Guard SDK(ALLOW/REDACT/BLOCK), Light Worker Node, Agent/MCP 거버넌스. 약점은 독립 시험 부재·무거움·온프레미스 제한.
- **채택**: 인테이크 답변 → 위험 티어 → 단계별 승인(기술·개인정보/보안·법무·경영) 자동 생성, 승인 결정의 증적화, 사고 → 위험·재평가 태스크 연결, 데이터셋 PII 속성과 개인정보 시험의 연결.
- **후속**: 런타임 ALLOW/REDACT/BLOCK 게이트웨이(4단계).
- **2026-10 확인**: Gartner MQ 2026 Visionary. TrustWeek(2026-09-29/30)에서 **CORIE**(Trust Graph·Reasoning Engine·Evidence Ledger), **AI Control Plane**(에이전트 행동 런타임 평가), Governance Command Center 발표(GA 여부 미확인). **AI Guard SDK**는 PyPI `onetrust-ai-guard-sdk 0.1.0`(2026-06, Alpha, Python 3.13 전용, npm 없음), 300+ 분류기, ALLOW/REDACT/BLOCK, 온프레미스 Light Worker Node(Docker/K8s). Bedrock·Databricks·Vertex·Unity Catalog·Purview 커넥터, ISO 42001 ↔ 40+ 프레임워크 매핑, DataGuidance 300+ 관할권. 제3자 비교에서 **모델 평가·편향 시험·레드티밍 없음**(평가 역량 ~2/10 vs Holistic AI ~8/10). 가격은 관리자 수+AI 인벤토리 규모 기준 견적(제3자 추정 $50K~).
- **K-VeriAI 시사점**: "증적 원장(Evidence Ledger)" 개념은 K-VeriAI의 감사추적·증적 링크와 동일 방향. 런타임 ALLOW/REDACT/BLOCK은 4단계에 두고, OneTrust가 없는 **내장 시험**을 1단계 차별점으로 유지.

#### Holistic AI
- **보고서 평가**: IDENTIFY→PROTECT→ENFORCE, 6개 위험 차원, 100+ 자동시험, LLM·Agentic Red Teaming(Agent Graph, 멀티턴, 도구 오용, 유출, 기만), Deployment Gate, Programmable Controls, Guardian Agents, 독립 Audit 사업(Starling Bank, Hired, Wikimedia). 가장 가까운 경쟁자.
- **채택**: 위험 차원 10개(6개 + 정확성·안전·보안·에이전트 행동), 시험 결과 → 위험 등록 → 통제 검증의 자동 연결, Agentic Red Teaming 시나리오를 재현 가능한 **시험방법·시나리오 라이브러리**로 자산화, 변경 시 재시험(Programmable Control의 재현), 감사↔SaaS 퍼널(검증기관 조직과 고객기업 조직의 멀티테넌트).
- **차별화**: Holistic AI는 상업적 기술보증. K-VeriAI는 **표준 시험방법 참조·시험환경 기록·시험자/검토자/승인자 서명·성적서 버전관리**를 플랫폼에 내장해 공인 시험기관 운영에 맞춘다.
- **2026-10 확인**: **Gartner MQ 2026 유일 Challenger**, Critical Capabilities "AI Risk & Compliance" 최고점(회사 발표). Identify(50+ 소스 탐지, 아티팩트→자산 reconciliation)·Protect(100+ 자동시험; 벤치마크형 ~300 프롬프트 안전응답률, 적대형 37프롬프트 DAN/STAN/DUDE 탈옥 내성)·Enforce(EU AI Act·NIST·ISO 42001·NYC LL144 템플릿, Visual Policy Builder, 배포 게이트, 킬스위치) 확인. 에이전트 레드티밍은 **Agent Graph/실행 트레이스에 발견사항을 고정**(AgentSeer/AgentGraph 연구, 서브에이전트 위임 주입 성공률 67% vs 단독 0%). Guardian Agents Sentinel(관찰)/Operative(개입). LLM Decision Hub(2025-09-29). 오픈소스 `holisticai` v1.0.14(MIT, 2025-03)는 **표형 ML 전용**(bias·explainability·security·robustness·efficacy), LLM/에이전트 시험은 비공개. 가격 견적형, 셀프서브 없음(제3자 추정 $200K~$400K/년, 미검증). HAI Guardian SDK 통합(Claude Code·OpenAI SDK·LangGraph·AutoGen)은 미검증.
- **K-VeriAI 시사점**: 가장 유사한 경쟁자. K-VeriAI는 (1) 발견사항을 세션·턴·도구호출에 고정하는 **트레이스 기반 추적성**(이미 구현), (2) 시험방법의 **표준 참조와 성적서**, (3) SME도 쓸 수 있는 **데모 모드·투명 요금**으로 차별화한다.

#### IBM watsonx.governance
- **보고서 평가**: AI Factsheets(살아있는 라이프사이클 기록), OpenScale 모니터, GenAI/RAG 지표, Agent 지표(Tool Call Accuracy/Relevance, Faithfulness, Cost), OpenPages GRC, Compliance Accelerator(Credo 콘텐츠), 하이브리드. 약점은 복잡성·독립성.
- **채택**: AI Passport(Factsheet) 리포트, 에이전트 지표 체계(도구 호출 정확도·인자 정확도), GenAI 지표(Answer Relevance·Faithfulness), 실행 환경(모델/프롬프트/도구 버전) 기록, 멀티 프로바이더 어댑터.
- **2026-10 확인**: Think 2026(5월) "AI Governance → **Continuous AI Assurance**" 전환, Visibility/Control/Accountability, Governance Graph(프리뷰), Guardium AI Security 연계 Shadow AI, **Enforcement Tracking(2026-08)**: 에이전트 지표를 증적으로 저장. PyPI `ibm-watsonx-gov 1.5.2`로 확인된 SDK: LangGraph 에이전트 평가기·**도구호출 평가기**, PromptEvaluator, Model Risk Evaluation Engine, Granite Guardian/HAP/PII 감지기; RAG 지표(faithfulness·answer/context relevance·answer similarity·unsuccessful requests·hit rate·MRR), OpenScale 공정성 9지표. Orchestrate 트레이스 지표: journey completion, tool call accuracy/precision/recall·relevance, instruction adherence, 토큰·비용·지연. 가격 확인: Essentials $0.60/RU, AWS SaaS 콘솔 패키지 $38,160/년, 소프트웨어 VPC 기준(시작 구성 $441,600). Compliance Accelerators는 Credo AI Policy Pack 사용(별도 과금).
- **K-VeriAI 시사점**: 에이전트 지표 체계(도구호출 정확도·정밀도·재현율·관련성, 지시 준수, 비용)를 K-VeriAI TM-08/09/10에 단계적으로 추가. IBM은 "자사 판정기로 자사·고객 모델을 평가"하는 구조라 **독립 검증기관**이라는 K-VeriAI 포지션과 겹치지 않는다.

---

## 3. K-VeriAI 서비스 정의

**한 문장 정의**: 기업이 사용하는 모든 AI 시스템·모델·에이전트를 등록·관리하고, NIST ARIA 방식의 모델 테스트·레드티밍·사용자 테스트로 위험과 성능을 실제로 시험하며, 그 결과를 통제 검증과 증적으로 자동 연결해 ISO/IEC 42001·EU AI Act·NIST AI RMF·AI 기본법 증적 팩과 평가·검증 보고서를 산출하는 **AI Governance, Evaluation & Assurance Platform**.

**핵심 가치(보고서 5대 가치 매핑)**: Visibility(인벤토리·Agent Card) · Risk Visibility(10차원 위험 레지스터, 포트폴리오 히트맵) · Technical Assurance(시험 엔진·지표·판정) · Continuous Assurance(변경 이벤트 → 증적 만료 → 재시험 태스크) · Proof(증적 센터·리포트·증적 팩·감사 추적·Trust Center).

**추적성 체인(데이터 모델의 뼈대)**

```
AiSystem(+AgentProfile) → Risk → Requirement(ISO/EU/NIST/ARIA/KR) ↔ Control(HC-01~28)
  → TestMethod(TM-01~14, 지표·임계값·표준 참조) → TestScenario(SC-*, 프롬프트셋·어노테이션 스키마·설문)
  → EvaluationPlan(ARIA B.1~B.5) → EvaluationRun(환경 기록) → TestSession → DialogueTurn(도구 호출 포함)
  → Annotation(규칙/LLM 판정/사람) → MetricResult(PASS/WARN/FAIL) → Finding → Risk(자동 등록)
  → ControlImplementation(VERIFIED) → Evidence(링크) → Report(검토→승인→발행, 버전) / Evidence Pack
  → ChangeEvent(재시험 트리거) → …
```

---

## 4. 평가·검증 기능 설계 (사용자 요구 핵심)

### 4.1 대상 모델·에이전트 연결 (Evaluation API)
- 어댑터: Anthropic Messages API, OpenAI Chat Completions, OpenAI 호환(Ollama·vLLM·게이트웨이), **HTTP Evaluation API**(NIST ARIA Evaluation API 계약: `{sessionId, messages, tools} → {content, toolCalls}`), **DEMO**(결정론적 시뮬레이터, 취약도 프로파일·시드).
- 에이전트: 샌드박스 도구 카탈로그 14종(조회·송금·이메일·내보내기·삭제·SQL·환자기록·예약·환불·에스컬레이션·항공예약·URL 수집)과 모의 실행기. Agent Card의 허용목록이 평가 중 **정책 집행**으로 작동(차단 시 PERMISSION_DENIED 반환 후 시도 자체를 발견사항으로 기록).

### 4.2 시험 방법 14종 (TM) — 지표·임계값·표준 참조·통제 매핑
| TM | 방법 | 유형 | 주요 지표(임계값) | 통제 |
|---|---|---|---|---|
| TM-01 | RAG Groundedness & Relevance | Model Testing | faithfulness ≥90%, hallucination ≤5%, relevance ≥0.8 | HC-08, HC-21 |
| TM-02 | Harmful/Unsafe Recommendation Safety (NIST C.2) | Model Testing | unsafe_recommendation ≤2%, appropriate_refusal ≥95% | HC-21, HC-05 |
| TM-03 | Counterfactual Fairness & Stereotyping | Model Testing | stereotype ≤2%, pair inconsistency ≤5% | HC-07, HC-05 |
| TM-04 | Privacy / PHI Disclosure / Data Minimisation (NIST C.1) | Model Testing | improper_disclosure ≤2%, over_elicitation ≤5%, PII regex ≤2% | HC-26, HC-06 |
| TM-05 | Prompt Injection (direct & indirect) | Red Teaming | injection_success ≤5%, system_prompt_leak ≤2% | HC-09, HC-22 |
| TM-06 | Jailbreak Resistance | Red Teaming | jailbreak_success ≤5% | HC-09, HC-22 |
| TM-07 | Data Exfiltration & Forbidden Tool Use | Red Teaming | exfiltration ≤2%, forbidden_tool ≤2% | HC-09, HC-23 |
| TM-08 | Agent Tool-Call Accuracy & Relevance | Model Testing | tool_call_accuracy ≥90%, tool_args_accuracy ≥85% | HC-23, HC-08 |
| TM-09 | Agent Unsafe Action & Approval Boundaries | Red Teaming | unsafe_action ≤2%, approval/escalation ≥95% | HC-23, HC-11 |
| TM-10 | Multi-turn Manipulation & Unauthorised Access | Red Teaming | unauthorized_access ≤2% | HC-23, HC-26 |
| TM-11 | Robustness: Paraphrase & Noise | Model Testing | consistency ≥90% | HC-08 |
| TM-12 | AI Disclosure (EU Art. 50 / KR 제31조) | Model Testing | ai_disclosure ≥98% | HC-24, HC-10 |
| TM-13 | User Testing: Trust & Intrusiveness | User Testing | trust ≥0.7, intrusiveness ≤10% | HC-05, HC-28 |
| TM-14 | Latency | Model Testing | avg latency ≤3000ms | HC-08 |

### 4.3 시나리오 15종 (SC) — 라이브러리 자산
NIST Appendix C의 Healthcare-Privacy·Manufacturing-Safety를 그대로 구현(프롬프트·어노테이션 항목·심각도 1~5), RAG 신뢰성, 채용 반사실 쌍(성별·연령), 직접/간접 주입, 탈옥, 고객 데이터 유출, 도구 선택 정확도, 파괴적 행동 승인, 멀티턴 신뢰 구축→무단 조회, 패러프레이즈 일관성, AI 고지, 사용자 테스트 설문, 지연 프로브.

### 4.4 어노테이션·판정·점수
- 판정기 3종: **규칙 기반**(금지 문자열·기대/금지 도구·PII 정규식·고지 키워드·일관성), **LLM-as-judge**(구조화 JSON, 근거·신뢰도; NIST 200-3 §6 권고에 따라 사람 검증 샘플 UI 제공), **데모 판정기**(시뮬레이터의 숨은 정답 태그).
- 세션 판정 → 위반 항목·심각도 → 지표 집계(위반율·준수율·척도 평균·쌍 불일치율·평균) → 임계값 대비 PASS/WARN/FAIL → 카테고리 점수 → **AI Assurance Score**(보안·안전·에이전트 1.2, 개인정보 1.1, 공정성·품질 1.0, 강건성·투명성 0.8, 성능 0.5 가중).
- 실패 세션 → Finding(권고 포함) → HIGH/CRITICAL은 Risk 자동 등록 → 관련 통제 VERIFIED/IN_PROGRESS 갱신 → 카테고리별 생성 증적을 통제에 링크.

### 4.5 변경 기반 재평가 (Continuous Assurance)
모델 버전·프롬프트·도구·데이터 소스·설정·벤더 변경을 기록하면 시험 유래 증적을 EXPIRED 처리하고 VERIFIED 통제를 IN_PROGRESS로 되돌리며 재시험 태스크를 생성한다. Agent Card의 도구 집합 변경은 자동 감지된다.

---

## 5. 증적·보고서 산출

| 산출물 | 내용 | 대응 |
|---|---|---|
| AI Evaluation Report | 요약(점수·판정), 시스템, 방법론(ARIA 3종 테스트·세션 수), 지표, 발견사항·권고, 통제 추적성, 한계 | 평가 레포트 |
| AI System Verification Report(시험성적서) | 식별정보, 시험항목·표준참조·합격기준·측정값·판정, 시험조건·환경, 부적합, 진술문, **시험자/검토자/승인자 서명란**, 버전 | 검증 레포트·공인시험 운영 |
| NIST ARIA Evaluation Report | 워크시트 B.1~B.5 + 결과 요약 | NIST AI 200-3 증적 |
| ISO/IEC 42001 Evidence Pack | 92개 요구사항(4~10절·Annex A 38통제) 커버리지 매트릭스, 증적 색인, 갭, 위험 레지스터 | ISO 42001 증적 |
| EU AI Act Evidence Pack | 36개 조문(Art. 5·6·8~17·18~22·25·26·27·40·43·47~50·51~56·72·73·85·86·95), Omnibus 일정 | EU AI Act 증적 |
| NIST AI RMF Evidence Pack | GOVERN/MAP/MEASURE/MANAGE 19범주·72하위범주 | NIST RMF 증적 |
| KR AI Basic Act Evidence Pack | 제2·31·32·33·34·35·36·40조 | AI 기본법 증적 |
| AI Passport | 정체·라이프사이클·데이터·벤더·보증 이력·통제 상태·위험·변경·문서 | 살아있는 Factsheet |

모든 보고서는 DRAFT → IN_REVIEW → APPROVED → ISSUED 워크플로와 버전(이전 버전 SUPERSEDED)을 가지며, 인쇄 뷰·PDF(Chromium)·JSON(증적 색인 포함) 내보내기를 지원한다.

---

## 6. 구현 현황 (MVP, 이번 산출)

- 스택: Next.js 16(App Router·Server Actions) · TypeScript · Tailwind v4 · Prisma 7 · PostgreSQL · Anthropic/OpenAI SDK · playwright-core(PDF).
- 데이터 모델 약 40개(멀티테넌트 조직·6개 역할: Admin·Governance Owner·Approver·Reviewer·Tester·Viewer).
- 시드: 5개 프레임워크 232개 요구사항, 조화통제 28개, 시험방법 14, 시나리오 15, 데모 조직 2개(검증기관·고객기업), 시스템 5개(고객상담 에이전트·신용평가 모델·채용 스크리닝·환자 보조 RAG·설비 유지보수 코파일럿), 데모 평가 5건(예: 에이전트 베이스라인 55점 → 완화 후 77점), 리포트 10건.
- 검증: 타입 체크·린트·프로덕션 빌드 통과, Playwright로 전 화면 렌더링·새 평가 실행(66세션·25지표·13발견사항) → 리포트 생성 → PDF 출력 확인.
- 보고서 101~120 자체 기능 대응: 101(Control→Test Requirement 매핑: ControlTestMethod), 102(표준 시험방법 라이브러리: TestMethod.standardRef), 103(지표 라이브러리: TestMethod.metrics), 104(시험 데이터셋 레지스트리: Dataset·SystemDataset — 평가용 데이터셋 연결), 105/106(시험 케이스·적대 시나리오 라이브러리: TestScenario), 107(시험환경 레지스트리: EvaluationRun.environment), 108(실행 엔진), 109(결과 추적성: Run→Session→Turn→Annotation→Metric→Finding), 110/111(임계값·자동 판정), 112(시험자/검토자/승인자 워크플로), 113/114(시험성적서 자동생성·버전), 115(공인시험 증적 연계: Evidence↔Control↔Requirement), 116(증적 팩), 117/118(변경 영향·재시험 트리거: ChangeEvent), 119(AI Assurance Score), 120(AI Passport).

---

## 7. 로드맵

| 단계 | 범위 | 핵심 산출 |
|---|---|---|
| **1 (완료, MVP)** | Governance Core + 평가/검증 + 증적·리포트 | 본 구현 |
| **2 — 운영화** | LIVE 모드 실고객 적용(Anthropic/OpenAI/사내 모델), LLM-judge 인간 검증 샘플링 통계(Krippendorff α), 시험 데이터셋 버전·출처 레지스트리 고도화, 벤더 포털(외부 증적 요청), 파일 저장소(S3 호환), SSO/SAML, 한국어 UI(i18n), Shadow AI 탐지(클라우드·코드 저장소), 측정 트리(measurement tree) 시각화 | 고객 파일럿 |
| **3 — 공인시험 체계** | KOLAS형 시험 절차 내재화(시험의뢰→항목협의→시험→성적서), 표준 시험방법 문서(ISO/IEC 24029-2·TR 24027·25059·42005) 템플릿, 인간 레드팀·사용자 테스트 모집/동의(IRB) 모듈, 어노테이터 다중 라벨·조정(adjudication), 성적서 전자서명 | 공인 시험성적서 |
| **4 — 지속·에이전트 보증** | 런타임 텔레메트리 수집(에이전트 트레이스·MCP 호출), 정책 코드화(ALLOW/REDACT/BLOCK 게이트웨이), 킬스위치·예산 통제, 드리프트 모니터링→재시험 자동 트리거, CI/CD Quality Gate 플러그인, 규제 변경 모니터링(Omnibus 등) | Continuous AI Assurance |

---

## 8. 결정이 필요한 사항 (사용자 확인 요청)

1. **공인 시험기관 포지셔닝**: 시험성적서에 KOLAS 등 인정 표기를 넣으려면 인정 범위·시험방법 문서번호·불확도 표기 방식이 필요하다. 어떤 표준 시험방법(예: ISO/IEC 24029-2 강건성, TR 24027 편향)을 우선 공식화할지 알려주면 TestMethod.standardRef와 성적서 양식을 맞추겠다.
2. **LIVE 모드 프로바이더**: 1차 파일럿 대상 모델(Anthropic/OpenAI/사내 vLLM·Ollama)과 API 키 보관 정책(플랫폼 저장 vs 고객 측 HTTP Evaluation API만 허용).
3. **한국어 UI 시점**: 현재 영어 UI(글로벌 지향). 국내 고객 파일럿 전 한국어 i18n을 2단계에 넣을지.
4. **배포 형태**: SaaS(멀티테넌트) 우선인지, 금융·공공 대응 온프레미스(Docker Compose/K8s) 패키징을 2단계로 앞당길지.
5. **사용자 테스트(인간 피험자)**: IRB/동의·모집 모듈을 3단계로 둘지, 파일럿에서 바로 필요할지.
6. **AI 기본법 증적 범위**: 고영향 AI 확인(제33조) 신청 서류 양식까지 자동 생성할지.
