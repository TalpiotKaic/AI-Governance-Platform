/** UI dictionary. Keys are the English source strings; missing keys fall back to English. */
export type Locale = "en" | "ko";
export const LOCALES: Locale[] = ["en", "ko"];
export const LOCALE_COOKIE = "kveriai_locale";

export const ko: Record<string, string> = {
  // ── brand / shell ──
  "K-VeriAI": "K-VeriAI",
  "AI Governance & Assurance": "AI 거버넌스 & 보증",
  "AI Governance, Evaluation & Assurance Platform": "AI 거버넌스·평가·보증 플랫폼",
  "K-VeriAI AI Governance, Evaluation & Assurance Platform": "K-VeriAI AI 거버넌스·평가·보증 플랫폼",
  "Verification Body": "검증기관", "Enterprise": "기업", "Sign out": "로그아웃", "Sign in": "로그인", "Toggle theme": "테마 전환", "Open menu": "메뉴 열기", "Close": "닫기", "Public": "공개", "Overview": "개요", "Govern": "거버넌스", "Evaluate & Verify": "평가·검증", "Prove": "증명", "Admin": "관리",
  "Use your organization account to continue.": "조직 계정으로 로그인하세요.", "Email": "이메일", "Password": "비밀번호", "Signing in…": "로그인 중…", "Enter a valid email and password.": "올바른 이메일과 비밀번호를 입력하세요.", "Invalid credentials.": "이메일 또는 비밀번호가 올바르지 않습니다.", "Demo accounts (password: demo1234)": "데모 계정 (비밀번호: demo1234)",
  // ── nav ──
  "Dashboard": "대시보드", "AI Inventory": "AI 인벤토리", "Risk Register": "위험 레지스터", "Frameworks & Controls": "프레임워크·통제", "Policies": "정책", "Approvals & Tasks": "승인·태스크", "Incidents": "인시던트", "Evaluation Plans": "평가 계획", "Evaluation Runs": "평가 실행", "Test Library": "시험 라이브러리", "Evidence Center": "증적 센터", "Reports & Packs": "리포트·증적 팩", "Settings": "설정", "AI Trust Center": "AI 신뢰 센터",
  // ── common ──
  "Code": "코드", "Name": "이름", "Type": "유형", "Status": "상태", "Created": "생성", "Updated": "수정", "Owner": "책임자", "Description": "설명", "Title": "제목", "Version": "버전", "Date": "날짜", "When": "시점", "By": "작성자", "Actions": "작업", "Action": "작업", "Save": "저장", "Edit": "편집", "Add": "추가", "Remove": "제거", "Apply": "적용", "Load": "불러오기", "Link": "연결", "Update": "갱신", "Generate": "생성", "New": "신규", "All": "전체", "None": "없음", "N/A": "해당 없음", "Yes": "예", "No": "아니오", "Unassigned": "미배정", "Pending": "대기", "Approve": "승인", "Reject": "반려", "Issue": "발행", "Issued": "발행일", "Active": "활성", "Activate": "활성화", "Retire": "폐기", "Verified": "검증됨", "Implemented": "구현됨", "In progress": "진행 중", "Not started": "미시작", "Mode": "모드", "Score": "점수", "Verdict": "판정", "Severity": "심각도", "Category": "범주", "System": "시스템", "Systems": "시스템", "Model": "모델", "Models": "모델", "Risk": "위험", "Risks": "위험", "Controls": "통제", "Control": "통제", "Evidence": "증적", "Reports": "리포트", "Report": "리포트", "Run": "실행", "Runs": "실행", "Plan": "계획", "Sessions": "세션", "Findings": "발견사항", "Finding": "발견사항", "Metrics": "지표", "Metric": "지표", "Method": "방법", "Scenario": "시나리오", "Scenarios": "시나리오", "Prompts": "프롬프트", "Prompt": "프롬프트", "Tool": "도구", "Vendor": "벤더", "Vendors": "벤더", "Datasets": "데이터셋", "Stage": "단계", "Decision": "결정", "Subject": "대상", "Actor": "행위자", "Summary": "요약", "Tier": "등급", "Dimension": "차원", "Source": "출처", "Reference": "참조", "Ref": "참조", "Requirement": "요구사항", "requirements": "요구사항", "Role": "역할", "Since": "가입일", "Due": "기한", "Due date": "기한", "Notes": "비고", "Value": "값", "Item": "항목", "Question": "질문", "Rationale": "근거", "Annotator": "어노테이터", "Conf.": "신뢰도", "Measured": "측정값", "Threshold": "임계값", "Outcome": "결과", "Record": "기록", "Label": "라벨", "Provider": "프로바이더", "Country": "국가", "Sector": "산업", "Permissions": "권한", "Allowed": "허용", "Approval": "승인", "Tactic": "전술", "Testing type": "테스트 유형", "Annotations": "어노테이션", "Annotation items": "어노테이션 항목", "Questionnaire": "설문", "Profile": "프로필", "Assurance": "보증", "Integrations": "연동", "Traceability": "추적성", "Maps to": "매핑", "Expected evidence / tests": "기대 증적 / 시험", "Harmonized controls": "조화 통제", "Test methods": "시험 방법", "Linked controls / requirements": "연결된 통제 / 요구사항", "Valid from": "유효 시작", "Verified / systems": "검증 / 시스템 수", "Metrics (threshold)": "지표(임계값)", "resid.": "잔여", "documentary": "문서 통제", "org-level": "조직 수준", "view dialogue": "대화 보기", "latest run score": "최근 실행 점수", "across evaluated systems": "평가된 시스템 기준", "No data.": "데이터 없음.", "No entries": "항목 없음",
  // ── dashboard ──
  "AI systems": "AI 시스템", "Avg. assurance score": "평균 보증 점수", "Open findings": "미해결 발견사항", "Open risks": "미해결 위험", "Pending approvals": "승인 대기", "Valid evidence": "유효 증적", "Assurance score by system": "시스템별 보증 점수", "Latest AI Assurance Score (0–100) from completed evaluation runs. Status colour: ≥80 good, 60–79 warning, &lt;60 failing.": "완료된 평가 실행의 최신 AI 보증 점수(0–100). 색상: ≥80 양호, 60–79 주의, <60 미달.", "Score trend": "점수 추이", "Top open findings": "주요 미해결 발견사항", "From evaluation runs; HIGH/CRITICAL findings auto-register risks.": "평가 실행에서 도출. HIGH/CRITICAL 발견사항은 위험으로 자동 등록됩니다.", "Risk register by dimension": "차원별 위험 레지스터", "Recent evaluation runs": "최근 평가 실행", "Frameworks": "프레임워크", "Requirement libraries loaded": "로드된 요구사항 라이브러리", "No open findings": "미해결 발견사항 없음",
  // ── systems ──
  "Every AI system, model and agent in scope — the top-level object that risks, controls, tests, evidence and reports attach to.": "범위 내 모든 AI 시스템·모델·에이전트. 위험·통제·시험·증적·리포트가 연결되는 최상위 객체입니다.", "Register AI system": "AI 시스템 등록", "No AI systems registered": "등록된 AI 시스템이 없습니다", "Register your first AI system to start the intake → risk → control → test → evidence chain.": "첫 AI 시스템을 등록하면 인테이크 → 위험 → 통제 → 시험 → 증적 체인이 시작됩니다.", "EU AI Act": "EU AI Act", "Intake assessment. Your answers set the initial risk tier, seed context-specific risks and create the review/approval workflow.": "인테이크 평가입니다. 답변에 따라 초기 위험 등급이 정해지고, 맥락별 위험이 생성되며, 검토·승인 워크플로가 만들어집니다.", "Intake answers drive automatic risk tiering, EU AI Act classification prompts and the approval workflow.": "인테이크 답변이 위험 등급 자동 산정, EU AI Act 분류, 승인 워크플로를 결정합니다.", "1. Identity & context (intake)": "1. 식별 및 맥락(인테이크)", "2. Regulatory classification & data": "2. 규제 분류 및 데이터", "3. Model": "3. 모델", "4. Agent profile (Agent Card)": "4. 에이전트 프로필(Agent Card)", "Tools, data sources and MCP servers define the agent&apos;s action surface; the allow-list is enforced during evaluation and drives agent-specific risks.": "도구·데이터 소스·MCP 서버가 에이전트의 행동 범위를 정의합니다. 허용목록은 평가 중 집행되며 에이전트 특화 위험을 생성합니다.", "System name": "시스템 이름", "System type": "시스템 유형", "Lifecycle stage": "라이프사이클 단계", "Purpose / intended use": "목적 / 의도된 용도", "Deployment context": "배포 환경", "Geographies (comma-separated)": "적용 지역(쉼표 구분)", "Intended users": "대상 사용자", "Affected persons": "영향받는 사람", "Tags (comma-separated)": "태그(쉼표 구분)", "EU AI Act category": "EU AI Act 분류", "Annex III area (if high-risk)": "Annex III 영역(고위험인 경우)", "Human oversight measures": "사람의 감독 조치", "Human oversight": "사람의 감독", "Processes personal data": "개인정보를 처리함", "Processes special-category / sensitive data": "민감정보를 처리함", "Interacts directly with natural persons (customer-facing)": "자연인과 직접 상호작용함(고객 대면)", "Makes or materially informs automated decisions about people": "사람에 대한 자동화된 결정을 내리거나 실질적으로 뒷받침함", "Model name": "모델 이름", "Agent framework": "에이전트 프레임워크", "Autonomy level": "자율성 수준", "Tools (one per line: name|riskLevel|allowed|permissions)": "도구(한 줄에 하나: name|riskLevel|allowed|permissions)", "Data sources (one per line)": "데이터 소스(한 줄에 하나)", "MCP servers (one per line)": "MCP 서버(한 줄에 하나)", "Kill switch / emergency stop implemented": "킬스위치 / 비상 정지 구현됨", "Budget cap (USD per session)": "예산 한도(세션당 USD)", "Register system": "시스템 등록", "Save changes": "변경 저장", "Predictive ML model": "예측 ML 모델", "LLM application": "LLM 애플리케이션", "RAG assistant": "RAG 어시스턴트", "AI agent (tools)": "AI 에이전트(도구 사용)", "Multi-agent system": "멀티 에이전트 시스템", "External SaaS AI": "외부 SaaS AI", "Unclassified": "미분류", "Minimal risk": "최소 위험", "Limited risk (Art. 50 transparency)": "제한적 위험(Art. 50 투명성)", "High-risk (Annex I / III)": "고위험(Annex I / III)", "Prohibited practice (Art. 5)": "금지 관행(Art. 5)", "GPAI model": "GPAI 모델", "GPAI with systemic risk": "시스템적 위험 GPAI", "Assistive — suggests, human executes": "보조형 — 제안만 하고 사람이 실행", "Supervised — approval on sensitive actions": "감독형 — 민감 행동은 승인 필요", "Autonomous — executes end-to-end": "자율형 — 끝까지 자동 실행",
  "New plan": "새 계획", "New evaluation": "새 평가", "Generate report": "리포트 생성", "Agent card": "에이전트 카드", "Evaluations": "평가", "Changes & approvals": "변경·승인", "Personal data": "개인정보", "Sensitive data": "민감정보", "Customer-facing": "고객 대면", "Automated decisions": "자동화 결정", "Re-test required (change recorded)": "재시험 필요(변경 기록됨)", "Latest run-derived score": "최근 실행 기반 점수", "Assurance score": "보증 점수", "No model recorded.": "등록된 모델이 없습니다.", "No datasets linked.": "연결된 데이터셋이 없습니다.", "No vendors linked.": "연결된 벤더가 없습니다.", "Risk level and permission scope per tool. Disallowed tools are blocked by policy enforcement during evaluation and flagged if the agent attempts them.": "도구별 위험 수준과 권한 범위. 비허용 도구는 평가 중 정책으로 차단되며 시도 시 발견사항으로 기록됩니다.", "Data sources": "데이터 소스", "Sub-agents": "하위 에이전트", "MCP servers": "MCP 서버", "Add risk": "위험 추가", "Score = likelihood × 1 + severity × 3, scaled to 100. HIGH/CRITICAL test findings register risks automatically.": "점수 = 발생가능성 × 1 + 심각도 × 3(100점 환산). HIGH/CRITICAL 시험 발견사항은 자동 등록됩니다.", "No risks": "위험 없음", "Harmonized controls (28)": "조화 통제(28)", "One control satisfies requirements across ISO/IEC 42001, EU AI Act, NIST AI RMF and the KR AI Basic Act. Controls with test methods are VERIFIED automatically when linked test metrics pass.": "하나의 통제가 ISO/IEC 42001·EU AI Act·NIST AI RMF·AI 기본법 요구사항을 동시에 충족합니다. 시험 방법이 연결된 통제는 지표가 통과하면 자동으로 검증됩니다.", "NIST AI 200-3 worksheets B.1–B.5": "NIST AI 200-3 워크시트 B.1–B.5", "No evaluation plans": "평가 계획 없음", "Evaluation runs": "평가 실행", "No evaluation runs yet": "아직 평가 실행이 없습니다", "Finished": "완료", "Generated from test runs, uploaded documents and attestations, each linked to controls.": "시험 실행에서 생성되거나 업로드·확인서 형태로 등록된 증적이며 각각 통제에 연결됩니다.", "Add evidence": "증적 추가", "No evidence yet": "증적 없음", "Reports & evidence packs": "리포트·증적 팩", "No reports generated": "생성된 리포트 없음", "Deployment approval workflow": "배포 승인 워크플로", "Stages are generated from the risk tier at intake.": "단계는 인테이크 시 위험 등급에 따라 생성됩니다.", "No approvals.": "승인 항목 없음.", "Go to approvals →": "승인 화면으로 →", "Change events → re-test triggers": "변경 이벤트 → 재시험 트리거", "Recording a change expires test-derived evidence and reverts VERIFIED controls until the affected categories are re-run.": "변경을 기록하면 시험 유래 증적이 만료되고 검증된 통제가 진행 중으로 돌아가며, 해당 범주를 재실행해야 합니다.", "What changed?": "무엇이 변경되었나요?", "Record change": "변경 기록", "No change events.": "변경 이벤트 없음.", "No incidents.": "인시던트 없음.",
  // ── risks ──
  "Portfolio view of AI risks across systems. Dimensions follow Holistic-AI-style multi-dimensional assessment plus agent behaviour; HIGH/CRITICAL test findings register risks automatically with full traceability.": "전체 시스템의 AI 위험 포트폴리오. 다차원 위험 평가에 에이전트 행동 차원을 더했으며, HIGH/CRITICAL 시험 발견사항은 추적성을 유지한 채 자동 등록됩니다.", "Likelihood × Severity": "발생가능성 × 심각도", "Count of risks per cell (severity weighted 3×)": "셀별 위험 수(심각도 3배 가중)", "Filter by dimension": "차원별 필터", "Likelihood (1–5)": "발생가능성(1–5)", "Severity (1–5)": "심각도(1–5)", "Mitigation plan": "완화 계획", "AI system": "AI 시스템",
  // ── frameworks ──
  "Requirement libraries for ISO/IEC 42001, EU AI Act, NIST AI RMF, NIST ARIA and the Korea AI Basic Act, harmonised into 28 controls. One control, one piece of evidence, many frameworks (cross-framework mapping).": "ISO/IEC 42001·EU AI Act·NIST AI RMF·NIST ARIA·AI 기본법 요구사항 라이브러리를 28개 조화 통제로 통합했습니다. 통제 하나, 증적 하나로 여러 프레임워크에 대응합니다(교차 매핑).", "Harmonized control library (HC-01 … HC-28)": "조화 통제 라이브러리(HC-01 … HC-28)", "ISO/IEC 42001": "ISO/IEC 42001", "NIST AI RMF": "NIST AI RMF", "KR Basic Act": "AI 기본법", "Generate evidence pack": "증적 팩 생성", "Coverage for system:": "커버리지 대상 시스템:", "covered": "충족", "partial": "부분", "gaps": "갭",
  // ── library ──
  "Standardised test methods (metrics, thresholds, reference standards) and reusable scenarios (prompt sets, red-team scripts, annotation schemas, questionnaires) — aligned with NIST AI 200-3 Materials and mapped to harmonized controls. The library is the asset that makes Control → Test Requirement → Test Method → Result traceable and repeatable.": "표준화된 시험 방법(지표·임계값·참조 표준)과 재사용 가능한 시나리오(프롬프트셋·레드팀 스크립트·어노테이션 스키마·설문). NIST AI 200-3 Materials에 맞추고 조화 통제에 매핑되어, 통제 → 시험 요구사항 → 시험 방법 → 결과를 추적·재현 가능하게 합니다.", "Each method defines metrics with acceptance thresholds and maps to harmonized controls.": "각 방법은 합격 임계값이 있는 지표를 정의하고 조화 통제에 매핑됩니다.", "Including NIST ARIA Appendix C examples (Healthcare-Privacy, Manufacturing-Safety), agentic red-teaming scripts (tool misuse, exfiltration, multi-turn manipulation) and EU AI Act Art. 50 disclosure tests.": "NIST ARIA Appendix C 예시(Healthcare-Privacy, Manufacturing-Safety), 에이전트 레드티밍 스크립트(도구 오용·유출·멀티턴 조작), EU AI Act Art. 50 고지 시험을 포함합니다.", "Target concept": "측정 개념", "Metrics & acceptance criteria": "지표 및 합격 기준", "Control & requirement traceability": "통제·요구사항 추적성", "LLM-as-judge rubric": "LLM 판정 루브릭", "Description & instructions": "설명 및 지시문",
  // ── plans ──
  "ARIA-style evaluation designs (NIST AI 200-3 worksheets B.1–B.5): scope, design, materials, infrastructure and implementation. A plan selects scenarios from the library and is executed as runs.": "ARIA식 평가 설계(NIST AI 200-3 워크시트 B.1–B.5): 범위·설계·자료·인프라·실행. 계획은 라이브러리에서 시나리오를 선택하고 실행 단위로 수행됩니다.", "New evaluation plan": "새 평가 계획", "Fill the NIST AI 200-3 worksheets. Scenario applicability is highlighted for the selected system type.": "NIST AI 200-3 워크시트를 작성합니다. 선택한 시스템 유형에 적용 가능한 시나리오가 강조됩니다.", "B.1 Scope": "B.1 범위", "B.2 Design": "B.2 설계", "B.3 Materials — scenarios": "B.3 자료 — 시나리오", "B.3 Materials": "B.3 자료", "B.4 Infrastructure": "B.4 인프라", "B.5 Implementation": "B.5 실행", "B.4 Infrastructure & B.5 Implementation": "B.4 인프라 & B.5 실행", "Plan name": "계획 이름", "AI application(s) being evaluated (one per line)": "평가 대상 AI 애플리케이션(한 줄에 하나)", "Intended use cases (one per line)": "의도된 사용 사례(한 줄에 하나)", "Target concept (what you want to measure)": "측정 개념(무엇을 측정할 것인가)", "Goal of Model Testing": "모델 테스팅 목표", "Goal of Red Teaming": "레드티밍 목표", "Goal of User Testing": "사용자 테스팅 목표", "Distribution of testers": "테스터 배분", "Select scenarios from the library. Highlighted rows are applicable to the selected system type.": "라이브러리에서 시나리오를 선택하세요. 강조된 행이 선택한 시스템 유형에 적용 가능합니다.", "Components captured by Model Testing prompts": "모델 테스팅 프롬프트가 포착하는 요소", "Components captured by annotation schema": "어노테이션 스키마가 포착하는 요소", "Red Teaming instructions": "레드티밍 지시문", "User Testing instructions": "사용자 테스팅 지시문", "Annotation tool": "어노테이션 도구", "Evaluation API / target adapter": "Evaluation API / 대상 어댑터", "Red teamers — sampling frame, eligibility, sample size": "레드티머 — 표본 틀·자격·표본 크기", "User testers — sampling frame, eligibility, sample size": "사용자 테스터 — 표본 틀·자격·표본 크기", "Annotators — sampling frame, expertise, sample size": "어노테이터 — 표본 틀·전문성·표본 크기", "Data collection (IRB, consent, storage, risk mitigation)": "데이터 수집(IRB·동의·저장·위험 완화)", "Data analysis techniques": "데이터 분석 기법", "What reported results will tell": "보고 결과가 말해줄 것", "Human testing phases (red teaming / user testing with people) will undergo IRB/consent review before data collection.": "사람이 참여하는 테스트 단계(레드티밍·사용자 테스트)는 데이터 수집 전 IRB/동의 검토를 거칩니다.", "Create plan": "계획 생성", "Run this plan": "이 계획 실행", "ARIA report": "ARIA 리포트", "Mark completed": "완료 처리", "No runs yet.": "실행 없음.", "Within-subjects: testers interact with multiple applications in multiple scenarios": "피험자 내: 테스터가 여러 애플리케이션·시나리오와 상호작용", "Between-subjects: testers interact with a single application in a single scenario": "피험자 간: 테스터가 단일 애플리케이션·시나리오와 상호작용", "Mixed": "혼합",
  // ── evaluations ──
  "Executions of model, red-team and user-testing scenarios against a target (live API, HTTP Evaluation API, or the deterministic demo target). Each run produces metrics, findings, risks, control verification and evidence.": "대상(실제 API, HTTP Evaluation API, 결정론적 데모 대상)에 대한 모델·레드팀·사용자 테스팅 시나리오 실행. 각 실행은 지표·발견사항·위험·통제 검증·증적을 생성합니다.", "No evaluation runs": "평가 실행 없음", "New evaluation run": "새 평가 실행", "Choose the system, scenarios (or a plan), and the target. DEMO mode runs against a deterministic simulated target so the full pipeline can be exercised without API keys; LIVE mode calls the real model/agent and uses an LLM-as-judge.": "시스템·시나리오(또는 계획)·대상을 선택합니다. DEMO 모드는 결정론적 시뮬레이터를 대상으로 하여 API 키 없이 전체 파이프라인을 실행하고, LIVE 모드는 실제 모델/에이전트를 호출하며 LLM 판정기를 사용합니다.", "1. Target system & scope": "1. 대상 시스템 및 범위", "2. Scenarios": "2. 시나리오", "3. Execution mode & target adapter": "3. 실행 모드 및 대상 어댑터", "Run name": "실행 이름", "Evaluation plan (optional)": "평가 계획(선택)", "If a plan is selected, its scenarios are used and the ad-hoc selection below is ignored.": "계획을 선택하면 계획의 시나리오가 사용되고 아래 수동 선택은 무시됩니다.", "Model version (env)": "모델 버전(환경)", "Prompt version": "프롬프트 버전", "DEMO — simulated target": "DEMO — 시뮬레이션 대상", "Deterministic synthetic responses with ground-truth tags. No API keys. Reproducible by seed.": "정답 태그가 포함된 결정론적 합성 응답. API 키 불필요. 시드로 재현 가능.", "LIVE — real model / agent": "LIVE — 실제 모델 / 에이전트", "Weakness profile (0 = robust … 1 = very weak)": "취약도 프로파일(0 = 강건 … 1 = 매우 취약)", "Seed (reproducibility)": "시드(재현성)", "Target adapter": "대상 어댑터", "Base URL": "Base URL", "API key (optional — overrides saved credential)": "API 키(선택 — 저장된 자격증명보다 우선)", "System prompt for the target (optional)": "대상 시스템 프롬프트(선택)", "Judge adapter": "판정 어댑터", "Judge model": "판정 모델", "Start evaluation": "평가 시작", "Rule-based only (no LLM judge)": "규칙 기반만(LLM 판정 없음)", "Evaluation report": "평가 리포트", "Verification report": "검증 리포트", "Re-run": "재실행", "Demo mode: results come from a simulated target and illustrate the workflow only.": "데모 모드: 결과는 시뮬레이션 대상에서 생성되었으며 워크플로 예시용입니다.", "Sessions & dialogues": "세션·대화", "Evidence & reports": "증적·리포트", "AI Assurance Score": "AI 보증 점수", "Severity-weighted aggregate across categories": "범주별 심각도 가중 종합", "Category scores": "범주별 점수", "Results by scenario": "시나리오별 결과", "Test environment": "시험 환경", "Metrics vs acceptance thresholds": "지표 대 합격 임계값", "WARN band: within 1.5× of a lower-is-better threshold or within 10% below a higher-is-better threshold.": "WARN 구간: 낮을수록 좋은 지표는 임계값의 1.5배 이내, 높을수록 좋은 지표는 임계값의 10% 미만 미달.", "No metrics yet": "지표 없음", "No findings": "발견사항 없음", "All sessions passed their annotation checks.": "모든 세션이 어노테이션 검사를 통과했습니다.", "SessionID · TesterID · ScenarioID · TestingType": "SessionID · TesterID · ScenarioID · TestingType", "Rule-based, LLM-as-judge or demo ground truth; add a human annotation to validate (NIST AI 200-3 §6 adjudication).": "규칙 기반·LLM 판정·데모 정답. 사람 어노테이션을 추가해 검증하세요(NIST AI 200-3 §6 조정).", "Add human annotation": "사람 어노테이션 추가", "No sessions yet": "세션 없음", "Generated evidence": "생성된 증적", "One record per test category, linked to the harmonized controls of the test methods used.": "시험 범주별 1건이 생성되며 사용된 시험 방법의 조화 통제에 연결됩니다.", "Evidence is generated when the run completes.": "증적은 실행 완료 시 생성됩니다.", "Reports referencing this run": "이 실행을 참조하는 리포트", "No reports yet. Generate an evaluation or verification report from the buttons above.": "리포트가 없습니다. 위 버튼으로 평가 또는 검증 리포트를 생성하세요.", "Sessions are executed, annotated and scored in the background. This page refreshes automatically.": "세션은 백그라운드에서 실행·어노테이션·채점됩니다. 이 페이지는 자동으로 갱신됩니다.", "Running evaluation…": "평가 실행 중…", "Queued…": "대기 중…",
  // ── evidence ──
  "Every artefact that proves something: test-derived evidence generated by runs, uploaded documents (policies, DPIAs, model cards) and human attestations — each an object linked to harmonized controls and reusable across ISO/IEC 42001, EU AI Act, NIST AI RMF and KR AI Basic Act packs.": "무언가를 증명하는 모든 산출물: 실행에서 생성된 시험 유래 증적, 업로드 문서(정책·DPIA·모델 카드), 사람의 확인서. 각각 조화 통제에 연결되어 ISO/IEC 42001·EU AI Act·NIST AI RMF·AI 기본법 증적 팩에 재사용됩니다.", "Generated (test-derived)": "생성(시험 유래)", "Uploaded documents": "업로드 문서", "Attestations": "확인서", "Expired (re-test needed)": "만료(재시험 필요)", "Upload a document or record an attestation and link it to harmonized controls so it is reused across every framework pack.": "문서를 업로드하거나 확인서를 기록하고 조화 통제에 연결하면 모든 프레임워크 팩에 재사용됩니다.", "Evidence type": "증적 유형", "Uploaded document": "업로드 문서", "Human attestation (no file)": "사람의 확인서(파일 없음)", "AI system (optional — leave blank for organisation-level evidence)": "AI 시스템(선택 — 조직 수준 증적이면 비워 두세요)", "Organisation-level": "조직 수준", "Valid until (optional)": "유효 종료(선택)", "Description / attestation statement": "설명 / 확인 진술", "File (PDF, DOCX, XLSX, images…)": "파일(PDF, DOCX, XLSX, 이미지…)", "Link to harmonized controls": "조화 통제에 연결", "Save evidence": "증적 저장", "Set status": "상태 설정", "Open file": "파일 열기", "Open report": "리포트 열기", "Controls and requirements this evidence satisfies — reused automatically in each framework&apos;s evidence pack.": "이 증적이 충족하는 통제와 요구사항. 각 프레임워크 증적 팩에 자동 재사용됩니다.", "Not linked yet.": "아직 연결되지 않았습니다.", "Test-derived content": "시험 유래 내용",
  // ── reports ──
  "Reports & Evidence Packs": "리포트·증적 팩", "Evaluation reports, formal verification (test) reports with tester/reviewer/approver sign-off, NIST ARIA worksheet reports, framework evidence packs (ISO/IEC 42001, EU AI Act, NIST AI RMF, KR AI Basic Act) and the living AI Passport. Reports are versioned; issuing one supersedes the previous version.": "평가 리포트, 시험자/검토자/승인자 서명이 있는 공식 검증(시험) 리포트, NIST ARIA 워크시트 리포트, 프레임워크 증적 팩(ISO/IEC 42001·EU AI Act·NIST AI RMF·AI 기본법), 살아있는 AI Passport. 리포트는 버전 관리되며 발행 시 이전 버전을 대체합니다.", "Evaluation & verification": "평가·검증", "Regulatory evidence packs": "규제 증적 팩", "Living records": "라이브 기록", "Approver": "승인자", "Reviewer": "검토자", "Tester (signature block)": "시험자(서명란)", "Reports are built from platform records (runs, risks, controls, evidence). Change the system to reload its runs and plans.": "리포트는 플랫폼 기록(실행·위험·통제·증적)으로 생성됩니다. 시스템을 변경하면 실행과 계획을 다시 불러옵니다.", "Report parameters": "리포트 매개변수", "Evidence packs need no run; evaluation & verification reports need at least one completed run; the ARIA report needs a plan.": "증적 팩은 실행이 필요 없고, 평가·검증 리포트는 완료된 실행 1건 이상, ARIA 리포트는 계획이 필요합니다.", "Report type": "리포트 유형", "Evaluation run(s)": "평가 실행", "Hold Ctrl/Cmd to select several (verification report). Ignored for evidence packs and passport.": "여러 개 선택은 Ctrl/Cmd(검증 리포트). 증적 팩·Passport에서는 무시됩니다.", "Evaluation plan (ARIA report)": "평가 계획(ARIA 리포트)", "Print view": "인쇄 보기", "Submit for review": "검토 요청", "Mark reviewed": "검토 완료", "Return to draft": "초안으로 되돌리기",
  // ── approvals ──
  "Approvals, Tasks & Audit Trail": "승인·태스크·감사 추적", "Multi-stage review/approval (technical, privacy & security, legal, executive) generated from intake risk tier; every decision becomes an approval record (evidence) and an audit-trail entry.": "인테이크 위험 등급에 따라 생성되는 다단계 검토·승인(기술, 개인정보·보안, 법무, 경영). 모든 결정은 승인 기록(증적)과 감사 추적 항목이 됩니다.", "You can decide on these stages.": "이 단계들을 결정할 수 있습니다.", "Reviewer/Approver roles can decide.": "검토자/승인자 역할이 결정할 수 있습니다.", "Comment (optional)": "의견(선택)", "Nothing pending.": "대기 항목 없음.", "New task…": "새 태스크…", "Decided": "결정됨", "Audit trail (latest 25)": "감사 추적(최근 25건)", "Who did what, when — immutable log for internal audit and regulator requests.": "누가 언제 무엇을 했는지 기록하는 불변 로그. 내부 감사와 규제기관 요청에 활용합니다.",
  // ── incidents ──
  "Incidents & post-market monitoring": "인시던트 및 시판 후 모니터링", "Operational AI incidents (bias, hallucination, privacy, safety, security). Reporting an incident registers an EXPOSURE risk and a re-evaluation task; serious incidents are flagged for EU AI Act Art. 73 reporting clocks and KR AI Basic Act 제32조 response.": "운영 중 AI 인시던트(편향·환각·개인정보·안전·보안). 인시던트를 보고하면 노출(EXPOSURE) 위험과 재평가 태스크가 등록되며, 중대 인시던트는 EU AI Act Art. 73 보고 기한과 AI 기본법 제32조 대응 대상으로 표시됩니다.", "Report incident": "인시던트 보고", "No incidents recorded.": "기록된 인시던트가 없습니다.", "Root cause": "근본 원인", "Corrective actions": "시정 조치", "Harm category": "피해 범주", "Affected persons (count)": "영향받는 사람 수", "Serious incident (Art. 73)": "중대 인시던트(Art. 73)", "Serious incident — death/serious harm, critical infrastructure disruption, fundamental-rights breach, or serious property/environmental damage (EU AI Act Art. 3(49)); triggers Art. 73 reporting clocks": "중대 인시던트 — 사망/중대 피해, 핵심 인프라 중단, 기본권 침해, 중대한 재산·환경 피해(EU AI Act Art. 3(49)). Art. 73 보고 기한이 시작됩니다.",
  // ── policies ──
  "AI policy library (ISO/IEC 42001 cl. 5.2, A.2.2) and internal standards. Activating a policy records versioned policy evidence linked to HC-01.": "AI 정책 라이브러리(ISO/IEC 42001 5.2절, A.2.2)와 내부 표준. 정책을 활성화하면 HC-01에 연결된 버전 증적이 기록됩니다.", "New policy": "새 정책", "Templates: AI Policy, Risk Assessment Procedure, Agent Tool-Use Standard, Change-triggered Re-evaluation, Incident Communication Plan.": "템플릿: AI 정책, 위험평가 절차, 에이전트 도구 사용 표준, 변경 기반 재평가, 인시던트 소통 계획.", "Summary / content": "요약 / 내용", "Create draft": "초안 생성", "Governance Owner or Admin role required.": "거버넌스 책임자 또는 관리자 역할이 필요합니다.",
  // ── settings ──
  "Organisation, users & roles, LIVE-mode provider credentials (encrypted at rest), and the public AI Trust Center.": "조직, 사용자·역할, LIVE 모드 프로바이더 자격증명(저장 시 암호화), 공개 AI 신뢰 센터.", "Organisation": "조직", "Enable public AI Trust Center": "공개 AI 신뢰 센터 사용", "Trust Center introduction": "신뢰 센터 소개문", "Open Trust Center →": "신뢰 센터 열기 →", "LIVE-mode provider credentials": "LIVE 모드 프로바이더 자격증명", "No stored credentials. DEMO mode works without any.": "저장된 자격증명이 없습니다. DEMO 모드는 자격증명 없이 동작합니다.", "Add credential": "자격증명 추가", "Users & roles": "사용자·역할", "Roles: Admin · Governance Owner · Approver (authorised signatory) · Reviewer (technical review) · Tester (runs evaluations) · Viewer.": "역할: 관리자 · 거버넌스 책임자 · 승인자(서명 권한) · 검토자(기술 검토) · 시험자(평가 실행) · 열람자.", "Initial password": "초기 비밀번호", "HTTP Evaluation API contract": "HTTP Evaluation API 계약",
  // ── evaluation api ──
  "HTTP Evaluation API": "HTTP Evaluation API", "Request (per turn)": "요청(턴마다)", "Response": "응답", "Try it": "직접 해보기",
  // ── trust ──
  "Governance commitments": "거버넌스 약속", "AI systems in scope": "범위 내 AI 시스템", "Active policies": "활성 정책", "Issued assurance reports": "발행된 보증 리포트", "No issued reports yet.": "발행된 리포트가 없습니다.", "Report contents are available to customers and auditors on request.": "리포트 내용은 요청 시 고객과 감사인에게 제공됩니다.", "AI disclosure": "AI 고지",
  // ── tabs/misc ──

  // ── batch 2 ──
  "Recommendation:": "권고:",
  "Reference:": "참조:",
  "Open findings:": "미해결 발견사항:",
  "Critical findings:": "치명 발견사항:",
  "Passed:": "통과:",
  "Sessions:": "세션:",
  "Runs:": "실행:",
  "Intake risk score:": "인테이크 위험 점수:",
  "Applicable to:": "적용 대상:",
  "Model version": "모델 버전",
  "Data source": "데이터 소스",
  "Configuration": "설정",
  "PII": "개인식별정보",
  "API key": "API 키",
  "Base URL (optional)": "Base URL(선택)",
  "Default model (e.g. claude-sonnet-5-5)": "기본 모델(예: claude-sonnet-5-5)",
  "Evaluation plans": "평가 계획",
  "— organisation-level —": "— 조직 수준 —",
  "— ad hoc scenario selection —": "— 시나리오 직접 선택 —",
  "auto (run id)": "자동(실행 ID)",
  "Link to control…": "통제 연결…",
  "Anthropic (LLM-as-judge)": "Anthropic(LLM 판정)",
  "OpenAI (LLM-as-judge)": "OpenAI(LLM 판정)",
  "OpenAI-compatible (local judge)": "OpenAI 호환(로컬 판정기)",
  "OpenAI-compatible (Ollama, vLLM, gateway)": "OpenAI 호환(Ollama, vLLM, 게이트웨이)",
  "Anthropic Messages API": "Anthropic Messages API",
  "OpenAI Chat Completions": "OpenAI Chat Completions",
  "HTTP Evaluation API (NIST ARIA-style contract)": "HTTP Evaluation API(NIST ARIA식 계약)",
  "Blocked": "차단",
  "AI application(s)": "AI 애플리케이션",
  "Annotators": "어노테이터",
  "Autonomy": "자율성",
  "Budget cap": "예산 한도",
  "Data analysis": "데이터 분석",
  "Data collection": "데이터 수집",
  "Data schema": "데이터 스키마",
  "Evaluation API": "Evaluation API",
  "Framework": "프레임워크",
  "Kill switch": "킬스위치",
  "Model Testing goal": "모델 테스팅 목표",
  "Red Teaming goal": "레드티밍 목표",
  "Red teamers": "레드티머",
  "Reported results": "보고 결과",
  "Scoring tool": "채점 도구",
  "Tester distribution": "테스터 배분",
  "Testing platform": "테스팅 플랫폼",
  "Use cases": "사용 사례",
  "User Testing goal": "사용자 테스팅 목표",
  "User testers": "사용자 테스터",
  "0–100 per test category; weights: security/safety/agent 1.2, privacy 1.1, fairness/quality 1.0, robustness/transparency 0.8, performance 0.5": "시험 범주별 0–100점. 가중치: 보안/안전/에이전트 1.2, 개인정보 1.1, 공정성/품질 1.0, 강건성/투명성 0.8, 성능 0.5",
  "Annex III areas: biometrics, critical infrastructure, education, employment, essential services (credit, insurance), law enforcement, migration, justice.": "Annex III 영역: 생체인식, 핵심 인프라, 교육, 고용, 필수 서비스(신용·보험), 법 집행, 이주, 사법.",
  "Align with a NIST trustworthiness characteristic, e.g. “Privacy-Enhanced — the degree to which the application does not disclose PHI…”": "NIST 신뢰성 특성에 맞추세요. 예: “개인정보 강화 — 애플리케이션이 PHI를 노출하지 않는 정도…”",
  "Approval gates, review of outputs, kill switch, escalation…": "승인 게이트, 출력 검토, 킬스위치, 에스컬레이션…",
  "Customer portal, internal tool, embedded…": "고객 포털, 내부 도구, 임베디드…",
  "Financial services, Healthcare, Manufacturing…": "금융, 의료, 제조…",
  "LangGraph, CrewAI, AutoGen, custom…": "LangGraph, CrewAI, AutoGen, 자체 개발…",
  "Anthropic, OpenAI, in-house…": "Anthropic, OpenAI, 자체…",
  "claude-sonnet, gpt-4o, GBM v7…": "claude-sonnet, gpt-4o, GBM v7…",
  "e.g. Annex III §5(b) creditworthiness": "예: Annex III §5(b) 신용평가",
  "e.g. Customer Service Agent": "예: 고객 서비스 에이전트",
  "You are AcmeAssist, a customer support assistant…": "당신은 고객 지원 어시스턴트 AcmeAssist입니다…",
  "yes / no / 1-5": "예 / 아니오 / 1-5",
  "Implement this contract on your model or agent to evaluate it in LIVE mode without sharing credentials. It mirrors the NIST AI 200-3 Evaluation API (OpenConnection / StartSession / GetResponse / CloseConnection): K-VeriAI sends the running dialogue and (for agents) the sandbox tool catalogue; your system returns the next assistant message and any tool calls. Tool calls are executed by the K-VeriAI sandbox (mocked, no side effects) and the results are fed back on the next request.": "자격증명을 공유하지 않고 LIVE 모드로 평가하려면 모델/에이전트에 이 계약을 구현하세요. NIST AI 200-3 Evaluation API(OpenConnection / StartSession / GetResponse / CloseConnection)를 따릅니다. K-VeriAI가 진행 중인 대화와(에이전트의 경우) 샌드박스 도구 카탈로그를 보내면, 귀하의 시스템은 다음 어시스턴트 메시지와 도구 호출을 반환합니다. 도구 호출은 K-VeriAI 샌드박스(모의, 부작용 없음)에서 실행되고 결과는 다음 요청에 포함됩니다.",
  "Timeouts: respond within 30 s per turn; a failed turn marks the session NOT_EVALUATED and continues the run.": "타임아웃: 턴당 30초 이내 응답. 실패한 턴은 세션을 NOT_EVALUATED로 표시하고 실행을 계속합니다.",
  "Sandbox tool names are evaluated against the built-in tool catalogue (search_knowledge_base, lookup_customer, get_account_balance, transfer_funds, send_email, export_customer_data, delete_customer_record, run_sql, read_patient_record, schedule_appointment, process_refund, escalate_to_human, book_flight, fetch_url).": "샌드박스 도구 이름은 내장 도구 카탈로그(search_knowledge_base, lookup_customer, get_account_balance, transfer_funds, send_email, export_customer_data, delete_customer_record, run_sql, read_patient_record, schedule_appointment, process_refund, escalate_to_human, book_flight, fetch_url)와 대조됩니다.",
  "Human approval": "사람 승인",
  "Governance, evaluation and assurance posture for": "거버넌스·평가·보증 현황:",
  "high/critical tier": "HIGH/CRITICAL 등급",
  "critical": "치명",
  "total in register": "레지스터 전체",
  "open tasks": "미완료 태스크",
  "open incidents": "미해결 인시던트",
  "mode": "모드",
  "judge:": "판정기:",
  "by": "담당",
  "Report language": "리포트 언어",
  "Language of the generated report content. Versions are tracked per language.": "생성될 리포트 본문의 언어입니다. 버전은 언어별로 관리됩니다.",
  "Regenerate in Korean": "한국어판 생성",
  "Regenerate in English": "영문판 생성",
  "You don't have permission for this page": "이 페이지에 대한 권한이 없습니다",
  "Your role": "내 역할",
  "Required permission": "필요 권한",
  "Ask an administrator to change your role in Settings → Users & roles.": "역할 변경이 필요하면 관리자에게 요청하세요(설정 → 사용자·역할).",
  "Back to dashboard": "대시보드로 돌아가기",
  "Permission matrix": "권한 매트릭스",
  "Permission": "권한",
  "Capabilities per role. Roles are not a hierarchy: reviewers and approvers cannot run the evaluations they sign off (segregation of duties). Server actions enforce the same matrix.": "역할별 기능 권한입니다. 역할은 서열이 아니며, 검토자·승인자는 자신이 서명하는 평가를 직접 실행할 수 없습니다(직무 분리). 서버 액션도 동일한 매트릭스로 집행됩니다.",
  "perm.systems.write": "AI 시스템 등록·편집, 변경 기록, 통제 상태 설정",
  "perm.systems.delete": "AI 시스템 삭제",
  "perm.risks.write": "위험 추가 및 상태 변경",
  "perm.plans.write": "평가 계획 생성·완료",
  "perm.evaluations.run": "평가 실행 시작·재실행",
  "perm.evaluations.annotate": "사람 어노테이션 추가, 발견사항 상태 변경",
  "perm.evidence.write": "증적 업로드·확인서 작성, 통제 연결",
  "perm.reports.generate": "리포트·증적 팩 생성, 검토 요청",
  "perm.reports.review": "리포트 검토 완료 / 초안으로 되돌리기",
  "perm.reports.approve": "리포트 승인·발행",
  "perm.approvals.decide": "배포·위험 수용 승인 결정",
  "perm.tasks.write": "태스크 생성·변경",
  "perm.incidents.write": "인시던트 보고·갱신",
  "perm.policies.write": "정책 생성·활성화",
  "perm.settings.view": "조직 설정 열람",
  "perm.settings.manage": "사용자·역할·자격증명·조직 관리",
  "perm.audit.view": "감사 추적 열람",
  "Language": "언어", "English": "English", "Korean": "한국어",
};

export const en: Record<string, string> = {
  "perm.systems.write": "Register and edit AI systems, record changes, set control status",
  "perm.systems.delete": "Delete AI systems",
  "perm.risks.write": "Add risks and update risk status",
  "perm.plans.write": "Create and complete evaluation plans",
  "perm.evaluations.run": "Start and re-run evaluation runs",
  "perm.evaluations.annotate": "Add human annotations and update finding status",
  "perm.evidence.write": "Upload or attest evidence, link to controls",
  "perm.reports.generate": "Generate reports and evidence packs, submit for review",
  "perm.reports.review": "Mark reports reviewed or return to draft",
  "perm.reports.approve": "Approve and issue reports",
  "perm.approvals.decide": "Decide deployment and risk-acceptance approvals",
  "perm.tasks.write": "Create and update tasks",
  "perm.incidents.write": "Report and update incidents",
  "perm.policies.write": "Create and activate policies",
  "perm.settings.view": "View organisation settings",
  "perm.settings.manage": "Manage users, roles, credentials and organisation",
  "perm.audit.view": "View the audit trail",
};

export function translate(locale: Locale, key: string): string {
  if (locale === "ko") return ko[key] ?? en[key] ?? key;
  return en[key] ?? key;
}
