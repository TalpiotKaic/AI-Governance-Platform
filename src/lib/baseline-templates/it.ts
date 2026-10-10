import type { BaselineSet } from "@/lib/baseline-documents";

// Baseline governance document templates (it). Placeholders in [ ] are filled in by the organisation.
export const it: BaselineSet = {
  ai_policy: { title: "Politica sull'IA", body: (o, sys) => `# Politica sull'IA

## 1. Scopo
${o} adotta la presente politica per sviluppare, acquisire e gestire sistemi di IA in modo sicuro, equo e trasparente.

## 2. Ambito di applicazione
Tutti i sistemi di IA che l'organizzazione sviluppa, acquisisce o utilizza, compresa l'IA esterna fornita in modalità SaaS. Sistemi attualmente presenti nell'inventario dell'IA:

${sys}

## 3. Principi
- **Responsabilità (accountability)**: ogni sistema di IA ha un responsabile designato.
- **Equità**: la discriminazione nei confronti di gruppi protetti viene verificata e prevenuta.
- **Trasparenza**: gli utenti vengono informati quando interagiscono con l'IA e i contenuti generati sono contrassegnati.
- **Sicurezza e protezione**: i rischi sono valutati e testati prima della messa in servizio.
- **Privacy**: si utilizzano solo i dati minimi necessari.
- **Sorveglianza umana**: le decisioni significative sono riesaminate da persone.

## 4. Obblighi
1. Ogni sistema di IA è registrato nell'inventario dell'IA e sottoposto a valutazione del rischio prima dell'uso.
2. I sistemi ad alto rischio sono testati e approvati prima della messa in servizio.
3. Dati personali, dati riservati e codice sorgente non vengono inseriti in strumenti di IA generativa senza approvazione.
4. Gli incidenti relativi all'IA e i comportamenti anomali sono segnalati immediatamente.
5. Ruoli e responsabilità seguono il documento "Ruoli e responsabilità per l'IA (RACI)".

## 5. Conformità
ISO/IEC 42001, il regolamento UE sull'IA (AI Act), il NIST AI RMF e la legge quadro coreana sull'IA.

## 6. Riesame
Riesaminata almeno una volta l'anno e ogni volta che la normativa o l'attività cambiano in modo significativo.

Approvata da: [nome] · In vigore dal: [data]
` },
  roles: { title: "Ruoli e responsabilità per l'IA (RACI)", body: (o) => `# Ruoli e responsabilità per l'IA (RACI)

Ruoli e responsabili della governance dell'IA presso ${o}. Sostituire i segnaposto [ ] con le persone effettive.

## 1. Ruoli
| Ruolo | Persona | Responsabilità principali |
|---|---|---|
| Sponsor esecutivo dell'IA | [nome] | Approva la politica sull'IA, assegna le risorse, riesame della direzione |
| Responsabile della governance dell'IA | [nome] | Inventario, rischi e documenti; coordina l'approvazione della messa in servizio |
| Responsabile del sistema | per ciascun sistema | Registra il sistema, tratta i rischi, registra le modifiche |
| Responsabile dei test | [nome] | Pianifica ed esegue le valutazioni, gestisce i risultati |
| Revisore | [nome] | Riesamina i risultati dei test e i documenti (indipendente dall'autore) |
| Approvatore | [nome] | Emette i report, approva la messa in servizio e l'accettazione del rischio |
| Responsabile della protezione dei dati | [nome] | Valutazione d'impatto sulla protezione dei dati, riesame dei trattamenti |
| Responsabile della sicurezza delle informazioni | [nome] | Test di sicurezza, due diligence sulla sicurezza dei fornitori |

## 2. RACI (R responsabile dell'esecuzione · A responsabile finale · C consultato · I informato)
| Attività | Responsabile della governance | Responsabile del sistema | Responsabile dei test | Revisore | Approvatore |
|---|---|---|---|---|---|
| Registrazione e classificazione dei sistemi di IA | A | R | I | I | I |
| Valutazione e trattamento del rischio | A | R | C | C | I |
| Test e valutazione | I | C | R | A | I |
| Redazione e approvazione dei documenti di governance | R | C | I | C | A |
| Approvazione della messa in servizio | R | C | C | C | A |
| Risposta agli incidenti | A | R | C | I | I |
| Due diligence sui fornitori | A | R | I | C | I |
| Formazione sull'alfabetizzazione in materia di IA | A | R | I | I | I |

## 3. Separazione dei compiti
Autore e revisore sono persone diverse; chi esegue i test non approva i propri risultati.
` },
  objectives: { title: "Obiettivi e piano per l'IA", body: (o) => `# Obiettivi e piano per l'IA

Obiettivi del sistema di gestione dell'IA di ${o} e modalità per conseguirli. Riesaminati annualmente nel riesame della direzione.

| Obiettivo | Indicatore | Traguardo | Responsabile | Verifica |
|---|---|---|---|---|
| Conoscere ogni sistema di IA | Tasso di registrazione nell'inventario dell'IA | 100% | Responsabile della governance | Trimestrale |
| Verificare prima della messa in servizio | Sistemi ad alto rischio valutati prima della messa in servizio | 100% | Responsabile dei test | Alla messa in servizio |
| Trattare i rischi nei tempi previsti | Rischi trattati entro la scadenza | ≥ 90% | Responsabili dei sistemi | Mensile |
| Mantenere aggiornati i documenti | Documenti di governance oltre la data di riesame | 0 | Responsabile della governance | Mensile |
| Alfabetizzazione in materia di IA | Completamento della formazione | ≥ 95% | Risorse umane / formazione | Semestrale |
| Prevenire gli incidenti | Incidenti gravi relativi all'IA | 0 | Tutti | Continua |

## Risorse
Le persone, il budget e gli strumenti (incluso K-VeriAI) necessari per conseguire gli obiettivi sono assegnati nel riesame della direzione.

## Ordine del giorno del riesame della direzione
Raggiungimento degli obiettivi, stato dei rischi, risultati dei test, incidenti, risultati degli audit, evoluzioni normative, miglioramenti.
` },
  risk_procedure: { title: "Procedura di valutazione e trattamento del rischio dell'IA", body: (o) => `# Procedura di valutazione e trattamento del rischio dell'IA

Modalità con cui ${o} identifica, valuta, tratta e monitora i rischi dell'IA.

## 1. Identificazione
- I rischi iniziali sono generati dalle risposte al questionario di ingresso al momento della registrazione di un sistema.
- Le risultanze dei test HIGH/CRITICAL, gli incidenti e gli esiti della due diligence sui fornitori aggiungono rischi.

## 2. Valutazione
- Assegnare probabilità (L) e gravità (S) su una scala da 1 a 5.
- Punteggio = (L × 1 + S × 3) ÷ 20 × 100. ≥ 80 critico, 60–79 alto, 35–59 medio, < 35 basso.

## 3. Trattamento
- Scegliere tra mitigare, accettare, evitare o trasferire e registrare la misura di mitigazione.
- Scadenze: critico 30 giorni, alto 45 giorni, altri 90 giorni.
- Registrare L·S residui dopo la mitigazione. L'accettazione del rischio residuo è approvata da un approvatore.

## 4. Valutazione d'impatto
L'IA ad alto rischio / ad alto impatto e i sistemi che trattano dati personali sono sottoposti a una valutazione d'impatto (diritti fondamentali, privacy) prima della messa in servizio.

## 5. Monitoraggio e rivalutazione
- I rischi scaduti sono segnalati nella dashboard e come attività.
- Le modifiche a versione del modello, prompt, strumenti o fonti di dati sono registrate e i test interessati vengono rieseguiti.
` },
  records: { title: "Regole per le registrazioni e il controllo dei documenti sull'IA", body: (o) => `# Regole per le registrazioni e il controllo dei documenti sull'IA

Modalità con cui ${o} crea, conserva e controlla i documenti e le registrazioni relativi all'IA.

## 1. Ambito di applicazione
Documenti di governance (politiche, procedure, piani), risultati dei test e report, evidenze, registro dei rischi, registrazioni delle modifiche, approvazioni, registrazioni degli incidenti e log di sistema.

## 2. Redazione e approvazione
- I documenti di governance sono redatti in K-VeriAI "Politiche e documenti" e approvati da un revisore diverso dall'autore.
- Sono conservate le versioni e la cronologia delle revisioni; quando una revisione viene approvata, la versione precedente è conservata come "Sostituito".

## 3. Conservazione e integrità
- Evidenze e report sono conservati nel Centro evidenze di K-VeriAI insieme all'hash SHA-256 del file.
- Ogni modifica viene scritta nel registro di audit.

## 4. Periodo di conservazione
| Registrazione | Conservazione |
|---|---|
| Documentazione tecnica e registrazioni di conformità dell'IA ad alto rischio | 10 anni dall'immissione sul mercato |
| Log generati automaticamente | almeno 6 mesi |
| Altri documenti e registrazioni | [periodo] |

## 5. Controllo degli accessi
Autorizzazioni basate sui ruoli limitano chi può leggere e modificare le registrazioni. Solo i report approvati sono condivisi all'esterno.

## 6. Riesame
Ogni documento è riesaminato secondo il proprio ciclo di riesame; dopo la data di riesame non è più considerato un'evidenza.
` },
  literacy: { title: "Piano di formazione sull'alfabetizzazione in materia di IA", body: (o) => `# Piano di formazione sull'alfabetizzazione in materia di IA

${o} forma tutte le persone che utilizzano o gestiscono l'IA al livello richiesto dal loro ruolo.

| Destinatari | Contenuti | Quando | Modalità |
|---|---|---|---|
| Tutto il personale | Politica sull'IA, usi consentiti e vietati, divieto di inserire dati personali o riservati, segnalazione degli incidenti | All'assunzione, annualmente | Online |
| Responsabili dei sistemi | Valutazione del rischio, registrazione delle modifiche, sorveglianza umana | Alla nomina, annualmente | Workshop |
| Personale addetto a test e revisione | Metodi di valutazione, red teaming, criteri di giudizio, bias | Alla nomina, annualmente | Workshop |
| Direzione | Evoluzioni normative, responsabilità, riesame della direzione | Annualmente | Briefing |

## Registrazioni
Fogli presenze e tassi di completamento sono registrati nel Centro evidenze come "Registro formazione".

## Traguardo
Completamento ≥ 95%; chi non ha partecipato viene formato entro 30 giorni.
` },
};
