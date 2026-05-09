/**
 * Minimal server-side markdown → HTML renderer for partner-kit pages.
 *
 * Scope: we control the source markdown ourselves. This handles only the
 * subset of markdown we actually use in content/partner-kit/*.md:
 *   - Headers (#, ##, ###, ####)
 *   - Paragraphs
 *   - Bold (**), italic (*), inline code (`)
 *   - Links [text](url)
 *   - Bullet lists (-)
 *   - Numbered lists (1.)
 *   - Blockquotes (>)
 *   - Horizontal rules (---)
 *   - Tables (| col |)
 *   - Fenced code blocks (```)
 *
 * Output is escaped where appropriate. Since the input is trusted (committed
 * by us), we do not run a full sanitizer pass — the goal is correct rendering
 * of our own copy, not arbitrary user content.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Apply inline transforms: code, bold, italic, links. Operates on already-escaped text. */
function inline(s: string): string {
  // Inline code first (so its contents aren't bolded/italicized)
  s = s.replace(/`([^`]+?)`/g, (_, code: string) => `<code>${code}</code>`);
  // Links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text: string, url: string) =>
      `<a href="${url}" rel="noopener">${text}</a>`,
  );
  // Bold **text**
  s = s.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  // Italic *text* — careful not to match leftover ** from a partial bold
  s = s.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s.,!?;:)]|$)/g, "$1<em>$2</em>");
  // Em-dash entities pass through; smart quotes already in source
  return s;
}

type Block =
  | { kind: "h"; level: 1 | 2 | 3 | 4; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "blockquote"; lines: string[] }
  | { kind: "hr" }
  | { kind: "code"; lang: string; text: string }
  | { kind: "table"; headers: string[]; rows: string[][] };

/**
 * Strip the leading metadata block from D-series internal docs.
 * Pattern: a series of "**Field:** value" lines or first paragraph,
 * followed by a `---` separator. We keep everything from the first
 * meaningful header onward.
 */
function stripInternalPreamble(md: string): string {
  // If the file leads with bold-field metadata followed by "---",
  // drop everything up to and including that first horizontal rule.
  const lines = md.split("\n");
  let firstHr = -1;
  let hasMetadataMarker = false;
  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    if (/^\*\*(Deliverable|Audience|Voice ratio|Format|Canon refs?):\*\*/.test(lines[i])) {
      hasMetadataMarker = true;
    }
    if (lines[i].trim() === "---" && hasMetadataMarker) {
      firstHr = i;
      break;
    }
  }
  if (firstHr >= 0) {
    return lines.slice(firstHr + 1).join("\n").replace(/^\n+/, "");
  }
  return md;
}

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ kind: "code", lang, text: buf.join("\n") });
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    // Header
    const h = /^(#{1,4})\s+(.+?)\s*$/.exec(line);
    if (h) {
      blocks.push({
        kind: "h",
        level: h[1].length as 1 | 2 | 3 | 4,
        text: h[2],
      });
      i++;
      continue;
    }

    // Table — header row followed by separator row
    if (line.startsWith("|") && i + 1 < lines.length && /^\s*\|[\s|:-]+\|\s*$/.test(lines[i + 1])) {
      const headers = splitRow(line);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ kind: "table", headers, rows });
      continue;
    }

    // Bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    // Numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ kind: "blockquote", lines: buf });
      continue;
    }

    // Paragraph — join until blank line or new block
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4}\s|>|-{3,}$|```|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "p", text: buf.join(" ") });
  }

  return blocks;
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

function renderBlocks(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.kind) {
        case "h":
          return `<h${b.level}>${inline(esc(b.text))}</h${b.level}>`;
        case "p":
          return `<p>${inline(esc(b.text))}</p>`;
        case "ul":
          return `<ul>${b.items.map((it) => `<li>${inline(esc(it))}</li>`).join("")}</ul>`;
        case "ol":
          return `<ol>${b.items.map((it) => `<li>${inline(esc(it))}</li>`).join("")}</ol>`;
        case "blockquote": {
          const inner = renderBlocks(parseBlocks(b.lines.join("\n")));
          return `<blockquote>${inner}</blockquote>`;
        }
        case "hr":
          return `<hr />`;
        case "code":
          return `<pre><code class="lang-${esc(b.lang)}">${esc(b.text)}</code></pre>`;
        case "table": {
          const head = `<thead><tr>${b.headers.map((c) => `<th>${inline(esc(c))}</th>`).join("")}</tr></thead>`;
          const body = `<tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(esc(c))}</td>`).join("")}</tr>`).join("")}</tbody>`;
          return `<table>${head}${body}</table>`;
        }
      }
    })
    .join("\n");
}

export function renderMarkdown(md: string, opts: { stripPreamble?: boolean } = {}): string {
  const source = opts.stripPreamble ? stripInternalPreamble(md) : md;
  return renderBlocks(parseBlocks(source));
}
