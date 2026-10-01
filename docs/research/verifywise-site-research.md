# VerifyWise — Competitive Research (as of 2026-10-01)

Research notes for the K-VeriAI competitive benchmarking report. verifywise.ai, docs.verifywise.ai, github.com HTML and web.archive.org were blocked; findings come from `raw.githubusercontent.com` (repo `bluewave-labs/verifywise`, mirrored as `verifywise-ai/verifywise`, default branch `develop`), the GitHub search API, and web-search snippets of verifywise.ai pages. Items that rest only on third-party listings or snippets are marked **unverified**.

## Overview

VerifyWise (BlueWave Labs Inc., Toronto; repo created Aug 2024) positions itself as a "complete AI governance and LLM Evals platform" for regulated industries: "source available", self-hostable, with "no per-seat pricing and no artificial limits on users, models, or assessments" in paid tiers. Its pitch against Credo AI / OneTrust is transparency (readable code for the bias-audit engine), AI-native data model (model inventory, datasets, bias audits, evals, use-case registry) and a regulation-agnostic unified model so overlapping obligations are tracked once. Over 2026 it widened from compliance tracking into runtime governance: an **AI Gateway** (LLM proxy), **Agent Control** (tool-call gating for coding agents), **Shadow AI** discovery, **AI Trust Index**/**AI Apps** (2.4, June 2026) and template-first scheduled reporting plus OpenTelemetry (2.5, Aug 2026).

Community size is modest: **360 GitHub stars, 124 forks, 77 open issues**, last push 2026-09-30 (GitHub API). Companion repos: `verifywise-eval-action` (GitHub Action + Python SDK, Apache-2.0, Apr 2026) and a now-retired `plugin-marketplace` (plugin system removed Aug 2026; frameworks and integrations folded back into the monorepo as "extensions").

## Features table

| Area | Shipped in 2026 (source) |
|---|---|
| Model inventory | Models, model risks, model versioning, Model Risk Management sub-module (`/model-inventory/model-risk-management`), Evidence Hub per model (routes.tsx, README) |
| AI use cases ("projects") | Use-case registry + risks; public **intake forms** (`/intake/:tenant/:form`) for use-case requests (routes.tsx) |
| Vendors | Vendor registry + vendor risks (README) |
| Shadow AI | Tool discovery, user/department activity, rules & alerts; score 0–100 recomputed nightly: approval status 40%, data & compliance 25%, department sensitivity 20%, usage volume 15% (user-guide snippet) |
| Agent discovery | `/agent-discovery` inventory of agents (README, migrations note) |
| AI Detection | Scans code repos for AI-generated code; AGRS score 0–100 / grade A–F (80+ low, 60–79 moderate, <60 high) (user-guide snippet) |
| Risk management | Project/vendor/model risks; owners, mitigations, residual risk; MIT & IBM AI Risk Repository import; Risk Import (Excel) extension; risk benchmarks. Score formula per site: **Score = Likelihood x 1 + Severity x 3** (snippet, **unverified** against code) |
| Frameworks | 25 built-in (see below); cross-framework mapper (`/governance/framework-mapper`), regulatory radar, scenarios, knowledge graph ("Governance OS") |
| Approval workflows | `/approval-workflows`, approval requests; roles Admin / Reviewer (approve-reject) / Editor / Auditor (CLAUDE.md) |
| Evidence center | Folder-structured file manager; 15 predefined evidence types (see below) |
| Policy manager | Policies with templates, rich-text editor (TipTap), `/policies/new`, `/policies/:id/edit` |
| Training registry | AI-literacy training programs; sessions, attendees, status Planned/In Progress/Completed, duration (docs snippet) |
| Incident management | `/ai-incident-managements`, filterable incident log (README) |
| AI Trust Center | Public page per org (`/aiTrustCentre/:hash`), consolidated trust/compliance metrics (README, docs snippet) |
| AI Trust Index / AI Apps | Grades third-party AI apps; inventory of SaaS AI tools the company uses (2.4 blog snippet) |
| AI Advisor | Chat assistant (assistant-ui + Vercel AI SDK; OpenAI/Anthropic SDKs on server) giving governance recommendations; org-level API keys (package.json, docs snippet) |
| LLM Evals | See below |
| Bias & fairness | Bias audit runs with impact ratios; `bias_audit_results` table in EvalServer; "law-aware bias audits" (NYC LL144) announced (roadmap snippet, EvalServer CLAUDE.md) |
| AI Gateway | OpenAI-compatible proxy via LiteLLM (100+ providers); PII + content-filter guardrails (block/mask) pre- and post-response; virtual keys; budgets with auto-block + e-mail alerts; spend dashboard; prompt library; playground; cache; daily risk-condition evaluation that suggests risks (AIGateway/CLAUDE.md) |
| Agent Control | Gates agent tool calls (MCP proxy + native hook for Claude Code/Cursor) with guardrails, human approval, rate limits, audit timeline (agent-control.md) |
| AI observability | `/ai-observability` page; OTel across backend/EvalServer/Gateway (2.5) |
| Automations | Entity-change triggers, periodic reports, webhooks (README) |
| Reporting | PDF/DOCX export; template-first reports with schedules and run history (2.5) |
| Integrations (extensions) | Slack, MLflow, Azure AI Foundry, Jira Assets, Model Lifecycle, Risk Import (Excel), Dataset Bulk Upload; GitHub integration referenced in docs; CE-marking registry, dataset registry |
| Auth / RBAC | 4 roles; Google OAuth2; Entra ID / OIDC SSO (enterprise); multi-tenant shared-schema with `organization_id`; super-admin console; event logs |
| API | REST under `/api`, Swagger generated (`generate:swagger`), API-contract smoke tests; MCP server for super-admin administration |

## Framework & Evidence model

**25 frameworks, none installable by users** (added in code only; "Users cannot create, import or export their own frameworks" per `docs/technical/domains/compliance-frameworks.md`; 2.5 blog says custom frameworks moved to an extension model — **unverified** whether end-user custom frameworks exist).

- 4 core, hand-built (ids 1–4): **EU AI Act** (13 control categories + assessment topics), **ISO 42001**, **ISO 27001** (clauses 4–10 + annexes, applicability/justification), **NIST AI RMF** (Govern/Map/Measure/Manage).
- 21 bundled generic-UI frameworks (ids 5–25): SOC 2, GDPR, PCI-DSS, CCPA, DORA, ALTAI, FTC AI Guidelines, NYC Local Law 144, CIS Controls, AI Ethics, OECD AI Principles, Data Governance, UAE PDPL, Saudi PDPL, Qatar PDPL, Bahrain PDPL, Quebec Law 25, Texas AI Act, Colorado AI Act, HIPAA, NIST CSF (`Servers/structures/index.ts`).

Each control/subclause/subcategory carries owner, reviewer, approver, due date, implementation description, `evidence_links` (JSONB), risk links, and a status lifecycle (Not started → Draft → In progress → Awaiting review → Awaiting approval → ...). Frameworks are attached to a project (use case) via `project_frameworks`. Marketing claims "30+ frameworks"; code shows 25.

**Evidence**: 15 predefined evidence types incl. Model Card, Risk Assessment Report, Bias & Fairness Report, Security Assessment, DPIA, Evaluation Metrics, Human Oversight Plan, Third-Party Audit (site snippet; full list **unverified**). Evidence lives in a folder-based Evidence Center / File Manager and is linked from controls; a per-model Evidence Hub exists in the model inventory.

## Evaluation/Testing & Agent capabilities

- **EvalServer**: Python 3.12 / FastAPI / Alembic, port 8000, 14 `llm_evals_*` tables; **DeepEval 4.1.3** pinned, plus openai, anthropic, google-genai, mistralai, ollama, transformers/torch (local HF). Marketing: LLM-as-a-Judge with **5 core metrics — Answer Relevancy, Bias, Toxicity, Faithfulness, Hallucination** — and **7 providers: OpenAI, Anthropic, Gemini, xAI, Mistral, Ollama (local), HuggingFace (local)**. Provider calls can be routed through the AI Gateway's internal completions endpoint so keys live in one place.
- Eval UI: `/evals`, per-project experiments, dataset editor, settings; **LLM Arena** for side-by-side model comparison (README).
- **CI quality gates**: `verifywise-eval-action` GitHub Action + Python SDK "gate PRs on correctness, faithfulness, hallucination" (repo description; threshold semantics **unverified**).
- **Bias audits**: `bias_audit_results` stored; impact-ratio computation is in source.
- **Agents**: (a) Agent discovery inventory; (b) **Agent Control** = governance of what agents *do*: MCP proxy (`POST /v1/mcp`) forwarding to registered MCP servers, and native hook (`/v1/mcp/hook`) adjudicating Bash/Edit/Write calls as allow / deny / approval_required / rate_limited; field-aware PII scanning of written content; argument-hash-scoped human approvals; per-invocation audit timeline with PreToolUse/PostToolUse correlation; UI tabs servers, tools, agent keys, approvals, runs, guardrails, audit. Roadmap: fleet governance, path-based write rules, decision provenance, priority rule engine. No agent *quality* evaluation (trajectory/tool-correctness metrics) found — **unverified**.

## Reporting

Dashboard with executive and operating views; `/reporting` with PDF and DOCX export (jspdf, docx deps); 2.5 added **template-first, framework-aware reports** with schedules, delivery and **run history**; monitoring cycles/reports (`/monitoring/reports`); Automations send periodic reports/webhooks; AI Gateway spend dashboard; activity history and event-tracker audit logs per entity.

## Pricing/Deployment

- **License**: BSL 1.1 with "Internal Use Only" additional grant; each version converts to Apache-2.0 24 months after release. Internal production use is free; hosting/reselling/embedding needs an Enterprise License (LICENSE.md, LICENSING-FAQ.md). Entra ID and some features are "enterprise edition".
- **Plans** (site snippets): **Trial $0 — 1 seat, 1 AI use case, 1 framework**; **Enterprise — unlimited seats/use cases/all frameworks**, sales-led. Third-party listings cite a **$129/month** entry and **$799/month "Growth"** plan — **unverified**.
- **Deployment**: Docker Compose (`install.sh`, images on `ghcr.io/verifywise-ai/*`: frontend, backend, worker, eval-server, ai-gateway; Postgres 16, Redis 7), Kubernetes, render.com; nginx + certbot guide; cloud demo at app.verifywise.ai. Email providers: Exchange Online, on-prem Exchange, SES, Resend, SMTP.
- **Architecture**: React 19 / TypeScript / Vite / MUI 7 / Redux Toolkit / React Query (clean architecture: presentation, application, domain, infrastructure); Node 22 / Express 4 / Sequelize 6; PostgreSQL shared schema with `organization_id`; Redis + BullMQ worker; Python FastAPI services EvalServer (8000) and AI Gateway (8100, LiteLLM); OpenTelemetry. Package.json still reads 1.7.0 while releases are tagged v2.5.x (version field not maintained).
- **Release velocity**: 1.3 (2025), Nov 2025 update (model versioning, NIST AI RMF), 2.4 (2026-06-21), 2.5 (2026-08-11/26), **v2.5.2 latest GitHub release** (Sept 2026); heavy Dependabot activity through Sept 2026, CLAUDE.md files dated 2026-09-26/28.

## Strengths

- Broadest module count in the open/source-available segment: inventory, risks, 25 frameworks, evals, gateway, agent control, shadow AI, trust center, policies, training, incidents, automations in one monorepo.
- Transparent code (bias and risk formulas readable); self-host keeps data on-prem; free internal production use.
- Unusual runtime controls for a GRC tool: LLM gateway guardrails/budgets, MCP/agent tool-call gating with human approvals and audit.
- Fast cadence and AI-assisted development (CLAUDE.md agents, i18n, e2e, OTel).
- Framework-aware scheduled reporting with run history; public Trust Center and intake forms.

## Weaknesses

- Small community (360 stars, few reviews; G2 has too few reviews for insight); several marketing claims (30+ frameworks, 5 metrics) lag or outrun code.
- Frameworks are code-defined; end-user custom frameworks and imports are not supported in the core (per technical docs).
- BSL "internal use only" blocks consultancies/MSPs from hosting for clients without a paid license; enterprise-only SSO (Entra ID).
- Eval depth is thin versus dedicated eval tools: 5 headline metrics, no agent-trajectory metrics found (**unverified**), DeepEval pinned to one version.
- Operational footprint: 5+ containers (Node, worker, two Python services, Postgres, Redis), nginx manual SSL; schema migration from per-tenant to shared schema in 2026 indicates churn.
- Breadth risk: many modules (Governance OS, knowledge graph, scenarios, AI Detection) are early and lightly documented.

## Notable UX/IA

Sidebar/route inventory (routes.tsx): Overview; Start here; Project/Use-case view; Framework; Risk management; Model inventory (models, model risks, MRM, evidence hub); Vendors; Datasets; Policies; Approval workflows; Evidence/File manager; Governance OS (evidence, framework mapper, insights, knowledge graph, regulatory radar, scenarios); Evals; AI Gateway (dashboard, endpoints, models, virtual keys, guardrails, prompts, playground, logs, MCP/Agent Control); Shadow AI (tools, user activity, rules, insights); Agent discovery; AI Apps; AI Trust Index; AI Trust Center; AI Detection; AI Observability; Incidents; Automations; Reporting; Monitoring; Event tracker; Extensions; Intake forms; Settings/Organization; Super admin. Patterns: generic drawer for bundled frameworks, per-entity activity history, desktop notifications, onboarding tour (react-joyride), style guide page, public share links (`/shared/:type/:token`).

## What K-VeriAI should borrow

1. Two-layer model: "AI Gateway governs what the AI says, Agent Control governs what it does" — clear mental model for runtime vs. design-time governance.
2. Framework-aware report templates with schedules and immutable run history (audit-ready).
3. Weighted, explainable scores (Severity x3; Shadow-AI 40/25/20/15 weights) shown in UI with their formula.
4. Owner / reviewer / approver on every control plus argument-scoped approvals; 4-role RBAC is enough to start.
5. Public Trust Center and public intake forms as low-cost adoption hooks.
6. CI quality gate via GitHub Action/SDK tied back to the governance record.
7. Framework-as-data registry (`structure.ts` per framework) rendered by one generic UI — but allow user-defined frameworks, which VerifyWise lacks.
8. Keep README feature list and package version in sync with releases (VerifyWise's drift is a credibility gap).

## Sources

- https://raw.githubusercontent.com/bluewave-labs/verifywise/develop/README.md (features, install, email providers)
- .../develop/LICENSE.md and .../develop/LICENSING-FAQ.md (BSL 1.1 terms)
- .../develop/CLAUDE.md, Servers/CLAUDE.md, Clients/CLAUDE.md, EvalServer/CLAUDE.md, AIGateway/CLAUDE.md (architecture, roles, extensions)
- .../develop/docs/technical/domains/compliance-frameworks.md and agent-control.md
- .../develop/Servers/structures/index.ts (21 bundled frameworks); Clients/src/application/config/routes.tsx (navigation)
- .../develop/Clients/package.json, Servers/package.json, EvalServer/requirements.txt, docker-compose.yml
- GitHub API search: verifywise-ai/verifywise (360 stars, 124 forks, 77 issues, pushed 2026-09-30); verifywise-ai/verifywise-eval-action
- Web-search snippets: verifywise.ai/pricing, /platform/llm-evaluations, /platform/ai-gateway, /platform/evidence-management, /user-guide/ai-detection/risk-scoring, /user-guide/shadow-ai/settings, /platform/risk-management, /blog/verifywise-2-5-announcement, /roadmap, /blog/verifywise-vs-onetrust-ai-governance; github.com/verifywise-ai/verifywise/releases/tag/v2.5.2; sourceforge.net and aitoptools.com listings (pricing, unverified)
