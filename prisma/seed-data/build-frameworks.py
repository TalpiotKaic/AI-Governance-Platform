"""Convert docs/framework-control-library.md into prisma/seed-data/frameworks.json."""
import json, re, sys
src = open("docs/framework-control-library.md", encoding="utf-8").read()
lines = src.split("\n")

def clean(s):
    s = s.replace("**", "").replace("`", "").strip()
    return re.sub(r"\s+", " ", s)

def table_rows(start_marker, end_marker=None, start_after=None):
    """Return list of row-cell lists for the first markdown table after start_marker."""
    i = 0
    if start_after is not None:
        i = start_after
    while i < len(lines) and start_marker not in lines[i]:
        i += 1
    rows = []
    j = i + 1
    while j < len(lines):
        l = lines[j]
        if end_marker and l.startswith(end_marker):
            break
        if l.startswith("|"):
            cells = [c.strip() for c in l.strip().strip("|").split("|")]
            if not all(re.fullmatch(r"-*", c) for c in cells):
                rows.append(cells)
        elif rows and not l.strip():
            # blank line ends the table
            if any(lines[k].startswith("|") for k in range(j+1, min(j+3, len(lines)))):
                j += 1
                continue
            break
        j += 1
    return rows, j

frameworks = []

# ── ISO 42001 clauses ──
rows, end = table_rows("### 1.1 Main body clauses")
iso_reqs = []
order = 0
for r in rows[1:]:
    if len(r) < 4: continue
    ref, title, req, ev = clean(r[0]), clean(r[1]), clean(r[2]), clean(r[3])
    if ref.lower() == "clause": continue
    order += 1
    cat = "Clause " + ref.split(".")[0]
    iso_reqs.append({"ref": ref, "title": title, "description": req if req != "—" else None, "category": cat, "evidenceHint": ev if ev != "—" else None, "sortOrder": order})
rows, _ = table_rows("### 1.2 Annex A", start_after=end)
for r in rows[1:]:
    if len(r) < 5: continue
    ref, title, desc, ev, tests = [clean(x) for x in r[:5]]
    if ref.lower() == "id": continue
    order += 1
    objective = re.match(r"A\.(\d+)", ref)
    cat = "Annex A." + objective.group(1) if objective else "Annex A"
    hint = ev if ev != "—" else None
    if tests and tests != "—": hint = (hint + " · Tests: " + tests) if hint else "Tests: " + tests
    iso_reqs.append({"ref": ref, "title": title, "description": desc, "category": cat, "evidenceHint": hint, "sortOrder": order})
frameworks.append({"code": "ISO_42001", "name": "ISO/IEC 42001:2023 — AI management system (AIMS)", "version": "2023", "issuer": "ISO/IEC JTC 1/SC 42", "description": "Requirements for establishing, implementing, maintaining and continually improving an AI management system. Clauses 4–10 plus Annex A reference controls (9 objectives, 38 controls).", "requirements": iso_reqs})

# ── EU AI Act articles ──
eu_reqs = []
order = 0
sec = src.split("### 2.3 High-risk requirements")[1].split("### 2.4 Art. 50")[0]
art_blocks = re.split(r"\n#### ", sec)
for blk in art_blocks[1:]:
    head, _, body = blk.partition("\n")
    m = re.match(r"(Art\.\s*[0-9]+(?:[–-][0-9]+)?)\s*[—-]\s*(.+?)\s*(`[VU*]+`)?\s*$", head)
    if not m: continue
    ref = clean(m.group(1)).replace("Art. ", "Art. ")
    title = clean(m.group(2))
    req = ev = tests = ""
    for l in body.split("\n"):
        ls = l.strip()
        if ls.startswith("- Requirement:"): req = clean(ls[len("- Requirement:"):])
        elif ls.startswith("- Evidence:"): ev = clean(ls[len("- Evidence:"):])
        elif ls.startswith("- Tests:"): tests = clean(ls[len("- Tests:"):])
    order += 1
    artnum = int(re.search(r"\d+", ref).group())
    cat = "High-risk requirements (Ch. III §2)" if 8 <= artnum <= 15 else "Provider & deployer obligations" if 16 <= artnum <= 27 else "Conformity, registration & post-market" if artnum in (43, 47, 49, 72, 73) else "Other"
    hint = ev
    if tests: hint = (hint + " · Tests: " + tests) if hint else "Tests: " + tests
    eu_reqs.append({"ref": ref, "title": title, "description": req or None, "category": cat, "evidenceHint": hint or None, "sortOrder": order})
