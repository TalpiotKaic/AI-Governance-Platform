# Credo AI — Competitive Research Note (as of October 2026)

Research method: web-search snippets (credo.ai pages, press releases, analyst coverage, marketplace listings), PyPI metadata and the raw GitHub README of `credoai_lens`. credo.ai, AWS Marketplace, G2, Gartner and archive.org pages could not be opened directly, so page-level details are taken from search snippets and are marked "unverified" where only a single secondary source exists.

## Overview

Credo AI (Palo Alto, founded 2020, ~$41M raised through a $21M round in July 2024) positions itself as "the trusted leader in AI governance": a contextual AI governance platform that lets enterprises maximize AI ROI while keeping AI "fair, compliant, safe, secure, auditable and human-centered" across the lifecycle. Analyst standing is strong: Leader in The Forrester Wave: AI Governance Solutions Q3 2025 (5/5 in 12 criteria including policy management, regulatory compliance audit, quality/testing workflows and innovation), Visionary in Gartner's inaugural Magic Quadrant for AI Governance Platforms (June 2026), and No. 6 in Applied AI on Fast Company's 2026 Most Innovative Companies list. Through 2025-26 the company pivoted its messaging from "model governance" to "enterprise AI and agent governance": AI Agent Registry, GAIA governance agent (GA May 2026), Agent Governor runtime enforcement (Research Preview, ~July 2026), Shadow AI Discovery, and a free Governance Insights Hub built on its Harmonized Controls Framework.

## Features table

| Area | Capability (2026) | Status / notes |
|---|---|---|
| AI Registry | Central inventory of AI use cases, models, applications, vendors; now extended with an **AI Agent Registry**: Agent Cards (purpose, tools, data sources, guardrails, autonomy level, access permissions) and dependency-graph mapping across agents, sub-agents, models and tools | Live; Agent Registry marketed since 2025 |
| Shadow AI Discovery | Detects unauthorized AI usage, classifies/triages tools by risk level, stakeholder reports; feeds the Registry | Private Preview with GA "expected Q4 2025"; current GA status unverified |
| Risk Intelligence | Risk Register with Policy-Intelligence-suggested **contextual risk scenarios and mitigating controls** per use case; functional + technical risk dimensions; 16 risk types / 80 scenarios in the harmonized framework | Live |
| Policy Intelligence & Policy Packs | Pre-built Policy Packs (EU AI Act, NIST AI RMF, ISO/IEC 42001, SOC 2, Colorado AI Act, "20+ standards"); Policy Intelligence tracks regulation from draft to enacted law and updates packs; authored by staff who contributed to ISO/NIST/EU/NATO/OECD work | Live; "20+" count unverified |
| Governance Knowledge Graph / HCF | Harmonized Controls Framework: knowledge graph linking 166 regulations, 80 risks, 116 controls; cross-walks EU AI Act to NIST RMF, ISO 42001, HITRUST and customer controls | Powers the free **AI Governance Insights Hub** (govportal.lab.credoai.net) |
| Evidence & reporting | Auto-generated model cards, AI impact assessments, audit reports, risk & compliance reports, disclosures; evidence pulled from Jira/ServiceNow/ML tooling | Live |
| Model Trust Score | Use-case-based model leaderboard: capability, safety, affordability, speed, overall; ~39 models x 95 use cases x 21 industries | Live (launched 2025) |
| Vendor governance | Vendor Risk Assessment Portal (vendors log in and submit evidence against a Policy Pack); GenAI Vendor Registry with pre-populated transparency reports on foundation-model vendors | Live |
| GAIA (Govern AI Assistant) | Agentic assistant: use-case intake from PRDs/docs, drafts questionnaire answers with reasoning, proactive risk/control/compliance mapping; human approves each suggestion | GA May 2026 |
| Agent Governor | Runtime governance installed on the agent harness: deterministic controls on tools, data, pre/post-action hooks; translates policy/risk appetite into executable runtime controls; "Agent Governance Configuration" framework | **Research Preview**, Claude Code first, small design-partner group |
| Integrations Hub / SDK | Jira, ServiceNow, Asana, Salesforce, Dynamics 365, SageMaker, Bedrock, Azure ML, Azure AI Foundry (Microsoft-embedded), Databricks/MLflow (official Technology Partner), Weights & Biases, Hugging Face, Collibra; Python SDK `credoai-connect` | Hub launched Oct 2024 |
| Credo AI Lens (OSS) | Responsible-AI assessment framework | **Deprecated**: README states "This project is no longer maintained"; last PyPI release 1.1.8 (May 2023); `credoai-connect` 0.1.3 (July 2023) |

## Framework & Evidence model

