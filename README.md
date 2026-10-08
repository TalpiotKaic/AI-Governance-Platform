# K-VeriAI — AI Governance, Evaluation & Assurance Platform

K-VeriAI registers every AI system, model and **agent** an organisation operates, evaluates them with
automated model testing, red teaming and user-testing scenarios (NIST AI 200-3 / ARIA style), turns the
results into risks, verified controls and evidence, and produces evaluation reports, formal verification
reports and **evidence packs for ISO/IEC 42001, the EU AI Act, NIST AI RMF and the Korea AI Basic Act**.

The product thesis (from the benchmarking of VerifyWise, Credo AI, OneTrust, Holistic AI and
IBM watsonx.governance) is one traceable chain that none of the five fully closes today:

```
AI System → Risk → Regulation/Standard → Harmonized Control → Test Requirement → Test Method
  → Scenario / Dataset → Execution (Run · Session · Dialogue · Tool calls) → Metric / Finding → Verdict
  → Review / Approval → Evidence → Report / Evidence Pack → Continuous re-test on change
```

## Features

| Layer | What is implemented |
|---|---|
| **Govern** | AI Inventory with intake assessment → automatic risk tier, EU AI Act classification, Agent Card (tools, permissions, data sources, MCP servers, kill switch); Risk Register (L×S, severity-weighted, 10 dimensions incl. agent behaviour); 5 framework libraries (ISO/IEC 42001 clauses + Annex A, EU AI Act articles incl. 2026 Omnibus dates, NIST AI RMF 72 subcategories, NIST ARIA, KR AI Basic Act) harmonised into 28 controls; policies; multi-stage approvals; tasks; incidents; audit trail |
| **Evaluate & Verify** | Test Library: 14 test methods with metrics & acceptance thresholds, 15 scenarios (prompt sets, red-team scripts, annotation schemas, questionnaires) incl. NIST ARIA Appendix C examples and agentic red teaming (tool misuse, exfiltration, multi-turn manipulation, indirect injection). Evaluation Plans = ARIA worksheets B.1–B.5. Evaluation Runs against **Anthropic / OpenAI-compatible / HTTP Evaluation API / deterministic demo** targets with a sandbox tool executor, rule-based + LLM-as-judge (+ demo ground-truth) annotation, per-metric verdicts, category scores and an **AI Assurance Score**; findings auto-register risks and verify controls |
| **Prove** | Evidence Center (generated, uploaded, attestation; SHA-256; control links; expiry on change); Reports: Evaluation Report, Verification (test) Report with tester/reviewer/approver sign-off, NIST ARIA report, ISO 42001 / EU AI Act / NIST AI RMF / KR AI Basic Act evidence packs, AI Passport; review → approve → issue workflow, versioning, print view, PDF (Chromium) and JSON export |
| **Public** | AI Trust Center per organisation (`/trust/<slug>`) |
| **Integrate** | HTTP Evaluation API contract (`/evaluation-api`) with a built-in sample target; CI gate via report export |

## Roles & permissions

Access is capability-based (`src/lib/permissions.ts`), not a linear hierarchy, so reviewers and approvers cannot run the evaluations they sign off (segregation of duties). Server actions call `requirePermission()`, form pages call `requirePagePermission()` (redirects to `/forbidden`), and the sidebar, mobile nav and action buttons are filtered with `userCan()`. The full matrix is shown read-only under **Settings → Permission matrix**.

| Role | Can |
|---|---|
| Admin | Everything, incl. users/roles/credentials |
| Governance Owner | Register/edit systems, risks, plans, run evaluations, evidence, generate reports, decide approvals, policies, view settings & audit |
| Approver | Approve/issue reports, decide approvals, tasks, incidents, audit |
| Reviewer | Human annotation & finding status, review reports, decide approvals, tasks, incidents, audit |
| Tester | Register/edit systems, risks, plans, run evaluations, annotate, evidence, generate reports, tasks, incidents |
| Viewer | Read-only (no Approvals & Tasks or Settings menu) |

## Running behind a tunnel or reverse proxy

Set `APP_ORIGIN` (e.g. `https://kveriai.example.com`) so login/locale redirects and the PDF renderer use the public origin. Without it, redirects are relative and the PDF renderer uses the request's own origin. `TRUST_PROXY_HEADERS=1` derives the origin from `X-Forwarded-Host`/`X-Forwarded-Proto` instead; enable it only behind a proxy you control, since those headers are otherwise attacker-controlled. For `next dev` through a tunnel add the hostname to `NEXT_ALLOWED_DEV_ORIGINS`. `pnpm tsx scripts/add-org.ts <slug> <name> <adminEmail> <password>` creates an organisation with an admin user.

## User guide / 사용 설명서

- English: [docs/USER-GUIDE.en.md](docs/USER-GUIDE.en.md)
- 한국어: [docs/USER-GUIDE.ko.md](docs/USER-GUIDE.ko.md)
- Deutsch: [docs/USER-GUIDE.de.md](docs/USER-GUIDE.de.md)
- Français: [docs/USER-GUIDE.fr.md](docs/USER-GUIDE.fr.md)
- Italiano: [docs/USER-GUIDE.it.md](docs/USER-GUIDE.it.md)
- Español: [docs/USER-GUIDE.es.md](docs/USER-GUIDE.es.md)

## Language / 언어 / Sprache / Langue / Lingua / Idioma