# Art. 50 and GPAI from sections 2.4/2.5
def section(start, end):
    return src.split(start)[1].split(end)[0]
s50 = section("### 2.4 Art. 50", "### 2.5 Chapter V")
ev50 = clean(re.search(r"- Evidence:(.+)", s50).group(1)) if re.search(r"- Evidence:(.+)", s50) else ""
t50 = clean(re.search(r"- Tests:(.+)", s50).group(1)) if re.search(r"- Tests:(.+)", s50) else ""
order += 1
eu_reqs.append({"ref": "Art. 50", "title": "Transparency obligations for providers and deployers of certain AI systems", "description": "Inform natural persons they are interacting with an AI system; mark synthetic audio/image/video/text outputs in a machine-readable, detectable way; inform persons exposed to emotion recognition/biometric categorisation; label deepfakes and AI-generated public-interest text; information provided clearly at first interaction. Applies from 2 Aug 2026.", "category": "Transparency (Art. 50)", "evidenceHint": (ev50 + " · Tests: " + t50).strip(" ·"), "sortOrder": order})
s5 = section("### 2.5 Chapter V", "### 2.6 Application timeline")
for blk in re.split(r"\n#### ", s5)[1:]:
    head, _, body = blk.partition("\n")
    m = re.match(r"(Art\.\s*[0-9]+(?:[–-][0-9]+)?)\s*[—-]\s*(.+?)\s*(`[VU*]+`)?\s*$", head)
    if not m: continue
    ref, title = clean(m.group(1)), clean(m.group(2))
    if "–" in ref or "-" in ref.replace("Art. ", ""):
        title = f"{title} ({ref})"
        ref = "Art. " + re.search(r"\d+", ref).group()
    req = ev = tests = ""
    for l in body.split("\n"):
        ls = l.strip()
        if ls.startswith("- Requirement:"): req = clean(ls[len("- Requirement:"):])
        elif ls.startswith("- Evidence:"): ev = clean(ls[len("- Evidence:"):])
        elif ls.startswith("- Tests:"): tests = clean(ls[len("- Tests:"):])
        elif not req and ls.startswith("- "): req = clean(ls[2:])
    order += 1
    hint = ev
    if tests: hint = (hint + " · Tests: " + tests) if hint else "Tests: " + tests
    eu_reqs.append({"ref": ref, "title": title, "description": req or None, "category": "General-purpose AI models (Ch. V)", "evidenceHint": hint or None, "sortOrder": order})
# Risk tiers & Annex III as informational requirements
order += 1
eu_reqs.insert(0, {"ref": "Art. 5", "title": "Prohibited AI practices", "description": "Bans manipulative/deceptive techniques causing significant harm, exploitation of vulnerabilities, social scoring, individual crime prediction by profiling alone, untargeted facial-image scraping, emotion recognition in workplace/education (except medical/safety), sensitive biometric categorisation, and real-time remote biometric identification for law enforcement (narrow exceptions). Applicable since 2 Feb 2025.", "category": "Classification", "evidenceHint": "Prohibited-practice screening record in the intake assessment (EV-RISK)", "sortOrder": 0})
eu_reqs.insert(1, {"ref": "Art. 6", "title": "Classification rules for high-risk AI systems (Annex I / Annex III)", "description": "AI system is high-risk if it is a safety component of (or is itself) a product under Annex I harmonisation legislation requiring third-party conformity assessment, or falls under an Annex III area (biometrics; critical infrastructure; education; employment; essential services incl. credit scoring & insurance; law enforcement; migration/border; justice & democratic processes). Art. 6(3) narrow exemption for procedural/preparatory tasks; profiling is always high-risk.", "category": "Classification", "evidenceHint": "Classification rationale & Annex III area record in the AI inventory (EV-INV, EV-DEC)", "sortOrder": 0})

