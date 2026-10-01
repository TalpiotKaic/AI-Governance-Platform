# 벤치마킹 보고서 (AI Governance Platform Bench-marking, 2026, 144p) — 정독 요약

## 보고서 결론 (우리 = 한국인공지능검증원 같은 공인시험·검증기관 관점)
- 최종 제품 정의: "기업에서 사용하는 모든 AI를 등록·관리하고, AI의 위험과 성능을 실제 시험을 통해 지속적으로 확인하며, 그 결과를 ISO/IEC 42001, AI 규제 및 감사에 활용할 수 있는 AI Management & Assurance Platform"
- 5축 아키텍처: Governance → Management → Testing → Assurance → Continuous Monitoring
- 4 Layer: L1 Governance Core(Registry/Policy/Compliance/Workflow/Evidence/Audit) → L2 AI Management(Model/Data/Vendor/Risk) → L3 AI Assurance(Test/Red Team/Evidence) → L4 Continuous/Agent(Runtime/Agent/Monitoring)
- 핵심 차별 체인 (5개사 모두 미완성): AI System → Risk Assessment → Applicable Regulation/Standard → Control → **Test Requirement → Test Method → Test Dataset/Scenario → Test Environment → Test Execution → Metric/Result → PASS/FAIL/Risk Level → Independent Review → Assurance Evidence** → ISO 42001 / EU AI Act / 국내 AI기본법 / 고객 증빙
- 5개사 공통 Core 흐름: AI Registry → Risk Classification → Framework Mapping → Control → Workflow → Evidence → Approval → Audit Trail → Report
- 2026 이후 2차 필수: Technical Evaluation → Continuous Monitoring → Agent Governance

## 5개사 한 줄 정의 & 가져올 것
| 회사 | 출발점 | 핵심 강점 | 약점 | 우리가 가져올 것 |
|---|---|---|---|---|
| VerifyWise | AI Governance | Workflow+Evidence(15종 Evidence 객체), Self-host, LLM Eval(DeepEval: Answer Relevancy/Faithfulness/Hallucination/Bias/Toxicity), Quality Gate(CI/CD), AI Trust Center, AI Advisor, BSL 1.1 | 고급 ML/Red Teaming 약함 | AI Use Case 중심 데이터모델, Risk–Control–Policy–Evidence–Test 관계형 연결, Evidence 객체화, Risk Score=L×1+S×3, Trust Center |
| Credo AI | Responsible AI | Governance Knowledge Graph(Regulation→Requirement→Risk→Control→Evidence), Policy Pack, Policy Intelligence, Agent Registry(Agent Card, Dependency Graph), Model Trust Score, Vendor Portal, GAIA, Agent Governor(Preview) | 직접 기술시험 약함, 가격 비공개, 폐쇄 | Regulation–Risk–Control 지식그래프, Contextual Risk(용도+산업+국가+데이터+Agent), Policy Pack 구조, Agent Card |
| OneTrust | Privacy/GRC | Intake→Risk Tier→분기 Workflow, Privacy·Data Use·Vendor 연결, Policy-as-Code, AI Guard SDK(ALLOW/REDACT/BLOCK), Light Worker Node(Hybrid), Agent/MCP Governance, DataGuidance | 독립 시험 없음, 무거움, On-prem 제한 | Intake가 Trigger가 되는 자동 분기 Workflow, AI↔Dataset↔Privacy Purpose↔Control 연결, Policy→Test/Control→Evidence |
| Holistic AI | AI Audit | IDENTIFY→PROTECT→ENFORCE, 6 Risk Dimension(Bias/Robustness/Transparency/Privacy/Efficacy/Exposure), 100+ 자동시험, LLM Red Teaming(Hallucination/Toxicity/Jailbreak/Prompt Injection/Data Extraction/Stereotyping), **Agentic Red Teaming(Agent Graph/Component Graph, Execution Trace, Multi-turn, Tool Misuse, Data Exfil, Deception)**, Deployment Gate, Programmable Controls, Guardian Agents(Sentinel/Operative), Independent Audit(Starling Bank, Hired NYC LL144, Wikimedia DSA), Ongoing Assurance | 범용 GRC/Privacy 약함, SME 접근성·가격 | 가장 가까운 경쟁자. Risk→Test→Audit→Assurance→Monitor→Enforce 체인, 6차원 위험, Agentic Red Teaming 시나리오, Deployment Gate, Programmable Control, Audit↔SaaS 퍼널 |
| IBM watsonx.gov | AI/MLOps | AI Factsheets(살아있는 Lifecycle Record), OpenScale(Fairness/Drift/Quality/Explainability), GenAI 지표(Answer Relevance/Similarity/Faithfulness/Context Relevance/Unsuccessful Requests/HAP/PII/Latency), **Agent 지표(Conversation: Duration/Cost; Message: Faithfulness/Relevance/Safety/Failure; Retrieval: Context Relevance; Tool: Tool Call Accuracy/Relevance)**, OpenPages GRC, Compliance Accelerator(Credo 콘텐츠 사용), Hybrid/On-prem | 복잡, 독립성 없음 | Factsheet(=AI Digital Passport), Agent Trace 기반 Metric, 평가→Threshold→Factsheet 자동 기록, Multi-model 지원 |