The core object is the **AI use case** (the pricing unit), to which Policy Packs are attached. A Policy Pack decomposes a regulation/standard into controls and evidence requirements; Risk Intelligence proposes context-specific risk scenarios and mitigating controls, and evidence (documents, questionnaire answers, metrics from MLflow/SageMaker/Azure ML, tickets from Jira/ServiceNow) is collected against those controls. The Harmonized Controls Framework is the normalization layer: one control can satisfy multiple regulations, so a use case assessed once can be reported against EU AI Act, ISO 42001, NIST RMF or HITRUST. Credo exposes this mapping for free in the Insights Hub (166 regulations / 80 risks / 116 controls, community-enriched), a notable content-marketing and standards-influence play. Vendor-supplied systems follow the same pattern: the Vendor Portal pushes a Policy Pack questionnaire to the supplier, whose evidence lands in the same registry record.

## Evaluation/Testing & Agent capabilities

Credo does **not** ship a large automated behavioral test library; technical evaluation relies on ingesting metrics from customers' own tooling (MLflow, W&B, SageMaker, Azure AI Foundry evaluations) or on the now-deprecated Lens. Secondary reviews (OpenLayer, co-aims) criticize "limited fine-grained observability" and "teams must define most evaluations themselves." The Model Trust Score partially fills the gap for model selection (benchmarked scores per use case), but it is a leaderboard, not customer-specific testing.

Agent capabilities are the 2026 differentiator: (1) Agent Registry with Agent Cards and dependency graphs for multi-agent systems; (2) GAIA, which automates intake, questionnaire drafting and risk mapping with per-suggestion reasoning and human sign-off; (3) Agent Governor, which moves governance into the runtime harness with deterministic allow/deny controls on tools and data and pre/post-action hooks, starting with coding agents (Claude Code). As of October 2026 Agent Governor remains a Research Preview; GA timing and supported harnesses beyond Claude Code are unverified.

## Reporting

Outputs are stakeholder-oriented: model cards, AI impact assessments, AI audit reports, risk & compliance reports, public disclosures, plus executive "Business Insights" dashboards (ROI, use-case pipeline, policy completion status) in a "single pane of glass." Credo reports customers achieving ~70% faster AI use-case reviews (vendor claim). Shadow AI Discovery adds usage/risk-triage reports for CISOs.

## Pricing/Deployment

- **Model**: annual enterprise subscription sized by the **number of AI use cases under management**; 12/24/36-month terms; overage fees when governed use cases exceed contracted volume. The AWS Marketplace listing carries a nominal $1 placeholder and directs buyers to private offers via sales@credo.ai. Also listed on Microsoft Marketplace (Nov 2025) with Azure AI Foundry embedding.
- **Indicative price**: third-party estimates range $30K-$150K/yr (co-aims), $75K-$400K/yr (aicompliancevendors), with average enterprise ACV reported above $1.2M in 2025 (cybercompanyprofiles) — all unverified; no list price is published.
- **Deployment**: SaaS, private cloud, on-prem including sovereign/air-gapped options (per Modulos comparison and Credo marketing; unverified for air-gap). SOC 2 Type II (trust.credo.ai).
- **Services**: Advisory Services (Aug 2025) embed **forward-deployed AI governance engineers** in customer teams; Global Partner Program (July 2025, 30+ partners) with Microsoft, IBM, Databricks, Booz Allen Hamilton, EXL, Version1, McKinsey; Carahsoft for US public sector.

## Strengths

- Deepest regulatory content in the category: Policy Packs plus Policy Intelligence maintained by former standards contributors; harmonized knowledge graph published free, which anchors Credo as the "reference framework."
- Analyst validation (Forrester Leader, Gartner Visionary) and marquee ecosystem (Microsoft, Databricks, AWS/Azure marketplaces).
- Fast movement on agents: registry data model, GAIA (GA) and harness-level runtime enforcement (preview) give a coherent "govern agents end-to-end" story.
- Vendor Portal and GenAI Vendor Registry address third-party AI, a gap in many competitors.
- Services motion (forward-deployed engineers, advisory) reduces implementation risk for large enterprises.

## Weaknesses

- Pricing opacity: no public price; per-use-case metering with overages can be hard to forecast; realistically enterprise-only (six-figure ACVs).
- Limited native technical testing: Lens is deprecated and no maintained OSS evaluation layer replaces it; evidence quality depends on customer tooling and data hygiene (reviews cite high variance when inputs are incomplete).
- Several flagship 2026 capabilities are still preview-stage (Agent Governor; Shadow AI Discovery GA unverified), so the agent story is partly roadmap.
- Heavy, workflow-centric platform; multiple reviewers note implementation and change-management overhead, and legacy-integration friction.
- Lacks public sandbox/trial, so direct technical validation by buyers is difficult.

## Notable UX/IA

Main navigation (from product pages and marketplace descriptions): **Shadow AI Discovery -> AI Registry (Use Cases / Models / Apps / Agents / Vendors) -> Risk Management (Risk Register, scenarios, controls) -> Compliance (Policy Packs, Policy Intelligence) -> Monitoring/Evidence -> Business Insights (executive dashboards)**, with GAIA as a cross-cutting assistant and the Integrations Hub as settings-level plumbing. The registry record is the hub object; everything else (risks, policies, evidence, reports, vendor questionnaires) hangs off it. Agent Cards reuse the model-card pattern, and dependency graphs are rendered as visual maps of agent-to-tool/model relationships. Forrester explicitly praised UI/UX aligned to best-practice governance workflows.

