// Renders docs/images/{governance-chain,role-cycle}.<lang>.png from scripts/guide-images/texts.json.
// Usage: node scripts/guide-images/render.mjs   (needs playwright-core + Chromium; a CJK font for ko)
import { chromium } from "playwright-core";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const T = JSON.parse(readFileSync(join(here, "texts.json"), "utf8"));
const LANGS = ["ko", "en", "de", "fr", "it", "es"];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

const CSS = `
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; font-family: "Inter", "Noto Sans", "Noto Sans CJK KR", "Noto Sans KR", "DejaVu Sans", sans-serif; color: #1f2937; }
  .wrap { position: relative; width: 1340px; padding: 28px 40px 24px; background: #fff; }
  h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { font-size: 14px; color: #6b7280; margin: 0 0 18px; }
  .box { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1.5px solid #c9cdbf; border-radius: 10px; background: #fff; padding: 6px 10px; font-size: 15px; line-height: 1.25; }
  .box b { font-size: 16px; font-weight: 700; }
  .box span { color: #6b7280; font-size: 14px; margin-top: 3px; }
  .box.hi { border-color: #2563eb; background: #e8f0fe; border-width: 2px; }
  .box.hi b, .box.hi { color: #111827; }
  .lane { position: absolute; left: 40px; right: 40px; border-top: 1px solid #e5e7eb; }
  .lanelabel { position: absolute; left: 40px; font-weight: 700; font-size: 16px; }
  .note { position: absolute; font-size: 14px; color: #6b7280; line-height: 1.3; }
  .footer { position: absolute; left: 40px; right: 40px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 14px; color: #4b5563; }
  svg { position: absolute; left: 0; top: 0; overflow: visible; }
  svg line, svg polyline, svg path { stroke: #c9cdbf; stroke-width: 1.5; fill: none; }
  svg .dash { stroke-dasharray: 5 5; }
  svg .solid-hi { stroke: #9ca3af; }
`;
const ARROW = `<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#c9cdbf" stroke="none"/></marker></defs>`;
const line = (x1, y1, x2, y2, cls = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="url(#a)"/>`;
const poly = (pts, cls = "dash") => `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" class="${cls}" marker-end="url(#a)"/>`;

function chainHtml(t) {
  const W = 1340, bw = 184, bh = 90, gap = 34, y = 112, x0 = 40;
  const xs = t.steps.map((_, i) => x0 + i * (bw + gap));
  const boxes = t.steps.map(([a, b], i) => `<div class="box ${i === 3 ? "hi" : ""}" style="left:${xs[i]}px;top:${y}px;width:${bw}px;height:${bh}px"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join("");
  const arrows = xs.slice(1).map((x, i) => line(xs[i] + bw + 2, y + bh / 2, x - 2, y + bh / 2)).join("");
  const c4 = xs[3] + bw / 2, c1 = xs[0] + bw / 2, c6 = xs[5] + bw / 2;
  const l1 = poly([[c4, y + bh + 2], [c4, y + bh + 108], [c1, y + bh + 108], [c1, y + bh + 4]]);
  const l2 = poly([[c4 - 70, y + bh + 2], [c4 - 70, y + bh + 178], [c6, y + bh + 178], [c6, y + bh + 4]]);
  return `<div class="wrap" style="height:500px"><h1>${esc(t.title)}</h1>
    <svg width="${W}" height="500">${ARROW}${arrows}${l1}${l2}</svg>${boxes}
    <div class="note" style="left:${c1 + 40}px;top:${y + bh + 116}px">${esc(t.loop1)}</div>
    <div class="note" style="left:${c4 - 40}px;top:${y + bh + 186}px">${esc(t.loop2)}</div>
    <div class="footer" style="top:440px">${esc(t.footer)}</div></div>`;
}

function cycleHtml(t) {
  const W = 1400, laneTop = 95, laneH = 118, bw = 216, bh = 72;
  const cx = [280, 540, 802, 1064]; // box left x per column
  const cy = (lane) => laneTop + lane * laneH + (laneH - bh) / 2;
  const B = (k, col, lane, hi = false) => `<div class="box ${hi ? "hi" : ""}" style="left:${cx[col]}px;top:${cy(lane)}px;width:${bw}px;height:${bh}px"><b>${esc(t.boxes[k])}</b></div>`;
  const lanes = t.lanes.map((l, i) => `<div class="lane" style="top:${laneTop + i * laneH}px"></div><div class="lanelabel" style="top:${cy(i) + bh / 2 - 10}px">${esc(l)}</div>`).join("") + `<div class="lane" style="top:${laneTop + 5 * laneH}px"></div>`;
  const mx = (c) => cx[c] + bw / 2;
  const arrows = [
    line(mx(0), cy(0) + bh + 2, mx(0), cy(1) - 2),            // reg -> plan
    line(cx[0] + bw + 2, cy(1) + bh / 2, cx[1] - 2, cy(1) + bh / 2), // plan -> report
    line(mx(1), cy(1) + bh + 2, mx(1), cy(2) - 2),            // report -> annot
    line(cx[1] + bw + 2, cy(2) + bh / 2, cx[2] - 2, cy(2) + bh / 2), // annot -> review
    line(mx(2), cy(2) + bh + 2, mx(2), cy(3) - 2),            // review -> approve
    line(cx[2] + bw + 2, cy(3) + bh / 2, cx[3] - 2, cy(3) + bh / 2), // approve -> issue
    // returned to draft: from the annotation step down to the note, then back up to "generate report"
    `<polyline points="${cx[1] + 8},${cy(2) + bh + 2} ${cx[1] + 8},${cy(3) - 4}" class="dash"/>`,
    poly([[cx[1] + 8, cy(2) - 2], [cx[1] + 8, cy(1) + bh + 4]]),
    poly([[mx(3), cy(3) - 2], [mx(3), cy(0) + bh / 2]]),
  ].join("");
  return `<div class="wrap" style="width:${W}px;height:${laneTop + 5 * laneH + 40}px"><h1>${esc(t.title)}</h1><p class="sub">${esc(t.subtitle)}</p>
    <svg width="${W}" height="${laneTop + 5 * laneH + 40}">${ARROW}${arrows}</svg>${lanes}
    ${B("reg", 0, 0)}${B("plan", 0, 1, true)}${B("report", 1, 1)}${B("annot", 1, 2)}${B("review", 2, 2)}${B("approve", 2, 3)}${B("issue", 3, 3, true)}${B("users", 0, 4)}${B("view", 3, 4)}
    <div class="note" style="left:${cx[1] + 16}px;top:${cy(3) + 2}px;width:200px">${esc(t.back)}</div>
    <div class="note" style="left:${mx(3) + 14}px;top:${cy(1) + 24}px;width:${W - 40 - (mx(3) + 14)}px">${esc(t.publish)}</div></div>`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ deviceScaleFactor: 2 });
mkdirSync(join(root, "docs/images"), { recursive: true });
for (const lang of LANGS) {
  for (const [name, fn, section] of [["governance-chain", chainHtml, "chain"], ["role-cycle", cycleHtml, "cycle"]]) {
    await page.setContent(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${fn(T[section][lang])}</body></html>`);
    await page.waitForTimeout(50);
    const el = page.locator(".wrap");
    const out = join(root, "docs/images", `${name}.${lang}.png`);
    await el.screenshot({ path: out });
    console.log("wrote", out);
  }
}
await browser.close();
