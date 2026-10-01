# K-VeriAI Framework Control & Evidence Library

**Status date:** 2026-10-01
**Purpose:** Machine-usable seed data for the K-VeriAI control/evidence/test registry. Covers ISO/IEC 42001:2023, EU AI Act (Regulation (EU) 2024/1689 as amended by the Digital Omnibus on AI, Regulation (EU) 2026/1744), NIST AI RMF 1.0 (AI 100-1) + Generative AI Profile (AI 600-1) + ARIA (AI 200-3), with a cross-framework harmonized-control map that also references the Korean AI Basic Act (인공지능 발전과 신뢰 기반 조성 등에 관한 기본법).

## 0. Conventions

### 0.1 Verification status legend
| Tag | Meaning |
|---|---|
| `V` | Clause/article id and title verified in this session against a well-known secondary source via web search (primary sites eur-lex.europa.eu, nvlpubs.nist.gov, airc.nist.gov, iso.org, artificialintelligenceact.eu, law.go.kr were **blocked by the egress proxy**; no direct fetch was possible). |
| `V*` | Id/title spot-checked for a sample of items in the same list; remainder from the standard's well-established public structure (high confidence, not individually re-verified in session). |
| `U` | Unverified in session; from prior knowledge or a single secondary mention. Treat as "needs confirmation" before legal reliance. |

### 0.2 Evidence artifact type codes (used throughout)
| Code | Evidence type |
|---|---|
| `EV-POL` | Policy / standard / charter document (approved, versioned) |
| `EV-PROC` | Procedure / process description / SOP / playbook |
| `EV-RACI` | Role & responsibility matrix, org chart, appointment letters |
| `EV-INV` | AI system inventory / registry record (system card, model card) |
| `EV-RISK` | Risk assessment record, risk register, risk treatment plan |
| `EV-IA` | Impact assessment (AI system impact assessment / FRIA / DPIA / 영향평가) |
| `EV-SOA` | Statement of Applicability |
| `EV-TECHDOC` | Technical documentation file (Annex IV-style), design specs, architecture |
| `EV-DATA` | Datasheet / data provenance record / data quality report / data lineage |
| `EV-TEST` | Test plan, test report, metrics dashboard export, evaluation report |
| `EV-LOG` | System/event logs, audit trails, log retention configuration |
| `EV-UI` | Screenshots / UI copy / instructions for use / user notices |
| `EV-TRAIN` | Training records, competence matrix, AI literacy curricula |
| `EV-AUDIT` | Internal audit programme, audit report, nonconformity & CAPA records |
| `EV-MR` | Management review minutes & decisions |
| `EV-INC` | Incident register, incident reports, regulator notifications |
| `EV-PMM` | Post-market / production monitoring plan and reports, drift dashboards |
| `EV-SUP` | Supplier assessments, contracts/DPAs, third-party model/system cards |
| `EV-CHG` | Change requests, release notes, re-assessment triggers, version history |
| `EV-DEC` | Declaration of conformity, certificates, registration confirmations, CE marking |
| `EV-COMM` | Stakeholder communication, external reporting channels, complaints handling |

### 0.3 Technical test type codes (tests that generate technical evidence)
| Code | Test type | Typical outputs |
|---|---|---|
| `T-ACC` | Accuracy / performance benchmark (task metrics, calibration, per-group performance) | metric tables, confusion matrices, confidence intervals |
| `T-ROB` | Robustness (noise, perturbation, distribution shift, OOD, stress/load) | degradation curves, pass/fail vs thresholds |
| `T-ADV` | Adversarial ML (evasion, model/data poisoning probes, adversarial examples) | attack success rate, robustness certificates |
| `T-SEC` | AI/LLM security (prompt injection, jailbreak, system-prompt/data exfiltration, tool abuse, supply-chain scan) | attack success rate, vulnerability list, OWASP-LLM mapping |
| `T-BIAS` | Fairness / bias (demographic parity, equalized odds, disparate impact, counterfactual fairness, representational harm) | fairness metric report, subgroup tables |
| `T-DQ` | Data quality / representativeness / provenance / label quality / leakage | data quality scorecard, bias-in-data report, provenance ledger |
| `T-PRIV` | Privacy (membership inference, PII leakage, training-data extraction, re-identification) | leakage rates, extraction success |
| `T-EXP` | Explainability / interpretability (feature attribution fidelity, explanation consistency, user comprehension) | explanation quality report |
| `T-HALL` | Factuality / groundedness / confabulation (RAG faithfulness, citation validity) | hallucination rate, groundedness score |
| `T-SAFE` | Harmful-content & misuse safety (toxicity, violence, CBRN uplift, self-harm, CSAM/obscene filters, refusal appropriateness) | harm category rates, refusal/over-refusal matrix |
| `T-HO` | Human-oversight testing (HITL escalation, override, stop/kill-switch, automation-bias UX test, alerting) | oversight test protocol & results |
| `T-LOG` | Logging/traceability verification (event coverage, integrity, retention, reconstructability of decisions) | log audit report |
| `T-TRANS` | Transparency/disclosure verification (AI-interaction notice, deepfake labels, watermark presence & detectability, metadata persistence) | disclosure checklist, watermark detection rate |
| `T-AGENT` | Agent tool-use & autonomy control (permission boundaries, sandbox escape, tool-call authorization, loop/budget limits, goal hijack) | agent trace audit, boundary violation rate |
| `T-RT` | Red teaming (human/automated adversarial campaign across risk categories) | red-team report, findings register |
| `T-UX` | User / field testing (ARIA-style scenario sessions with real users, questionnaires) | field-test report, impact observations |
| `T-ENV` | Environmental measurement (energy, carbon, compute accounting) | energy/carbon report |
| `T-IP` | IP / copyright (memorization/regurgitation of protected content, licence compliance of training data) | regurgitation rate, licence audit |
| `T-DRIFT` | Production monitoring (data/concept drift, performance decay, alert thresholds) | drift dashboards, alert history |
| `T-CONF` | Conformity verification against standards (harmonised standards / common specs checklists) | conformity checklist |

---

## 1. ISO/IEC 42001:2023 — Artificial intelligence management system (AIMS)

Published December 2023. Harmonized Structure (HS) clauses 4–10; Annex A (normative reference control objectives and controls, 9 objectives / 38 controls), Annex B (implementation guidance), Annex C (AI-related organizational objectives and risk sources), Annex D (use across domains/sectors; integration with ISO/IEC 27001, 27701, 9001 etc.). Certifiable. Status: `V*` (structure and control titles spot-verified: A.2.2, A.5.2, A.5.5, A.6.2.4, A.6.2.5, A.6.2.8, A.7.4, A.8.2, A.8.3, A.8.4, A.10.3, A.10.4).

### 1.1 Main body clauses 4–10

| Clause | Title | Requirement (1-line) | Typical evidence |
|---|---|---|---|
| 4 | Context of the organization | Establish the external/internal context in which the AIMS operates. | — |
| 4.1 | Understanding the organization and its context | Determine external/internal issues relevant to purpose; determine the organization's role(s) with respect to AI systems (provider, producer, user/deployer, partner, subject, etc.); consider applicable climate-change relevance (Amd.). | Context analysis, AI role statement (`EV-POL`) |
| 4.2 | Understanding the needs and expectations of interested parties | Identify interested parties and their relevant requirements (incl. legal/regulatory, contractual, ethical) for the AIMS and AI systems. | Interested-party & requirements register, legal/regulatory register (`EV-POL`, `EV-RISK`) |
| 4.3 | Determining the scope of the AI management system | Define and document AIMS boundaries and applicability, considering 4.1/4.2 and the AI systems/products/services covered. | AIMS scope statement (`EV-POL`) |
| 4.4 | AI management system | Establish, implement, maintain and continually improve the AIMS incl. processes and their interactions. | AIMS manual / process map (`EV-PROC`) |
| 5 | Leadership | — | — |
| 5.1 | Leadership and commitment | Top management demonstrates commitment: AI policy & objectives aligned with strategy, resources, integration into business processes, communication, direction/support, promotion of continual improvement. | Signed policy, resourcing decisions, leadership communications (`EV-POL`, `EV-MR`) |
| 5.2 | AI policy | Establish an AI policy appropriate to purpose; framework for AI objectives; commitment to applicable requirements and continual improvement; documented, communicated, available to interested parties. | **AI policy document** (`EV-POL`) |
| 5.3 | Roles, responsibilities and authorities | Assign and communicate responsibilities/authorities for AIMS conformance and reporting on AIMS performance. | **Roles & responsibilities matrix**, appointment letters (`EV-RACI`) |
| 6 | Planning | — | — |
| 6.1 | Actions to address risks and opportunities | — | — |
| 6.1.1 | General | Determine risks/opportunities to be addressed considering 4.1/4.2; define AI risk criteria (incl. risk acceptance), plan actions and integrate them. | Risk criteria statement, risk methodology (`EV-PROC`, `EV-RISK`) |
| 6.1.2 | AI risk assessment | Define and apply a repeatable AI risk assessment process: identify, analyse (consequences/likelihood), evaluate risks against criteria; prioritise for treatment; retain documented information. | **AI risk assessment record** / risk register (`EV-RISK`) |
| 6.1.3 | AI risk treatment | Select treatment options, determine controls (compare with Annex A), produce **Statement of Applicability** with justifications for inclusion/exclusion, formulate risk treatment plan, obtain risk-owner approval and acceptance of residual risk. | **Statement of Applicability**, risk treatment plan, residual-risk acceptance (`EV-SOA`, `EV-RISK`) |
| 6.1.4 | AI system impact assessment | Define and apply a process to assess potential consequences of AI systems for individuals/groups and society across the life cycle; results documented and used in risk assessment. | **AI system impact assessment** (`EV-IA`) |
| 6.2 | AI objectives and planning to achieve them | Establish measurable AI objectives consistent with policy; plan what/who/when/how evaluated. | AI objectives register & KPI plan (`EV-POL`) |
| 6.3 | Planning of changes | Changes to the AIMS carried out in a planned manner. | Change plans / change log (`EV-CHG`) |
| 7 | Support | — | — |
| 7.1 | Resources | Determine and provide resources for the AIMS. | Resource plan, budget approvals (`EV-MR`) |
| 7.2 | Competence | Determine necessary competence, ensure competence via education/training/experience, take actions and evaluate effectiveness; retain evidence. | **Training records**, competence matrix (`EV-TRAIN`) |
| 7.3 | Awareness | Persons aware of AI policy, their contribution, implications of nonconformance. | Awareness campaigns, attestations (`EV-TRAIN`) |
| 7.4 | Communication | Determine internal/external communications: what, when, with whom, how. | Communication plan (`EV-COMM`) |
| 7.5 | Documented information | — | — |
| 7.5.1 | General | AIMS includes documented information required by the standard and determined necessary for effectiveness. | Document register (`EV-PROC`) |
| 7.5.2 | Creating and updating | Identification/description, format/media, review and approval for suitability and adequacy. | Document control records (`EV-PROC`) |
| 7.5.3 | Control of documented information | Availability/suitability, protection; distribution, access, storage, change control, retention, disposition; control of external documents. | Document control procedure, access logs (`EV-PROC`, `EV-LOG`) |
| 8 | Operation | — | — |
| 8.1 | Operational planning and control | Plan, implement and control processes to meet requirements and implement 6.x actions; control planned changes, review unintended changes; control externally provided processes/products/services. | Operational procedures, process KPIs, change records (`EV-PROC`, `EV-CHG`) |
| 8.2 | AI risk assessment | Perform AI risk assessments at planned intervals or on significant changes; retain results. | Periodic risk assessment records (`EV-RISK`) |
| 8.3 | AI risk treatment | Implement risk treatment plan; verify effectiveness; re-assess when new risks emerge; retain results. | Treatment implementation evidence, control effectiveness tests (`EV-RISK`, `EV-TEST`) |
| 8.4 | AI system impact assessment | Perform AI system impact assessments at planned intervals or on significant changes; retain results. | Updated impact assessments (`EV-IA`) |
| 9 | Performance evaluation | — | — |
| 9.1 | Monitoring, measurement, analysis and evaluation | Determine what to monitor/measure, methods, when, who analyses; evaluate AIMS performance and effectiveness; retain evidence. | AIMS KPI reports, monitoring dashboards (`EV-PMM`, `EV-TEST`) |
| 9.2 | Internal audit | — | — |
| 9.2.1 | General | Conduct internal audits at planned intervals to confirm AIMS conforms to own requirements and the standard and is effectively implemented. | **Internal audit report** (`EV-AUDIT`) |
| 9.2.2 | Internal audit programme | Plan/establish/maintain audit programme(s): frequency, methods, responsibilities, reporting; define criteria and scope; auditor objectivity; report to management; retain evidence. | Audit programme, audit plans, auditor independence records (`EV-AUDIT`) |
| 9.3 | Management review | — | — |
| 9.3.1 | General | Top management reviews the AIMS at planned intervals for suitability, adequacy, effectiveness. | **Management review minutes** (`EV-MR`) |
| 9.3.2 | Management review inputs | Status of prior actions; changes in issues; changes in interested-party needs; AIMS performance incl. nonconformities/CAPA, monitoring results, audit results; opportunities for continual improvement. | MR input pack (`EV-MR`) |
| 9.3.3 | Management review results | Decisions on continual improvement opportunities and any needed AIMS changes; retain documented information. | MR decisions / action log (`EV-MR`) |
| 10 | Improvement | — | — |
| 10.1 | Continual improvement | Continually improve suitability, adequacy, effectiveness of the AIMS. | Improvement register (`EV-AUDIT`, `EV-MR`) |
| 10.2 | Nonconformity and corrective action | React to nonconformities, evaluate need to eliminate causes, implement actions, review effectiveness, update AIMS if needed; retain evidence of nature of nonconformities, actions and results. | Nonconformity & CAPA records (`EV-AUDIT`) |

