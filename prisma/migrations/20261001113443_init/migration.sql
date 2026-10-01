-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('VERIFICATION_BODY', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GOVERNANCE_OWNER', 'TESTER', 'REVIEWER', 'APPROVER', 'VIEWER');

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('PREDICTIVE_ML', 'LLM_APPLICATION', 'RAG_ASSISTANT', 'AGENT', 'MULTI_AGENT', 'EXTERNAL_SAAS');

-- CreateEnum
CREATE TYPE "LifecycleStage" AS ENUM ('PLANNED', 'DEVELOPMENT', 'TESTING', 'APPROVED', 'PRODUCTION', 'RETIRED');

-- CreateEnum
CREATE TYPE "RiskTier" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EuAiActCategory" AS ENUM ('UNCLASSIFIED', 'MINIMAL', 'LIMITED_TRANSPARENCY', 'HIGH_RISK', 'PROHIBITED', 'GPAI', 'GPAI_SYSTEMIC');

-- CreateEnum
CREATE TYPE "AutonomyLevel" AS ENUM ('ASSISTIVE', 'SUPERVISED', 'AUTONOMOUS');

-- CreateEnum
CREATE TYPE "HostingType" AS ENUM ('THIRD_PARTY_API', 'CLOUD_MANAGED', 'SELF_HOSTED', 'ON_PREMISE');

-- CreateEnum
CREATE TYPE "RiskDimension" AS ENUM ('ACCURACY_EFFICACY', 'BIAS_FAIRNESS', 'ROBUSTNESS', 'SAFETY', 'SECURITY', 'PRIVACY', 'TRANSPARENCY_EXPLAINABILITY', 'ACCOUNTABILITY', 'AGENT_BEHAVIOR', 'EXPOSURE');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('IDENTIFIED', 'ASSESSED', 'MITIGATING', 'ACCEPTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RiskSource" AS ENUM ('INTAKE', 'MANUAL', 'TEST_FINDING', 'INCIDENT', 'MONITORING');

-- CreateEnum
CREATE TYPE "FrameworkCode" AS ENUM ('ISO_42001', 'EU_AI_ACT', 'NIST_AI_RMF', 'NIST_ARIA', 'KR_AI_BASIC_ACT');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFIED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "TestingType" AS ENUM ('MODEL_TESTING', 'RED_TEAMING', 'USER_TESTING');

-- CreateEnum
CREATE TYPE "TestCategory" AS ENUM ('QUALITY', 'SAFETY', 'FAIRNESS', 'PRIVACY', 'SECURITY', 'ROBUSTNESS', 'AGENT', 'TRANSPARENCY', 'PERFORMANCE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RunMode" AS ENUM ('LIVE', 'DEMO');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('DRAFT', 'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('PASS', 'WARN', 'FAIL', 'NOT_EVALUATED');

-- CreateEnum
CREATE TYPE "TurnRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT', 'TOOL');

-- CreateEnum
CREATE TYPE "AnnotatorType" AS ENUM ('HUMAN', 'LLM_JUDGE', 'RULE');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'MITIGATING', 'MITIGATED', 'ACCEPTED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('MODEL_CARD', 'AGENT_CARD', 'RISK_ASSESSMENT', 'IMPACT_ASSESSMENT', 'DPIA', 'BIAS_FAIRNESS_REPORT', 'ROBUSTNESS_TEST_REPORT', 'SECURITY_ASSESSMENT', 'RED_TEAM_REPORT', 'USER_TESTING_REPORT', 'EVALUATION_METRICS', 'EVALUATION_PLAN', 'TEST_REPORT', 'HUMAN_OVERSIGHT_PLAN', 'POST_MARKET_MONITORING_PLAN', 'AUDIT_REPORT', 'CONFORMITY_ASSESSMENT', 'POLICY_DOCUMENT', 'APPROVAL_RECORD', 'INCIDENT_RECORD', 'TRAINING_RECORD', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceSource" AS ENUM ('GENERATED', 'UPLOADED', 'ATTESTATION');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('DRAFT', 'VALID', 'EXPIRED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('EVALUATION_REPORT', 'VERIFICATION_REPORT', 'NIST_ARIA_EVALUATION_REPORT', 'ISO_42001_EVIDENCE_PACK', 'EU_AI_ACT_EVIDENCE_PACK', 'NIST_AI_RMF_EVIDENCE_PACK', 'KR_AI_BASIC_ACT_EVIDENCE_PACK', 'AI_PASSPORT');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ISSUED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ApprovalSubject" AS ENUM ('SYSTEM_DEPLOYMENT', 'REPORT_ISSUANCE', 'RISK_ACCEPTANCE', 'POLICY_EXCEPTION', 'EVALUATION_PLAN');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'INVESTIGATING', 'MITIGATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('MODEL_VERSION', 'PROMPT', 'TOOL', 'DATA_SOURCE', 'CONFIGURATION', 'VENDOR');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL DEFAULT 'ENTERPRISE',
    "country" TEXT,
    "sector" TEXT,
    "trustCenterEnabled" BOOLEAN NOT NULL DEFAULT false,
    "trustCenterIntro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSystem" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SystemType" NOT NULL,
    "sector" TEXT,
    "purpose" TEXT,
    "deploymentContext" TEXT,
    "lifecycleStage" "LifecycleStage" NOT NULL DEFAULT 'DEVELOPMENT',
    "ownerId" TEXT,
    "technicalOwnerId" TEXT,
    "euAiActCategory" "EuAiActCategory" NOT NULL DEFAULT 'UNCLASSIFIED',
    "euAiActAnnexIIIArea" TEXT,
    "riskTier" "RiskTier" NOT NULL DEFAULT 'MEDIUM',
    "riskScore" DOUBLE PRECISION,
    "assuranceScore" DOUBLE PRECISION,
    "intendedUsers" TEXT,
    "affectedPersons" TEXT,
    "usesPersonalData" BOOLEAN NOT NULL DEFAULT false,
    "usesSensitiveData" BOOLEAN NOT NULL DEFAULT false,
    "customerFacing" BOOLEAN NOT NULL DEFAULT false,
    "automatedDecision" BOOLEAN NOT NULL DEFAULT false,
    "humanOversight" TEXT,
    "geographies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelAsset" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "systemId" TEXT,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "version" TEXT,
    "modality" TEXT,
    "hostingType" "HostingType" NOT NULL DEFAULT 'THIRD_PARTY_API',
    "licence" TEXT,
    "trainingDataDesc" TEXT,
    "knownLimitations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "framework" TEXT,
    "autonomyLevel" "AutonomyLevel" NOT NULL DEFAULT 'SUPERVISED',
    "tools" JSONB NOT NULL DEFAULT '[]',
    "dataSources" JSONB NOT NULL DEFAULT '[]',
    "subAgents" JSONB NOT NULL DEFAULT '[]',
    "mcpServers" JSONB NOT NULL DEFAULT '[]',
    "memoryDesc" TEXT,
    "guardrails" TEXT,
    "killSwitch" BOOLEAN NOT NULL DEFAULT false,
    "maxBudgetUsd" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "source" TEXT,
    "description" TEXT,
    "containsPii" BOOLEAN NOT NULL DEFAULT false,
    "sensitivity" TEXT,
    "recordCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDataset" (
    "systemId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "purpose" TEXT,

    CONSTRAINT "SystemDataset_pkey" PRIMARY KEY ("systemId","datasetId")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" TEXT,
    "country" TEXT,
    "riskScore" DOUBLE PRECISION,
    "dataSensitivity" TEXT,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemVendor" (
    "systemId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "role" TEXT,

    CONSTRAINT "SystemVendor_pkey" PRIMARY KEY ("systemId","vendorId")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dimension" "RiskDimension" NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "residualScore" DOUBLE PRECISION,
    "status" "RiskStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "source" "RiskSource" NOT NULL DEFAULT 'MANUAL',
    "ownerId" TEXT,
    "mitigation" TEXT,
    "dueDate" TIMESTAMP(3),
    "findingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Framework" (
    "id" TEXT NOT NULL,
    "code" "FrameworkCode" NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "issuer" TEXT,
    "description" TEXT,

    CONSTRAINT "Framework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "evidenceHint" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "testHint" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementControl" (
    "requirementId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,

    CONSTRAINT "RequirementControl_pkey" PRIMARY KEY ("requirementId","controlId")
);

-- CreateTable
CREATE TABLE "ControlImplementation" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "status" "ControlStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "ownerId" TEXT,
    "notes" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlImplementation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TestCategory" NOT NULL,
    "testingType" "TestingType" NOT NULL,
    "description" TEXT,
    "standardRef" TEXT,
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "applicableTo" "SystemType"[] DEFAULT ARRAY[]::"SystemType"[],
    "judgeRubric" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TestMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlTestMethod" (
    "controlId" TEXT NOT NULL,
    "testMethodId" TEXT NOT NULL,

    CONSTRAINT "ControlTestMethod_pkey" PRIMARY KEY ("controlId","testMethodId")
);

-- CreateTable
CREATE TABLE "TestScenario" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "methodId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "useCase" TEXT,
    "targetConcept" TEXT,
    "description" TEXT,
    "instructions" TEXT,
    "tactic" TEXT,
    "prompts" JSONB NOT NULL DEFAULT '[]',
    "annotationSchema" JSONB NOT NULL DEFAULT '[]',
    "questionnaire" JSONB NOT NULL DEFAULT '[]',
    "defaultSeverity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "applicableTo" "SystemType"[] DEFAULT ARRAY[]::"SystemType"[],
    "isLibrary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationPlan" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "scope" JSONB NOT NULL DEFAULT '{}',
    "design" JSONB NOT NULL DEFAULT '{}',
    "materials" JSONB NOT NULL DEFAULT '{}',
    "infrastructure" JSONB NOT NULL DEFAULT '{}',
    "implementation" JSONB NOT NULL DEFAULT '{}',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanScenario" (
    "planId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "testingType" "TestingType" NOT NULL,
    "sampleSize" INTEGER,

    CONSTRAINT "PlanScenario_pkey" PRIMARY KEY ("planId","scenarioId")
);

-- CreateTable
CREATE TABLE "EvaluationRun" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "planId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "RunMode" NOT NULL DEFAULT 'DEMO',
    "status" "RunStatus" NOT NULL DEFAULT 'DRAFT',
    "targetConfig" JSONB NOT NULL DEFAULT '{}',
    "judgeConfig" JSONB NOT NULL DEFAULT '{}',
    "environment" JSONB NOT NULL DEFAULT '{}',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB NOT NULL DEFAULT '{}',
    "verdict" "Verdict" NOT NULL DEFAULT 'NOT_EVALUATED',
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "testingType" "TestingType" NOT NULL,
    "testerId" TEXT NOT NULL,
    "promptRef" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "verdict" "Verdict" NOT NULL DEFAULT 'NOT_EVALUATED',
    "severity" "Severity",
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueTurn" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "role" "TurnRole" NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResult" JSONB,
    "latencyMs" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DialogueTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "annotator" "AnnotatorType" NOT NULL,
    "annotatorId" TEXT,
    "itemKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "rationale" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "category" "TestCategory" NOT NULL,
    "metricKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "threshold" DOUBLE PRECISION,
    "direction" TEXT NOT NULL DEFAULT 'higher',
    "verdict" "Verdict" NOT NULL DEFAULT 'NOT_EVALUATED',
    "sampleSize" INTEGER,

    CONSTRAINT "MetricResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "sessionId" TEXT,
    "systemId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TestCategory" NOT NULL,
    "severity" "Severity" NOT NULL,
    "tactic" TEXT,
    "evidenceExcerpt" TEXT,
    "recommendation" TEXT,
    "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindingControl" (
    "findingId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,

    CONSTRAINT "FindingControl_pkey" PRIMARY KEY ("findingId","controlId")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "systemId" TEXT,
    "runId" TEXT,
    "type" "EvidenceType" NOT NULL,
    "source" "EvidenceSource" NOT NULL DEFAULT 'GENERATED',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "mimeType" TEXT,
    "sha256" TEXT,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'VALID',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceLink" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "controlId" TEXT,
    "requirementId" TEXT,
    "riskId" TEXT,

    CONSTRAINT "EvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB NOT NULL DEFAULT '{}',
    "createdById" TEXT,
    "reviewerId" TEXT,
    "approverId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "supersedesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportRun" (
    "reportId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,

    CONSTRAINT "ReportRun_pkey" PRIMARY KEY ("reportId","runId")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "subjectType" "ApprovalSubject" NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subjectLabel" TEXT,
    "stage" TEXT NOT NULL,
    "approverId" TEXT,
    "decision" "ApprovalDecision" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "relatedType" TEXT,
    "relatedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "systemId" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "Severity" NOT NULL,
    "harmCategory" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "affectedCount" INTEGER,
    "rootCause" TEXT,
    "actions" TEXT,
    "seriousIncident" BOOLEAN NOT NULL DEFAULT false,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeEvent" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "type" "ChangeType" NOT NULL,
    "description" TEXT NOT NULL,
    "requiresRetest" BOOLEAN NOT NULL DEFAULT true,
    "retestCategories" "TestCategory"[] DEFAULT ARRAY[]::"TestCategory"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderCredential" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "baseUrl" TEXT,
    "defaultModel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_orgId_idx" ON "User"("orgId");

-- CreateIndex
CREATE INDEX "AiSystem_orgId_lifecycleStage_idx" ON "AiSystem"("orgId", "lifecycleStage");

-- CreateIndex
CREATE UNIQUE INDEX "AiSystem_orgId_code_key" ON "AiSystem"("orgId", "code");

-- CreateIndex
CREATE INDEX "ModelAsset_orgId_idx" ON "ModelAsset"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_systemId_key" ON "AgentProfile"("systemId");

-- CreateIndex
CREATE INDEX "Dataset_orgId_idx" ON "Dataset"("orgId");

-- CreateIndex
CREATE INDEX "Vendor_orgId_idx" ON "Vendor"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Risk_findingId_key" ON "Risk"("findingId");

-- CreateIndex
CREATE INDEX "Risk_systemId_idx" ON "Risk"("systemId");

-- CreateIndex
CREATE UNIQUE INDEX "Risk_orgId_code_key" ON "Risk"("orgId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Framework_code_key" ON "Framework"("code");

-- CreateIndex
CREATE INDEX "Requirement_frameworkId_idx" ON "Requirement"("frameworkId");

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_frameworkId_ref_key" ON "Requirement"("frameworkId", "ref");

-- CreateIndex
CREATE UNIQUE INDEX "Control_code_key" ON "Control"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ControlImplementation_systemId_controlId_key" ON "ControlImplementation"("systemId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "TestMethod_code_key" ON "TestMethod"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TestScenario_code_key" ON "TestScenario"("code");

-- CreateIndex
CREATE INDEX "TestScenario_methodId_idx" ON "TestScenario"("methodId");

-- CreateIndex
CREATE INDEX "EvaluationPlan_systemId_idx" ON "EvaluationPlan"("systemId");

-- CreateIndex
CREATE INDEX "EvaluationRun_systemId_status_idx" ON "EvaluationRun"("systemId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationRun_orgId_code_key" ON "EvaluationRun"("orgId", "code");

-- CreateIndex
CREATE INDEX "TestSession_runId_idx" ON "TestSession"("runId");

-- CreateIndex
CREATE INDEX "DialogueTurn_sessionId_index_idx" ON "DialogueTurn"("sessionId", "index");

-- CreateIndex
CREATE INDEX "Annotation_sessionId_idx" ON "Annotation"("sessionId");

-- CreateIndex
CREATE INDEX "MetricResult_runId_idx" ON "MetricResult"("runId");

-- CreateIndex
CREATE INDEX "Finding_systemId_status_idx" ON "Finding"("systemId", "status");

-- CreateIndex
CREATE INDEX "Evidence_orgId_type_idx" ON "Evidence"("orgId", "type");

-- CreateIndex
CREATE INDEX "Evidence_systemId_idx" ON "Evidence"("systemId");

-- CreateIndex
CREATE INDEX "EvidenceLink_evidenceId_idx" ON "EvidenceLink"("evidenceId");

-- CreateIndex
CREATE INDEX "EvidenceLink_controlId_idx" ON "EvidenceLink"("controlId");

-- CreateIndex
CREATE INDEX "EvidenceLink_requirementId_idx" ON "EvidenceLink"("requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_supersedesId_key" ON "Report"("supersedesId");

-- CreateIndex
CREATE INDEX "Report_systemId_type_idx" ON "Report"("systemId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Report_orgId_code_key" ON "Report"("orgId", "code");

-- CreateIndex
CREATE INDEX "Approval_orgId_decision_idx" ON "Approval"("orgId", "decision");

-- CreateIndex
CREATE INDEX "Task_orgId_status_idx" ON "Task"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Incident_orgId_code_key" ON "Incident"("orgId", "code");

-- CreateIndex
CREATE INDEX "ChangeEvent_systemId_idx" ON "ChangeEvent"("systemId");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_createdAt_idx" ON "AuditLog"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderCredential_orgId_idx" ON "ProviderCredential"("orgId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSystem" ADD CONSTRAINT "AiSystem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSystem" ADD CONSTRAINT "AiSystem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSystem" ADD CONSTRAINT "AiSystem_technicalOwnerId_fkey" FOREIGN KEY ("technicalOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelAsset" ADD CONSTRAINT "ModelAsset_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelAsset" ADD CONSTRAINT "ModelAsset_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDataset" ADD CONSTRAINT "SystemDataset_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemDataset" ADD CONSTRAINT "SystemDataset_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemVendor" ADD CONSTRAINT "SystemVendor_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemVendor" ADD CONSTRAINT "SystemVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementControl" ADD CONSTRAINT "RequirementControl_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementControl" ADD CONSTRAINT "RequirementControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlImplementation" ADD CONSTRAINT "ControlImplementation_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlImplementation" ADD CONSTRAINT "ControlImplementation_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlImplementation" ADD CONSTRAINT "ControlImplementation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlTestMethod" ADD CONSTRAINT "ControlTestMethod_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlTestMethod" ADD CONSTRAINT "ControlTestMethod_testMethodId_fkey" FOREIGN KEY ("testMethodId") REFERENCES "TestMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestScenario" ADD CONSTRAINT "TestScenario_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestScenario" ADD CONSTRAINT "TestScenario_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "TestMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationPlan" ADD CONSTRAINT "EvaluationPlan_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationPlan" ADD CONSTRAINT "EvaluationPlan_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationPlan" ADD CONSTRAINT "EvaluationPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanScenario" ADD CONSTRAINT "PlanScenario_planId_fkey" FOREIGN KEY ("planId") REFERENCES "EvaluationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanScenario" ADD CONSTRAINT "PlanScenario_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "TestScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_planId_fkey" FOREIGN KEY ("planId") REFERENCES "EvaluationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationRun" ADD CONSTRAINT "EvaluationRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvaluationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "TestScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueTurn" ADD CONSTRAINT "DialogueTurn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireResponse" ADD CONSTRAINT "QuestionnaireResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricResult" ADD CONSTRAINT "MetricResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvaluationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvaluationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingControl" ADD CONSTRAINT "FindingControl_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingControl" ADD CONSTRAINT "FindingControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvaluationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRun" ADD CONSTRAINT "ReportRun_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportRun" ADD CONSTRAINT "ReportRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvaluationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeEvent" ADD CONSTRAINT "ChangeEvent_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "AiSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderCredential" ADD CONSTRAINT "ProviderCredential_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
