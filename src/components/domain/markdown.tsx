import * as React from "react";

/**
 * Minimal, safe Markdown renderer (React elements only, no raw HTML): headings, paragraphs, bullet and
 * numbered lists, pipe tables, horizontal rules, **bold**, *italic* and `code`. Plain text renders as paragraphs.
 */
function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={`${key}-${i++}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={`${key}-${i++}`} className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em]">{tok.slice(1, -1)}</code>);
    else out.push(<em key={`${key}-${i++}`}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
const cells = (row: string) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0, k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length, cls = ["text-lg font-semibold", "text-base font-semibold", "text-sm font-semibold", "text-sm font-medium"][lvl - 1];
      blocks.push(React.createElement(`h${lvl + 1}`, { key: k++, className: `${cls} mt-4 mb-2 first:mt-0` }, inline(h[2], `h${k}`)));
      i++; continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push(<hr key={k++} className="my-3 border-border" />); i++; continue; }
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = cells(line); i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(cells(lines[i])); i++; }
      blocks.push(<div key={k++} className="my-2 overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr>{head.map((c, j) => <th key={j} className="border border-border bg-surface-2 px-2 py-1 text-left font-semibold">{inline(c, `th${k}${j}`)}</th>)}</tr></thead><tbody>{rows.map((r, ri) => <tr key={ri}>{head.map((_, j) => <td key={j} className="border border-border px-2 py-1 align-top">{inline(r[j] ?? "", `td${k}${ri}${j}`)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, "")); i++; }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(<Tag key={k++} className={`my-2 space-y-0.5 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}>{items.map((it, j) => <li key={j}>{inline(it, `li${k}${j}`)}</li>)}</Tag>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*([-*+]|\d+[.)])\s+|\s*\|.*\|\s*$|-{3,}\s*$)/.test(lines[i])) { para.push(lines[i]); i++; }
    if (!para.length) { para.push(lines[i]); i++; }
    blocks.push(<p key={k++} className="my-2 leading-relaxed">{para.flatMap((p, j) => j ? [<br key={`br${j}`} />, ...inline(p, `p${k}${j}`)] : inline(p, `p${k}${j}`))}</p>);
  }
  return <div className="text-sm text-foreground">{blocks}</div>;
}