### 1.2 Annex A — Reference control objectives and controls (normative)

Notation: objective rows are `A.n` (and `A.6.1`, `A.6.2` sub-objectives); control rows are `A.n.m`. 38 controls total.

| Id | Title | Description (1-line) | Typical evidence | Tests |
|---|---|---|---|---|
| **A.2** | **Policies related to AI** | Objective: provide management direction and support for AI systems according to business requirements. | — | — |
| A.2.2 | AI policy | Document a policy for development or use of AI systems. | AI policy (`EV-POL`) | — |
| A.2.3 | Alignment with other organizational policies | Determine where other policies (security, privacy, quality, HR, etc.) are affected by or apply to AI objectives. | Policy cross-reference map (`EV-POL`) | — |
| A.2.4 | Review of the AI policy | Review AI policy at planned intervals or on significant change for continuing suitability, adequacy, effectiveness. | Policy review records (`EV-MR`) | — |
| **A.3** | **Internal organization** | Objective: establish accountability within the organization to uphold responsible AI. | — | — |
| A.3.2 | AI roles and responsibilities | Define and allocate roles and responsibilities for AI according to organizational needs. | RACI, job descriptions (`EV-RACI`) | — |
| A.3.3 | Reporting of concerns | Define and put in place a process for reporting concerns about the organization's role with respect to an AI system throughout its life cycle. | Whistleblowing/concern channel, case log (`EV-COMM`) | — |
| **A.4** | **Resources for AI systems** | Objective: ensure the organization accounts for the resources (incl. AI system components and assets) of the AI system to fully understand and address risks and impacts. | — | — |
| A.4.2 | Resource documentation | Identify and document relevant resources required for AI system activities at given life-cycle stages. | Resource inventory per system (`EV-INV`) | — |
| A.4.3 | Data resources | Document information about data resources utilized for the AI system (provenance, categories, labelling, intended use, etc.). | Datasheets, data inventory (`EV-DATA`) | `T-DQ` |
| A.4.4 | Tooling resources | Document information about tooling resources (frameworks, libraries, pipelines, evaluation tools). | Tooling/SBOM-like inventory (`EV-INV`) | — |
| A.4.5 | System and computing resources | Document information about system and computing resources (hardware, cloud, compute). | Infrastructure inventory, compute records (`EV-INV`) | `T-ENV` |
| A.4.6 | Human resources | Document information about human resources and their competences for development, deployment, operation, change management, maintenance, transfer, decommissioning, verification & integration. | Competence matrix, staffing plan (`EV-TRAIN`, `EV-RACI`) | — |
| **A.5** | **Assessing impacts of AI systems** | Objective: assess AI system impacts to individuals or groups of individuals, or both, and societies affected by the AI system throughout its life cycle. | — | — |
| A.5.2 | AI system impact assessment process | Establish a process to assess potential consequences for individuals/groups/societies throughout the life cycle. | Impact assessment procedure (`EV-PROC`) | — |
| A.5.3 | Documentation of AI system impact assessments | Document results of impact assessments and retain for a defined period. | Impact assessment reports (`EV-IA`) | — |
| A.5.4 | Assessing AI system impact on individuals or groups of individuals | Assess and document potential impacts on individuals/groups (fairness, safety, privacy, rights, etc.). | Individual/group impact section of IA (`EV-IA`) | `T-BIAS`, `T-PRIV`, `T-SAFE` |
| A.5.5 | Assessing societal impacts of AI systems | Assess and document potential societal impacts (environment, economy, democratic processes, health & safety, culture, misuse). | Societal impact section of IA (`EV-IA`) | `T-ENV`, `T-SAFE` |
| **A.6** | **AI system life cycle** | — | — | — |
| **A.6.1** | Management guidance for AI system development | Objective: ensure the organization identifies and documents objectives and implements processes for responsible design and development of AI systems. | — | — |
| A.6.1.2 | Objectives for responsible development of AI system | Identify and document objectives to guide responsible development and integrate measures to achieve them into the life cycle. | Responsible-AI objectives / design principles (`EV-POL`) | — |
| A.6.1.3 | Processes for responsible design and development of AI systems | Define and document specific processes for responsible design and development. | Development lifecycle (SDLC/MLOps) procedure (`EV-PROC`) | — |
| **A.6.2** | AI system life cycle | Objective: define criteria and requirements for each stage of the life cycle. | — | — |
| A.6.2.2 | AI system requirements and specification | Specify and document requirements for new AI systems or material enhancements. | Requirements specification (`EV-TECHDOC`) | — |
| A.6.2.3 | Documentation of AI system design and development | Document design and development based on organizational objectives, documented requirements and specification criteria. | Design documents, architecture, model cards (`EV-TECHDOC`) | — |
| A.6.2.4 | AI system verification and validation | Define and document verification and validation measures and specify criteria for their use (test methods, test data, release criteria). | **Test plans & reports**, acceptance criteria (`EV-TEST`) | `T-ACC`, `T-ROB`, `T-BIAS`, `T-SEC`, `T-HALL`, `T-SAFE` |
| A.6.2.5 | AI system deployment | Document a deployment plan and ensure requirements are met before deployment. | Deployment plan, go-live checklist/approval (`EV-CHG`) | `T-CONF` |
| A.6.2.6 | AI system operation and monitoring | Define and document necessary elements for ongoing operation (performance monitoring, incident handling, repair, updates, support). | Operations runbook, monitoring reports (`EV-PMM`) | `T-DRIFT` |
| A.6.2.7 | AI system technical documentation | Determine what technical documentation is needed for each interested-party category and provide it in appropriate form. | Technical documentation set (`EV-TECHDOC`) | — |
| A.6.2.8 | AI system recording of event logs | Determine at which phases event logs should be enabled, at minimum when the system is in use. | Logging configuration, log samples, retention policy (`EV-LOG`) | `T-LOG` |
| **A.7** | **Data for AI systems** | Objective: ensure the organization understands the role and impacts of data in AI systems throughout the life cycle. | — | — |
| A.7.2 | Data for development and enhancement of AI system | Define, document and implement data management processes related to development of AI systems (privacy/security, threats, transparency, representativeness, accuracy, integrity). | Data management procedure (`EV-PROC`, `EV-DATA`) | `T-DQ` |
| A.7.3 | Acquisition of data | Determine and document details about acquisition and selection of data (sources, rights, demographics, consent). | Data acquisition records, licences, DPAs (`EV-DATA`, `EV-SUP`) | `T-IP`, `T-DQ` |
| A.7.4 | Quality of data for AI systems | Define and document data quality requirements and ensure data meets them. | **Data quality assessment report** (`EV-DATA`) | `T-DQ`, `T-BIAS` |
| A.7.5 | Data provenance | Define and document a process for recording the provenance of data over its life cycle. | Provenance/lineage ledger (`EV-DATA`) | `T-DQ` |
| A.7.6 | Data preparation | Define and document criteria and methods for data preparation (cleaning, labelling, transformation, augmentation). | Preparation/labelling guidelines, pipeline records (`EV-DATA`) | `T-DQ` |
| **A.8** | **Information for interested parties of AI systems** | Objective: ensure relevant interested parties have the necessary information to understand and assess the risks and their impacts. | — | — |
| A.8.2 | System documentation and information for users | Determine and provide necessary information to users (purpose, operation, oversight needs, limitations, impacts). | Instructions for use, user documentation (`EV-UI`, `EV-TECHDOC`) | `T-TRANS` |
| A.8.3 | External reporting | Provide capabilities for interested parties to report adverse impacts of the AI system. | External reporting channel, case records (`EV-COMM`) | — |
| A.8.4 | Communication of incidents | Determine and document a plan for communicating incidents to users. | Incident communication plan, notifications sent (`EV-INC`) | — |
| A.8.5 | Information for interested parties | Determine and document obligations to report information about the AI system to interested parties (regulators, customers, public). | Regulatory reporting register (`EV-COMM`) | — |
| **A.9** | **Use of AI systems** | Objective: ensure the organization uses AI systems responsibly and per organizational policies. | — | — |
| A.9.2 | Processes for responsible use of AI | Define and document processes for the responsible use of AI systems. | Acceptable-use procedure for AI (`EV-PROC`) | — |
| A.9.3 | Objectives for responsible use of AI system | Identify and document objectives to guide responsible use and integrate measures to achieve them. | Responsible-use objectives (`EV-POL`) | — |
| A.9.4 | Intended use of the AI system | Ensure the AI system is used according to its intended uses and accompanying documentation. | Use-case approval records, usage monitoring (`EV-INV`, `EV-PMM`) | `T-DRIFT`, `T-AGENT` |
| **A.10** | **Third-party and customer relationships** | Objective: ensure understanding of responsibilities and remain accountable, and risks are apportioned appropriately, when third parties are involved at any life-cycle stage. | — | — |
| A.10.2 | Allocating responsibilities | Ensure responsibilities within the AI life cycle are allocated between the organization, its partners, suppliers, customers and third parties. | Shared-responsibility matrix, contracts (`EV-SUP`, `EV-RACI`) | — |
| A.10.3 | Suppliers | Establish a process to ensure supplier services/products/materials align with the organization's responsible AI approach. | Supplier due-diligence, third-party model cards, SLAs (`EV-SUP`) | `T-SEC`, `T-ACC` (on supplied models) |
| A.10.4 | Customers | Ensure the organization's responsible AI approach considers customer expectations and needs. | Customer requirements analysis, contractual commitments (`EV-SUP`, `EV-COMM`) | — |