# Additional EU articles referenced by harmonized controls
extra_eu = [
    ("Art. 4", "AI literacy", "Providers and deployers take measures to support a sufficient level of AI literacy of their staff and other persons dealing with the operation and use of AI systems (reworded by the Omnibus).", "Provider & deployer obligations", "AI literacy training records, curricula (EV-TRAIN)"),
    ("Art. 18", "Documentation keeping", "Providers keep technical documentation, QMS documentation, notified-body decisions and the EU declaration of conformity at the disposal of authorities for 10 years after placing on the market.", "Provider & deployer obligations", "Document retention policy & registry (EV-TECHDOC, EV-PROC)"),
    ("Art. 19", "Automatically generated logs", "Providers of high-risk AI systems keep the automatically generated logs under their control for a period appropriate to the intended purpose, at least six months.", "Provider & deployer obligations", "Log retention configuration, log samples (EV-LOG) · Tests: T-LOG"),
    ("Art. 20", "Corrective actions and duty of information", "Providers that consider a high-risk AI system not in conformity immediately take corrective actions (withdraw, disable, recall) and inform distributors, deployers, authorised representative and importers.", "Provider & deployer obligations", "Corrective action records, notifications (EV-AUDIT, EV-COMM)"),
    ("Art. 22", "Authorised representatives of providers of high-risk AI systems", "Providers established outside the Union appoint by written mandate an authorised representative established in the Union before making the system available.", "Provider & deployer obligations", "Mandate letter (EV-RACI)"),
    ("Art. 25", "Responsibilities along the AI value chain", "Distributors, importers, deployers or third parties become providers when they put their name on, substantially modify, or change the intended purpose of a high-risk AI system; written agreements on information and technical access with suppliers of components.", "Provider & deployer obligations", "Value-chain agreements, shared-responsibility matrix (EV-SUP)"),
    ("Art. 40", "Harmonised standards and standardisation deliverables", "High-risk AI systems or GPAI models conforming to harmonised standards published in the OJEU are presumed to comply with the corresponding requirements.", "Conformity, registration & post-market", "Standards conformity checklist (EV-DEC) · Tests: T-CONF"),
    ("Art. 48", "CE marking", "The CE marking is affixed visibly, legibly and indelibly to high-risk AI systems (or digitally where applicable), followed by the notified body identification number where relevant.", "Conformity, registration & post-market", "CE marking record (EV-DEC)"),
    ("Art. 85", "Right to lodge a complaint with a market surveillance authority", "Any natural or legal person with grounds to consider an infringement may lodge a complaint with the relevant market surveillance authority.", "Other", "Complaint handling records (EV-COMM)"),
    ("Art. 86", "Right to explanation of individual decision-making", "Affected persons subject to a decision taken by a deployer on the basis of output from an Annex III high-risk AI system that produces legal or similarly significant effects have the right to clear and meaningful explanations of the role of the AI system and the main elements of the decision.", "Other", "Explanation procedure & templates (EV-UI, EV-PROC) · Tests: T-EXP"),
    ("Art. 95", "Codes of conduct for voluntary application of specific requirements", "The AI Office and Member States encourage codes of conduct fostering voluntary application of high-risk requirements to other AI systems, incl. environmental sustainability, AI literacy, inclusive design and stakeholder participation.", "Other", "Code of conduct adherence record (EV-POL)"),
]
for i, (ref, title, desc, cat, hint) in enumerate(extra_eu):
    eu_reqs.append({"ref": ref, "title": title, "description": desc, "category": cat, "evidenceHint": hint, "sortOrder": 100 + i})

frameworks.append({"code": "EU_AI_ACT", "name": "EU AI Act — Regulation (EU) 2024/1689 (as amended by Reg. (EU) 2026/1744)", "version": "2024/1689 + Omnibus 2026/1744", "issuer": "European Parliament and Council", "description": "Risk-based obligations for AI systems: prohibited practices (Art. 5), high-risk requirements (Arts. 8–15) and obligations (Arts. 16–27), transparency (Art. 50), GPAI models (Arts. 51–56), conformity assessment, registration, post-market monitoring and serious-incident reporting. Annex III high-risk obligations apply from 2 Dec 2027 (Omnibus).", "requirements": eu_reqs})

# ── NIST AI RMF ──
nist_reqs = []
order = 0
for fn in ["GOVERN", "MAP", "MEASURE", "MANAGE"]:
    marker = f"### 3.{ {'GOVERN':2,'MAP':3,'MEASURE':4,'MANAGE':5}[fn] } {fn}"
    rows, _ = table_rows(marker)
    for r in rows[1:]:
        if len(r) < 2: continue
        ref = clean(r[0])
        if ref.lower() == "id": continue
        text = clean(r[1])
        ev = clean(r[2]) if len(r) > 2 else ""
        tests = clean(r[3]) if len(r) > 3 else ""
        order += 1
        is_cat = re.fullmatch(rf"{fn} \d+", ref) is not None
        hint = ev if ev and ev != "—" else None
        if tests and tests != "—": hint = (hint + " · Tests: " + tests) if hint else "Tests: " + tests
        nist_reqs.append({"ref": ref, "title": text if is_cat else text[:120] + ("…" if len(text) > 120 else ""), "description": None if is_cat else text, "category": fn, "evidenceHint": hint, "sortOrder": order})
