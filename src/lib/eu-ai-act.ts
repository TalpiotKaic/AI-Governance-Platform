/** EU AI Act (Reg. (EU) 2024/1689) Annex III high-risk areas — reference list for the intake form and the Excel template. */
export const ANNEX_III_AREAS = [
  { n: 1, label: "Biometrics", description: "Remote biometric identification, biometric categorisation by sensitive attributes, emotion recognition." },
  { n: 2, label: "Critical infrastructure", description: "Safety components in the management and operation of critical digital infrastructure, road traffic, or the supply of water, gas, heating and electricity." },
  { n: 3, label: "Education and vocational training", description: "Access or admission, evaluation of learning outcomes, assessment of the appropriate level of education, monitoring of prohibited behaviour during tests." },
  { n: 4, label: "Employment, workers management and access to self-employment", description: "Recruitment and selection (targeted ads, screening, evaluating candidates), decisions on promotion or termination, task allocation, monitoring and evaluation of workers." },
  { n: 5, label: "Access to essential private and public services and benefits", description: "Eligibility for public assistance, creditworthiness assessment and credit scoring, risk assessment and pricing in life and health insurance, triage of emergency calls." },
  { n: 6, label: "Law enforcement", description: "Victim risk assessment, polygraphs, evaluation of evidence reliability, assessing the risk of offending or re-offending, profiling in criminal investigations." },
  { n: 7, label: "Migration, asylum and border control", description: "Polygraphs, risk assessments of persons, examination of asylum, visa and residence applications, detection and identification of persons." },
  { n: 8, label: "Administration of justice and democratic processes", description: "Assisting judicial authorities in researching and interpreting facts and law, or influencing the outcome of elections or voting behaviour." },
] as const;

/** Display string stored in the free-text Annex III field when an area is picked from the list. */
export function annexRef(t: (k: string) => string, a: (typeof ANNEX_III_AREAS)[number]) {
  return `${t("Annex III")} §${a.n}`;
}
export function annexAreaValue(t: (k: string) => string, a: (typeof ANNEX_III_AREAS)[number]) {
  return `${annexRef(t, a)} — ${t(a.label)}`;
}