### 1.3 Annex B, C, D (informative)
- **Annex B — Implementation guidance for AI controls.** Mirrors Annex A numbering (B.2–B.10) with implementation guidance for each control (e.g., B.6.2.4 lists V&V considerations; B.7.4 lists data quality dimensions). Use as the "how-to" text behind each A-control in the control library. `V*`
- **Annex C — Potential AI-related organizational objectives and risk sources.** `V`
  - *Objectives (C.2):* accountability; AI expertise; availability and quality of training and test data; environmental impact; fairness; maintainability; privacy; robustness; safety; security; transparency and explainability. (The task's list — fairness, security, safety, privacy, robustness, transparency/explainability, accountability, environmental impact, maintainability, availability, data quality, AI expertise — maps 1:1.)
  - *Risk sources (C.3):* complexity of environment; lack of transparency and explainability; level of automation; risk sources related to machine learning (training data, training approaches); system hardware issues; system life cycle issues; technology readiness.
- **Annex D — Use of the AI management system across domains or sectors.** Guidance on integrating the AIMS with other management system standards (ISO/IEC 27001, ISO/IEC 27701, ISO 9001, etc.) and sector-specific use. `V*`
- Related: ISO/IEC 42005:2025 (AI system impact assessment), ISO/IEC 23894:2023 (AI risk management), ISO/IEC 42006:2025 (requirements for bodies certifying AIMS). `U` for exact publication months.

---

## 2. EU AI Act — Regulation (EU) 2024/1689 (as amended by Regulation (EU) 2026/1744)

Entry into force 1 Aug 2024. Amended by the **Digital Omnibus on AI, Regulation (EU) 2026/1744 of 8 July 2026**, published OJ L 24 July 2026, in force 27 July 2026 (`V` via multiple law-firm and tracker secondary sources; EUR-Lex itself blocked).

### 2.1 Risk classification tiers

| Tier | Legal basis | Scope (1-line) | Core consequence |
|---|---|---|---|
| Prohibited (unacceptable risk) | Art. 5 | Subliminal/manipulative or deceptive techniques causing significant harm; exploitation of vulnerabilities (age, disability, socio-economic); social scoring by public/private actors leading to detrimental treatment; individual criminal-risk prediction solely by profiling; untargeted facial-image scraping to build facial recognition databases; emotion recognition in workplace/education (except medical/safety); biometric categorisation inferring race, political opinions, trade-union membership, religion, sex life/orientation; real-time remote biometric identification (RBI) in public spaces for law enforcement (narrow exceptions). | Banned since 2 Feb 2025; fines up to €35M / 7% turnover (Art. 99(3)). |
| High-risk | Art. 6 + Annex I (safety components / products under Union harmonisation legislation requiring third-party conformity assessment) + Annex III (stand-alone use-case list); Art. 6(3) exemption for narrow procedural/preparatory/pattern-detection tasks, profiling always high-risk; Art. 7 Commission may amend Annex III. | Systems posing significant risk to health, safety, fundamental rights. | Chapter III Section 2 requirements (Arts. 8–15), provider/deployer obligations (Arts. 16–27), conformity assessment (Art. 43), registration (Art. 49), PMM (Art. 72), incident reporting (Art. 73). |
| Limited risk / transparency | Art. 50 | Systems interacting with natural persons; synthetic content generators; emotion recognition / biometric categorisation deployers; deepfake and public-interest-text deployers. | Disclosure & marking obligations. |
| General-purpose AI (GPAI) models | Chapter V, Arts. 51–56 | GPAI model providers (Art. 53), with additional duties for models with **systemic risk** (Art. 51 designation; presumption at >10^25 FLOPs training compute; Art. 52 notification; Art. 55 duties; Art. 56 codes of practice). | Documentation, downstream info, copyright policy, training-content summary; +evaluation, adversarial testing, incident reporting, cybersecurity for systemic risk. |
| Minimal / no specific obligations | — (Recitals; Art. 95 voluntary codes of conduct; Art. 4 AI literacy applies to all providers/deployers) | All other AI systems (spam filters, games, etc.). | Voluntary codes; AI literacy (Art. 4, reworded by Omnibus to "support" rather than "ensure" literacy — `V`). |

### 2.2 Annex III — High-risk areas (8 areas) `V*`

1. **Biometrics** (where permitted): remote biometric identification systems (excluding pure verification); biometric categorisation by sensitive/protected attributes; emotion recognition.
2. **Critical infrastructure**: safety components in management and operation of critical digital infrastructure, road traffic, or supply of water, gas, heating or electricity.
3. **Education and vocational training**: access/admission/assignment; evaluating learning outcomes; assessing appropriate level of education; monitoring/detecting prohibited behaviour during tests.
4. **Employment, workers' management and access to self-employment**: recruitment/selection (targeted ads, filtering, evaluating candidates); decisions on terms, promotion, termination, task allocation based on behaviour/traits; monitoring and evaluating performance.
5. **Access to and enjoyment of essential private services and essential public services and benefits**: eligibility for public assistance benefits/services; creditworthiness evaluation / credit scoring (except fraud detection); risk assessment & pricing in life and health insurance; evaluating and classifying emergency calls, dispatching/prioritising emergency services and emergency healthcare triage.
6. **Law enforcement**: victim-risk assessment; polygraphs and similar; evidence reliability evaluation; offending/re-offending risk assessment (not solely profiling) and personality-trait assessment; profiling in detection/investigation/prosecution.
7. **Migration, asylum and border control management**: polygraphs; risk assessment of persons entering; examination of applications (asylum, visa, residence) and complaints; detecting/recognising/identifying persons (except travel document verification).
8. **Administration of justice and democratic processes**: assisting judicial authorities in researching/interpreting facts and law and applying law; influencing the outcome of elections/referenda or voting behaviour (excluding back-office campaign tools).

**Annex I** (product legislation) — Section A (New Legislative Framework: machinery, toys, recreational craft, lifts, ATEX equipment, radio equipment, pressure equipment, cableways, PPE, gas appliances, medical devices, in-vitro diagnostics) and Section B (other Union harmonisation: civil aviation security, two/three-wheel vehicles, agricultural/forestry vehicles, marine equipment, rail interoperability, motor vehicles & general safety, civil aviation 2018/1139). `V*`

### 2.3 High-risk requirements and obligations, article by article

Format per article: **Requirement** · **Evidence** · **Tests**.

#### Art. 8 — Compliance with the requirements `V*`
- Requirement: High-risk AI systems comply with Section 2 requirements taking into account intended purpose and generally acknowledged state of the art; providers of Annex I products may integrate AI Act compliance into existing product documentation/procedures.
- Evidence: Compliance matrix mapping Arts. 9–15 to controls (`EV-SOA`-like), integrated technical file (`EV-TECHDOC`).
- Tests: `T-CONF`.

#### Art. 9 — Risk management system `V*`
- Requirement: Establish, implement, document and maintain a continuous iterative risk management system across the life cycle: (a) identify/analyse known and reasonably foreseeable risks to health, safety, fundamental rights under intended purpose; (b) estimate/evaluate risks under intended use and reasonably foreseeable misuse; (c) evaluate other risks from post-market monitoring data; (d) adopt targeted risk management measures. Residual risk acceptable; eliminate/reduce by design, mitigate/control, provide information and training to deployers. Test against prior-defined metrics and probabilistic thresholds, incl. real-world testing where appropriate (Art. 60), before placing on market. Consider impacts on persons under 18 and other vulnerable groups.
- Evidence: Risk management plan & procedure (`EV-PROC`), risk register with hazard/likelihood/severity/mitigation (`EV-RISK`), residual-risk acceptance, test-threshold definitions and test results (`EV-TEST`), PMM-to-risk feedback records (`EV-PMM`).
- Tests: `T-ACC` (threshold verification), `T-ROB`, `T-SAFE`, `T-BIAS`, `T-RT`; misuse-scenario testing; real-world/field testing `T-UX`.

#### Art. 10 — Data and data governance `V*`
- Requirement: Training, validation and testing datasets subject to data governance and management practices covering: (a) design choices; (b) data collection processes and origin, original purpose for personal data; (c) preparation operations (annotation, labelling, cleaning, updating, enrichment, aggregation); (d) assumptions about what data measures/represents; (e) assessment of availability, quantity, suitability; (f) examination for possible biases likely to affect health/safety/fundamental rights or lead to prohibited discrimination; (g) measures to detect, prevent and mitigate such biases; (h) identification of data gaps/shortcomings and how addressed. Datasets relevant, sufficiently representative, to the best extent possible free of errors and complete for the intended purpose; appropriate statistical properties incl. for persons/groups on whom the system is used; account for the specific geographical, contextual, behavioural or functional setting. Art. 10(5): processing of special categories of personal data permitted for bias detection/correction under strict safeguards (necessity, no alternatives, security, no onward transfer, deletion). Art. 10(6): systems not using model training still apply (b)–(h) to testing data.
- Evidence: Data governance procedure (`EV-PROC`), datasheets for each dataset incl. provenance, collection, labelling, cleaning (`EV-DATA`), bias examination report and mitigation record (`EV-DATA`, `EV-TEST`), representativeness analysis, special-category-data justification & DPIA (`EV-IA`).
- Tests: `T-DQ` (completeness, error rate, label quality, representativeness vs target population, leakage, duplication), `T-BIAS` (bias-in-data and bias-in-output analyses), `T-PRIV` (special-category handling checks).

#### Art. 11 — Technical documentation (+ Annex IV) `V`
- Requirement: Draw up technical documentation before placing on market/putting into service and keep it up to date; demonstrate compliance with Section 2; contain at minimum Annex IV elements; SMEs/microenterprises (and under the Omnibus, SMCs) may use a simplified form (Commission template). Annex I products: a single set of documentation.
- **Annex IV items:**
  1. General description: intended purpose; provider name; version and relation to previous versions; interaction with external hardware/software incl. other AI systems; software/firmware versions and update requirements; all forms placed on market (software package, embedded, API, etc.); hardware description; product photos/illustrations where a component; basic description of the user interface provided to the deployer; instructions for use for the deployer.
  2. Detailed description of elements and development process: methods and steps incl. use of pre-trained systems/third-party tools; design specifications (general logic, algorithms, key design choices incl. rationale and assumptions, what the system optimises, relevance of parameters, expected output and output quality, decisions on trade-offs); system architecture (how components build on/feed each other; computational resources for development, training, testing, validation); data requirements — datasheets describing training methodologies/techniques and training data sets (provenance, scope, main characteristics, how obtained and selected, labelling procedures, data cleaning); assessment of human oversight measures per Art. 14 incl. technical measures to facilitate interpretation of outputs; description of pre-determined changes and technical solutions for continuous compliance; validation and testing procedures incl. test data characteristics, metrics for accuracy, robustness and compliance with other requirements, potentially discriminatory impacts; test logs and all test reports dated and signed by responsible persons incl. for pre-determined changes; cybersecurity measures.
  3. Monitoring, functioning and control: capabilities and limitations in performance, incl. degrees of accuracy for specific persons/groups and overall expected accuracy; foreseeable unintended outcomes and sources of risks to health/safety/fundamental rights/discrimination; human oversight measures incl. technical measures for interpreting outputs; specifications on input data as appropriate.
  4. Description of the appropriateness of the performance metrics for the specific AI system.
  5. Detailed description of the risk management system (Art. 9).
  6. Description of relevant changes made by the provider through the life cycle.
  7. List of harmonised standards applied in full or in part; where none applied, detailed description of solutions adopted to meet Section 2 requirements, incl. other relevant standards/technical specifications applied.
  8. Copy of the EU declaration of conformity (Art. 47).
  9. Detailed description of the post-market monitoring system (Art. 72) incl. the post-market monitoring plan.
- Evidence: Complete Annex IV technical file (`EV-TECHDOC`), signed/dated test reports (`EV-TEST`), datasheets (`EV-DATA`), DoC copy (`EV-DEC`), PMM plan (`EV-PMM`), change log (`EV-CHG`).
- Tests: all test types feed Annex IV §2 (validation & testing) and §3 (capabilities/limitations) — `T-ACC`, `T-ROB`, `T-BIAS`, `T-SEC`, `T-ADV`, `T-HO`.

#### Art. 12 — Record-keeping `V*`
- Requirement: Technically allow automatic recording of events (logs) over the system's lifetime; logging capability ensures traceability appropriate to intended purpose, enabling: identification of situations that may present a risk (Art. 79(1)) or substantial modification; facilitating post-market monitoring (Art. 72); monitoring operation by deployers (Art. 26(5)). For Annex III point 1(a) RBI systems, logs include at minimum: period of each use (start/end date-time), reference database against which input data was checked, input data for which search led to a match, identification of natural persons involved in result verification (Art. 14(5)). Retention by provider (Art. 19) and deployer (Art. 26(6)) at least 6 months unless other law.
- Evidence: Logging specification, log schema, retention configuration, sample log exports, access controls on logs (`EV-LOG`, `EV-TECHDOC`).
- Tests: `T-LOG` (event coverage test, tamper-evidence/integrity test, decision reconstruction test, retention verification); `T-AGENT` trace logging for agentic systems.

#### Art. 13 — Transparency and provision of information to deployers `V*`
- Requirement: Design so operation is sufficiently transparent for deployers to interpret and use output appropriately; accompany with instructions for use (digital or otherwise) containing concise, complete, correct and clear information: (a) provider identity/contact; (b) characteristics, capabilities and limitations of performance incl. intended purpose; level of accuracy (incl. metrics), robustness and cybersecurity tested/validated and any known/foreseeable circumstances that may impact them; known/foreseeable circumstances that may lead to risks to health, safety or fundamental rights; technical capabilities and characteristics to provide information relevant to explain output; performance regarding specific persons/groups; specifications for input data, or other information on training/validation/testing data sets; information enabling deployers to interpret output and use it appropriately; (c) pre-determined changes; (d) human oversight measures (Art. 14) incl. technical measures to facilitate interpretation of outputs; (e) computational and hardware resources needed, expected lifetime, necessary maintenance and care measures incl. software updates; (f) description of mechanisms allowing deployers to collect, store and interpret logs.
- Evidence: Instructions for use / deployer documentation (`EV-UI`, `EV-TECHDOC`), model/system card, declared metrics (`EV-TEST`).
- Tests: `T-ACC` (metrics declared must be reproduced), `T-EXP` (explanation capability verification), `T-TRANS` (documentation completeness check), deployer comprehension `T-UX`.

#### Art. 14 — Human oversight `V*`
- Requirement: Design (incl. human-machine interface tools) so natural persons can effectively oversee during use; aim to prevent/minimise risks to health, safety, fundamental rights; measures built-in by provider and/or identified for deployer implementation; oversight persons enabled, as appropriate and proportionate, to: (a) properly understand relevant capacities and limitations and duly monitor operation incl. to detect and address anomalies, dysfunctions and unexpected performance; (b) remain aware of automation bias; (c) correctly interpret output considering available interpretation tools/methods; (d) decide not to use the system or otherwise disregard, override or reverse output; (e) intervene in operation or interrupt via a "stop" button or similar procedure allowing halt in a safe state. Art. 14(5): for Annex III 1(a) RBI, no action/decision on the basis of identification unless separately verified and confirmed by at least two competent natural persons (exceptions for law enforcement/migration where disproportionate).
- Evidence: Human-oversight design specification, HMI description, operator procedures, training materials for oversight staff (`EV-TECHDOC`, `EV-PROC`, `EV-TRAIN`), oversight test records (`EV-TEST`), override/stop logs (`EV-LOG`).
- Tests: `T-HO` (HITL escalation test, override/reversal test, stop-button/safe-state test, anomaly alerting test, automation-bias UX study, two-person verification workflow test for RBI), `T-AGENT` (approval gates on agent actions), `T-UX`.

#### Art. 15 — Accuracy, robustness and cybersecurity `V*`
- Requirement: Achieve appropriate level of accuracy, robustness and cybersecurity and perform consistently throughout life cycle; Commission to encourage benchmarks/measurement methodologies; declare accuracy levels and relevant metrics in instructions for use; be as resilient as possible to errors, faults or inconsistencies within the system or its environment, incl. through technical redundancy (backup or fail-safe plans); systems that continue learning after deployment address risk of biased outputs feeding back (feedback loops) with mitigation; resilient to attempts by unauthorised third parties to alter use, outputs or performance by exploiting vulnerabilities; cybersecurity solutions appropriate to circumstances and risks; measures to prevent, detect, respond to, resolve and control attacks incl. data poisoning, model poisoning, adversarial examples / model evasion, confidentiality attacks, and model flaws.
- Evidence: Accuracy/robustness/cybersecurity test reports (`EV-TEST`), declared metrics in IFU (`EV-UI`), threat model & security architecture (`EV-TECHDOC`), redundancy/fail-safe design, feedback-loop controls, penetration/red-team reports (`EV-TEST`).
- Tests: **`T-ACC`** (accuracy metrics per task and per subgroup, calibration), **`T-ROB`** (perturbation, distribution shift, stress, fault injection, fail-safe behaviour), **`T-ADV`** (adversarial examples, evasion, poisoning probes), **`T-SEC`** (prompt injection, jailbreak, data/model extraction, confidentiality attacks, supply-chain vulnerability scan, OWASP LLM Top-10 coverage), `T-DRIFT` (feedback-loop/bias drift monitoring), `T-RT`.

#### Art. 16 — Obligations of providers of high-risk AI systems `V*`
- Requirement: Providers shall: (a) ensure compliance with Section 2; (b) indicate name, registered trade name/mark and contact address on the system or, where not possible, packaging/documentation; (c) have a QMS (Art. 17); (d) keep documentation (Art. 18 — 10 years); (e) keep automatically generated logs under their control (Art. 19 — ≥6 months); (f) ensure the conformity assessment procedure (Art. 43) before placing on market; (g) draw up EU declaration of conformity (Art. 47); (h) affix CE marking (Art. 48); (i) comply with registration (Art. 49); (j) take corrective actions and provide information (Art. 20); (k) upon reasoned request, demonstrate conformity to a national competent authority; (l) ensure accessibility requirements per Directives (EU) 2016/2102 and (EU) 2019/882.
- Evidence: Provider obligations checklist, labelling/identification evidence (`EV-UI`), QMS manual (`EV-PROC`), document retention records, DoC (`EV-DEC`), CE marking evidence, EU database registration confirmation (`EV-DEC`), corrective action records (`EV-INC`, `EV-CHG`), accessibility conformance report.
- Tests: `T-CONF`; accessibility testing (WCAG/EN 301 549) as `T-UX`.

#### Art. 17 — Quality management system `V`
- Requirement: Put in place a QMS ensuring compliance, documented systematically as written policies, procedures and instructions, including at least:
  - (a) a strategy for regulatory compliance, incl. compliance with conformity assessment procedures and procedures for the management of modifications to the high-risk AI system;
  - (b) techniques, procedures and systematic actions for the design, design control and design verification;
  - (c) techniques, procedures and systematic actions for development, quality control and quality assurance;
  - (d) examination, test and validation procedures to be carried out before, during and after development, and the frequency with which they are carried out;
  - (e) technical specifications, incl. standards, to be applied and, where harmonised standards are not applied in full or do not cover all requirements, the means to ensure compliance;
  - (f) systems and procedures for data management, incl. data acquisition, collection, analysis, labelling, storage, filtration, mining, aggregation, retention and any other data operation performed before and for the purposes of placing on the market/putting into service;
  - (g) the risk management system referred to in Art. 9;
  - (h) the setting-up, implementation and maintenance of a post-market monitoring system (Art. 72);
  - (i) procedures related to the reporting of a serious incident (Art. 73);
  - (j) the handling of communication with national competent authorities, other relevant authorities incl. those providing/supporting data access, notified bodies, other operators, customers or other interested parties;
  - (k) systems and procedures for record-keeping of all relevant documentation and information;
  - (l) resource management, incl. security-of-supply related measures;
  - (m) an accountability framework setting out the responsibilities of management and other staff with regard to all aspects listed.
  Implementation proportionate to provider size (Omnibus: additional simplification for SMEs/SMCs `V`). Financial institutions may satisfy via existing internal governance rules (Art. 17(4)). Integration with sectoral QMS for Annex I products allowed.
- Evidence: QMS manual and procedures covering (a)–(m) (`EV-PROC`), ISO 9001/ISO 42001 certificate if used as evidence (`EV-DEC`), test/validation procedure documents (`EV-TEST`), data management procedure (`EV-DATA`), PMM & incident procedures (`EV-PMM`, `EV-INC`), accountability framework (`EV-RACI`), internal audit of QMS (`EV-AUDIT`).
- Tests: `T-CONF` (QMS audit); test-procedure execution evidence from all `T-*` types under (d).

#### Arts. 18–21 (brief) `V*`
- Art. 18 Documentation keeping (10 years: technical documentation, QMS documentation, notified body approvals, DoC). Art. 19 Automatically generated logs (≥6 months). Art. 20 Corrective actions and duty of information (withdraw/disable/recall; inform distributors, deployers, authorised representatives, importers). Art. 21 Cooperation with competent authorities (provide information/documentation and log access on reasoned request). Evidence: retention schedule, corrective action records, authority correspondence (`EV-PROC`, `EV-INC`, `EV-COMM`).

#### Art. 26 — Obligations of deployers of high-risk AI systems `V*`
- Requirement: Use per instructions for use; assign human oversight to natural persons with necessary competence, training, authority and support; where deployer controls input data, ensure it is relevant and sufficiently representative; monitor operation per IFU and inform provider/distributor and market surveillance authority of risks (Art. 79(1)) and suspend use; inform provider/importer/distributor and authorities of serious incidents; keep logs under their control for ≥6 months; before putting into service at the workplace, inform workers' representatives and affected workers; public authorities/EU bodies deployers register (Art. 49); use Art. 13 information for DPIA where applicable; post-remote RBI: judicial/administrative authorisation (Art. 26(10)); inform natural persons that they are subject to a high-risk AI system used to make or assist decisions concerning them (Art. 26(11)); cooperate with authorities.
- Evidence: Deployment procedure & IFU adherence checklist (`EV-PROC`), oversight role assignments and competence records (`EV-RACI`, `EV-TRAIN`), input-data representativeness analysis (`EV-DATA`), monitoring reports (`EV-PMM`), log retention evidence (`EV-LOG`), worker notification records, registration confirmation, DPIA (`EV-IA`), individual notification templates (`EV-UI`).
- Tests: `T-DQ` (input data checks), `T-HO`, `T-DRIFT`, `T-LOG`, `T-TRANS` (notification UX).

#### Art. 27 — Fundamental rights impact assessment (FRIA) `V`
- Requirement: Before deploying an Annex III high-risk system (except area 2 critical infrastructure), deployers that are bodies governed by public law, private entities providing public services, and deployers of Annex III 5(b) (creditworthiness/credit scoring) and 5(c) (life/health insurance risk assessment & pricing) systems perform an assessment comprising: (a) deployer's processes in which the system will be used in line with intended purpose; (b) period and frequency of use; (c) categories of natural persons and groups likely affected; (d) specific risks of harm likely to impact those categories, taking into account the provider's Art. 13 information; (e) implementation of human oversight measures per IFU; (f) measures to be taken if risks materialise, incl. internal governance and complaint mechanisms. Notify market surveillance authority of results (template questionnaire from AI Office, possibly automated tool); may rely on DPIA where overlapping; update when elements change. Omnibus: FRIA timing follows the Annex III high-risk date (2 Dec 2027) `V`.
- Evidence: FRIA report (`EV-IA`), notification to authority (`EV-COMM`), DPIA cross-reference, complaint-mechanism description.
- Tests: `T-BIAS` and `T-HO` outputs as inputs to (d)/(e); `T-UX` with affected groups.

#### Art. 43 — Conformity assessment `V*`
- Requirement: Annex III point 1 (biometrics): if harmonised standards (Art. 40) or common specifications (Art. 41) applied, choose internal control (Annex VI) or third-party assessment of QMS and technical documentation by a notified body (Annex VII); if not applied / partially applied / no standards exist, Annex VII with notified body. Annex III points 2–8: internal control (Annex VI), no notified body. Annex I Section A products: follow the sectoral third-party conformity procedure with Section 2 requirements and Annex VII points 4.3–4.5 and 4.6 fifth paragraph integrated. New conformity assessment on substantial modification (changes pre-determined by provider and assessed at initial assessment are not substantial modifications); continuously learning systems' pre-determined changes covered. Commission may amend Annexes VI/VII and shift points 2–8 to third-party assessment by delegated act.
- Evidence: Conformity assessment report / Annex VI internal control record, notified body certificate (Annex VII) where applicable, harmonised-standards application record, substantial-modification assessment procedure (`EV-DEC`, `EV-CHG`, `EV-TECHDOC`).
- Tests: `T-CONF`; full `T-*` test package as technical input to Annex VI/VII.

#### Art. 47 — EU declaration of conformity `V*`
- Requirement: Draw up a written, machine-readable, physically or electronically signed DoC for each high-risk system; keep 10 years; provide copy on request; identify the system; state compliance with Section 2 (and with other Union legislation requiring a DoC, where applicable, via a single DoC); contain Annex V information (provider name/address; statement under sole responsibility; system name, type and unique reference; statement of conformity with the Regulation and other relevant Union law e.g. data protection; references to harmonised standards/common specifications; where applicable notified body name/number, procedure and certificate; place and date, signatory name/function); translate into a language required by Member States; keep up to date.
- Evidence: Signed DoC (`EV-DEC`), standards reference list, notified body certificate.
- Tests: `T-CONF`.

#### Art. 49 — Registration `V` (Omnibus details `U`)
- Requirement: Before placing on market/putting into service an Annex III high-risk system (except area 2), the provider (or authorised representative) registers itself and the system in the EU database (Art. 71) with Annex VIII Section A information; providers concluding a system is not high-risk under Art. 6(3) register under Annex VIII Section B (**Omnibus proposal removed/simplified this self-assessment registration — status `U`, treat as "verify in consolidated text"**); deployers that are public authorities/EU bodies register per Annex VIII Section C; law enforcement, migration, asylum, border control systems registered in a secure non-public section. Omnibus: required registration information simplified `V`.
- Evidence: EU database registration record / confirmation (`EV-DEC`), Annex VIII data package.
- Tests: none technical (`T-CONF` completeness check).

#### Art. 72 — Post-market monitoring by providers and post-market monitoring plan `V*`
- Requirement: Establish and document a PMM system proportionate to the nature of AI technologies and risks; actively and systematically collect, document and analyse relevant data on performance throughout lifetime (provided by deployers or collected via other sources, incl. interaction with other AI systems where relevant; excluding sensitive operational data of law-enforcement deployers); evaluate continuous compliance with Section 2; based on a PMM plan which is part of the Annex IV technical documentation (point 9); Commission implementing act with PMM plan template (due by 2 Feb 2026); for Annex I Section A products, integrate into existing PMM systems; financial institutions may use existing rules.
- Evidence: PMM plan (`EV-PMM`), PMM reports/dashboards, performance trend analysis, deployer feedback records, PMM-to-risk-management linkage records (`EV-RISK`).
- Tests: `T-DRIFT` (performance decay, data/concept drift), periodic re-execution of `T-ACC`/`T-BIAS`/`T-SEC` in production, `T-LOG` analysis.

#### Art. 73 — Reporting of serious incidents `V*`
- Requirement: Providers of high-risk systems placed on the Union market report any **serious incident** (Art. 3(49): death or serious harm to health; serious and irreversible disruption of critical infrastructure management/operation; infringement of Union fundamental-rights obligations; serious harm to property or the environment) to the market surveillance authorities of the Member State where it occurred; immediately after establishing a causal link or reasonable likelihood, and no later than **15 days** after awareness; **≤2 days** for widespread infringement or serious incident involving critical infrastructure; **≤10 days** for death; initial incomplete report permitted; perform investigation and risk assessment, corrective action, cooperate with authorities, no alteration before informing authority; for Annex I Section A systems covered by equivalent sectoral reporting, only incidents infringing fundamental rights obligations; for medical devices (MDR/IVDR) reporting via existing framework. Deployers report per Art. 26(5).
- Evidence: Incident management procedure (`EV-PROC`), incident register with severity classification and clock-start timestamps (`EV-INC`), regulator notification copies, root-cause analyses, corrective action records (`EV-CHG`).
- Tests: Incident-response tabletop/drill records (`T-HO` variant), `T-LOG` (ability to reconstruct incident), `T-DRIFT` alerting verification.

### 2.4 Art. 50 — Transparency obligations for providers and deployers of certain AI systems `V`
- 50(1) **Chatbot/interaction disclosure** (providers): systems intended to interact directly with natural persons designed so persons are informed they are interacting with an AI, unless obvious to a reasonably well-informed, observant and circumspect person (law-enforcement exception).
- 50(2) **Synthetic content marking** (providers, incl. GPAI systems): outputs (audio, image, video, text) marked in machine-readable format and detectable as artificially generated or manipulated; technical solutions effective, interoperable, robust and reliable as technically feasible (watermarks, metadata, cryptographic provenance, logging, fingerprinting); exception for assistive/standard editing functions and law enforcement.
- 50(3) **Emotion recognition / biometric categorisation** (deployers): inform exposed natural persons; process personal data per GDPR/LED.
- 50(4) **Deepfake labelling** (deployers): disclose that image/audio/video content constituting a deepfake has been artificially generated or manipulated (artistic/satirical works: disclosure in a way that does not hamper display); AI-generated/manipulated **text published to inform the public on matters of public interest** disclosed unless human review/editorial control and editorial responsibility exist.
- 50(5) Information provided clearly and distinguishably at the latest at first interaction/exposure, accessible. 50(7) AI Office codes of practice (Code of Practice on marking and labelling of AI-generated content — drafting process 2025–2026 `U` for final status).
- **Timing:** applies from **2 Aug 2026** (unchanged by Omnibus) `V`; Omnibus grace period for Art. 50(2) marking for generative systems placed on the market before 2 Aug 2026 → **2 Dec 2026** `V` (an earlier draft used 2 Feb 2027; final adopted date per multiple secondary sources is 2 Dec 2026 — mark `V*`).
- Evidence: Disclosure UX copy & screenshots (`EV-UI`), watermark/metadata (e.g., C2PA) implementation spec (`EV-TECHDOC`), deepfake labelling policy, editorial-responsibility statement (`EV-POL`).
- Tests: **`T-TRANS`** (AI disclosure presence at first interaction; watermark presence, persistence through transformations and detectability; metadata survival; label visibility), `T-UX` (user comprehension of notices), `T-SEC` (robustness of watermark against removal).

### 2.5 Chapter V — GPAI models

#### Art. 51–52 — Classification and notification `V*`
- Systemic risk if high-impact capabilities (evaluated via benchmarks/indicators) or Commission decision; presumption when cumulative training compute > 10^25 FLOPs; provider notifies Commission within 2 weeks of meeting/anticipating threshold; may argue against designation.
- Evidence: Compute accounting record, notification correspondence (`EV-COMM`, `EV-TECHDOC`). Tests: `T-ENV`-style compute accounting; capability evaluations `T-ACC`.

#### Art. 53 — Obligations for providers of GPAI models `V`
- Requirement: (a) draw up and keep up to date **technical documentation** of the model incl. training and testing process and evaluation results (Annex XI) for the AI Office / national competent authorities on request; (b) draw up, keep up to date and make available **information and documentation to downstream providers** integrating the model (Annex XII), enabling them to understand capabilities and limitations and comply with their obligations; (c) put in place a **policy to comply with Union copyright law**, incl. identifying and complying with rights reservations under Art. 4(3) of Directive (EU) 2019/790 (text-and-data-mining opt-outs) via state-of-the-art technologies; (d) draw up and make publicly available a sufficiently detailed **summary of the content used for training** per the AI Office template (template published July 2025 `V*`). Open-source exemption from (a)/(b) (not (c)/(d)) unless systemic risk. Compliance may be demonstrated via codes of practice (Art. 56; GPAI Code of Practice published 10 July 2025 with Transparency, Copyright, and Safety & Security chapters `V*`) or harmonised standards.
- Evidence: Annex XI technical documentation (`EV-TECHDOC`), Annex XII downstream documentation / model card (`EV-TECHDOC`, `EV-SUP`), copyright compliance policy & opt-out handling records (`EV-POL`, `EV-DATA`), public training-content summary (`EV-DATA`), CoP signatory status (`EV-DEC`).
- Tests: `T-ACC` (evaluation results in docs), `T-IP` (regurgitation/memorization tests, opt-out crawler compliance verification), `T-DQ` (training data provenance).

#### Art. 54 — Authorised representatives of GPAI providers established in third countries `V*` (brief)
- Appoint EU authorised representative by written mandate; evidence: mandate (`EV-DEC`).

#### Art. 55 — Obligations for providers of GPAI models with systemic risk `V`
- Requirement (in addition to Art. 53): (a) perform **model evaluation** per standardised protocols and tools reflecting the state of the art, incl. conducting and documenting **adversarial testing** to identify and mitigate systemic risks; (b) assess and mitigate possible systemic risks at Union level, incl. their sources, that may stem from development, placing on the market or use; (c) keep track of, document and **report serious incidents** and possible corrective measures to the AI Office and, as appropriate, national competent authorities without undue delay; (d) ensure an adequate level of **cybersecurity protection** for the model and its physical infrastructure. Codes of practice (Safety & Security chapter) as presumption of conformity route.
- Evidence: Model evaluation reports incl. dangerous-capability evaluations (`EV-TEST`), red-team reports (`EV-TEST`), systemic-risk assessment and mitigation (Safety & Security Framework) (`EV-RISK`), incident reports to AI Office (`EV-INC`), cybersecurity controls and assessments (model weights protection, insider threat, infrastructure) (`EV-TECHDOC`, `EV-TEST`).
- Tests: **`T-RT`** (adversarial/red teaming across CBRN, cyber-offence, loss-of-control, manipulation), **`T-SAFE`** (dangerous-capability evals), `T-SEC` (model weight exfiltration resistance, infra pen-test), `T-ACC` (capability benchmarks), `T-ADV`.

#### Art. 56 — Codes of practice `V*`
- AI Office facilitates codes of practice; GPAI CoP (10 July 2025); monitoring and review; Commission may approve via implementing act.

### 2.6 Application timeline (original vs. Omnibus) `V` unless flagged

| Milestone | Original (Art. 113, Reg. 2024/1689) | After Digital Omnibus on AI (Reg. (EU) 2026/1744) | Status |
|---|---|---|---|
| Entry into force | 1 Aug 2024 | unchanged | `V` |
| Chapters I–II (general provisions, definitions, AI literacy Art. 4, prohibitions Art. 5) | 2 Feb 2025 | unchanged (Art. 4 wording softened to "support development of AI literacy"; Commission/Member States given a stronger role) | `V` |
| Ch. III Sect. 4 (notifying authorities/notified bodies), Ch. V (GPAI), Ch. VII (governance), Ch. XII (penalties, except Art. 101 GPAI fines), Art. 78 (confidentiality) | 2 Aug 2025 | unchanged | `V` |
| GPAI models placed on market before 2 Aug 2025 — compliance deadline | 2 Aug 2027 | unchanged | `V` |
| Commission enforcement powers / fines for GPAI providers (Art. 101) | 2 Aug 2026 | unchanged | `V*` |
| Art. 50 transparency obligations | 2 Aug 2026 | 2 Aug 2026 (unchanged); **grace period for Art. 50(2) machine-readable marking for generative systems placed on the market before 2 Aug 2026 → 2 Dec 2026** | `V` (date `V*`) |
| **Annex III stand-alone high-risk** (Arts. 6(2), 8–27, 43, 47, 49, 72, 73 etc.) | 2 Aug 2026 | **2 Dec 2027** | `V` |
| Art. 27 FRIA | 2 Aug 2026 | **2 Dec 2027** (follows Annex III) | `V` |
| **Annex I embedded high-risk** (Art. 6(1)) | 2 Aug 2027 | **2 Aug 2028** | `V` |
| High-risk systems placed on market before the applicable date | only if significant design change (Art. 111(2)); public-authority deployers of pre-existing systems → 2 Aug 2030 | dates shift accordingly; 2 Aug 2030 public-authority date — status `U` | `U` |
| Large-scale IT systems (Annex X) placed on market before 2 Aug 2027 | 31 Dec 2030 | reportedly unchanged | `U` |
| Omnibus adoption path | — | EP plenary approval 16 Jun 2026; Council adoption 29 Jun 2026; signed 8 Jul 2026; OJ L 24 Jul 2026; in force 27 Jul 2026 | `V` |
| Other Omnibus changes | — | SME & SMC definitions added to Art. 3 with proportionate QMS/documentation relief; simplified registration data; AI Office centralised supervision for certain systems (e.g., systems built on a provider's own GPAI model, very large online platforms/search engines) `U`; broadened legal basis for processing special-category data for bias detection/correction `U`; Art. 6(3)-exemption registration removed `U`; AI regulatory sandboxes / real-world testing facilitation `U`. | mixed |

Penalty bands (unchanged): Art. 99(3) prohibited practices €35M/7%; Art. 99(4) most other operator obligations (incl. Arts. 16, 22–24, 26, 31, 33, 34, 50) €15M/3%; Art. 99(5) incorrect/misleading information €7.5M/1%; SMEs lower of the two; Art. 101 GPAI providers €15M/3%. `V*`

---

## 3. NIST AI RMF 1.0 (NIST AI 100-1, Jan 2023) + Generative AI Profile (NIST AI 600-1, Jul 2024) + ARIA (NIST AI 200-3)

Voluntary, non-sector-specific. Core = 4 functions, 19 categories, 72 subcategories (GOVERN 19, MAP 18, MEASURE 22, MANAGE 13). Status: `V*` (spot-verified GOVERN 1.1, 6.2; MAP 1.1, 5.2; MEASURE 2.1, 2.7, 2.11, 2.13; MANAGE 2.3, 4.1; remainder from the published Core; NIST sites blocked).

### 3.1 Seven characteristics of trustworthy AI `V`
1. Valid and Reliable (foundational)
2. Safe
3. Secure and Resilient
4. Accountable and Transparent
5. Explainable and Interpretable
6. Privacy-Enhanced
7. Fair — with Harmful Bias Managed

### 3.2 GOVERN — "A culture of risk management is cultivated and present"

| Id | Subcategory (short text) | Typical evidence | Tests |
|---|---|---|---|
| **GOVERN 1** | Policies, processes, procedures, and practices across the organization related to mapping, measuring, and managing AI risks are in place, transparent, and implemented effectively. | | |
| GOVERN 1.1 | Legal and regulatory requirements involving AI are understood, managed, and documented. | Legal/regulatory register (`EV-POL`) | — |
| GOVERN 1.2 | The characteristics of trustworthy AI are integrated into organizational policies, processes, procedures, and practices. | AI policy, RAI principles (`EV-POL`) | — |
| GOVERN 1.3 | Processes, procedures, and practices are in place to determine the needed level of risk management activities based on the organization's risk tolerance. | Risk tiering methodology (`EV-PROC`, `EV-RISK`) | — |
| GOVERN 1.4 | The risk management process and its outcomes are established through transparent policies, procedures, and other controls based on organizational risk priorities. | Risk management procedure (`EV-PROC`) | — |
| GOVERN 1.5 | Ongoing monitoring and periodic review of the risk management process and its outcomes are planned, and organizational roles and responsibilities are clearly defined, including determining the frequency of periodic review. | Review schedule, MR minutes (`EV-MR`) | — |
| GOVERN 1.6 | Mechanisms are in place to inventory AI systems and are resourced according to organizational risk priorities. | **AI inventory** (`EV-INV`) | — |
| GOVERN 1.7 | Processes and procedures are in place for decommissioning and phasing out AI systems safely and in a manner that does not increase risks or decrease the organization's trustworthiness. | Decommissioning procedure & records (`EV-PROC`, `EV-CHG`) | — |
| **GOVERN 2** | Accountability structures are in place so that the appropriate teams and individuals are empowered, responsible, and trained for mapping, measuring, and managing AI risks. | | |
| GOVERN 2.1 | Roles and responsibilities and lines of communication related to mapping, measuring, and managing AI risks are documented and are clear to individuals and teams throughout the organization. | RACI (`EV-RACI`) | — |
| GOVERN 2.2 | The organization's personnel and partners receive AI risk management training to enable them to perform their duties and responsibilities consistent with related policies, procedures, and agreements. | Training records (`EV-TRAIN`) | — |
| GOVERN 2.3 | Executive leadership of the organization takes responsibility for decisions about risks associated with AI system development and deployment. | Executive sign-offs, board minutes (`EV-MR`) | — |
| **GOVERN 3** | Workforce diversity, equity, inclusion, and accessibility processes are prioritized in the mapping, measuring, and managing of AI risks throughout the lifecycle. | | |
| GOVERN 3.1 | Decision-making related to mapping, measuring, and managing AI risks throughout the lifecycle is informed by a diverse team (e.g., diversity of demographics, disciplines, experience, expertise, and backgrounds). | Team composition records, review board charters (`EV-RACI`) | — |
| GOVERN 3.2 | Policies and procedures are in place to define and differentiate roles and responsibilities for human-AI configurations and oversight of AI systems. | Human-oversight role definitions (`EV-PROC`, `EV-RACI`) | `T-HO` |
| **GOVERN 4** | Organizational teams are committed to a culture that considers and communicates AI risk. | | |
| GOVERN 4.1 | Organizational policies and practices are in place to foster a critical thinking and safety-first mindset in the design, development, deployment, and uses of AI systems to minimize potential negative impacts. | Safety culture policy, design review checklists (`EV-POL`) | — |
| GOVERN 4.2 | Organizational teams document the risks and potential impacts of the AI technology they design, develop, deploy, evaluate, and use, and they communicate about the impacts more broadly. | Risk/impact documentation, system cards (`EV-RISK`, `EV-IA`) | — |
| GOVERN 4.3 | Organizational practices are in place to enable AI testing, identification of incidents, and information sharing. | Testing policy, incident sharing procedure (`EV-PROC`, `EV-INC`) | `T-RT`, `T-SEC` |
| **GOVERN 5** | Processes are in place for robust engagement with relevant AI actors. | | |
| GOVERN 5.1 | Organizational policies and practices are in place to collect, consider, prioritize, and integrate feedback from those external to the team that developed or deployed the AI system regarding the potential individual and societal impacts related to AI risks. | Stakeholder engagement policy, feedback logs (`EV-COMM`) | `T-UX` |
| GOVERN 5.2 | Mechanisms are established to enable the team that developed or deployed AI systems to regularly incorporate adjudicated feedback from relevant AI actors into system design and implementation. | Feedback-to-backlog traceability (`EV-CHG`) | — |
| **GOVERN 6** | Policies and procedures are in place to address AI risks and benefits arising from third-party software and data and other supply chain issues. | | |
| GOVERN 6.1 | Policies and procedures are in place that address AI risks associated with third-party entities, including risks of infringement of a third party's intellectual property or other rights. | Third-party AI policy, supplier assessments (`EV-SUP`) | `T-IP` |
| GOVERN 6.2 | Contingency processes are in place to handle failures or incidents in third-party data or AI systems deemed to be high-risk. | Contingency/fallback plans (`EV-PROC`) | `T-ROB` (fallback test) |

### 3.3 MAP — "Context is recognized and risks related to context are identified"

| Id | Subcategory (short text) | Typical evidence | Tests |
|---|---|---|---|
| **MAP 1** | Context is established and understood. | | |
| MAP 1.1 | Intended purposes, potentially beneficial uses, context-specific laws, norms and expectations, and prospective settings in which the AI system will be deployed are understood and documented (users and expectations; positive/negative impacts to individuals, communities, organizations, society, planet; assumptions and limitations; related TEVV and system metrics). | Use-case definition / intended-purpose statement (`EV-INV`, `EV-TECHDOC`) | — |
| MAP 1.2 | Interdisciplinary AI actors, competencies, skills, and capacities for establishing context reflect demographic diversity and broad domain and user experience expertise, and their participation is documented. | Team/stakeholder roster (`EV-RACI`) | — |
| MAP 1.3 | The organization's mission and relevant goals for AI technology are understood and documented. | AI strategy (`EV-POL`) | — |
| MAP 1.4 | The business value or context of business use has been clearly defined or — in the case of assessing existing AI systems — re-evaluated. | Business case (`EV-INV`) | — |
| MAP 1.5 | Organizational risk tolerances are determined and documented. | Risk appetite/tolerance statement (`EV-POL`, `EV-RISK`) | — |
| MAP 1.6 | System requirements (e.g., "the system shall respect the privacy of its users") are elicited from and understood by relevant AI actors; design decisions take socio-technical implications into account. | Requirements specification (`EV-TECHDOC`) | — |
| **MAP 2** | Categorization of the AI system is performed. | | |
| MAP 2.1 | The specific tasks and methods used to implement the tasks that the AI system will support are defined (e.g., classifiers, generative models, recommenders). | System/model card (`EV-INV`) | — |
| MAP 2.2 | Information about the AI system's knowledge limits and how system output may be utilized and overseen by humans is documented; sufficient to assist AI actors in decisions and subsequent actions. | Limitations statement, oversight guidance (`EV-TECHDOC`, `EV-UI`) | `T-HO` |
| MAP 2.3 | Scientific integrity and TEVV considerations are identified and documented, including those related to experimental design, data collection and selection (availability, representativeness, suitability), system trustworthiness, and construct validation. | TEVV plan (`EV-TEST`), data suitability analysis (`EV-DATA`) | `T-DQ` |
| **MAP 3** | AI capabilities, targeted usage, goals, and expected benefits and costs compared with appropriate benchmarks are understood. | | |
| MAP 3.1 | Potential benefits of intended AI system functionality and performance are examined and documented. | Benefit analysis (`EV-IA`) | — |
| MAP 3.2 | Potential costs, including non-monetary costs, which result from expected or realized AI errors or system functionality and trustworthiness — as connected to organizational risk tolerance — are examined and documented. | Cost/harm analysis (`EV-IA`, `EV-RISK`) | — |
| MAP 3.3 | Targeted application scope is specified and documented based on the system's capability, established context, and AI system categorization. | Scope statement / intended-use boundaries (`EV-INV`) | — |
| MAP 3.4 | Processes for operator and practitioner proficiency with AI system performance and trustworthiness — and relevant technical standards and certifications — are defined, assessed, and documented. | Operator competence requirements (`EV-TRAIN`) | — |
| MAP 3.5 | Processes for human oversight are defined, assessed, and documented in accordance with organizational policies from the GOVERN function. | Human-oversight design (`EV-PROC`, `EV-TECHDOC`) | `T-HO` |
| **MAP 4** | Risks and benefits are mapped for all components of the AI system including third-party software and data. | | |
| MAP 4.1 | Approaches for mapping AI technology and legal risks of its components — including the use of third-party data or software — are in place, followed, and documented, as are risks of infringement of a third party's intellectual property or other rights. | Component/dependency risk map, licence audit (`EV-SUP`, `EV-RISK`) | `T-IP`, `T-SEC` (supply-chain scan) |
| MAP 4.2 | Internal risk controls for components of the AI system, including third-party AI technologies, are identified and documented. | Control mapping per component (`EV-RISK`) | — |
| **MAP 5** | Impacts to individuals, groups, communities, organizations, and society are characterized. | | |
| MAP 5.1 | Likelihood and magnitude of each identified impact (both potentially beneficial and harmful) based on expected use, past uses of AI systems in similar contexts, public incident reports, feedback from those external to the team, or other data are identified and documented. | Impact assessment with likelihood/magnitude (`EV-IA`) | `T-UX` |
| MAP 5.2 | Practices and personnel for supporting regular engagement with relevant AI actors and integrating feedback about positive, negative, and unanticipated impacts are in place and documented. | Engagement plan, feedback records (`EV-COMM`) | `T-UX` |

### 3.4 MEASURE — "Identified risks are assessed, analyzed, or tracked"

| Id | Subcategory (short text) | Typical evidence | Tests |
|---|---|---|---|
| **MEASURE 1** | Appropriate methods and metrics are identified and applied. | | |
| MEASURE 1.1 | Approaches and metrics for measurement of AI risks enumerated during MAP are selected for implementation starting with the most significant AI risks; risks or trustworthiness characteristics that will not — or cannot — be measured are properly documented. | Metrics selection record, "unmeasured risks" register (`EV-TEST`, `EV-RISK`) | all |
| MEASURE 1.2 | Appropriateness of AI metrics and effectiveness of existing controls are regularly assessed and updated, including reports of errors and potential impacts on affected communities. | Metric review log (`EV-TEST`) | — |
| MEASURE 1.3 | Internal experts who did not serve as front-line developers for the system and/or independent assessors are involved in regular assessments and updates; domain experts, users, external AI actors and affected communities are consulted as necessary. | Independent assessment reports, assessor independence attestation (`EV-AUDIT`, `EV-TEST`) | independent re-execution of `T-*` |
| **MEASURE 2** | AI systems are evaluated for trustworthy characteristics. | | |
| MEASURE 2.1 | Test sets, metrics, and details about the tools used during TEVV are documented. | TEVV documentation: test sets, metrics, tool versions (`EV-TEST`) | all (`T-*` metadata) |
| MEASURE 2.2 | Evaluations involving human subjects meet applicable requirements (including human subject protection) and are representative of the relevant population. | IRB/ethics approvals, participant demographics (`EV-TEST`) | `T-UX`, `T-RT` (human) |
| MEASURE 2.3 | AI system performance or assurance criteria are measured qualitatively or quantitatively and demonstrated for conditions similar to deployment setting(s); measures are documented. | Performance report under deployment-like conditions (`EV-TEST`) | `T-ACC`, `T-ROB` |
| MEASURE 2.4 | The functionality and behavior of the AI system and its components — as identified in MAP — are monitored when in production. | Production monitoring dashboards (`EV-PMM`) | `T-DRIFT` |
| MEASURE 2.5 | The AI system to be deployed is demonstrated to be valid and reliable; limitations of generalizability beyond development conditions are documented. | Validity & reliability report, generalization limits (`EV-TEST`) | `T-ACC`, `T-ROB`, `T-HALL` |
| MEASURE 2.6 | The AI system is evaluated regularly for safety risks — as identified in MAP; demonstrated to be safe, residual negative risk within tolerance, and able to fail safely especially beyond knowledge limits; safety metrics reflect reliability and robustness, real-time monitoring, and response times for failures. | Safety evaluation report, fail-safe test results (`EV-TEST`) | `T-SAFE`, `T-ROB`, `T-HO` |
| MEASURE 2.7 | AI system security and resilience — as identified in MAP — are evaluated and documented. | Security test report, pen-test/red-team report (`EV-TEST`) | `T-SEC`, `T-ADV`, `T-RT` |
| MEASURE 2.8 | Risks associated with transparency and accountability — as identified in MAP — are examined and documented. | Transparency assessment, accountability trace (`EV-TEST`, `EV-LOG`) | `T-TRANS`, `T-LOG` |
| MEASURE 2.9 | The AI model is explained, validated, and documented, and AI system output is interpreted within its context — as identified in MAP — to inform responsible use and governance. | Explainability report, model documentation (`EV-TEST`, `EV-TECHDOC`) | `T-EXP` |
| MEASURE 2.10 | Privacy risk of the AI system — as identified in MAP — is examined and documented. | Privacy test report, DPIA (`EV-TEST`, `EV-IA`) | `T-PRIV` |
| MEASURE 2.11 | Fairness and bias — as identified in MAP — are evaluated and results are documented. | Fairness/bias evaluation report (`EV-TEST`) | `T-BIAS`, `T-DQ` |
| MEASURE 2.12 | Environmental impact and sustainability of AI model training and management activities — as identified in MAP — are assessed and documented. | Energy/carbon report (`EV-TEST`) | `T-ENV` |
| MEASURE 2.13 | Effectiveness of the employed TEVV metrics and processes in the MEASURE function are evaluated and documented. | TEVV effectiveness review (`EV-TEST`, `EV-AUDIT`) | meta-evaluation of `T-*` |
| **MEASURE 3** | Mechanisms for tracking identified AI risks over time are in place. | | |
| MEASURE 3.1 | Approaches, personnel, and documentation are in place to regularly identify and track existing, unanticipated, and emergent AI risks based on factors such as intended and actual performance in deployed contexts. | Risk tracking register, monitoring roles (`EV-RISK`, `EV-PMM`) | `T-DRIFT` |
| MEASURE 3.2 | Risk tracking approaches are considered for settings where AI risks are difficult to assess using currently available measurement techniques or where metrics are not yet available. | Qualitative risk tracking notes (`EV-RISK`) | `T-UX`, `T-RT` |
| MEASURE 3.3 | Feedback processes for end users and impacted communities to report problems and appeal system outcomes are established and integrated into AI system evaluation metrics. | User feedback & appeal channel, metrics integration (`EV-COMM`, `EV-PMM`) | `T-UX` |
| **MEASURE 4** | Feedback about efficacy of measurement is gathered and assessed. | | |
| MEASURE 4.1 | Measurement approaches for identifying AI risks are connected to deployment context(s) and informed through consultation with domain experts and other end users; approaches are documented. | Measurement approach documentation with expert consultation (`EV-TEST`) | `T-UX` |
| MEASURE 4.2 | Measurement results regarding AI system trustworthiness in deployment context(s) and across the AI lifecycle are informed by input from domain experts and relevant AI actors to validate whether the system is performing consistently as intended; results documented. | Validation records with stakeholder input (`EV-TEST`) | `T-UX`, `T-DRIFT` |
| MEASURE 4.3 | Measurable performance improvements or declines based on consultations with relevant AI actors, including affected communities, and field data about context-relevant risks and trustworthiness characteristics are identified and documented. | Trend analysis, field data reports (`EV-PMM`) | `T-DRIFT`, `T-UX` |

### 3.5 MANAGE — "Risks are prioritized and acted upon based on a projected impact"

| Id | Subcategory (short text) | Typical evidence | Tests |
|---|---|---|---|
| **MANAGE 1** | AI risks based on assessments and other analytical output from MAP and MEASURE are prioritized, responded to, and managed. | | |
| MANAGE 1.1 | A determination is made as to whether the AI system achieves its intended purposes and stated objectives and whether its development or deployment should proceed. | Go/no-go decision record (`EV-MR`, `EV-CHG`) | gate on `T-*` results |
| MANAGE 1.2 | Treatment of documented AI risks is prioritized based on impact, likelihood, and available resources or methods. | Prioritised risk treatment plan (`EV-RISK`) | — |
| MANAGE 1.3 | Responses to the AI risks deemed high priority, as identified by MAP, are developed, planned, and documented; options include mitigating, transferring, avoiding, or accepting. | Risk response plans (`EV-RISK`) | — |
| MANAGE 1.4 | Negative residual risks (the sum of all unmitigated risks) to both downstream acquirers of AI systems and end users are documented. | Residual risk statement, downstream disclosure (`EV-RISK`, `EV-UI`) | — |
| **MANAGE 2** | Strategies to maximize AI benefits and minimize negative impacts are planned, prepared, implemented, documented, and informed by input from relevant AI actors. | | |
| MANAGE 2.1 | Resources required to manage AI risks are taken into account — along with viable non-AI alternative systems, approaches, or methods — to reduce the magnitude or likelihood of potential impacts. | Resource plan, alternatives analysis (`EV-RISK`, `EV-MR`) | — |
| MANAGE 2.2 | Mechanisms are in place and applied to sustain the value of deployed AI systems. | Maintenance/retraining plan (`EV-PMM`) | `T-DRIFT` |
| MANAGE 2.3 | Procedures are followed to respond to and recover from a previously unknown risk when it is identified. | Emergent-risk response procedure & records (`EV-PROC`, `EV-INC`) | incident drills |
| MANAGE 2.4 | Mechanisms are in place and applied, and responsibilities are assigned and understood, to supersede, disengage, or deactivate AI systems that demonstrate performance or outcomes inconsistent with intended use. | Kill-switch / deactivation procedure, authority assignment (`EV-PROC`, `EV-RACI`) | `T-HO` (stop test), `T-AGENT` |
| **MANAGE 3** | AI risks and benefits from third-party entities are managed. | | |
| MANAGE 3.1 | AI risks and benefits from third-party resources are regularly monitored, and risk controls are applied and documented. | Supplier monitoring records (`EV-SUP`) | `T-SEC`, `T-ACC` on third-party components |
| MANAGE 3.2 | Pre-trained models which are used for development are monitored as part of AI system regular monitoring and maintenance. | Base-model version tracking, re-evaluation on upgrade (`EV-SUP`, `EV-CHG`) | `T-ACC`, `T-SAFE` regression |
| **MANAGE 4** | Risk treatments, including response and recovery, and communication plans for the identified and measured AI risks are documented and monitored regularly. | | |
| MANAGE 4.1 | Post-deployment AI system monitoring plans are implemented, including mechanisms for capturing and evaluating input from users and other relevant AI actors, appeal and override, decommissioning, incident response, recovery, and change management. | **Post-deployment monitoring plan** & reports (`EV-PMM`), appeal/override records, change management (`EV-CHG`) | `T-DRIFT`, `T-HO` |
| MANAGE 4.2 | Measurable activities for continual improvements are integrated into AI system updates and include regular engagement with interested parties, including relevant AI actors. | Improvement backlog, release notes (`EV-CHG`) | regression `T-*` |
| MANAGE 4.3 | Incidents and errors are communicated to relevant AI actors, including affected communities; processes for tracking, responding to, and recovering from incidents and errors are followed and documented. | Incident register, communications, post-mortems (`EV-INC`, `EV-COMM`) | — |

### 3.6 NIST AI 600-1 — Generative AI Profile (July 2024) `V`
Cross-sectoral profile per AI RMF §6; identifies 12 risks unique to or exacerbated by GAI and provides a few hundred suggested actions, each mapped to an AI RMF subcategory and tagged with the GAI risks it addresses, plus the AI actor tasks involved. Structure usable as "GenAI control overlay" in the library.

| # | GAI risk category | 1-line description | Primary tests |
|---|---|---|---|
| 1 | CBRN Information or Capabilities | Eased access to or synthesis of materially nefarious information/design capabilities related to chemical, biological, radiological, or nuclear weapons. | `T-SAFE` (uplift evals), `T-RT` |
| 2 | Confabulation | Production of confidently stated but erroneous or false content ("hallucinations") that misleads users. | `T-HALL` |
| 3 | Dangerous, Violent, or Hateful Content | Eased production of and access to violent, inciting, radicalizing, or threatening content and recommendations of self-harm or illegal activities. | `T-SAFE`, `T-RT` |
| 4 | Data Privacy | Leakage/unauthorized use/de-anonymization of personal data; inference of sensitive attributes; training on data without consent. | `T-PRIV` |
| 5 | Environmental Impacts | Resource-intensive training, operation and maintenance (energy, water, carbon). | `T-ENV` |
| 6 | Harmful Bias and Homogenization | Amplification of societal biases, performance disparities, representational harms, and homogenization of outputs (incl. model-collapse dynamics). | `T-BIAS` |
| 7 | Human-AI Configuration | Arrangements of humans and GAI that cause emotional entanglement, over-reliance/automation bias, anthropomorphization, or inadequate oversight. | `T-HO`, `T-UX` |
| 8 | Information Integrity | Lowered barriers to large-scale mis/disinformation and deepfakes; erosion of trust in information ecosystems. | `T-TRANS` (watermark), `T-HALL`, `T-RT` |
| 9 | Information Security | Lowered barriers to offensive cyber capabilities (malware, phishing) and new attack surfaces (prompt injection, data poisoning, model extraction). | `T-SEC`, `T-ADV`, `T-AGENT` |
| 10 | Intellectual Property | Eased production of content infringing copyright, trademark, or trade secrets; licence violations in training data. | `T-IP` |
| 11 | Obscene, Degrading, and/or Abusive Content | Eased production of synthetic NCII, CSAM, and other obscene/degrading content. | `T-SAFE` |
| 12 | Value Chain and Component Integration | Non-transparent or untraceable integration of upstream third-party components (models, data, tools) with inadequate provenance, documentation, or due diligence. | supplier `T-SEC`/`T-ACC` regression, `T-DQ` provenance |

### 3.7 NIST ARIA — Assessing Risks and Impacts of AI (NIST AI 200-3; pilot report AI 700-2) `V*`
- **AI 200-3 "ARIA Evaluation Planning Manual: Elements of ARIA-Style AI Evaluations"** describes a holistic evaluation design with five elements (Scope, Design, Materials, Infrastructure, Implementation) and worksheets. **AI 700-2** documents the ARIA 0.1 pilot evaluation (title `U`).
- ARIA combines three testing types to measure risk and impact in context (serving the **MEASURE** function and feeding MANAGE):
  1. **Model Testing** (automated; pre-defined prompt sets; annotator/LLM-judge labelling) → evidence for MEASURE 2.1, 2.3, 2.5, 2.6, 2.7, 2.9, 2.10, 2.11 (`T-ACC`, `T-ROB`, `T-SAFE`, `T-HALL`, `T-BIAS`, `T-PRIV`).
  2. **Red Teaming** (human adversarial interaction to elicit negative outcomes) → MEASURE 2.6, 2.7, 2.11; GOVERN 4.3 (`T-RT`, `T-SEC`, `T-SAFE`).
  3. **User / Field Testing** (recruited users interacting in realistic scenarios across sessions, with questionnaires; "Field Testing" in ARIA documents = "User Testing") → MEASURE 2.2, 2.3, 3.3, 4.1–4.3; MAP 5.1–5.2 (`T-UX`).
- Target concepts align with the seven trustworthiness characteristics (Sector-Concept pairs, e.g., Healthcare-Privacy). Data schema (SessionID, TesterID, ApplicationID, ScenarioID, TestingType; dialogues, questionnaires, annotations) and Evaluation API (OpenConnection/StartSession/GetResponse/CloseConnection) are directly reusable as K-VeriAI evaluation-plan and evidence schemas (see `nist-ai-200-3-notes.md` in this folder).

---

## 4. Cross-framework harmonized control map

Korean AI Basic Act (인공지능 발전과 신뢰 기반 조성 등에 관한 기본법, Act No. 20676, promulgated 21 Jan 2025, in force **22 Jan 2026**; at least 1-year 계도기간 with fines deferred) `V`. Key articles used below (`V` for 31/32/34 content, `V*` for others): 제2조 definitions incl. 고영향 인공지능 (domains: energy; drinking water; healthcare; medical devices; nuclear safety; biometric analysis for criminal investigation/arrest; decisions with significant impact on individual rights/duties such as recruitment and loan screening; transport systems/facilities; public-service eligibility/decisions; education (student evaluation); others by Presidential Decree) `V*`; 제31조 투명성 확보 의무 (prior notice that a product/service operates on high-impact or generative AI; marking of generative AI outputs; clear notice for deepfake-type synthetic content); 제32조 안전성 확보 의무 (for AI above a cumulative-compute threshold set by Decree: risk identification/assessment/mitigation across life cycle, safety-incident monitoring & response system, results submitted to MSIT); 제33조 고영향 인공지능 확인 (self-review and optional confirmation request to MSIT); 제34조 고영향 인공지능과 관련한 사업자의 책무 (1) 위험관리방안 수립·운영, (2) 기술적으로 가능한 범위에서 최종결과·주요 판단 기준·학습용데이터 개요 등에 대한 설명 방안 수립·시행, (3) 이용자 보호 방안 수립·운영, (4) 고영향 인공지능에 대한 사람의 관리·감독, (5) 안전성·신뢰성 확보 조치 내용을 확인할 수 있는 문서 작성·보관, (6) 기타 대통령령); 제35조 인공지능 영향평가 (fundamental-rights impact assessment — best-effort duty, preferential public procurement); 제36조 국내대리인 지정; 제40조 사실조사·시정명령; 제43조 과태료 (≤ 30M KRW for 제31조, 제36조, 시정명령 violations). References are **general** (article-level) and should be confirmed against the consolidated text and 시행령 before legal reliance.

| HC ID | Harmonized control | ISO/IEC 42001 | EU AI Act | NIST AI RMF (+600-1) | Korean AI Basic Act (general) | Evidence types | Technical tests |
|---|---|---|---|---|---|---|---|
| HC-01 | AI policy & governance framework | 5.1, 5.2, A.2.2, A.2.3, A.2.4 | Art. 17(1)(a),(m) (compliance strategy, accountability framework); Art. 4 (AI literacy, org-level) | GOVERN 1.1, 1.2, 1.4, 4.1 | 제34조 (책무 이행 체계 전반), 정부 AI 윤리원칙 (제27조 — `U`) | `EV-POL`, `EV-MR` | — |
| HC-02 | Roles, responsibilities & accountability | 5.3, A.3.2, A.10.2 | Art. 17(1)(m); Art. 16 (provider duties); Art. 26 (deployer duties); Art. 22 (authorised representative) | GOVERN 2.1, 2.3, 3.2 | 제34조; 제36조 국내대리인 | `EV-RACI` | — |
| HC-03 | AI system inventory & classification | 4.3, A.4.2, A.4.3–A.4.6, A.9.4 | Art. 6 + Annex I/III classification; Art. 49 registration; Art. 51–52 GPAI classification | GOVERN 1.6; MAP 2.1, 3.3 | 제2조 고영향 AI 정의; 제33조 고영향 AI 확인 | `EV-INV`, `EV-DEC` | `T-CONF` |
| HC-04 | AI risk assessment & treatment | 6.1.1, 6.1.2, 6.1.3, 8.2, 8.3 | Art. 9 risk management system; Art. 55(1)(b) systemic-risk assessment | GOVERN 1.3; MAP 1.5, 3.2, 5.1; MANAGE 1.1–1.4 | 제34조①1 위험관리방안; 제32조 위험 식별·평가·완화 | `EV-RISK`, `EV-SOA` | all `T-*` as risk-measurement inputs |
| HC-05 | AI system / fundamental-rights impact assessment | 6.1.4, 8.4, A.5.2–A.5.5 | Art. 27 FRIA; Art. 9(9) vulnerable groups; GDPR DPIA linkage (Art. 26(9)) | MAP 3.1, 3.2, 5.1, 5.2; MEASURE 2.11 | 제35조 인공지능 영향평가 | `EV-IA` | `T-BIAS`, `T-UX` |
| HC-06 | Data governance & data quality | A.7.2–A.7.6, A.4.3 | Art. 10; Art. 17(1)(f); Annex IV §2(d); Art. 53(1)(d) training-content summary | MAP 2.3; MEASURE 2.11; 600-1 Data Privacy / Value Chain | 제34조①2 학습용데이터 개요 설명 | `EV-DATA` | `T-DQ`, `T-PRIV` |
| HC-07 | Bias & fairness testing | A.5.4, A.6.2.4, A.7.4 | Art. 10(2)(f),(g); Art. 15 (per-group accuracy); Annex IV §3 | MEASURE 2.11; 600-1 Harmful Bias & Homogenization | 제34조 (안전성·신뢰성 확보 조치 문서) | `EV-TEST`, `EV-DATA` | `T-BIAS`, `T-DQ` |
| HC-08 | Accuracy, validity & robustness testing | A.6.2.4, A.6.2.6 | Art. 15(1)–(4); Art. 9(6)–(8) testing vs thresholds; Art. 13(3)(b) declared metrics; Annex IV §2(g), §4 | MEASURE 2.3, 2.5, 2.6; 600-1 Confabulation | 제32조 안전성; 제34조①5 | `EV-TEST` | `T-ACC`, `T-ROB`, `T-HALL` |
| HC-09 | AI security & adversarial resilience testing | A.6.2.4, A.10.3 (supplied components) | Art. 15(5) cybersecurity (poisoning, evasion, confidentiality attacks, model flaws); Art. 55(1)(d) GPAI cybersecurity; Annex IV §2(h) | MEASURE 2.7; GOVERN 4.3; 600-1 Information Security | 제32조 안전성 확보 | `EV-TEST`, `EV-TECHDOC` | `T-SEC`, `T-ADV`, `T-RT` |
| HC-10 | Transparency, technical documentation & explainability | A.6.2.3, A.6.2.7, A.8.2 | Art. 11 + Annex IV; Art. 13 IFU; Art. 53(1)(a),(b) + Annex XI/XII; Art. 47 DoC | MAP 2.2; MEASURE 2.8, 2.9; GOVERN 4.2 | 제34조①2 설명 방안; 제34조①5 문서 작성·보관 | `EV-TECHDOC`, `EV-UI` | `T-EXP`, `T-TRANS`, `T-CONF` |
| HC-11 | Human oversight | A.6.1.2 (objectives), A.9.2, A.9.4 | Art. 14; Art. 26(2) deployer oversight assignment; Art. 27(1)(e) | GOVERN 3.2; MAP 3.5; MANAGE 2.4; 600-1 Human-AI Configuration | 제34조①4 사람의 관리·감독 | `EV-PROC`, `EV-TECHDOC`, `EV-TRAIN`, `EV-TEST` | `T-HO`, `T-UX` |
| HC-12 | Logging, traceability & record-keeping | A.6.2.8, 7.5 | Art. 12; Art. 19; Art. 26(6); Art. 17(1)(k); Art. 18 | MEASURE 2.8; MANAGE 4.1 | 제34조①5 문서 보관; 제40조 사실조사 대응 | `EV-LOG` | `T-LOG`, `T-AGENT` (trace) |
| HC-13 | Post-market / production monitoring | A.6.2.6, 9.1 | Art. 72 + PMM plan (Annex IV §9); Art. 26(5) deployer monitoring; Art. 17(1)(h) | MEASURE 2.4, 3.1, 4.3; MANAGE 2.2, 4.1 | 제32조 안전사고 모니터링; 제34조①1 위험관리 운영 | `EV-PMM` | `T-DRIFT`, periodic `T-ACC`/`T-BIAS`/`T-SEC` |
| HC-14 | Incident management & reporting | A.8.4, A.3.3, 10.2 | Art. 73 serious incidents (15/10/2-day clocks); Art. 55(1)(c) GPAI incidents; Art. 20 corrective actions; Art. 17(1)(i) | GOVERN 4.3, 6.2; MANAGE 2.3, 4.3 | 제32조 대응 체계; 제34조①3 이용자 보호 | `EV-INC`, `EV-COMM` | incident drills; `T-LOG` reconstruction |
| HC-15 | Supplier / third-party & value-chain management | A.10.2, A.10.3, A.10.4, 8.1 | Art. 25 (value-chain responsibilities); Art. 53(1)(b) downstream info; Art. 17(1)(l) resource/security of supply; Annex IV §2(a) third-party components | GOVERN 6.1, 6.2; MAP 4.1, 4.2; MANAGE 3.1, 3.2; 600-1 Value Chain & Component Integration | 제34조 (적용 범위: 사업자 책임 분배 — general) | `EV-SUP` | `T-SEC` (supply-chain scan), `T-ACC`/`T-SAFE` regression on supplied models, `T-IP` |
| HC-16 | Change management & substantial modification | 6.3, 8.1, A.6.2.5 | Art. 17(1)(a) modification management; Art. 43(4) substantial modification → re-assessment; Annex IV §6; Art. 25(1)(b),(c) | MANAGE 4.1 (change management), 4.2 | 제33조 재확인 (general) | `EV-CHG` | regression `T-*`, `T-CONF` |
| HC-17 | Competence, training & AI literacy | 7.2, 7.3, A.4.6 | Art. 4 AI literacy; Art. 26(2) competent oversight persons; Art. 14(4)(b) automation-bias awareness | GOVERN 2.2; MAP 3.4 | 제34조①4 (관리·감독 인력 — general); 정부 인력양성 조항 (`U`) | `EV-TRAIN` | `T-HO` (operator proficiency check) |
| HC-18 | Internal audit & independent assessment | 9.2.1, 9.2.2 | Art. 43 conformity assessment (Annex VI internal control / Annex VII notified body); Art. 17 QMS audit | MEASURE 1.3 (independent assessors); MEASURE 2.13 | 제33조 확인(MSIT); 제40조 사실조사 | `EV-AUDIT`, `EV-DEC` | independent re-execution of `T-*`; `T-CONF` |
| HC-19 | Management review & accountability of leadership | 9.3.1–9.3.3, 5.1 | Art. 17(1)(m) accountability framework; Art. 16 provider responsibilities | GOVERN 1.5, 2.3 | 제34조 (경영진 책무 — general) | `EV-MR` | — |
| HC-20 | Continual improvement & corrective action | 10.1, 10.2 | Art. 20 corrective actions; Art. 72 PMM feedback into Art. 9 | MANAGE 4.2; MEASURE 1.2 | 제40조 시정명령 이행 | `EV-AUDIT`, `EV-CHG` | regression `T-*` |
| HC-21 | Model evaluation (capability, safety & systemic-risk evals) | A.6.2.4 | Art. 55(1)(a) standardised evaluation protocols; Art. 53 Annex XI evaluation results; Art. 9(6) testing | MEASURE 2.1, 2.3, 2.5, 2.6; ARIA Model Testing; 600-1 CBRN / Dangerous Content | 제32조 안전성 (고성능 AI) | `EV-TEST` | `T-ACC`, `T-SAFE`, `T-HALL`, `T-ROB` |
| HC-22 | Red teaming & adversarial testing | A.6.2.4 | Art. 55(1)(a) adversarial testing; Art. 15(5); Art. 9(2) foreseeable misuse | MEASURE 2.6, 2.7; GOVERN 4.3; ARIA Red Teaming; 600-1 Information Security / CBRN | 제32조 (위험 식별 — general) | `EV-TEST` | `T-RT`, `T-SEC`, `T-ADV`, `T-SAFE` |
| HC-23 | Agent & tool-use control (autonomy boundaries) | A.9.4 intended use, A.6.2.6, A.6.2.8 | Art. 14(4)(d),(e) override/stop; Art. 12 logging; Art. 15 resilience to unauthorised alteration; Art. 26(1) use per IFU | MANAGE 2.4; MAP 3.3 scope; 600-1 Human-AI Configuration, Information Security, Value Chain | 제34조①4 관리·감독 (general) | `EV-TECHDOC`, `EV-LOG`, `EV-TEST` | `T-AGENT`, `T-HO`, `T-SEC` |
| HC-24 | User notification, disclosure & synthetic-content marking | A.8.2, A.8.5 | Art. 50(1)–(5); Art. 26(11) notice to affected persons; Art. 13 | MEASURE 2.8; 600-1 Information Integrity | 제31조 투명성 확보 의무 (사전 고지, 생성물 표시, 딥페이크 고지) | `EV-UI`, `EV-POL` | `T-TRANS`, `T-UX` |
| HC-25 | Conformity assessment, declaration & registration | 6.1.3 (SoA), 9.2 | Art. 43; Art. 47 + Annex V; Art. 48 CE marking; Art. 49 + Annex VIII; Art. 16(f)–(i) | GOVERN 1.1 (regulatory compliance); MEASURE 2.13 | 제33조 고영향 AI 확인; 제36조 국내대리인 | `EV-DEC`, `EV-SOA` | `T-CONF` |
| HC-26 | Privacy & personal-data protection in AI | A.7.2, A.5.4 | Art. 10(5) special categories; Art. 26(9) DPIA; Art. 50(3) | MEASURE 2.10; 600-1 Data Privacy | 개인정보보호법 연계 (general) | `EV-IA`, `EV-TEST` | `T-PRIV` |
| HC-27 | Environmental impact of AI | A.5.5, A.4.5 | Recitals / Art. 95 codes of conduct (voluntary); Art. 40(2) standardisation request on energy reporting | MEASURE 2.12; 600-1 Environmental Impacts | — (general policy objective) | `EV-TEST` | `T-ENV` |
| HC-28 | Stakeholder engagement & external reporting / complaints | 4.2, 7.4, A.8.3, A.8.5 | Art. 27(1)(f) complaint mechanisms; Art. 85 right to lodge complaint; Art. 86 right to explanation of individual decision-making | GOVERN 5.1, 5.2; MAP 5.2; MEASURE 3.3 | 제34조①3 이용자 보호 방안 | `EV-COMM` | `T-UX` |

---

## 5. Source & verification notes

- **Verified via web search (secondary sources):** Digital Omnibus on AI = Regulation (EU) 2026/1744 (signed 8 Jul 2026, OJ 24 Jul 2026, in force 27 Jul 2026); Annex III → 2 Dec 2027; Annex I → 2 Aug 2028; FRIA follows Annex III; Art. 50(2) legacy grace → 2 Dec 2026; Art. 4 reworded; SME/SMC definitions; registration data simplified. Art. 17(1)(a) and (m) wording; Annex IV 9-section structure; Annex III 8 areas. ISO 42001 Annex A titles for A.2.2, A.5.2, A.5.5, A.6.2.4, A.6.2.5, A.6.2.8, A.7.4, A.8.2, A.8.3, A.8.4, A.10.3, A.10.4; Annex C objectives and risk sources. NIST AI RMF subcategory texts GOVERN 1.1, 6.2; MAP 1.1, 5.2; MEASURE 2.1, 2.7, 2.11, 2.13; MANAGE 2.3, 4.1; AI 600-1 twelve risk names; ARIA three testing types (Model Testing, Red Teaming, Field/User Testing) and AI 200-3 title. Korean AI Basic Act enforcement date 22 Jan 2026, ≥1-year grace, 제31/32/34조 content and 제34조 five sub-items.
- **Not directly fetched (egress proxy blocked):** eur-lex.europa.eu, artificialintelligenceact.eu, nvlpubs.nist.gov, airc.nist.gov, iso.org, law.go.kr, and most secondary law-firm/vendor sites. Items marked `U` above (Art. 6(3) registration removal, AI Office centralised supervision scope, special-category-data processing broadening, 2 Aug 2030 public-authority date, Annex X date post-Omnibus, AI 700-2 title, Korean 제27조/인력양성 article numbers, exact ISO 42005/42006 publication months) should be re-checked against primary texts when the proxy allows.