frameworks.append({"code": "NIST_AI_RMF", "name": "NIST AI Risk Management Framework 1.0 (AI 100-1) + Generative AI Profile (AI 600-1)", "version": "1.0 (2023) / 600-1 (2024)", "issuer": "NIST", "description": "Voluntary framework organised in four functions — GOVERN, MAP, MEASURE, MANAGE — with 19 categories and 72 subcategories; the GenAI Profile adds 12 generative-AI risk categories. ARIA-style evaluations (AI 200-3) implement the MEASURE function.", "requirements": nist_reqs})

# ── NIST ARIA (AI 200-3) elements as requirements ──
aria = [
    ("Scope", "Scope — AI applications, sector, use cases, target concept", "Define the AI application(s) evaluated, the sector, representative use cases and the target concept (trustworthiness characteristic) to be measured (Worksheet B.1).", "Completed B.1 worksheet; evaluation plan scope record"),
    ("Design", "Design — Model Testing, Red Teaming, User Testing, tester distribution", "State the goal of each testing type used and how testers are distributed across applications and scenarios (within-/between-subjects/mixed) (Worksheet B.2).", "Completed B.2 worksheet; design rationale; power analysis if comparing systems"),
    ("Materials", "Materials — scenarios, prompt sets, instructions, questionnaires, annotation schema", "Develop scenarios (use case, sector, users, intended outcomes, expected impacts, KPIs), prompt sets, tester instructions, general and scenario-specific questionnaires and the annotation schema (Worksheet B.3).", "Scenario library entries; prompt sets; instructions; questionnaires; annotation schema"),
    ("Infrastructure", "Infrastructure — Evaluation API, data schema, testing platform, annotation tool, scoring tool", "Implement the Evaluation API (OpenConnection/CloseConnection/StartSession/GetResponse), the data schema (SessionID, Date/Time, TesterID, ApplicationID, ScenarioID, TestingType; Dialogues, Questionnaires, Annotations), testing platform, annotation tool and scoring tool (Worksheet B.4).", "Platform configuration; data schema export; session/dialogue/annotation logs"),
    ("Implementation", "Implementation — recruitment, data collection, data analysis, reporting results", "Recruit human testers and annotators (sampling frame, eligibility, sample size, IRB/consent), collect data, analyse (descriptive/inferential statistics, severity weighting, measurement trees) and report methods and results (Worksheet B.5).", "Completed B.5 worksheet; analysis outputs; evaluation report"),
]
frameworks.append({"code": "NIST_ARIA", "name": "NIST AI 200-3 — ARIA Evaluation Planning Manual (Sept 2026)", "version": "AI 200-3 (2026-09)", "issuer": "NIST", "description": "Elements of ARIA-style evaluations assessing real-world risks and impacts by combining Model Testing, Red Teaming and User Testing: Scope, Design, Materials, Infrastructure, Implementation, with worksheets B.1–B.5.", "requirements": [{"ref": r, "title": t, "description": d, "category": "ARIA elements", "evidenceHint": e, "sortOrder": i+1} for i, (r, t, d, e) in enumerate(aria)]})

