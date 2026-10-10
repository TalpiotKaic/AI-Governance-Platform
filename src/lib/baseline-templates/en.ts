import type { BaselineSet } from "@/lib/baseline-documents";

// Baseline governance document templates (en). Placeholders in [ ] are filled in by the organisation.
export const en: BaselineSet = {
  ai_policy: { title: "AI Policy", body: (o, sys) => `# AI Policy

## 1. Purpose
${o} sets this policy to develop, procure and operate AI systems safely, fairly and transparently.

## 2. Scope
All AI systems the organisation develops, procures or uses, including external SaaS AI. Systems currently in the AI inventory:

${sys}

## 3. Principles
- **Accountability**: every AI system has a named owner.
- **Fairness**: discrimination against protected groups is tested for and prevented.
- **Transparency**: users are told when they interact with AI and generated content is marked.
- **Safety and security**: risks are assessed and tested before deployment.
- **Privacy**: only the minimum necessary data is used.
- **Human oversight**: significant decisions are reviewed by people.

## 4. Obligations
1. Every AI system is registered in the AI inventory and risk-assessed before use.
2. High-risk systems are tested and approved before deployment.
3. Personal, confidential data and source code are not entered into generative AI tools without approval.
4. AI incidents and abnormal behaviour are reported immediately.
5. Roles and responsibilities follow "AI roles and responsibilities (RACI)".

## 5. Compliance
ISO/IEC 42001, the EU AI Act, the NIST AI RMF and the Korea AI Basic Act.

## 6. Review
Reviewed at least annually and whenever law or business changes significantly.

Approved by: [name] · Effective: [date]
` },
  roles: { title: "AI roles and responsibilities (RACI)", body: (o) => `# AI roles and responsibilities (RACI)

AI governance roles and owners at ${o}. Replace the [ ] placeholders with the actual people.

## 1. Roles
| Role | Person | Main responsibilities |
|---|---|---|
| Executive AI sponsor | [name] | Approves the AI policy, allocates resources, management review |
| AI governance owner | [name] | Inventory, risks and documents; coordinates deployment approval |
| System owner | per system | Registers the system, treats risks, records changes |
| Test lead | [name] | Plans and runs evaluations, manages results |
| Reviewer | [name] | Reviews test results and documents (independent of the author) |
| Approver | [name] | Issues reports, approves deployment and risk acceptance |
| Data protection officer | [name] | Privacy impact assessment, data processing review |
| Information security officer | [name] | Security testing, vendor security due diligence |

## 2. RACI (R responsible · A accountable · C consulted · I informed)
| Activity | Governance owner | System owner | Test lead | Reviewer | Approver |
|---|---|---|---|---|---|
| Register and classify AI systems | A | R | I | I | I |
| Risk assessment and treatment | A | R | C | C | I |
| Testing and evaluation | I | C | R | A | I |
| Write and approve governance documents | R | C | I | C | A |
| Deployment approval | R | C | C | C | A |
| Incident response | A | R | C | I | I |
| Vendor due diligence | A | R | I | C | I |
| AI literacy training | A | R | I | I | I |

## 3. Segregation of duties
Author and reviewer are different people; testers do not approve their own results.
` },
  objectives: { title: "AI objectives and plan", body: (o) => `# AI objectives and plan

Objectives of the AI management system at ${o} and how they are achieved. Reviewed annually in management review.

| Objective | Indicator | Target | Owner | Checked |
|---|---|---|---|---|
| Know every AI system | AI inventory registration rate | 100% | Governance owner | Quarterly |
| Verify before deployment | High-risk systems evaluated before deployment | 100% | Test lead | At deployment |
| Treat risks on time | Risks treated by their due date | ≥ 90% | System owners | Monthly |
| Keep documents current | Governance documents past their review date | 0 | Governance owner | Monthly |
| AI literacy | Training completion | ≥ 95% | HR / training | Half-yearly |
| Prevent incidents | Serious AI incidents | 0 | Everyone | Ongoing |

## Resources
People, budget and tools (including K-VeriAI) needed to meet the objectives are allocated in management review.

## Management review agenda
Objective achievement, risk status, test results, incidents, audit results, regulatory change, improvements.
` },
  risk_procedure: { title: "AI risk assessment and treatment procedure", body: (o) => `# AI risk assessment and treatment procedure

How ${o} identifies, assesses, treats and monitors AI risks.

## 1. Identify
- Initial risks are generated from the intake answers when a system is registered.
- HIGH/CRITICAL test findings, incidents and vendor due-diligence results add risks.

## 2. Assess
- Rate likelihood (L) and severity (S) from 1 to 5.
- Score = (L × 1 + S × 3) ÷ 20 × 100. ≥ 80 critical, 60–79 high, 35–59 medium, < 35 low.

## 3. Treat
- Choose mitigate, accept, avoid or transfer and record the mitigation.
- Due dates: critical 30 days, high 45 days, others 90 days.
- Record residual L·S after mitigation. Residual-risk acceptance is approved by an approver.

## 4. Impact assessment
High-risk / high-impact AI and systems processing personal data get an impact assessment (fundamental rights, privacy) before deployment.

## 5. Monitor and reassess
- Overdue risks are flagged on the dashboard and as tasks.
- Changes to model version, prompt, tools or data sources are recorded and the affected tests re-run.
` },
  records: { title: "AI records and document control rules", body: (o) => `# AI records and document control rules

How ${o} creates, keeps and controls AI documents and records.

## 1. Scope
Governance documents (policies, procedures, plans), test results and reports, evidence, the risk register, change records, approvals, incident records and system logs.

## 2. Writing and approval
- Governance documents are written in K-VeriAI "Policies & documents" and approved by a reviewer other than the author.
- Versions and revision history are kept; when a revision is approved the previous version is kept as "Superseded".

## 3. Storage and integrity
- Evidence and reports are kept in the K-VeriAI Evidence Center with the file's SHA-256 hash.
- Every change is written to the audit log.

## 4. Retention
| Record | Retention |
|---|---|
| High-risk AI technical documentation and conformity records | 10 years after placing on the market |
| Automatically generated logs | at least 6 months |
| Other documents and records | [period] |

## 5. Access control
Role-based permissions limit who can read and change records. Only approved reports are shared externally.

## 6. Review
Each document is reviewed on its review cycle; after its review date it no longer counts as evidence.
` },
  literacy: { title: "AI literacy training plan", body: (o) => `# AI literacy training plan

${o} trains everyone who uses or manages AI to the level their role requires.

| Audience | Content | When | Format |
|---|---|---|---|
| All staff | AI policy, allowed and prohibited uses, no personal or confidential input, incident reporting | On joining, annually | Online |
| System owners | Risk assessment, change records, human oversight | On appointment, annually | Workshop |
| Test and review staff | Evaluation methods, red teaming, judging criteria, bias | On appointment, annually | Workshop |
| Management | Regulatory developments, accountability, management review | Annually | Briefing |

## Records
Attendance lists and completion rates are registered in the Evidence Center as "Training record".

## Target
Completion ≥ 95%; anyone who missed it is trained within 30 days.
` },
};
