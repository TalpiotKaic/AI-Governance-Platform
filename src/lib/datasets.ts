// Dataset register vocabularies. Stored values stay English (reports, Excel import and the API compare on them);
// labels are translated at render time.
export const SENSITIVITY_LEVELS = ["public", "internal", "confidential", "restricted"] as const;
export const DATASET_PURPOSES = ["training", "evaluation", "retrieval", "inference input"] as const;

type T = (key: string) => string;
export function sensitivityLabel(t: T, v: string | null | undefined): string {
  if (!v) return "";
  return (SENSITIVITY_LEVELS as readonly string[]).includes(v) ? t(v) : v;
}
export function purposeLabel(t: T, v: string | null | undefined): string {
  if (!v) return "";
  return (DATASET_PURPOSES as readonly string[]).includes(v) ? t(v) : v;
}