## 100개 기능 매트릭스 (10 대분류 × 10) + 등급
- A Discovery&Inventory(1-10), B Governance Org&Policy(11-20), C Risk(21-30), D Regulation&Compliance(31-40), E Workflow/Evidence/Audit(41-50), F Technical Evaluation(51-60), G Red Teaming&Assurance(61-70), H Monitoring&Runtime(71-80), I Agent/Data/Vendor(81-90), J Architecture/Deployment(91-100)
- Core 30 (1단계 MVP): 1,2,9,11,12,13,14,15,16,19,21,22,23,24,30,31,32,33,36,39,40,41,42,44,45,47,48,91,95,98
- Competitive 25 (2단계): 3,4,5,6,10,17,18,25,26,27,28,29,37,38,43,49,51,54,56,57,58,71,73,80,87
- Differentiator 20 (3단계, 핵심): 52,53,55,59,60,61,62,63,64,65,66,67,68(독립 Audit 최우선),69(지속 재평가 최우선),70(Test Library 최우선),75,79,83(Tool-call 정확도),86,100
- Later 25 (4단계): 7,8,20,34,35,46,50,72,74,76,77,78,81,82,84,85,88,89,90,92,93,94,96*,97*,99 (*금융·공공 우선 시 2단계로)

## 자체 특화 기능 101-120 (존재 이유)
101 Control→Test Requirement 자동 Mapping | 102 Standard Test Method Library | 103 Test Metric Library | 104 Test Dataset Registry | 105 Test Case Library | 106 Adversarial Scenario Library | 107 Test Environment Registry | 108 Test Execution Engine | 109 Test Result Traceability | 110 Threshold/Acceptance Criteria | 111 Auto PASS/FAIL | 112 시험자/검토자/승인자 Workflow | 113 시험성적서 자동생성 | 114 성적서 Version/Revision | 115 Accredited Evidence 연계 | 116 Assurance Evidence Pack(ISO42001/AI기본법/EU AI Act) | 117 Model Change Impact Analysis | 118 Re-test Trigger Engine | 119 AI Assurance Score | 120 Assurance History / Digital Passport

## 규제 컨텍스트 (보고서 기준, 2026)
- ISO/IEC 42001:2023 AIMS
- EU AI Act: GPAI 의무 2025-08-02, 투명성 의무 2026-08-02, AI Omnibus(2026-07)로 High-risk 2027-12-02, 제품내장 AI 2028-08-02로 조정
- 국내 「인공지능 발전과 신뢰 기반 조성 등에 관한 기본법」 2026-01-22 시행: 고영향 AI 사업자 위험관리방안, 설명방안, 이용자 보호, 사람의 관리·감독, 안전성·신뢰성 확보조치 문서 작성·보관
- Gartner 2026.6 첫 MQ for AI Governance Platforms (Holistic AI = Challenger)

## 보고서가 다루지 않은 것 → 내가 보완할 것
- NIST AI 200-3 ARIA 매뉴얼(Model Testing/Red Teaming/User Testing 3종 + 워크시트) 기반 평가 설계/증적
- 각 서비스의 2026-10 현재 실제 사이트 기준 재검증 (에이전트 조사 결과로 대조)
