/**
 * FTC material-connection disclosure detector.
 *
 * The FTC's Endorsement Guides (16 CFR Part 255) require an endorser to
 * clearly and conspicuously disclose any material connection to the product
 * they promote — for an affiliate, the fact that they earn a commission on
 * sales. AESDR affiliates must include such a disclosure in any promotional
 * copy they submit. Founder call 2026-07-06: this is a soft warning, not a
 * hard gate — a submission without a marker still goes through, the affiliate
 * is warned on submit, and the admin review page flags it so the human
 * reviewer enforces the disclosure before approval.
 *
 * `hasFtcDisclosure` is a deliberately narrow allow-list of well-understood
 * disclosure markers (the same ones the FTC's own guidance calls out: "#ad",
 * "affiliate", "paid partnership", "sponsored", a clear commission statement,
 * "material connection"). It is NOT an NLP judge of disclosure adequacy — a
 * human still reviews placement/conspicuousness. Its only job is to surface a
 * submission that carries no recognizable disclosure marker at all.
 */

/**
 * Disclosure markers we accept. Each is matched case-insensitively and
 * tolerant of surrounding punctuation/hashtags (see `hasFtcDisclosure`).
 * Exported so tests (and any future UI hint) can show the canonical list.
 */
export const FTC_DISCLOSURE_MARKERS = [
  "#ad",
  "#affiliate",
  "#sponsored",
  "affiliate", // "affiliate link", "affiliate partner", "as an affiliate"
  "paid partnership",
  "sponsored",
  "material connection",
  // A commission statement in a disclosing context: "I earn a commission",
  // "earn a commission", "may earn ... commission". We require the verb so a
  // bare "commission" (e.g. "boost your sales commission") doesn't pass.
  "earn a commission",
  "earn commission",
  "may earn",
  "i earn",
  "we earn",
  "earns a commission",
] as const;

/**
 * Returns true if `text` contains at least one recognizable FTC disclosure
 * marker. Case-insensitive; treats hashtags and most punctuation as word
 * separators so "(#Ad)", "#AD!", "affiliate-link", and "affiliate." all match.
 *
 * See 16 CFR Part 255 (FTC Endorsement Guides).
 */
export function hasFtcDisclosure(text: string): boolean {
  if (!text) return false;

  const lower = text.toLowerCase();

  // Hashtag markers: a leading "#" followed by the tag. Tolerate any
  // non-word char (or string start) immediately before the "#", and require
  // a word boundary after so "#ads" or "#advance" don't satisfy "#ad".
  const hashtagMarkers: Array<[string, RegExp]> = [
    ["#ad", /(?:^|[^\w#])#ad\b/],
    ["#affiliate", /(?:^|[^\w#])#affiliate\b/],
    ["#sponsored", /(?:^|[^\w#])#sponsored\b/],
  ];
  for (const [, re] of hashtagMarkers) {
    if (re.test(lower)) return true;
  }

  // Phrase / word markers. We normalize runs of non-alphanumeric characters
  // to single spaces so punctuation between or around words doesn't defeat the
  // match ("affiliate-link" -> "affiliate link", "sponsored." -> "sponsored").
  // \b anchors keep these matching on whole words only.
  const normalized = ` ${lower.replace(/[^a-z0-9]+/g, " ").trim()} `;
  const phraseMarkers = [
    /\baffiliate\b/, // affiliate link / partner / "as an affiliate"
    /\bpaid partnership\b/,
    /\bsponsored\b/,
    /\bmaterial connection\b/,
    /\bearn(?:s)? a commission\b/, // "earn a commission" / "earns a commission"
    /\bearn commission\b/,
    /\bmay earn\b/, // "may earn a commission"
    /\b(?:i|we) earn\b/, // "I earn a commission" / "we earn"
  ];
  return phraseMarkers.some((re) => re.test(normalized));
}
