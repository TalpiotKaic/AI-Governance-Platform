# Holistic AI — Competitive Benchmarking Research (as of October 2026)

Research constraints: holisticai.com, G2, Gartner, GitHub HTML, arXiv and the Wayback Machine were blocked. Findings rely on search-engine snippets of holisticai.com pages, press releases, third-party reviews (appsecsanta, kosmoy, tooljunction, peerspot, OECD.AI, GOV.UK), PyPI JSON metadata and the raw GitHub README/docs of `holistic-ai/holisticai`. Items not confirmed from a primary source are marked **unverified**.

## Overview

Holistic AI (London, spun out of UCL research) positions itself as an **end-to-end "Agentic AI Governance" platform for enterprises**, structured around three pillars: **IDENTIFY** (discover every AI system incl. shadow AI, build an inventory), **PROTECT** (100+ automated tests, red teaming, continuous monitoring) and **ENFORCE** (regulatory templates, policy-as-code, deployment gates, Guardian Agents for runtime enforcement). Its tagline frames the company as "built for the boardroom and for the lab" — i.e. GRC workflow plus deep technical testing in one product.

In Gartner's inaugural **Magic Quadrant for AI Governance Platforms (June 2026)** Holistic AI was the **sole Challenger** (Leaders: IBM, ServiceNow, Truyo; Visionaries: Airia, Credo AI, ModelOp, Monitaur, OneTrust; Niche: Cranium, Relyance, Saidot, SAP). Holistic AI says it scored **highest in the companion Critical Capabilities report for the "AI Risk and Compliance" use case**; a third-party aggregation puts its overall CC score at 3.81 vs 3.97 for IBM/ModelOp (unverified). Gartner also lists it as a Representative Vendor in its **Market Guide for Guardian Agents**. Company-reported scale: 100+ AI projects audited, 10,000+ algorithms covered, 20+ jurisdictions; Unilever alone completed 200+ AI audits with them.

## Features table