## What K-VeriAI should borrow

1. **Use case as the primary governed object** with a harmonized control layer so one assessment reports against multiple Korean and international frameworks (AI Basic Act, ISO 42001, EU AI Act, NIST RMF).
2. **Policy Pack abstraction** with a regulatory-change feed; publish a free, public crosswalk (Insights-Hub style) to build authority.
3. **Agent Cards + dependency graph** in the registry from day one, not retrofitted.
4. **Assistant with per-suggestion reasoning and human approval** (GAIA pattern) for intake and questionnaire drafting.
5. **Vendor Portal** workflow for third-party evidence collection.
6. Differentiate where Credo is weak: a maintained, open evaluation/testing layer with reproducible evidence, transparent pricing tiers and a self-serve trial.

## Sources

- AWS Marketplace listing (via snippets): https://aws.amazon.com/marketplace/pp/prodview-x67krdatcdday ; Microsoft Marketplace: https://marketplace.microsoft.com/en-us/product/saas/credo_ai.credo-ai-enterprise-ai-governance-platform
- Pricing estimates: https://co-aims.com/blog/credo-ai-review-2026-compliance-officers ; https://aicompliancevendors.com/vendors/credo-ai ; https://www.openlayer.com/blog/credo-ai-reviews-pricing-alternatives ; https://cybercompanyprofiles.com/companies/credo-ai
- Agent Governor: https://www.credo.ai/blog/introducing-credo-ai-agent-governor ; https://www.credo.ai/agent-governor ; https://www.credo.ai/blog/agent-governance-configuration-a-framework-for-governing-autonomous-ai-agents-at-the-harness ; https://www.tipranks.com/news/private-companies/credo-ai-positions-agent-governor-for-enterprise-ai-governance-demand
- GAIA: https://www.credo.ai/blog/announcing-general-availability-of-govern-ai-assistant-gaia-credo-ais-ai-governance-agent ; https://www.credo.ai/blog/governance-at-the-speed-of-ai-introducing-gaia-credo-ais-governance-agent-public-preview
- Agent Registry: https://www.credo.ai/ai-agent-registry ; https://www.arthur.ai/column/best-ai-governance-platforms-2026 ; https://workos.com/blog/credo-ai-vs-workos-agentic-security
- Policy Packs / Policy Intelligence: https://www.credo.ai/glossary/credo-ai-policy-pack ; https://www.credo.ai/policy-intelligence ; https://www.credo.ai/blog/credo-ai-launches-the-most-comprehensive-governance-solution-to-support-iso-42001-adoption
- HCF / Insights Hub: https://www.credo.ai/blog/ai-governance-intelligence-unified-and-free ; https://www.credo.ai/products/ai-governance-insights-hub ; https://govportal.lab.credoai.net/
- Shadow AI Discovery: https://www.credo.ai/shadow-ai-discovery
- Model Trust Score: https://www.credo.ai/news/which-models-work-best-for-your-enterprise-ai-use-case-enterprise-model-trust-scores-reveal-the-answer
- Vendor Portal: https://www.credo.ai/blog/vendor-risk-assessment-portal-streamline-third-party-ai-risk-management-to-build-trust-and-decrease-risk ; https://www.credo.ai/solutions/vendor-compliance
- Integrations: https://www.businesswire.com/news/home/20241003124932/en/ ; https://www.credo.ai/blog/partnership-announcement-credo-ai-becomes-official-databricks-technology-partner ; https://www.credo.ai/blog/credo-ai-now-available-on-microsoft-marketplace-for-embeddable-governance-in-azure-ai
- Advisory / partners: https://www.businesswire.com/news/home/20250812596835/en/ ; https://www.credo.ai/blog/why-every-ai-first-enterprise-needs-a-forward-deployed-ai-governance-engineer ; https://www.businesswire.com/news/home/20250715061509/en/ ; https://www.thefastmode.com/technology-solutions/46612-credo-ai-partners-with-carahsoft-to-bring-ai-governance-to-the-public-sector
- Analyst recognition: https://www.credo.ai/recognition/forrester-wave-2025 ; https://www.credo.ai/recognition/gartner-magic-quadrant-ai-governance-platforms-2026 ; https://www.kosmoy.com/resources/blog/best-ai-governance-platforms-2026/
- Deployment / security: https://trust.credo.ai/ ; https://www.modulos.ai/modulos-vs-credo-ai/
- Lens OSS status: https://raw.githubusercontent.com/credo-ai/credoai_lens/develop/README.md ; https://pypi.org/project/credoai-lens/ ; https://pypi.org/project/credoai-connect/
