/** Requirement refs that only group sub-clauses (e.g. ISO "A.2" when "A.2.2" exists); without own controls they are not assessed. */
export function headingRefs(refs: string[]): Set<string> {
  return new Set(refs.filter((r) => refs.some((x) => x !== r && x.startsWith(`${r}.`))));
}
