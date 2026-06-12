/**
 * Deep-link into the operator's own mail client — plain URL navigation, no
 * mail API and no OAuth. Defaults to Gmail's search URL; point
 * NEXT_PUBLIC_INBOX_SEARCH_BASE anywhere that accepts a trailing query
 * (e.g. another webmail's search route) to change it.
 */
export function inboxSearchUrl(fromAddr: string): string {
  const base =
    process.env.NEXT_PUBLIC_INBOX_SEARCH_BASE ||
    "https://mail.google.com/mail/u/0/#search/";
  return `${base}${encodeURIComponent(`from:(${fromAddr})`)}`;
}

export function looksLikeEmail(s: string | null | undefined): boolean {
  return !!s && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(s.trim());
}
