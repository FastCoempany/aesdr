import twr from "./tower.module.css";
import { composeUrl } from "@/lib/partnerships/inbox-link";

/**
 * Turn a free-text contact path ("Circle DM via Women in Sales Club community;
 * alternatively email…") into one-click destinations: URLs open directly,
 * email addresses open a compose window, and when the text names a place
 * without giving either, a web search for it — so the path never dead-ends
 * into copy-paste.
 */

const MONO = "'Space Mono', monospace";
const CRIMSON = "#8B1A1A";

function shortHost(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "link";
  }
}

export default function ContactLinks({
  text,
  searchHint,
}: {
  text: string | null | undefined;
  /** What to search for when the text names a destination without a URL —
   *  usually `${name} ${surface}`. Falls back to the text itself. */
  searchHint?: string;
}) {
  if (!text || !text.trim()) return null;

  const urls = Array.from(
    new Set(text.match(/https?:\/\/[^\s)>,;"']+|www\.[^\s)>,;"'(]+\.[a-z]{2,}[^\s)>,;"']*/gi) ?? []),
  );
  const emails = Array.from(
    new Set(text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []),
  );

  const links: Array<{ href: string; label: string }> = [];
  for (const u of urls.slice(0, 3)) {
    const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    // An email's domain can false-match the bare-domain pattern — skip those.
    if (emails.some((e) => e.includes(u))) continue;
    links.push({ href, label: `open ${shortHost(href)} ↗` });
  }
  for (const e of emails.slice(0, 2)) {
    links.push({ href: composeUrl(e), label: `email ${e} ↗` });
  }
  if (links.length === 0) {
    const q = (searchHint?.trim() || text.trim()).slice(0, 140);
    links.push({
      href: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      label: "find them ↗",
    });
  }

  return (
    <span style={{ display: "inline-flex", gap: "14px", flexWrap: "wrap" }}>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className={twr.lnk}
          style={{ fontFamily: MONO, fontSize: "11px", color: CRIMSON, fontWeight: 700 }}
        >
          {l.label}
        </a>
      ))}
    </span>
  );
}