The UI and generated reports are available in English, Korean, German, French, Italian and Spanish. Switch with the flag toggle (**EN | KO | DE | FR | IT | ES**, `src/components/layout/flag.tsx`) on the login page or in the top bar; the choice is stored in the `kveriai_locale` cookie (first visit follows `Accept-Language`). Reports are generated in the language chosen on the **Generate report** form (defaults to the UI language); each report stores its `language`, versions are tracked per language, and the report page offers "Regenerate in …" for the other languages.

**Vendors & datasets**: `/vendors` manages third-party providers and datasets (`src/app/(app)/vendors`); systems link to them from the intake form (section 4), the system page cards or the Excel columns. `src/lib/systems/links.ts` resolves links by id or name (creating missing records), auto-links the model provider as an LLM-provider vendor, and records VENDOR / DATA_SOURCE change events that trigger re-tests.

**Vendor due diligence**: `src/lib/vendors/assessment.ts` defines the six weighted items (0–3 each → 0–100), the data-sensitivity profile options and the 60-point high-risk threshold; `src/lib/vendors/risk.ts` auto-registers a VENDOR-source risk when a 60+ vendor is linked to a high-risk system. Saving an assessment files a VENDOR_ASSESSMENT evidence record linked to HC-15.

**Bulk inventory import**: AI Inventory → *Import from Excel* downloads a template (`GET /api/systems/template?l=<code>`, built with exceljs: localized headers, dropdown data validation for coded fields, Yes/No lists, header notes, Guide sheet) and accepts the filled file back; rows are validated with the same schema as the form (`src/lib/import/systems-xlsx.ts`, `src/lib/systems/create.ts`) and registered with intake tier, seeded risks and approvals.

**Framework content** (ISO/IEC 42001, EU AI Act, NIST AI RMF, NIST ARIA, Korea AI Basic Act requirement titles/descriptions/evidence hints, framework names and harmonized-control names) is translated too. The database keeps the source text (English; Korean for the Korea AI Basic Act); translations live in `prisma/seed-data/i18n/<code>.json` and are applied at render time by `src/lib/i18n/content.ts` on the Frameworks pages, system control tabs, evidence pages and in evidence packs, following the UI or report language. `python3 scripts/check-framework-i18n.py` validates the files (same keys as `_source.json`, no empty fields, codes such as `EV-POL`, `T-CONF`, `Art. 9` preserved). Regenerate `_source.json` from `frameworks.json` whenever the control library changes and add the new keys to every language file.

The diagrams embedded in the user guides are generated per language from `scripts/guide-images/texts.json` by `node scripts/guide-images/render.mjs` (Playwright + Chromium; a CJK font such as Noto Sans CJK is needed for Korean), which writes `docs/images/<diagram>.<code>.png`.

**Adding a language**: create `src/lib/i18n/locales/<code>.ts` exporting the UI dictionary (English key → translation), the enum-label map and the report-string map (copy `de.ts` or `fr.ts` as a template), add a flag in `src/components/layout/flag.tsx`, then register the code in `LOCALES`/`LOCALE_META`/`DICTS` (`src/lib/i18n/dict.ts`), `LABEL_MAPS` (`src/lib/i18n/labels.ts`) and `REPORT_DICTS` (`src/lib/reports/dict.ts`). Missing keys fall back to English.

## Quick start

```bash
pnpm install
cp .env.example .env            # set DATABASE_URL (PostgreSQL 14+) and AUTH_SECRET
pnpm prisma migrate deploy      # or `pnpm prisma migrate dev` while developing
pnpm prisma db seed             # frameworks, controls, test library, demo org + 5 demo runs + reports
pnpm dev                        # http://localhost:3000
```

Demo accounts (password `demo1234`): `admin@kveriai.demo` (Admin, verification body), `tester@…`, `reviewer@…`,
`approver@…`, `owner@acme.demo` (enterprise Governance Owner), `viewer@acme.demo`.

**DEMO mode** needs no API keys: a deterministic simulated target with a configurable weakness profile
exercises the full pipeline. **LIVE mode** needs provider credentials (Settings → credentials, or
`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `OLLAMA_BASE_URL`) and uses an LLM-as-judge. PDF export uses
Chromium via `playwright-core` (`CHROMIUM_PATH` or `PLAYWRIGHT_BROWSERS_PATH`); without a browser it falls
back to the print view.

## Stack

Next.js 16 (App Router, Server Actions, Turbopack) · TypeScript · Tailwind CSS v4 · Prisma 7 + PostgreSQL ·
Anthropic & OpenAI SDKs · jose (sessions) · playwright-core (PDF).

## Repository layout

```
prisma/schema.prisma          data model (≈40 models)
prisma/seed.ts                seed: frameworks, controls, library, demo data, demo runs, reports
prisma/seed-data/             frameworks.json (built from docs/framework-control-library.md), library.ts
src/lib/eval/                 evaluation engine: adapters, sandbox tools, judges, metrics, runner
src/lib/reports/              report & evidence-pack builders, report service
src/app/(app)/                authenticated application (dashboard, systems, risks, frameworks, plans,
                              evaluations, library, evidence, reports, approvals, incidents, policies, settings)
src/app/(public)/trust        public AI Trust Center
src/app/(print)/print         print/PDF view
src/app/api/                  files, report export/pdf, sample Evaluation API target
docs/                         framework control library, benchmarking & product plan
```

## Scripts

`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm tsc --noEmit` · `pnpm prisma studio`

Rebuild the framework seed from the library markdown: `python3 prisma/seed-data/build-frameworks.py`.
