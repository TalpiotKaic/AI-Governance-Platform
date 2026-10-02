import type { Locale } from "./dict";
import { enumLabel } from "@/lib/utils";

/** Korean labels for enum values; falls back to the English enumLabel. */
const KO: Record<string, string> = {
  // roles
  ADMIN: "관리자", GOVERNANCE_OWNER: "거버넌스 책임자", TESTER: "시험자", REVIEWER: "검토자", APPROVER: "승인자", VIEWER: "열람자",
  // org
  VERIFICATION_BODY: "검증기관", ENTERPRISE: "기업",
  // system types
  PREDICTIVE_ML: "예측 ML", LLM_APPLICATION: "LLM 애플리케이션", RAG_ASSISTANT: "RAG 어시스턴트", AGENT: "에이전트", MULTI_AGENT: "멀티 에이전트", EXTERNAL_SAAS: "외부 SaaS AI",
  // lifecycle
  PLANNED: "계획", DEVELOPMENT: "개발", TESTING: "시험", APPROVED: "승인됨", PRODUCTION: "운영", RETIRED: "폐기",
  // tiers / severity
  LOW: "낮음", MEDIUM: "보통", HIGH: "높음", CRITICAL: "치명", INFO: "정보",
  // EU AI Act
  UNCLASSIFIED: "미분류", MINIMAL: "최소 위험", LIMITED_TRANSPARENCY: "제한적 위험(투명성)", HIGH_RISK: "고위험", PROHIBITED: "금지", GPAI: "GPAI", GPAI_SYSTEMIC: "GPAI(시스템적 위험)",
  // autonomy
  ASSISTIVE: "보조형", SUPERVISED: "감독형", AUTONOMOUS: "자율형",
  // risk dimensions
  ACCURACY_EFFICACY: "정확성·유효성", BIAS_FAIRNESS: "편향·공정성", ROBUSTNESS: "강건성", SAFETY: "안전", SECURITY: "보안", PRIVACY: "개인정보", TRANSPARENCY_EXPLAINABILITY: "투명성·설명가능성", ACCOUNTABILITY: "책임성", AGENT_BEHAVIOR: "에이전트 행동", EXPOSURE: "노출",
  // risk status / source
  IDENTIFIED: "식별", ASSESSED: "평가됨", MITIGATING: "완화 중", ACCEPTED: "수용", CLOSED: "종료", INTAKE: "인테이크", MANUAL: "수동", TEST_FINDING: "시험 발견사항", INCIDENT: "인시던트", MONITORING: "모니터링",
  // frameworks
  ISO_42001: "ISO/IEC 42001", EU_AI_ACT: "EU AI Act", NIST_AI_RMF: "NIST AI RMF", NIST_ARIA: "NIST ARIA", KR_AI_BASIC_ACT: "AI 기본법",
  // control status
  NOT_STARTED: "미시작", IN_PROGRESS: "진행 중", IMPLEMENTED: "구현됨", VERIFIED: "검증됨", NOT_APPLICABLE: "해당 없음",
  // testing types / categories
  MODEL_TESTING: "모델 테스팅", RED_TEAMING: "레드티밍", USER_TESTING: "사용자 테스팅",
  QUALITY: "품질", FAIRNESS: "공정성", TRANSPARENCY: "투명성", PERFORMANCE: "성능",
  // run
  LIVE: "LIVE", DEMO: "DEMO", DRAFT: "초안", QUEUED: "대기", RUNNING: "실행 중", COMPLETED: "완료", FAILED: "실패", CANCELLED: "취소", PASS: "통과", WARN: "주의", FAIL: "실패", NOT_EVALUATED: "미평가",
  // finding
  OPEN: "미해결", MITIGATED: "완화됨", FALSE_POSITIVE: "오탐",
  // annotator
  HUMAN: "사람", LLM_JUDGE: "LLM 판정", RULE: "규칙",
  // evidence
  MODEL_CARD: "모델 카드", AGENT_CARD: "에이전트 카드", RISK_ASSESSMENT: "위험 평가", IMPACT_ASSESSMENT: "영향 평가", DPIA: "DPIA", BIAS_FAIRNESS_REPORT: "편향·공정성 보고서", ROBUSTNESS_TEST_REPORT: "강건성 시험 보고서", SECURITY_ASSESSMENT: "보안 평가", RED_TEAM_REPORT: "레드팀 보고서", USER_TESTING_REPORT: "사용자 테스트 보고서", EVALUATION_METRICS: "평가 지표", EVALUATION_PLAN: "평가 계획", TEST_REPORT: "시험 보고서", HUMAN_OVERSIGHT_PLAN: "사람 감독 계획", POST_MARKET_MONITORING_PLAN: "시판 후 모니터링 계획", AUDIT_REPORT: "감사 보고서", CONFORMITY_ASSESSMENT: "적합성 평가", POLICY_DOCUMENT: "정책 문서", APPROVAL_RECORD: "승인 기록", INCIDENT_RECORD: "인시던트 기록", TRAINING_RECORD: "교육 기록", OTHER: "기타",
  GENERATED: "생성", UPLOADED: "업로드", ATTESTATION: "확인서", VALID: "유효", EXPIRED: "만료", SUPERSEDED: "대체됨",
  // reports
  EVALUATION_REPORT: "AI 평가 리포트", VERIFICATION_REPORT: "AI 시스템 검증 리포트(시험성적서)", NIST_ARIA_EVALUATION_REPORT: "NIST ARIA 평가 리포트", ISO_42001_EVIDENCE_PACK: "ISO/IEC 42001 증적 팩", EU_AI_ACT_EVIDENCE_PACK: "EU AI Act 증적 팩", NIST_AI_RMF_EVIDENCE_PACK: "NIST AI RMF 증적 팩", KR_AI_BASIC_ACT_EVIDENCE_PACK: "AI 기본법 증적 팩", AI_PASSPORT: "AI Passport", IN_REVIEW: "검토 중", ISSUED: "발행됨",
  // approvals / tasks / incidents
  SYSTEM_DEPLOYMENT: "시스템 배포", REPORT_ISSUANCE: "리포트 발행", RISK_ACCEPTANCE: "위험 수용", POLICY_EXCEPTION: "정책 예외", PENDING: "대기", REJECTED: "반려", DONE: "완료", REPORTED: "보고됨", INVESTIGATING: "조사 중",
  // change types / hosting
  MODEL_VERSION: "모델 버전", PROMPT: "프롬프트", TOOL: "도구", DATA_SOURCE: "데이터 소스", CONFIGURATION: "설정", VENDOR: "벤더", THIRD_PARTY_API: "외부 API", CLOUD_MANAGED: "클라우드 관리형", SELF_HOSTED: "자체 호스팅", ON_PREMISE: "온프레미스", ACTIVE: "활성",
  // coverage
  COVERED: "충족", PARTIAL: "부분", GAP: "갭", UNMAPPED: "미매핑",
};

export function labelFor(locale: Locale, value: string | null | undefined): string {
  if (!value) return "—";
  if (locale === "ko" && KO[value]) return KO[value];
  return enumLabel(value);
}
