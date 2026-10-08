import { db } from "@/lib/db";

/** Vendor / dataset links for an AI system, resolved by id or by (case-insensitive) name within the organisation. */
export type VendorLink = { id?: string; name?: string; role?: string | null; serviceType?: string | null; country?: string | null };
export type DatasetLink = { id?: string; name?: string; purpose?: string | null; containsPii?: boolean; sensitivity?: string | null };
export type LinkSpec = { vendors: VendorLink[]; datasets: DatasetLink[] };

const PROVIDER_SKIP = new Set(["", "in-house", "inhouse", "internal", "unknown", "n/a", "none", "자체", "자체 개발", "사내", "intern", "interne", "interno", "propio", "maison"]);

/** "name | role | serviceType | country" per line → vendor links. */
export function parseVendorLines(text?: string | null): VendorLink[] {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, role, serviceType, country] = l.split("|").map((x) => x.trim());
    return { name, role: role || null, serviceType: serviceType || null, country: country || null };
  }).filter((v) => v.name);
}
/** "name | purpose | PII(yes/no) | sensitivity" per line → dataset links. */
export function parseDatasetLines(text?: string | null, yes: (v: string) => boolean = (v) => /^(y|yes|true|1|예|네|ja|oui|sì|si|sí|o)$/i.test(v)): DatasetLink[] {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, purpose, pii, sensitivity] = l.split("|").map((x) => x.trim());
    return { name, purpose: purpose || null, containsPii: pii ? yes(pii) : undefined, sensitivity: sensitivity || null };
  }).filter((d) => d.name);
}

/** Vendor derived from the model provider field (Anthropic → "LLM provider"); null for in-house / unknown. */
export function vendorFromProvider(provider?: string | null): VendorLink | null {
  const p = (provider ?? "").trim();
  if (PROVIDER_SKIP.has(p.toLowerCase())) return null;
  return { name: p, role: "LLM provider", serviceType: "Foundation model API" };
}

async function resolveVendor(orgId: string, v: VendorLink) {
  if (v.id) { const found = await db.vendor.findFirst({ where: { id: v.id, orgId } }); if (found) return found; }
  if (!v.name) return null;
  const existing = await db.vendor.findFirst({ where: { orgId, name: { equals: v.name, mode: "insensitive" } } });
  if (existing) return existing;
  return db.vendor.create({ data: { orgId, name: v.name, serviceType: v.serviceType ?? undefined, country: v.country ?? undefined } });
}
async function resolveDataset(orgId: string, d: DatasetLink) {
  if (d.id) { const found = await db.dataset.findFirst({ where: { id: d.id, orgId } }); if (found) return found; }
  if (!d.name) return null;
  const existing = await db.dataset.findFirst({ where: { orgId, name: { equals: d.name, mode: "insensitive" } } });
  if (existing) return existing;
  return db.dataset.create({ data: { orgId, name: d.name, containsPii: d.containsPii ?? false, sensitivity: d.sensitivity ?? undefined } });
}

/**
 * Applies vendor/dataset links to a system. In replace mode links not present in the spec are removed.
 * Returns the vendor/dataset names now linked plus whether the vendor set changed (for change events).
 */
export async function syncSystemLinks(orgId: string, systemId: string, spec: LinkSpec, opts: { replace?: boolean } = {}) {
  const before = await db.systemVendor.findMany({ where: { systemId }, select: { vendorId: true } });
  const vendorIds = new Set<string>();
  for (const v of spec.vendors) {
    const vendor = await resolveVendor(orgId, v); if (!vendor || vendorIds.has(vendor.id)) continue;
    vendorIds.add(vendor.id);
    await db.systemVendor.upsert({ where: { systemId_vendorId: { systemId, vendorId: vendor.id } }, create: { systemId, vendorId: vendor.id, role: v.role ?? vendor.serviceType ?? undefined }, update: { role: v.role ?? undefined } });
  }
  const datasetIds = new Set<string>();
  for (const d of spec.datasets) {
    const ds = await resolveDataset(orgId, d); if (!ds || datasetIds.has(ds.id)) continue;
    datasetIds.add(ds.id);
    await db.systemDataset.upsert({ where: { systemId_datasetId: { systemId, datasetId: ds.id } }, create: { systemId, datasetId: ds.id, purpose: d.purpose ?? undefined }, update: { purpose: d.purpose ?? undefined } });
  }
  if (opts.replace) {
    await db.systemVendor.deleteMany({ where: { systemId, vendorId: { notIn: [...vendorIds] } } });
    await db.systemDataset.deleteMany({ where: { systemId, datasetId: { notIn: [...datasetIds] } } });
  }
  const after = await db.systemVendor.findMany({ where: { systemId }, select: { vendorId: true } });
  const vendorsChanged = before.length !== after.length || before.some((b) => !after.find((a) => a.vendorId === b.vendorId));
  return { vendorIds: [...vendorIds], datasetIds: [...datasetIds], vendorsChanged };
}

/** Reads the intake form's vendor/dataset section into a LinkSpec (existing ids with role/purpose + new entries typed as lines). */
export function linksFromForm(fd: FormData, d: { vendors?: string; datasets?: string; modelProvider?: string; linkProviderVendor?: boolean }): LinkSpec {
  const vendors: VendorLink[] = fd.getAll("vendorIds").map(String).filter(Boolean).map((id) => ({ id, role: String(fd.get(`vendorRole:${id}`) || "") || null }));
  const datasets: DatasetLink[] = fd.getAll("datasetIds").map(String).filter(Boolean).map((id) => ({ id, purpose: String(fd.get(`datasetPurpose:${id}`) || "") || null }));
  vendors.push(...parseVendorLines(d.vendors));
  datasets.push(...parseDatasetLines(d.datasets));
  if (d.linkProviderVendor ?? true) { const pv = vendorFromProvider(d.modelProvider); if (pv && !vendors.some((v) => v.name?.toLowerCase() === pv.name!.toLowerCase())) vendors.push(pv); }
  return { vendors, datasets };
}