# ── Korean AI Basic Act (general) ──
kr = [
    ("제2조", "정의 — 고영향 인공지능", "사람의 생명·신체 안전 및 기본권에 중대한 영향을 미치거나 위험을 초래할 우려가 있는 영역(에너지, 먹는물, 보건의료, 의료기기, 원자력, 범죄 수사 생체인식, 채용·대출 등 개인의 권리·의무에 중대한 영향을 미치는 판단·평가 등)에서 활용되는 인공지능시스템.", "AI 인벤토리의 고영향 AI 해당 여부 판단 기록 (EV-INV)"),
    ("제31조", "인공지능 투명성 확보 의무", "고영향 또는 생성형 AI 제품·서비스 제공 시 이용자에게 AI 기반 운영 사실을 사전 고지하고, 생성형 AI 결과물임을 표시하며, 딥페이크 등 실제와 구분하기 어려운 결과물은 그 사실을 명확히 고지.", "고지·표시 UX 증적, 정책 문서 (EV-UI, EV-POL) · Tests: T-TRANS"),
    ("제32조", "인공지능 안전성 확보 의무", "일정 기준 이상 고성능 AI 사업자는 생애주기 전반의 위험 식별·평가·완화 및 안전사고 모니터링·대응 체계를 구축·운영하고 그 결과를 과기정통부장관에게 제출.", "위험관리 체계 문서, 안전사고 대응 체계, 제출 이력 (EV-RISK, EV-INC, EV-PMM) · Tests: T-SAFE, T-SEC, T-ROB, T-RT"),
    ("제33조", "고영향 인공지능 확인", "사업자는 제공하려는 AI가 고영향 AI에 해당하는지 사전에 검토하고 필요시 과기정통부장관에게 확인을 요청할 수 있음.", "고영향 AI 해당성 검토·확인 기록 (EV-INV, EV-DEC) · Tests: T-CONF"),
    ("제34조", "고영향 인공지능 사업자의 책무", "①1 위험관리방안의 수립·운영, ①2 AI 최종 결과·주요 기준·학습용데이터 개요 등에 대한 설명방안 수립·시행, ①3 이용자 보호 방안, ①4 사람의 관리·감독, ①5 안전성·신뢰성 확보 조치를 확인할 수 있는 문서의 작성·보관.", "위험관리방안, 설명방안, 이용자 보호방안, 관리·감독 체계, 안전성·신뢰성 문서 (EV-RISK, EV-TECHDOC, EV-COMM, EV-PROC, EV-TEST) · Tests: T-ACC, T-BIAS, T-SEC, T-HO, T-HALL"),
    ("제35조", "인공지능 영향평가", "고영향 AI 제품·서비스가 사람의 기본권에 미치는 영향을 사전에 평가하도록 노력하고, 국가기관 등은 영향평가를 실시한 제품·서비스를 우선 고려할 수 있음.", "인공지능 영향평가서 (EV-IA) · Tests: T-BIAS, T-UX"),
    ("제40조", "사실조사 및 시정명령", "과기정통부장관은 법 위반 혐의가 있는 경우 사실조사를 실시하고 위반 사업자에게 중지·시정 등 필요한 조치를 명할 수 있음.", "조사 대응 기록, 시정조치 이행 기록 (EV-AUDIT, EV-COMM)"),
    ("제36조", "국내대리인의 지정", "일정 기준 이상 국내 주소·영업소가 없는 해외 사업자는 국내대리인을 지정하여 안전성·신뢰성 관련 업무를 대행하게 함.", "국내대리인 지정 서류 (EV-RACI)"),
]
frameworks.append({"code": "KR_AI_BASIC_ACT", "name": "인공지능 발전과 신뢰 기반 조성 등에 관한 기본법 (Korea AI Basic Act)", "version": "법률 제20676호, 2026-01-22 시행", "issuer": "대한민국 (과학기술정보통신부)", "description": "Korean AI Basic Act. Key obligations for high-impact and generative AI: transparency (제31조), safety (제32조), high-impact AI confirmation (제33조), business operator duties incl. risk management, explanation, user protection, human oversight and documentation (제34조), impact assessment (제35조). At least a one-year grace period applies to fines.", "requirements": [{"ref": r, "title": t, "description": d, "category": "고영향·생성형 AI 의무", "evidenceHint": e, "sortOrder": i+1} for i, (r, t, d, e) in enumerate(kr)]})

# ── Harmonized controls HC-01..28 ──
rows, _ = table_rows("| HC ID | Harmonized control |")
rows = [r for r in rows if clean(r[0]).startswith("HC-")]
controls = []
def expand_range(prefix, a, b):
    # a,b like "1.1","1.4" -> 1.1,1.2,1.3,1.4 ; or "A.4.3","A.4.6"
    pa, pb = a.rsplit(".", 1), b.rsplit(".", 1)
    if pa[0] != pb[0]: return [a, b]
    out = []
    for n in range(int(pa[1]), int(pb[1]) + 1):
        out.append(f"{pa[0]}.{n}")
    return out

