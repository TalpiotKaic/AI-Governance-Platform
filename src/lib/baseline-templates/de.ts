import type { BaselineSet } from "@/lib/baseline-documents";

// Baseline governance document templates (de). Placeholders in [ ] are filled in by the organisation.
export const de: BaselineSet = {
  ai_policy: { title: "KI-Richtlinie", body: (o, sys) => `# KI-Richtlinie

## 1. Zweck
${o} legt diese Richtlinie fest, um KI-Systeme sicher, fair und transparent zu entwickeln, zu beschaffen und zu betreiben.

## 2. Geltungsbereich
Alle KI-Systeme, die die Organisation entwickelt, beschafft oder nutzt, einschließlich externer SaaS-KI. Derzeit im KI-Inventar erfasste Systeme:

${sys}

## 3. Grundsätze
- **Rechenschaftspflicht**: Für jedes KI-System ist eine verantwortliche Person benannt.
- **Fairness**: Diskriminierung geschützter Gruppen wird getestet und verhindert.
- **Transparenz**: Nutzer werden informiert, wenn sie mit KI interagieren, und generierte Inhalte werden gekennzeichnet.
- **Sicherheit und Informationssicherheit**: Risiken werden vor der Inbetriebnahme bewertet und getestet.
- **Datenschutz**: Es werden nur die minimal erforderlichen Daten verwendet.
- **Menschliche Aufsicht**: Wesentliche Entscheidungen werden von Menschen überprüft.

## 4. Pflichten
1. Jedes KI-System wird vor der Nutzung im KI-Inventar registriert und einer Risikobewertung unterzogen.
2. Hochrisiko-Systeme werden vor der Inbetriebnahme getestet und freigegeben.
3. Personenbezogene und vertrauliche Daten sowie Quellcode werden ohne Genehmigung nicht in generative KI-Werkzeuge eingegeben.
4. KI-Vorfälle und auffälliges Verhalten werden unverzüglich gemeldet.
5. Rollen und Verantwortlichkeiten richten sich nach „KI-Rollen und Verantwortlichkeiten (RACI)“.

## 5. Compliance
ISO/IEC 42001, die EU-KI-Verordnung (AI Act), das NIST AI RMF und das koreanische KI-Grundgesetz.

## 6. Überprüfung
Die Richtlinie wird mindestens jährlich sowie bei wesentlichen rechtlichen oder geschäftlichen Änderungen überprüft.

Genehmigt von: [Name] · Gültig ab: [Datum]
` },
  roles: { title: "KI-Rollen und Verantwortlichkeiten (RACI)", body: (o) => `# KI-Rollen und Verantwortlichkeiten (RACI)

Rollen und Verantwortliche der KI-Governance bei ${o}. Ersetzen Sie die Platzhalter in [ ] durch die tatsächlichen Personen.

## 1. Rollen
| Rolle | Person | Hauptaufgaben |
|---|---|---|
| KI-Sponsor der Geschäftsleitung | [Name] | Genehmigt die KI-Richtlinie, stellt Ressourcen bereit, Managementbewertung |
| KI-Governance-Verantwortliche/r | [Name] | Inventar, Risiken und Dokumente; koordiniert die Freigabe zur Inbetriebnahme |
| Systemverantwortliche/r | je System | Registriert das System, behandelt Risiken, dokumentiert Änderungen |
| Testleitung | [Name] | Plant und führt Evaluierungen durch, verwaltet Ergebnisse |
| Prüfer/in | [Name] | Prüft Testergebnisse und Dokumente (unabhängig vom Verfasser) |
| Genehmiger/in | [Name] | Gibt Berichte heraus, genehmigt Inbetriebnahme und Risikoakzeptanz |
| Datenschutzbeauftragte/r | [Name] | Datenschutz-Folgenabschätzung, Prüfung der Datenverarbeitung |
| Informationssicherheitsbeauftragte/r | [Name] | Sicherheitstests, Sicherheitsprüfung von Anbietern |

## 2. RACI (R durchführungsverantwortlich · A rechenschaftspflichtig · C konsultiert · I informiert)
| Tätigkeit | Governance-Verantwortliche/r | Systemverantwortliche/r | Testleitung | Prüfer/in | Genehmiger/in |
|---|---|---|---|---|---|
| KI-Systeme registrieren und klassifizieren | A | R | I | I | I |
| Risikobewertung und -behandlung | A | R | C | C | I |
| Tests und Evaluierung | I | C | R | A | I |
| Governance-Dokumente erstellen und genehmigen | R | C | I | C | A |
| Freigabe zur Inbetriebnahme | R | C | C | C | A |
| Reaktion auf Vorfälle | A | R | C | I | I |
| Due-Diligence-Prüfung von Anbietern | A | R | I | C | I |
| Schulung zur KI-Kompetenz | A | R | I | I | I |

## 3. Funktionstrennung
Verfasser und Prüfer sind unterschiedliche Personen; Tester genehmigen ihre eigenen Ergebnisse nicht.
` },
  objectives: { title: "KI-Ziele und Planung", body: (o) => `# KI-Ziele und Planung

Ziele des KI-Managementsystems bei ${o} und wie sie erreicht werden. Jährliche Überprüfung im Rahmen der Managementbewertung.

| Ziel | Kennzahl | Zielwert | Verantwortlich | Prüfung |
|---|---|---|---|---|
| Alle KI-Systeme kennen | Erfassungsquote im KI-Inventar | 100% | Governance-Verantwortliche/r | Quartalsweise |
| Vor der Inbetriebnahme verifizieren | Vor Inbetriebnahme evaluierte Hochrisiko-Systeme | 100% | Testleitung | Bei Inbetriebnahme |
| Risiken fristgerecht behandeln | Fristgerecht behandelte Risiken | ≥ 90% | Systemverantwortliche | Monatlich |
| Dokumente aktuell halten | Governance-Dokumente mit überschrittenem Prüfdatum | 0 | Governance-Verantwortliche/r | Monatlich |
| KI-Kompetenz | Schulungsabschlussquote | ≥ 95% | Personalabteilung / Schulung | Halbjährlich |
| Vorfälle verhindern | Schwerwiegende KI-Vorfälle | 0 | Alle | Laufend |

## Ressourcen
Personal, Budget und Werkzeuge (einschließlich K-VeriAI), die zur Erreichung der Ziele erforderlich sind, werden im Rahmen der Managementbewertung bereitgestellt.

## Tagesordnung der Managementbewertung
Zielerreichung, Risikostatus, Testergebnisse, Vorfälle, Auditergebnisse, regulatorische Änderungen, Verbesserungen.
` },
  risk_procedure: { title: "Verfahren zur KI-Risikobewertung und -behandlung", body: (o) => `# Verfahren zur KI-Risikobewertung und -behandlung

Wie ${o} KI-Risiken identifiziert, bewertet, behandelt und überwacht.

## 1. Identifizieren
- Erste Risiken werden bei der Registrierung eines Systems aus den Antworten des Erfassungsfragebogens erzeugt.
- Testbefunde der Stufe HIGH/CRITICAL, Vorfälle und Ergebnisse der Anbieter-Due-Diligence führen zu weiteren Risiken.

## 2. Bewerten
- Eintrittswahrscheinlichkeit (L) und Schweregrad (S) werden von 1 bis 5 bewertet.
- Punktzahl = (L × 1 + S × 3) ÷ 20 × 100. ≥ 80 kritisch, 60–79 hoch, 35–59 mittel, < 35 niedrig.

## 3. Behandeln
- Wählen Sie Minderung, Akzeptanz, Vermeidung oder Übertragung und dokumentieren Sie die Maßnahme.
- Fristen: kritisch 30 Tage, hoch 45 Tage, übrige 90 Tage.
- Dokumentieren Sie das Restrisiko L·S nach der Minderung. Die Akzeptanz von Restrisiken wird von einem Genehmiger genehmigt.

## 4. Folgenabschätzung
Für Hochrisiko-KI bzw. KI mit hoher Tragweite sowie für Systeme, die personenbezogene Daten verarbeiten, wird vor der Inbetriebnahme eine Folgenabschätzung (Grundrechte, Datenschutz) durchgeführt.

## 5. Überwachen und neu bewerten
- Überfällige Risiken werden im Dashboard und als Aufgaben gekennzeichnet.
- Änderungen an Modellversion, Prompt, Werkzeugen oder Datenquellen werden dokumentiert und die betroffenen Tests erneut ausgeführt.
` },
  records: { title: "Regeln zu KI-Aufzeichnungen und Dokumentenlenkung", body: (o) => `# Regeln zu KI-Aufzeichnungen und Dokumentenlenkung

Wie ${o} KI-Dokumente und -Aufzeichnungen erstellt, aufbewahrt und lenkt.

## 1. Geltungsbereich
Governance-Dokumente (Richtlinien, Verfahren, Pläne), Testergebnisse und Berichte, Nachweise, das Risikoregister, Änderungsaufzeichnungen, Genehmigungen, Vorfallsaufzeichnungen und Systemprotokolle.

## 2. Erstellung und Genehmigung
- Governance-Dokumente werden in K-VeriAI unter „Richtlinien & Dokumente“ erstellt und von einem Prüfer genehmigt, der nicht der Verfasser ist.
- Versionen und Änderungshistorie werden aufbewahrt; wird eine Überarbeitung genehmigt, bleibt die vorherige Version als „Ersetzt“ erhalten.

## 3. Speicherung und Integrität
- Nachweise und Berichte werden im Nachweiszentrum von K-VeriAI zusammen mit dem SHA-256-Hash der Datei aufbewahrt.
- Jede Änderung wird im Audit-Log protokolliert.

## 4. Aufbewahrung
| Aufzeichnung | Aufbewahrungsfrist |
|---|---|
| Technische Dokumentation und Konformitätsnachweise für Hochrisiko-KI | 10 Jahre nach dem Inverkehrbringen |
| Automatisch erzeugte Protokolle | mindestens 6 Monate |
| Sonstige Dokumente und Aufzeichnungen | [Zeitraum] |

## 5. Zugriffskontrolle
Rollenbasierte Berechtigungen beschränken, wer Aufzeichnungen lesen und ändern darf. Nur genehmigte Berichte werden extern weitergegeben.

## 6. Überprüfung
Jedes Dokument wird gemäß seinem Prüfzyklus überprüft; nach Ablauf des Prüfdatums gilt es nicht mehr als Nachweis.
` },
  literacy: { title: "Schulungsplan zur KI-Kompetenz", body: (o) => `# Schulungsplan zur KI-Kompetenz

${o} schult alle Personen, die KI nutzen oder verwalten, auf dem für ihre Rolle erforderlichen Niveau.

| Zielgruppe | Inhalt | Zeitpunkt | Format |
|---|---|---|---|
| Alle Mitarbeitenden | KI-Richtlinie, erlaubte und verbotene Nutzungen, keine Eingabe personenbezogener oder vertraulicher Daten, Meldung von Vorfällen | Bei Eintritt, jährlich | Online |
| Systemverantwortliche | Risikobewertung, Änderungsaufzeichnungen, menschliche Aufsicht | Bei Ernennung, jährlich | Workshop |
| Test- und Prüfpersonal | Evaluierungsmethoden, Red Teaming, Bewertungskriterien, Bias | Bei Ernennung, jährlich | Workshop |
| Geschäftsleitung | Regulatorische Entwicklungen, Rechenschaftspflicht, Managementbewertung | Jährlich | Briefing |

## Aufzeichnungen
Teilnehmerlisten und Abschlussquoten werden im Nachweiszentrum als „Schulungsnachweis“ erfasst.

## Zielwert
Abschlussquote ≥ 95%; wer die Schulung versäumt hat, wird innerhalb von 30 Tagen geschult.
` },
};