| Area | Capability (2026) | Evidence / notes |
|---|---|---|
| Discovery (Identify) | Shadow AI Discovery connects to **50+ sources** (cloud, code repos, ML platforms, LLM providers, agent frameworks, documentation systems, enterprise SaaS); continuous scanning; risk scoring; staging; one-click **reconciliation of discovered *artifacts* into governed *assets***; claims true footprint is typically 30–50% larger than expected | holisticai.com/blog/shadow-ai-discovery…, /learn/assets-vs-artifacts |
| Inventory | Asset = complete AI system composed of one or more artifacts; assessments, workflows and compliance actions run at **asset** level; executive dashboards flag model duplication and ROI | /blog/enterprise-ai-inventory |
| Risk dimensions | Six technical risk verticals: **Bias, Robustness, Transparency (explainability), Privacy, Efficacy, Exposure** (OECD.AI catalogue lists bias/efficacy/robustness/privacy; "transparency" and "exposure" from platform marketing) | OECD.AI, GOV.UK AI assurance catalogue |
| AI Testing (Protect) | **100+ automated tests** across red teaming, jailbreaks, hallucinations, adversarial probes, bias, security, privacy, robustness; older copy cites "40+ tests for bias, hallucination, privacy and robustness"; split between benchmark-style evaluations (safe-response rate, ~300 prompts per model) and adversarial tests (jailbreak resiliency, 37-prompt DAN/STAN/DUDE suites) | /protect, /ai-system-testing, /red-teaming/* audits |
| LLM red teaming | Prompt injection, jailbreak, hallucination, toxicity, counterfactual bias/stereotyping, prompt leakage / data extraction; published public audits of Claude 3.7 Sonnet, Grok‑3, Chinese open models | /red-teaming/claude-3-7-sonnet…, /blog/red-teaming-at-holistic-ai |
| Agentic red teaming | **Agent graph** (interactive knowledge graph built from execution logs: agents, tasks, tools, data flows, failure points); **trace-grounded findings** that map to a moment in the execution trace; research framework **AgentSeer / AgentGraph** decomposes runs into **action graphs and component graphs**; finds agentic-only vulns — tool misuse, memory poisoning, inter-agent spread (sub-agent delegation injection with 67% success in loop vs 0% in isolation), social-engineering/authority mimicry, data exfiltration; multi-turn manipulation and deception categories inferred from AgentSeer paper (specific product taxonomy **unverified**) | /learn/what-is-an-agent-graph, /papers/agentgraph…, GPT‑OSS‑20B hackathon top‑10 press release |
| Enforce | Preconfigured **regulatory templates**: EU AI Act, NIST AI RMF, ISO/IEC 42001, NYC Local Law 144 (templates "translate into enforceable rules", obligations mapped by risk classification); **Visual Policy Builder** (drag-and-drop); custom internal policies run through same engine; **deployment gates** (block non-compliant systems), approval workflows, **kill switch**, programmable controls | /enforce, /learn/what-is-enforce |
| Guardian Agents | Two modes: **Sentinel** (passive — observe/log/score: anomaly detection, risk scoring, compliance & security monitoring, data-access tracking, drift; catches injection/jailbreak/leakage/hallucination/toxicity in production) and **Operative** (inline — gates which tools an agent can call, what data it accesses, how much it can spend). Three-layer architecture: policy layer / execution layer / supervision layer. "Every module powered by Sentinel and Operative agents" | /guardian-agents, /learn/what-are-guardian-agents, /blog/runtime-agentic-monitoring-tools-access-control-cost |
| HAI Guardian SDK | Integrations for Claude Code, OpenAI Agents SDK, LangGraph, AutoGen — **unverified** (no indexed snippet found; plausible given PreToolUse-hook style enforcement described in the runtime-enforcement blog) | — |
| Audit & assurance services | Third-party audits: Starling Bank customer onboarding assessment; **Hired** NYC LL144 bias audit (adverse impact + transparency, training, process review); **Wikimedia** — world-first independent DSA audit of Wikipedia (Dec 2024); MindBridge; Bryq; Unilever 200+ audits; **ongoing assurance** = annual re-audits, re-audits after major system changes, legislative-update education | /case-study/*, BusinessWire Dec 2024, /blog/ai-assurance |
| Research | **HAI Lab** (papers, tools, benchmarks with UCL and other universities; fairness, robustness, safety, agentic systems) | /hai-lab |
| LLM Decision Hub | Launched 29 Sep 2025 at llmleaderboard.ai; free; 20+ models compared on performance, safety, jailbreak resistance, coding, math, TCO; use-case rankings; provider cost/latency analysis; blends public benchmarks (GPQA, LiveBench variants) with proprietary red-team data | /press-release/holistic-ai-launches-new-llm-decision-hub |
| Open-source `holisticai` | MIT, PyPI v1.0.14 (Mar 2025, 26 releases, Python ≥3.8, Beta). Modules: `bias` (metrics for classification/regression/clustering/recommender, mitigation pre/in/post-processing, plots), `explainability` (metrics + plots; LIME/SHAP extras), `security` (privacy/attack metrics + mitigation), `robustness` (metrics), `efficacy`, plus `datasets` and `pipeline` tools. Extras: `[bias]`, `[explainability]`, `[security]`, `[datasets]`, `[all]`. Docs on readthedocs; Slack community | README, pyproject.toml, docs/source/reference/index.rst |

## Framework & Evidence model

Governance objects are **artifacts → assets**: scanners auto-create artifacts; humans or reconciliation merge them into assets, which carry risk classification, assessments, workflows and controls. Regulatory **templates are control sets, not checklists**: activating the EU AI Act template maps obligations to each asset by risk tier and attaches controls automatically; custom policies share the same enforcement engine. Evidence is generated by tests (per-dimension scores), Guardian Agent logs (runtime events, risk scores), approvals and version history, and rolled up into **audit trails, evidence logs and on-demand reports** for regulators and boards. Policy-as-code is the connective tissue between Enforce templates and Guardian Agents.

## Evaluation/Testing & Agent capabilities

Testing spans classical ML (the six dimensions, lineage from the open-source library), LLMs (benchmark + adversarial suites, safe-response rate / jailbreak resiliency metrics) and agents (agent graph + trace-grounded red teaming). The agentic layer is the clearest differentiator: the AgentSeer/AgentGraph research (AAAI paper; top‑10 in OpenAI's GPT‑OSS‑20B red-teaming hackathon) feeds a product where each finding is pinned to a node/edge in an execution graph. Runtime: Sentinels score; Operatives gate tool calls, data access and spend, with kill switch. Public LLM audits and the LLM Decision Hub double as thought-leadership funnels.

## Reporting

Executive dashboards (ROI, duplication, efficiency), compliance dashboards (policy adherence, violation trends, compliance scores in real time), risk-management dashboard per AI system, framework-mapped compliance reports (EU AI Act, NIST AI RMF, ISO 42001), full audit trail with version history and on-demand exports. Services-side outputs are formal audit reports/attestations (LL144 summaries, DSA audit report). Exact report formats/screens **unverified**.

## Pricing/Deployment

No public pricing; **enterprise subscription by quote**, scoped by number of AI systems, modules (discovery, testing, monitoring, policy-as-code) and frameworks; no free or self-serve tier; some offerings sold as services. Third-party estimate: ~$200K–$400K/yr for 100–500 models, custom above (unverified). Deployment: SaaS platform (go.holisticai.com) with Trust Center; discovery connectors reach cloud, code, SaaS and on-prem environments; private/VPC deployment option **unverified**.

## Strengths

- Only MQ vendor combining boardroom GRC workflow with a credible in-house **testing/red-teaming practice** and **runtime enforcement**; top Critical Capabilities score for risk & compliance.
- Research credibility (UCL, HAI Lab, AAAI, OpenAI hackathon) and public model audits.
- Mature agentic story: agent graph, Sentinel/Operative Guardian Agents, cost/tool/access controls.
- Proven audit services track record (Wikimedia DSA, Hired/Bryq LL144, Starling, Unilever) and ongoing-assurance model.
- Free open-source library and LLM Decision Hub lower the top of the funnel.

## Weaknesses

- **Pricing opacity** and enterprise-only positioning; reviewers call it inaccessible for SMEs and "less polished for engineering self-service" than MLOps-centric rivals.
- GRC depth (policy packs, vendor-risk portal, program management) judged behind Credo AI / OneTrust; workflow layer is thinner than its testing layer.
- Open-source library lags: last release Mar 2025, tabular-ML focused, no LLM/agent tooling — the platform's LLM/agent tests are closed.
- Marketing numbers inconsistent (40+ vs 100+ tests); many agentic claims rest on research papers rather than documented product specs.
- Site is thin on documentation/screenshots; Guardian SDK integrations not discoverable via search (unverified).

## Notable UX/IA

Top-level nav mirrors the value chain: **Platform → Identify / Protect / Enforce / Guardian Agents**, plus **Solutions by regulation** (EU AI Act, NYC Bias Audit, DSA Audit, ISO 42001), **Services** (AI Audits, Red Teaming), **Resources** (Learn explainer pages e.g. "What is an Agent Graph?", "Assets vs Artifacts", Glossary, Blog by type incl. Policy, Papers, Case Studies, Press, Red-teaming audits), **HAI Lab**, **Trust Center**, and a "Holistic AI vs other vendors" comparison page. Explainer-style "Learn" pages define product nouns, which doubles as SEO and onboarding. The LLM Decision Hub lives on a separate domain (llmleaderboard.ai).

## What K-VeriAI should borrow

1. **Artifact → Asset reconciliation** as the inventory primitive, with assessments bound to assets.
2. **Templates that compile to controls**: EU AI Act / Korea AI Basic Act / ISO 42001 templates that auto-attach controls by risk tier, editable in a visual policy builder.
3. **Trace-grounded agent testing**: every red-team finding anchored to an execution-graph node, with component graph views.
4. **Passive/active runtime split** (Sentinel vs Operative) with explicit tool/data/spend controls and kill switch.
5. **Six-dimension score card** reused across ML, LLM and agent assets; benchmark vs adversarial labeling.
6. Public, free credibility assets (model leaderboard, published audits, open-source metrics library) — but keep them maintained.
7. Fill Holistic AI's gaps: transparent SME pricing tier, self-serve onboarding, stronger GRC workflow (vendor risk, policy packs), and visible documentation.

## Sources

- holisticai.com pages (via search snippets): /ai-governance-platform, /protect, /enforce, /guardian-agents, /learn/what-are-guardian-agents, /learn/what-is-enforce, /learn/what-is-an-agent-graph, /learn/assets-vs-artifacts, /blog/shadow-ai-discovery-risk-scoring-staging-reconciliation, /blog/enterprise-ai-inventory, /blog/runtime-agentic-monitoring-tools-access-control-cost, /blog/guardian-agents-architecting-ai-that-governs-ai, /blog/gartner-guardian-agent-vendor-guide, /holistic-ai-recognized-gartner-magic-quadrant-2026, /holistic-ai-vs-other-ai-governance-vendors, /hai-lab, /case-study/{wikimedia,hired,bryq,mindbridge}, /ai-audits, /blog/ai-assurance, /red-teaming/claude-3-7-sonnet-jailbreaking-audit, /red-teaming/grok-3, /press-release/holistic-ai-launches-new-llm-decision-hub, /press-release/holistic-ai-named-top-10-winner-in-openai-gpt-oss-20b-red-teaming-hackathon, /papers/agentgraph-trace-to-graph-platform…
- Third party: appsecsanta.com/holistic-ai; kosmoy.com (Holistic AI alternatives; Credo AI vs Holistic AI; 2026 MQ set scored); tooljunction.io/ai-tools/holistic-ai; peerspot.com Credo AI vs Holistic AI; sanjmo.medium.com (Inside Gartner's first AI Governance MQ); getaigovernance.net; oecd.ai catalogue entry; gov.uk/ai-assurance-techniques/holistic-ai-audits; BusinessWire 16 Dec 2024 (Wikipedia DSA audit); newswire.com / Yahoo Finance (LLM Decision Hub, 29 Sep 2025).
- Code: raw.githubusercontent.com/holistic-ai/holisticai/main/{README.md, pyproject.toml, docs/source/reference/index.rst}; pypi.org/pypi/holisticai/json (v1.0.14, 2025-03-03).