def parse_iso(col):
    refs = []
    for tok in re.split(r",\s*", clean(col)):
        tok = tok.strip()
        if not tok or tok == "—": continue
        tok = re.sub(r"\s*\(.*?\)", "", tok).strip()
        m = re.match(r"^(A\.)?([\d.]+)[–-](A\.)?([\d.]+)$", tok)
        if m:
            a = (m.group(1) or "") + m.group(2); b = (m.group(3) or m.group(1) or "") + m.group(4)
            refs += expand_range("", a, b)
        else:
            m2 = re.match(r"^(A\.[\d.]+|[\d.]+)", tok)
            if m2: refs.append(m2.group(1))
    return refs

def parse_eu(col):
    refs = set()
    for m in re.finditer(r"Art\.?\s*(\d+)", col):
        refs.add(f"Art. {m.group(1)}")
    return sorted(refs)

def parse_nist(col):
    refs = []
    col = clean(col).split(";")
    for part in col:
        part = part.strip()
        if not part or part.startswith("600-1") or part.startswith("ARIA"): continue
        m = re.match(r"(GOVERN|MAP|MEASURE|MANAGE)\s+(.*)", part)
        if not m: continue
        fn, rest = m.group(1), m.group(2)
        rest = re.sub(r"\s*\(.*?\)", "", rest)
        for tok in re.split(r",\s*", rest):
            tok = tok.strip()
            if not tok: continue
            r = re.match(r"^([\d.]+)[–-]([\d.]+)$", tok)
            if r:
                for x in expand_range("", r.group(1), r.group(2)): refs.append(f"{fn} {x}")
            else:
                r2 = re.match(r"^\d+\.\d+", tok)
                if r2: refs.append(f"{fn} {r2.group(0)}")
    return refs

def parse_kr(col):
    return sorted(set(re.findall(r"제\d+조", col)))

def parse_aria(col):
    out = []
    for name in ["Model Testing", "Red Teaming", "User Testing"]:
        if name in col: out.append("Design")
    for element in ["Scope", "Materials", "Infrastructure", "Implementation"]:
        if f"ARIA {element}" in col: out.append(element)
    return sorted(set(out))

cat_map = {"HC-01": "Governance", "HC-02": "Governance", "HC-03": "Inventory", "HC-04": "Risk", "HC-05": "Risk", "HC-06": "Data", "HC-07": "Technical testing", "HC-08": "Technical testing", "HC-09": "Technical testing", "HC-10": "Transparency", "HC-11": "Human oversight", "HC-12": "Logging", "HC-13": "Monitoring", "HC-14": "Incidents", "HC-15": "Third parties", "HC-16": "Change management", "HC-17": "Competence", "HC-18": "Audit", "HC-19": "Governance", "HC-20": "Improvement", "HC-21": "Technical testing", "HC-22": "Technical testing", "HC-23": "Agent governance", "HC-24": "Transparency", "HC-25": "Conformity", "HC-26": "Privacy", "HC-27": "Environment", "HC-28": "Stakeholders"}
for i, r in enumerate(rows):
    if len(r) < 8: continue
    code = clean(r[0])
    if not code.startswith("HC-"): continue
    controls.append({
        "code": code, "name": clean(r[1]), "category": cat_map.get(code, "General"), "sortOrder": i + 1,
        "description": f"ISO/IEC 42001: {clean(r[2])} · EU AI Act: {clean(r[3])} · NIST AI RMF: {clean(r[4])} · KR AI Basic Act: {clean(r[5])}",
        "testHint": clean(r[7]) if clean(r[7]) != "—" else None,
        "evidenceTypes": clean(r[6]),
        "mappings": {"ISO_42001": parse_iso(r[2]), "EU_AI_ACT": parse_eu(r[3]), "NIST_AI_RMF": parse_nist(r[4]), "KR_AI_BASIC_ACT": parse_kr(r[5]), "NIST_ARIA": parse_aria(r[4])},
    })

out = {"frameworks": frameworks, "controls": controls}
json.dump(out, open("prisma/seed-data/frameworks.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for f in frameworks: print(f["code"], len(f["requirements"]))
print("controls", len(controls))
# sanity: unresolved mapping refs
for f in frameworks:
    refs = {r["ref"] for r in f["requirements"]}
    missing = set()
    for c in controls:
        for m in c["mappings"].get(f["code"], []):
            if m not in refs: missing.add(m)
    if missing: print("UNRESOLVED", f["code"], sorted(missing)[:30])
