/**
 * Director plan data — the founder-facing 90-day partnerships playbook.
 *
 * This is internal, founder-only (admin-gated under /admin/tower/director), so
 * it is deliberately exhaustive: every task explains what it is, what it does,
 * what the end result looks like, where to find it, and the exact click path.
 * Every file / table / doc / route / agent it names is a live link.
 *
 * Rendered by DirectorPlan.tsx (collapsible weeks + tasks, checkboxes,
 * automation chips). Bodies are trusted authored HTML (dangerouslySetInnerHTML)
 * styled by the :global(.d-*) rules in director.module.css.
 */

/* eslint-disable no-restricted-syntax --
 * Founder-only internal playbook (admin-gated /admin/tower/director). It must
 * use the literal Claude Code dispatch syntax "use the <agent> subagent" (which
 * trips the R-G4 "the ledger" rule on the ledger agent's slug) and it names
 * banned vocabulary as teaching examples in the R-G explainer. Canon's
 * mechanical enforcement targets buyer-/affiliate-facing surfaces; this admin
 * doc is out of that scope, the same way canon-check.mjs exempts canon-
 * describing files. */

// ── Canonical URLs for everything the plan references ──
const GH = "https://github.com/fastcoempany/aesdr/blob/main";
const GHT = "https://github.com/fastcoempany/aesdr/tree/main";
const SB = "https://supabase.com/dashboard/project/jwhjysjvehqslzcfpehl";
const SBTBL = `${SB}/editor`;
const BOOKING = "https://calendar.app.google/wFRpSWG2ehvNhgd4A";

/** Inline link helper — opens in a new tab so the Director stays put. */
const L = (href: string, label: string) =>
  `<a class="d-link" href="${href}" target="_blank" rel="noopener">${label}</a>`;

/** A Supabase table reference → links to the table editor. */
const TBL = (name: string) => L(SBTBL, name);
/** A repo file reference → links to the file on GitHub (main branch). */
const FILE = (path: string, label?: string) => L(`${GH}/${path}`, label || path);
/** A file that lives on the affiliatekit branch (the gated kit deployment), not main. */
const AFF = (path: string, label?: string) =>
  L(`https://github.com/fastcoempany/aesdr/blob/affiliatekit/${path}`, label || path);
/** A file the operator CREATES later in the plan — link the folder so it never 404s pre-creation. */
const FUTURE = (_path: string, label: string) => L(`${GHT}/docs/partnerships`, label);

export type Tag = "you" | "tower" | "auto" | "done";
/** Audit verdict stamped 2026-07-21 — what is actually done in the world/repo. */
export type Audit = { state: "done" | "partial" | "open"; note?: string };
export type Task = {
  id: string;
  title: string;
  tags: Tag[];
  automatable?: boolean;
  audit?: Audit;
  bodyHtml: string;
};
export type Week = {
  id: string;
  phase: "p30" | "p60" | "p90";
  tag: string;
  title: string;
  intro: string;
  tasks: Task[];
};
export type Phase = { id: string; num: string; title: string; goal: string };

export const PHASES: Phase[] = [
  {
    id: "p30",
    num: "Phase · Days 1–30",
    title: "Foundation & First Contact",
    goal: "Roster discovered · 25 candidates in the pipeline · cold outreach approved · attribution decision made.",
  },
  {
    id: "p60",
    num: "Phase · Days 31–60",
    title: "Activation & The Channel Switch",
    goal: "10 affiliates active · 3 channel conversations open · payouts running clean.",
  },
  {
    id: "p90",
    num: "Phase · Days 61–90",
    title: "Compounding & Proof",
    goal: "Top affiliates on a $3k/mo trajectory · one channel deal signed or close · the machine runs without your hand on every lever.",
  },
];

export const WEEKS: Week[] = [
  // ══════════════════════════════ PHASE 30 ══════════════════════════════
  {
    id: "w1",
    phase: "p30",
    tag: "Week 1 · Days 1–5",
    title: "See the whole board. Know the canon.",
    intro:
      "Reconnaissance, not construction. You don't send a single outreach this week. You walk the tower, learn the brand voice until you can hear it, and confirm the candidate list a prior sweep already left you.",
    tasks: [
      {
        id: "w1t1",
        audit: { state: "done", note: "You walk it daily. Brought current 2026-07-21 — the walkthrough below now describes the live warren floor." },
        title: "Day 1, 9:00am — Walk the warren (the floor, top to bottom)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">The Control Tower is your home base for the next 90 days — one floor, called <strong>the warren</strong>, where a sweep hunts and finished cards land, and every card is a door to a room where the whole move happens. Learn the layout cold so you can read it at a glance. <strong>Heads-up:</strong> nothing drafts and nothing sends without your press inside a room — that's the safety-by-default design.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open the floor.</strong> In your browser go to ${L("/admin/tower", "aesdr.com/admin/tower")}. If you're asked to sign in, use your founder email — you're a permanent admin, so you land straight in.</li>
  <li class="d-step"><strong>The masthead — the postage strip.</strong> Today's Claude spend against the $10/day wall, plus email credits. Every sweep and brief is metered here, and the wall fails closed: when the postage runs out, the machine stops asking for more.</li>
  <li class="d-step"><strong>The headline.</strong> It says either "All clear." or "N waiting on you." That number is the entire job for the day. If it's 0, you can close the tab.</li>
  <li class="d-step"><strong>The sweep row.</strong> Three thin buttons — <span class="d-ui">Communities</span>, <span class="d-ui">Newsletters &amp; podcasts</span>, <span class="d-ui">Practitioners</span>. One press runs the whole line: Claude sweeps the live web (~2–4 min), and every new find is auto-promoted, briefed, verdict-called and address-hunted <em>before the run reports done</em>. There is no Promote/Reject gate — the sweep lands finished cards.</li>
  <li class="d-step"><strong>The band — chambers and the strip.</strong> Cards sort into verdict chambers (<em>reach out · your call · waiting · talking · skip · researching</em>); pick a chamber, flip its stack. The <span class="d-ui">territory</span> toggle pulls the same band back to every candidate as a dot. A card is a door.</li>
  <li class="d-step"><strong>The room — the letter.</strong> Click a card and it takes the screen: the verdict is the salutation, the draft is the body you edit in place, and one ceramic press sends. The read, the scout's notes, replies and history fold below the seal.</li>
  <li class="d-step"><strong>Payouts, the shelf, the machinery.</strong> Below the band: <strong>Payouts waiting</strong> appears only when money is owed; <strong>On the shelf</strong> holds parked drafts; the collapsed <strong>machinery</strong> drawer at the bottom holds the four levers (followup, usher, almanac, contact-finder), the model pickers and the sent log.</li>
  <li class="d-step"><strong>The side rail:</strong> <span class="d-ui">The roster</span>, <span class="d-ui">The bin</span>, <span class="d-ui">The sent record</span> — the doors, reachable at any scroll depth.</li>
  <li class="d-step"><strong>Bookmark it.</strong> Press <span class="d-ui">⌘/Ctrl + D</span>. The warren is your default tab now.</li>
</ol>
<div class="d-end"><b>When you're done:</b> you can walk the floor top to bottom from memory — postage strip, headline, sweep row, the band, payouts &amp; shelf, machinery. You can reach it from the <strong>Control Tower</strong> item in the admin nav, the iris-shimmer <strong>Director</strong> tab (this page), or the <strong>admin-mode menu</strong> (floating button, bottom-right).</div>
<div class="d-refs"><b>Links in this task</b>${L("/admin/tower", "/admin/tower — the warren")} · ${L("/admin/tower/sent", "/admin/tower/sent — the sent record")} · <a class="d-link" href="#ref-wiki">How it all runs (manual)</a></div>`,
      },
      {
        id: "w1t2",
        audit: { state: "partial", note: "Plumbing built (partner-alerts.ts, almanac lever). The real-time bright-signal ping retired with sentinel — today alerts = the almanac digest, and only while its lever is on." },
        title: "Day 1, 10:00am — Confirm where your alerts land",
        tags: ["you", "auto"],
        bodyHtml: `
<p class="d-what">The system emails you one thing: the once-a-day standup digest at 7am ET (the almanac lever must be on). The old real-time "bright signal" ping retired with sentinel — replies land in your inbox and in each candidate's room. This task is just confirming the digest address is one you actually read.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Default is <span class="d-code">antaeus.coe@gmail.com</span></strong> (your permanent-admin email). If that's the inbox you live in, you're done — skip to the last step.</li>
  <li class="d-step"><strong>To send alerts somewhere else,</strong> open the Vercel dashboard at ${L("https://vercel.com", "vercel.com")} → the <strong>aesdr</strong> project → <span class="d-ui">Settings</span> → <span class="d-ui">Environment Variables</span>.</li>
  <li class="d-step"><strong>Add a variable</strong> named <span class="d-code">PARTNER_ALERT_EMAIL</span>, value = the address you want, environment = <strong>Production</strong>. Click <span class="d-ui">Save</span>.</li>
  <li class="d-step"><strong>Redeploy</strong> so the new value takes effect: Vercel → <span class="d-ui">Deployments</span> → the top row → <span class="d-ui">⋯</span> → <span class="d-ui">Redeploy</span>.</li>
  <li class="d-step"><strong>Confirm by waiting for the next 7am digest</strong> — but only after you've started the <strong>almanac</strong> lever in the machinery drawer (bottom of the warren). Until almanac is started, no digest mails (the OFF-by-default safety). If almanac is on, the next morning's digest (subject "Tower: all clear" on a quiet day) is proof the chain works.</li>
</ol>
<div class="d-callout">
  <div class="d-callout-title">Where these emails are built</div>
  <p>The alert + digest templates live in ${FILE("lib/partner-alerts.ts", "lib/partner-alerts.ts")} if you ever want to change the wording. You don't need to touch it — this is just so nothing is a black box.</p>
</div>
<div class="d-end"><b>When you're done:</b> you know which inbox bright-signal pings and the daily digest land in, and how to change it. The sender code is ${FILE("lib/partner-alerts.ts", "lib/partner-alerts.ts")}.</div>`,
      },
      {
        id: "w1t3",
        audit: { state: "done", note: "You ratified this canon; the R-G4 blocklist is enforced mechanically in ESLint + canon-check." },
        title: "Day 1, 2:00pm — Read the brand canon until you can hear it",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">"Canon" is AESDR's brand-voice rulebook — the standard every word of outreach and every affiliate's copy is held to. You can't approve a cold email or judge an affiliate's post until you can hear when something is off-voice. This is a reading task; budget about an hour.</p>
<p class="d-h">What "R-G" means (you'll see it everywhere)</p>
<p class="d-what">R-G is the name of the eight house language rules (R-G1 through R-G8) in the language-patch supplement. In short: <strong>R-G1</strong> no single abstract noun carrying a whole idea; <strong>R-G2</strong> don't end a sentence on a vague pronoun; <strong>R-G3</strong> three short sentences in a row reads like a robot; <strong>R-G4</strong> the banned-buzzword list ("masterclass", "level up", "ecosystem" — the machine enforces this one); <strong>R-G5</strong> read every long sentence out loud; <strong>R-G6</strong> would a real SDR say this at a bar; <strong>R-G7</strong> AI-tell hygiene; <strong>R-G8</strong> plain noun over fancy verb. Full text: ${FILE("docs/canon-revisions/2026-05-19-language-patch-supplement.md", "the language-patch supplement")}.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Read 1 (15 min):</strong> ${FILE("AGENTS.md", "AGENTS.md")} then ${FILE("AFFILIATE_BRAND_CANON.md", "AFFILIATE_BRAND_CANON.md")}. These set the base voice and the affiliate-side rules.</li>
  <li class="d-step"><strong>Read 2 (30 min):</strong> open the folder ${L(`${GHT}/docs/canon-revisions`, "docs/canon-revisions/")} and read these four in order — ${FILE("docs/canon-revisions/2026-05-19-consumer-brand-voice-canon.md", "the base brand-voice canon")}, ${FILE("docs/canon-revisions/2026-05-19-language-patch-supplement.md", "the language-patch supplement (R-G1→R-G8)")}, ${FILE("docs/canon-revisions/2026-05-19-curriculum-copy-rubric.md", "the curriculum copy rubric")}, and ${FILE("docs/canon-revisions/2026-05-28-canon-v1.5-substantial-assets-and-operating-manual.md", "the v1.5 vocabulary pack")}.</li>
  <li class="d-step"><strong>Read 3 (10 min) — walk the live pages as a buyer would,</strong> reading out loud (that's the R-G5 test): ${L("/", "the landing page")}, ${L("/affiliates", "the affiliate program page")}, ${L("/affiliates/kit", "the public kit")}, ${L("/enterprise", "the enterprise page")}.</li>
  <li class="d-step"><strong>See what the machine catches vs. what needs your ear:</strong> the mechanical checker is ${FILE("scripts/canon-check.mjs", "scripts/canon-check.mjs")} — it greps for the banned R-G4 words. Everything subtler (cadence, register) is on you.</li>
</ol>
<div class="d-end"><b>When you're done:</b> you can name five banned R-G4 words from memory and you've heard the voice on the live site. Canon home: ${L(`${GHT}/docs/canon-revisions`, "docs/canon-revisions/")}.</div>`,
      },
      {
        id: "w1done1",
        audit: { state: "done", note: "Tables and the inbound pipe hold true. The cron roster has since shrunk: sentinel, scribe, courier and dossier-enrich were retired for the manual-only tower." },
        title: "Already done — the infrastructure the old plan built in Week 1",
        tags: ["done"],
        bodyHtml: `
<p class="d-what">The original 90-day plan spent Week 1 standing up systems by hand. All of it is permanently in place now, so you skip it. This card is just so you know what exists and where.</p>
<p class="d-h">What's already built</p>
<ol class="d-steps">
  <li class="d-step"><strong>The agent roster.</strong> Four levers can run on a schedule once you start them in the machinery drawer — ${FILE("app/api/cron/followup/route.ts", "followup")} (the +4/+9 ladder), ${FILE("app/api/cron/usher/route.ts", "usher")} (workshop logistics), ${FILE("app/api/cron/almanac/route.ts", "almanac")} (daily digest), ${FILE("app/api/cron/contact-finder/route.ts", "contact-finder")} (address hunts) — all OFF by default. The old sentinel / courier / scribe-drafter crons were retired for the manual-only tower: reading replies, drafting and sending are your presses now. Six are saved roles you call in chat — ${FILE(".claude/agents/scout.md", "scout")}, ${FILE(".claude/agents/dossier.md", "dossier")}, ${FILE(".claude/agents/scribe.md", "scribe")}, ${FILE(".claude/agents/warden.md", "warden")}, ${FILE(".claude/agents/ledger.md", "ledger")}, ${FILE(".claude/agents/herald.md", "herald")}.</li>
  <li class="d-step"><strong>The database.</strong> Your partner tables already exist: ${TBL("partner_pipeline")} (the candidate CRM), ${TBL("partner_inbound_email")}, ${TBL("partner_outbound_queue")} (the draft house), ${TBL("partner_sent_log")}, ${TBL("partner_signals")}, ${TBL("partner_workshop")} — plus the affiliate tables ${TBL("affiliates")}, ${TBL("affiliate_attributions")}, ${TBL("affiliate_payouts")}, ${TBL("affiliate_links")}, ${TBL("affiliate_applications")}.</li>
  <li class="d-step"><strong>The inbound email pipe.</strong> Mail to <span class="d-code">affiliates@aesdr.com</span> is caught by a Cloudflare Worker, forwarded to your inbox, and dropped into ${TBL("partner_inbound_email")} so each candidate's room keeps the thread's record in its replies fold.</li>
</ol>
<div class="d-end"><b>Nothing to do here.</b> You start Day 1 with a tower already breathing.</div>`,
      },
      {
        id: "w1t4",
        audit: { state: "done", note: "Doctrine v2.0 is in the repo, and its fit bar now runs automatically inside every sweep." },
        title: "Day 4 — Read the discovery doctrine (don't rewrite it)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">The "discovery doctrine" is the written rule for who counts as a good partner and who doesn't. It already exists at version 2.0. Your job is to read it once so that when you see a tempting-but-wrong candidate later, you can pass on them without re-arguing it every time.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open it:</strong> ${FILE("docs/partnerships/discovery-doctrine.md", "docs/partnerships/discovery-doctrine.md")}. Read it top to bottom.</li>
  <li class="d-step"><strong>Internalize the six rules:</strong> (1) source from practitioner networks, never affiliate marketplaces, never LinkedIn; (2) the voice-fit bar is 1–5 and you cut anything ≤2; (3) the four kinds of partner you want (creator / coach / alumni / community); (4) the narrow list of automatic disqualifiers; (5) the four "motion" tags that decide the angle — affiliate / coach_complement / open_recruit / co_marketing; (6) always run a candidate through dossier before scribe.</li>
  <li class="d-step"><strong>Note the one trap it protects against:</strong> a creator with 100k followers and a guru voice is a <em>worse</em> partner than a 5k-reader operator who sounds like a peer. Borrowed trust cuts both ways — a bad-fit partner damages the brand faster than a good one helps.</li>
</ol>
<div class="d-end"><b>When you're done:</b> you can recite the six rules. The doctrine is ${FILE("docs/partnerships/discovery-doctrine.md", "docs/partnerships/discovery-doctrine.md")} and you'll lean on it during the Week-2 cut.</div>`,
      },
      {
        id: "w1t5",
        audit: { state: "done", note: "Opened and answered — stay custom. The verdict is recorded in the Attribution Decision card in the toolkit; the memo file itself is still unwritten (Week 4)." },
        title: "Day 5 — Open the attribution-platform question (you decide by Day 25)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">"Attribution" = how the system knows which affiliate's link led to which sale, so the right person gets paid. AESDR already has a working home-grown system (links → tracked clicks → commission → Stripe payout). The only decision is whether to keep extending it or switch to a paid tool later. You don't decide today — you just read the lay of the land. The real call comes around Day 25 when you know your actual volume.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Read the cost audit:</strong> ${FILE("docs/partnerships/attribution-build-cost.md", "docs/partnerships/attribution-build-cost.md")}. It's the honest baseline of what's already built and what a paid tool would add.</li>
  <li class="d-step"><strong>The likely answer for your stage:</strong> keep the custom system ($0) for the first ~25 partners, and only move to <strong>Rewardful</strong> (~$49/mo) once partners are asking for a self-serve dashboard you don't want to build. Note that as your tentative pick; confirm it Day 20–22 with real numbers.</li>
  <li class="d-step"><strong>One thing is already handled:</strong> the job that moves a commission from "pending" to "cleared" once the 30-day refund window passes runs automatically every morning — see ${FILE("app/api/cron/affiliate/route.ts", "the affiliate cron")}, scheduled in ${FILE("vercel.json", "vercel.json")}.</li>
</ol>
<div class="d-end"><b>When you're done:</b> you've read the audit and named a tentative pick. Decision artifact comes Day 20–22. Source: ${FILE("docs/partnerships/attribution-build-cost.md", "attribution-build-cost.md")}.</div>`,
      },
    ],
  },
  {
    id: "w2",
    phase: "p30",
    tag: "Week 2 · Days 6–10",
    title: "The list. Fifty names, scored.",
    intro:
      "The highest-leverage week of the quarter. Three sweep presses build a tight, scored target list — finished cards, verdicts called — and then you write the letters.",
    tasks: [
      {
        id: "w2t1",
        audit: { state: "done", note: "Absorbed into one press: a sweep now runs the fit call, the brief, and the address hunt, and lands finished cards. No Promote gate, no dossier-enrich lever. The pipeline is seeded." },
        title: "Days 6–7 — Run three sweeps from the warren (target: ~45 finished cards)",
        tags: ["tower", "auto"],
        automatable: true,
        bodyHtml: `
<p class="d-what">A "sweep" is one press that asks Claude to find ~15 candidate partners on a specific kind of platform — and then finishes the job itself. Every new find is auto-promoted, briefed, fit-called and address-hunted before the run reports done. You run three sweeps so the results don't blur. End result: ~45 finished cards in the band, each already carrying a verdict.</p>
<div class="d-callout d-callout-note"><div class="d-callout-title">What changed</div><p>Earlier versions of this task had a Promote/Reject gate and a separate dossier auto-enrich lever. Both are gone — the sweep is the whole line now. Costs are real (roughly $0.50–$2.50 per sweep plus ~$0.15–$0.60 per card for the briefs), metered by the postage wall, so each button asks you to confirm.</p></div>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>You already have a head start.</strong> A prior manual sweep seeded the pipeline — open ${TBL("partner_pipeline")} and you'll see existing candidates (also documented in ${FILE("docs/partnerships/seed-partner-pipeline-2026-06-01.sql", "the seed file")}). Your job: verify them and extend with three fresh sweeps.</li>
  <li class="d-step"><strong>Open the warren:</strong> ${L("/admin/tower", "/admin/tower")} → the sweep row under the headline.</li>
  <li class="d-step"><strong>Run the three sweeps,</strong> one at a time. Press <span class="d-ui">Communities</span> → confirm → the button itself narrates the line (sweeping the web → preparing N cards). Then <span class="d-ui">Newsletters &amp; podcasts</span>. Then <span class="d-ui">Practitioners</span>.</li>
  <li class="d-step"><strong>Work the chambers as cards land.</strong> <em>reach out.</em> cards are ready for a letter; <em>your call.</em> cards want your read (open the room, weigh the scout's notes, decide); <em>skip.</em> cards go to the bin from inside their room — parked, never deleted.</li>
  <li class="d-step"><strong>Sanity-check anything suspicious.</strong> Claude can occasionally invent a plausible-sounding name — open the room and follow the brief's links to confirm the surface exists before you write.</li>
</ol>
<div class="d-end"><b>When you're done:</b> 30–45 cards in the band, each with a verdict, a research brief, and (where the hunt landed) an address. The counts live in ${TBL("partner_pipeline")} and on ${L("/admin/tower/pipeline", "the roster")}.</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower — the sweep row")} · ${TBL("partner_pipeline")} · ${FILE("lib/partnerships/sweep.ts", "sweep.ts — the whole line")} · ${FILE(".claude/agents/scout.md", "scout spec")} · ${FILE("docs/partnerships/discovery-doctrine.md", "doctrine")}</div>`,
      },
      {
        id: "w2t2",
        audit: { state: "done", note: "A rank-and-cut ran 2026-06-01 (the SQL record sits in docs/partnerships). Re-run it whenever a fresh sweep swells the roster." },
        title: "Days 8–9 — Score, rank, and cut to the top 25",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">You now have ~50 researched candidates. This task narrows them to the 25 best, using a formula that rewards voice-fit and reachability over raw audience size. The losers aren't deleted — they're parked as "cold" for a later wave. End result: 25 candidates marked ready to pursue, the rest set aside.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Ask ledger to rank them.</strong> In plain terms, you're asking it to score every researched candidate by a weighted formula and hand back the top 25. Paste:
    <span class="d-cmd">use the ledger subagent: from partner_pipeline, take everyone with motion 'affiliate' and status 'enriched'. Score each one as (voice_fit × 3) + (their audience size, capped at 20,000, divided by 4,000, × 2). Show me the top 25 by that score, with their name, surface, audience, voice_fit, the score, and contact path.</span>
    <span style="display:block;margin-top:6px;color:#6B6B6B;font-style:italic;">Why this formula: voice-fit matters most (×3). Audience helps but is capped, so a huge guru can't outrank a great-fit operator. The result is a ranked shortlist, not a popularity contest.</span></li>
  <li class="d-step"><strong>Why reachability wins:</strong> a 5,000-reader newsletter with an open reply address beats a 50,000-follower account you can only reach through a gatekeeper. The cap in the formula is what enforces that.</li>
  <li class="d-step"><strong>Apply the human cuts</strong> on the ranked list: drop anyone voice-fit 2 or below no matter how big; drop a competitor's actual <em>employee</em>, anyone under ~1,000 engaged audience, or someone sponsored by a tool whose lessons you'd contradict. <strong>Do not</strong> cut people who run a competing course — under the ${FILE("docs/partnerships/discovery-doctrine.md", "doctrine (v2.0)")} those are "coach_complement" candidates, a different angle, not a cut.</li>
  <li class="d-step"><strong>Set statuses.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: keep my top 25 at status 'enriched' and set everyone else to status 'cold'. Don't delete anyone — cold is my second-wave list.</span>
    The companion logic for this cut is preserved in ${FILE("docs/partnerships/rank-and-cut-2026-06-01.sql", "rank-and-cut-2026-06-01.sql")} and ${FILE("docs/partnerships/reclassify-motions-2026-06-01.sql", "reclassify-motions-2026-06-01.sql")} if you want to see exactly how a prior cut was done.</li>
</ol>
<div class="d-end"><b>When you're done:</b> the tower's <strong>Pipeline</strong> board shows 25 at <span class="d-code">enriched</span> and the rest at <span class="d-code">cold</span>. View it live in ${TBL("partner_pipeline")}.</div>
<div class="d-refs"><b>Touches</b>${TBL("partner_pipeline")} · ${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE("docs/partnerships/rank-and-cut-2026-06-01.sql", "rank-and-cut.sql")} · ${FILE("docs/partnerships/discovery-doctrine.md", "doctrine")}</div>`,
      },
      {
        id: "w2t3",
        audit: { state: "partial", note: "The 15-minute drafting cron is retired — a draft is now one press inside each room, canon-checked on save. Nothing fills the tower by itself anymore, by design." },
        title: "Day 10 — Write the letters (one press per room)",
        tags: ["auto", "tower"],
        automatable: true,
        bodyHtml: `
<p class="d-what">Drafting used to be a background job; now it's deliberate. Each room has one press that writes the first-touch from the right canon template, runs the mechanical brand-check, and lays the result into the letter for your edit. Nothing fills the tower by itself anymore, by design — you choose who gets written, and the machine does the writing.</p>
<p class="d-h">How it works (so it's not a black box)</p>
<p class="d-what">The press picks the template by the candidate's surface from ${L(`${GHT}/content/partnerships/outreach`, "content/partnerships/outreach/")} — ${FILE("content/partnerships/outreach/first-touch-newsletter.md", "newsletter")}, ${FILE("content/partnerships/outreach/first-touch-community.md", "community")}, or ${FILE("content/partnerships/outreach/first-touch-podcast.md", "podcast")} — fills in the name and the research detail, then checks it against the banned-word list in ${FILE("lib/partnerships/canon-mechanical.ts", "canon-mechanical.ts")}. The draft becomes the letter's body, right there in the room.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open the <em>reach out</em> chamber</strong> on ${L("/admin/tower", "/admin/tower")} and enter a card.</li>
  <li class="d-step"><strong>Press the button.</strong> The ceramic seal's caption carries the move — it writes the letter, and the room re-renders with the draft as the body.</li>
  <li class="d-step"><strong>Finish the one bespoke line.</strong> If the body carries a placeholder (like <span class="d-code">[SPECIFIC PIECE]</span>), replace it with one real, specific sentence — the actual piece of theirs you read. Click <span class="d-ui">Save &amp; re-check canon</span>; it re-runs the check right there. <em>That one sentence per non-community candidate is the only writing you do.</em></li>
  <li class="d-step"><strong>Check the address chip.</strong> An address on file means the seal will send it for you. No address: paste one into the attach form if you have it, or hand-deliver through their contact links and press <span class="d-ui">Mark sent</span> — same audit trail either way (that happens in Week 3).</li>
</ol>
<div class="d-callout">
  <div class="d-callout-title">What still needs a human writer</div>
  <p>The press only does clean affiliate first-touches. The relationship-heavy angles — coach_complement (needs the specific thing they made), open_recruit (names a competitor), co_marketing (proposes a real collaboration) — want your judgment, so for those dispatch the ${FILE(".claude/agents/scribe.md", "scribe")} agent in chat and paste its output into the room's draft. The templates for those angles are ${FILE("content/partnerships/outreach/first-touch-coach-complement.md", "coach-complement")}, ${FILE("content/partnerships/outreach/first-touch-open-recruit.md", "open-recruit")}, ${FILE("content/partnerships/outreach/first-touch-co-marketing.md", "co-marketing")}.</p>
</div>
<div class="d-end"><b>When you're done:</b> every <em>reach out.</em> room holds a canon-clean letter waiting on your press. The drafts live in ${TBL("partner_outbound_queue")} (status "ready").</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower — the chambers")} · ${TBL("partner_outbound_queue")} · ${L(`${GHT}/content/partnerships/outreach`, "outreach templates")} · ${FILE("lib/partnerships/canon-mechanical.ts", "canon check")}</div>`,
      },
    ],
  },
  {
    id: "w3",
    phase: "p30",
    tag: "Week 3 · Days 11–15",
    title: "First contact — the trigger-pull.",
    intro:
      "The cold-outreach gate happens this week. You stand in the warren with ~25 letters written and pull the trigger — one ceramic press at a time. Then you work the replies.",
    tasks: [
      {
        id: "w3done1",
        audit: { state: "done", note: "Pipe still live. Sentinel's auto-classification retired — replies land in your inbox and in each room's replies fold; you make the call." },
        title: "Already done — confirm the affiliates@ inbox delivers",
        tags: ["done"],
        bodyHtml: `
<p class="d-what">The old plan made you manually verify that mail to <span class="d-code">affiliates@aesdr.com</span> gets caught and routed before sending to 25 real people. That whole pipe is live and was tested end-to-end.</p>
<p class="d-h">What's running</p>
<ol class="d-steps">
  <li class="d-step">A Cloudflare Email Worker (source in ${L(`https://github.com/fastcoempany/aesdr/tree/affiliatekit/infra/cloudflare`, "infra/cloudflare/")}) catches every inbound message, forwards a copy to your personal inbox, and posts the raw message to ${AFF("app/api/webhooks/inbound-email/route.ts", "the inbound webhook")}, which stores it in ${TBL("partner_inbound_email")}.</li>
  <li class="d-step">Each message is kept whole in that table, so the candidate's room shows the thread in its replies fold. Classifying and answering are yours — the old sentinel auto-sorter was retired with the manual-only tower.</li>
</ol>
<div class="d-end"><b>Nothing to do.</b> Replies to your outreach will arrive in your inbox <em>and</em> in each candidate's room.</div>`,
      },
      {
        id: "w3t1",
        audit: { state: "partial", note: "The send path is live end-to-end (suppression re-check, no-double-send claim, delivery stamps) and first touches have gone out — but the 25-in-three-waves campaign hasn't run. A send is one ceramic press per room; there is no batch approve." },
        title: "Days 11–13 — Send the first 25 (in three waves of ~8)",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">This is the moment outreach actually goes out. A send is one ceramic press inside a room — approve and transmit in a single motion, with the safeties underneath: a suppression re-check at the instant of send, a claim that makes a double-press physically unable to double-send, and a permanent line in the sent record that later upgrades to a <em>delivered ✓</em> stamp. You go in waves of about 8 (not all 25 at once) so you can watch the first replies and tweak the message before the next wave.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open the <em>reach out</em> chamber:</strong> ${L("/admin/tower", "/admin/tower")} — the stack is your queue.</li>
  <li class="d-step"><strong>Wave 1 (Day 11) — send ~8.</strong> Enter each room, read the letter one last time, press the seal. It confirms, then sends; the proof strip under the letter shows <em>sent ✓</em> and upgrades to <em>delivered ✓</em> when the delivery event lands. If something reads wrong, edit the body in place (<span class="d-ui">Save &amp; re-check canon</span>) or <span class="d-ui">Hold</span> it to the shelf. There is no batch send, on purpose — every letter gets your eyes.</li>
  <li class="d-step"><strong>Wave 2 (Day 12) — ~8 more, adjusted.</strong> If Wave 1 got replies to the "15-minute call" ask, leave it. If nobody bit, edit the remaining letters to switch the ask to "want the kit?" then press.</li>
  <li class="d-step"><strong>Wave 3 (Day 13) — the final ~9.</strong> Same pattern. The point of waving is reaction time; don't blast all 25 in one sitting.</li>
  <li class="d-step"><strong>Rooms with no address:</strong> paste an address into the attach form and the seal lights up — or copy the body, deliver it through their channel yourself, and press <span class="d-ui">Mark sent</span> so it's logged in the same audit trail.</li>
  <li class="d-step"><strong>Watch the record.</strong> ${L("/admin/tower/sent", "/admin/tower/sent")} lists every transmission with its delivery status.</li>
</ol>
<div class="d-end"><b>When you're done:</b> ~25 messages sent or marked-sent — rows in ${TBL("partner_sent_log")}, cards moved to the <em>waiting</em> chamber, and the follow-up ladder clock stamped on each.</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower")} · ${L("/admin/tower/sent", "the sent record")} · ${FILE("lib/partnerships/courier-send.ts", "the send path")} · ${TBL("partner_outbound_queue")} · ${TBL("partner_sent_log")}</div>`,
      },
      {
        id: "w3tLadder",
        audit: { state: "partial", note: "Built and waiting: the followup lever sits in the machinery drawer, default off. First-touch sends already stamp the ladder clock. Start the lever when you want the +4/+9 drafts." },
        title: "Days 15+ — The follow-up ladder drafts itself",
        tags: ["auto", "tower"],
        automatable: true,
        bodyHtml: `
<p class="d-what">A "ladder" is the fixed sequence of polite follow-ups to someone who got your first email and didn't reply. The cadence: <strong>first-touch (day 0) → +4 days: follow-up 1 → +9 days: follow-up 2 → +13 days: parked as cold.</strong> "+4 / +9" just means days <em>after</em> the first-touch. You used to track this by hand; now a cron does the watching and drafting.</p>
<p class="d-h">What runs on its own</p>
<ol class="d-steps">
  <li class="d-step"><strong>The clock starts when the first-touch sends.</strong> The moment a first-touch leaves a room (or you Mark-sent a manual one), that candidate's <code>first_touch_at</code> is stamped and they move to <span class="d-code">contacted</span> in ${TBL("partner_pipeline")}.</li>
  <li class="d-step"><strong>+4 days, no reply → follow-up 1 is drafted for you.</strong> The ${FILE("app/api/cron/followup/route.ts", "follow-up cron")} (hourly) renders ${FILE("content/partnerships/outreach/follow-up-1.md", "follow-up-1")} (adds a useful resource, not a nag) into that candidate's room as the live letter. You finish the one bespoke line (the resource) and press the seal — same as a first-touch.</li>
  <li class="d-step"><strong>+9 days, still no reply → follow-up 2 is drafted.</strong> ${FILE("content/partnerships/outreach/follow-up-2.md", "follow-up-2")} — the honest close. Same review-and-approve.</li>
  <li class="d-step"><strong>+13 days, still nothing → the candidate is set to <span class="d-code">cold</span></strong> automatically (your second-wave list, not deleted).</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">It halts the instant they reply</div><p>A ladder that keeps firing after someone answered is the fastest way to look like a bot. Two halts stop it cold: (a) you move them off <span class="d-code">contacted</span> when you work the reply, and (b) the cron itself checks for an inbound email from their address since the first-touch — either one stops all further follow-ups and flips them to <span class="d-code">replied</span>.</p></div>
<div class="d-end"><b>Your part:</b> just press (or hold) the follow-up letters as they appear in their rooms. The detection, timing, and drafting are automatic — once the <strong>followup</strong> lever in the machinery drawer is on.</div>
<div class="d-refs"><b>Touches</b>${FILE("app/api/cron/followup/route.ts", "follow-up cron")} · ${TBL("partner_pipeline")} · ${TBL("partner_outbound_queue")} · ${L("/admin/tower", "/admin/tower")}</div>`,
      },
      {
        id: "w3t2",
        audit: { state: "partial", note: "Mark-replied and the replies fold are live in every room; the auto-ping retired with sentinel, so watch the inbox. This one is ongoing work rather than a box to tick." },
        title: "Days 14–15 — Work the replies the tower surfaces",
        tags: ["you", "auto"],
        bodyHtml: `
<p class="d-what">As people reply, the thread lands in your inbox and in each candidate's room. Replying is human work — watch the inbox during send weeks; same-day replies are the whole game here.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>When a reply lands,</strong> it arrives in your inbox and in the room's replies fold. Open the room — the fold keeps the thread's record next to everything you know about them.</li>
  <li class="d-step"><strong>Reply same day from your AESDR address.</strong> A warm reply that waits 48 hours goes cold.</li>
  <li class="d-step"><strong>For a "yes, tell me more":</strong> send them the kit at ${L("/affiliates/kit", "/affiliates/kit")} plus your booking link ${L(BOOKING, "(15-min AESDR partner intro)")}.</li>
  <li class="d-step"><strong>For "what's the commission?":</strong> the honest numbers — 40% commission, 30-day attribution window, $249/$299 one-time product, paid through Stripe. Transparency is the pitch; don't hedge.</li>
  <li class="d-step"><strong>When you've replied, press the seal</strong> in their room ("they wrote back") — the card moves to the <em>talking</em> chamber.</li>
  <li class="d-step"><strong>Silence is fine</strong> — those stay in the <em>waiting</em> chamber and the follow-up ladder handles them later. A polite no goes to the bin from the room; hard bounces and complaints land on the suppression list automatically.</li>
</ol>
<div class="d-end"><b>When you're done:</b> every interested reply is answered within 24h and its room moved to <em>talking</em>. The booking calendar is ${L(BOOKING, "this Google Appointment link")} (cross-checks your personal calendars for conflicts).</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower")} · ${L("/affiliates/kit", "/affiliates/kit")} · ${L(BOOKING, "booking link")}</div>`,
      },
    ],
  },
  {
    id: "w4",
    phase: "p30",
    tag: "Week 4 · Days 16–22",
    title: "First conversations + the attribution call.",
    intro:
      "Real candidates on calendar holds. You turn conversations into verbal yeses, and you make the attribution-platform decision the role puts on your desk by Day 30.",
    tasks: [
      {
        id: "w4t1",
        audit: { state: "open", note: "Not verifiable from the repo (no call log). The booking link is live." },
        title: "Days 16–19 — Run partner intro calls (target: 8–10)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">These are 15-minute fit-check calls, not hard sells. You send a prep bundle beforehand so the call itself is short and mutual. The goal of each call is a clear yes/maybe/no, logged.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Send the Pre-Call Bundle 24–48h before each call:</strong> the audience-sized earnings one-pager, a 90-second founder video, the course preview, the kit, and the transparency page. The full bundle — what each asset is, who builds it, and the exact dispatch line — is in the <a class="d-link" href="#ref-precall">Pre-Call Bundle card in the Toolkit below</a>; the always-live piece is the kit at ${L("/affiliates/kit", "/affiliates/kit")}. The bundle does the convincing so the call is a conversation.</li>
  <li class="d-step"><strong>Two minutes before the call,</strong> reopen that candidate's dossier brief and the one specific piece of theirs you referenced in outreach, so your opening line names something real they made.</li>
  <li class="d-step"><strong>Hit four beats:</strong> (1) why you reached out to <em>them</em> specifically; (2) the mechanics — 40% / 30-day window / tracked link + kit; (3) the brand-fit gate, framed as protecting <em>their</em> audience's trust ("we read your first few posts so they sound like you, not an ad — then you post freely"); (4) their questions — let this be most of the call.</li>
  <li class="d-step"><strong>Close on a binary:</strong> "I send the kit today and we talk again [day], OR I set your link up this week — which is easier?" Never end on "let me think."</li>
  <li class="d-step"><strong>Log it right after.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: set [name] in partner_pipeline to status 'negotiating' <span class="c">// a yes or maybe</span> — or 'passed' if it was a no.</span></li>
</ol>
<div class="d-end"><b>When you're done:</b> 8–10 calls done, each candidate moved to <span class="d-code">negotiating</span> or <span class="d-code">passed</span> in ${TBL("partner_pipeline")}.</div>
<div class="d-refs"><b>Touches</b><a class="d-link" href="#ref-precall">Pre-Call Bundle (toolkit)</a> · ${L("/affiliates/kit", "kit")} · ${TBL("partner_pipeline")} · ${FILE(".claude/agents/ledger.md", "ledger")}</div>`,
      },
      {
        id: "w4t2",
        audit: { state: "open", note: "docs/partnerships/attribution-decision.md does not exist. The call itself is made — stay custom, per the Attribution card — so the memo is a twenty-minute write." },
        title: "Days 20–22 — Decide the attribution platform & write the memo",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">You now know your real numbers — roughly 25 contacted, 8–10 in conversation, a feel for payout cadence. That's enough to make the attribution call you opened on Day 5. The deliverable is a one-page memo to the founder, not just a private decision.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Re-read the audit:</strong> ${FILE("docs/partnerships/attribution-build-cost.md", "attribution-build-cost.md")}.</li>
  <li class="d-step"><strong>Make the call.</strong> The likely answer: keep the custom Supabase+Stripe system ($0) for now, and switch to <strong>Rewardful</strong> ($49/mo) the moment partner self-serve dashboards become the bottleneck. Name the exact trigger condition that would flip you.</li>
  <li class="d-step"><strong>Write the memo.</strong> Create ${FUTURE("docs/partnerships/attribution-decision.md", "docs/partnerships/attribution-decision.md")} (in your terminal: <span class="d-code">touch docs/partnerships/attribution-decision.md</span>, then open it in your editor). One page: what you chose, the gaps it closes, the trigger that flips you to Rewardful, the cost both ways.</li>
  <li class="d-step"><strong>Send it to the founder</strong> by email — this is a founder-aligned strategic call, not just a commit.</li>
</ol>
<div class="d-end"><b>When you're done:</b> the memo exists at ${FUTURE("docs/partnerships/attribution-decision.md", "attribution-decision.md")} and is in the founder's inbox. The clearing automation is already live (${FILE("app/api/cron/affiliate/route.ts", "affiliate cron")}), so there's no plumbing to add if you stay custom.</div>`,
      },
    ],
  },
  {
    id: "w45",
    phase: "p30",
    tag: "Week 4½ · Days 23–30",
    title: "Close the phase. Hit the milestone.",
    intro:
      "Convert verbal yeses into tracked affiliates and lock the four Phase-30 milestones, then send the 30-day memo.",
    tasks: [
      {
        id: "w45t1",
        audit: { state: "open", note: "No affiliates onboarded yet; /admin/affiliates/new and the review queue are built and waiting." },
        title: "Days 23–27 — Onboard the first 3–5 affiliates",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">"Onboarding" = turning a verbal yes into a real affiliate row with a tracking link and kit access, then starting them through the copy-review gate. Creating the row automatically emails them their welcome. End result: 3–5 active affiliates with their first piece in review.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Create each affiliate.</strong> Go to ${L("/admin/affiliates/new", "/admin/affiliates/new")}. Fill display name, email, and archetype (from their dossier brief), set tier to <strong>developing</strong>, click <span class="d-ui">Create</span>. This mints their unique slug, writes the row to ${TBL("affiliates")}, and auto-sends the onboarding email.</li>
  <li class="d-step"><strong>Flip them to active.</strong> Open the affiliate at <span class="d-where">/admin/affiliates/[their-slug]</span> (you'll get there by clicking their name in ${L("/admin/affiliates", "/admin/affiliates")}). Change status from <span class="d-code">vetting</span> to <span class="d-code">active</span>. Confirm the row reads <span class="d-code">commission_pct = 40</span> and <span class="d-code">attribution_window_days = 30</span>.</li>
  <li class="d-step"><strong>Send them two links</strong> in one email from your AESDR address: their private kit at ${L("/affiliates/kit-private", "/affiliates/kit-private")} and the playbook for their archetype at ${L("/affiliates/dashboard/playbooks", "/affiliates/dashboard/playbooks")}.</li>
  <li class="d-step"><strong>Review their first piece</strong> when it lands in ${L("/admin/affiliates/queue", "/admin/affiliates/queue")} (the affiliate copy-submission queue — separate from the tower's outbound drafts). Copy the text, then in Claude Code:
    <span class="d-cmd">use the warden subagent on this affiliate submission: [paste]. Give me APPROVE, EDITS (with exact line rewrites), or DECLINE against canon.</span>
    Apply the verdict in the queue UI. First-timers get EDITS with rewrites, never DECLINE — you're teaching the voice.</li>
</ol>
<div class="d-end"><b>When you're done:</b> 3–5 rows at <span class="d-code">active</span> in ${TBL("affiliates")}, kit links sent, first copy in review at ${L("/admin/affiliates/queue", "/admin/affiliates/queue")}.</div>
<div class="d-refs"><b>Touches</b>${L("/admin/affiliates/new", "/admin/affiliates/new")} · ${L("/admin/affiliates", "/admin/affiliates")} · ${L("/admin/affiliates/queue", "queue")} · ${TBL("affiliates")} · ${L("/affiliates/kit-private", "private kit")} · ${L("/affiliates/dashboard/playbooks", "playbooks")} · ${FILE(".claude/agents/warden.md", "warden")}</div>`,
      },
      {
        id: "w45t2",
        audit: { state: "open", note: "The phase-30 memo has not been written." },
        title: "Days 28–30 — Phase-30 review + the founder memo",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Close the phase by checking the four milestones against real evidence and sending the founder an 8-line memo. The four milestones: discovery documented, 25 candidates identified, outreach started, attribution platform chosen.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Pull the numbers.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: for a phase-30 review, return these counts — total affiliate candidates in partner_pipeline, how many at status 'contacted', how many at 'call_booked' or 'negotiating', how many affiliates are 'active', and total rows in affiliate_attributions.</span></li>
  <li class="d-step"><strong>Check each milestone against an artifact:</strong> discovery documented → ${FILE("docs/partnerships/discovery-doctrine.md", "discovery-doctrine.md")} exists; 25 candidates → ${TBL("partner_pipeline")} count ≥ 25; outreach started → "recent sends" on ${L("/admin/tower", "/admin/tower")}; platform chosen → ${FUTURE("docs/partnerships/attribution-decision.md", "attribution-decision.md")} sent. If any is short, that's the lead of the memo, not something to hide.</li>
  <li class="d-step"><strong>Draft the memo.</strong> Paste:
    <span class="d-cmd">use the almanac subagent: write the 30-day founder memo from ledger's numbers. Cover numbers vs each milestone, what converted, what didn't, and the one change for Phase 60. Eight lines, not a report.</span></li>
  <li class="d-step"><strong>Send it</strong> to the founder.</li>
</ol>
<div class="d-end"><b>When you're done:</b> a four-milestone-evidenced memo is in the founder's inbox.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE(".claude/agents/almanac.md", "almanac")} · ${TBL("partner_pipeline")} · ${FILE("docs/partnerships/discovery-doctrine.md", "doctrine")} · ${FUTURE("docs/partnerships/attribution-decision.md", "decision memo")}</div>`,
      },
    ],
  },

  // ══════════════════════════════ PHASE 60 ══════════════════════════════
  {
    id: "w5",
    phase: "p60",
    tag: "Week 5 · Days 31–37",
    title: "Through the copy gate. First attributed dollars.",
    intro:
      "A signed affiliate who never posts is worth zero. Get the first cohort live through the copy gate, then prove a click actually writes a commission.",
    tasks: [
      {
        id: "w5t1",
        audit: { state: "open", note: "Waits on the first onboarded cohort; the queue and warden are ready." },
        title: "Days 31–34 — Drive the first cohort through the copy gate",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">The "copy gate" is the rule that a new (developing-tier) affiliate's first 3 posts get reviewed before they can post freely — so borrowed trust never turns into a guru-style ad. Your job is fast turnaround: a slow review is the #1 reason a new affiliate goes quiet in month one.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Point each affiliate at their playbook:</strong> email them ${L("/affiliates/dashboard/playbooks", "/affiliates/dashboard/playbooks")} → they pick their archetype roadmap, draft a piece, and submit it at ${L("/affiliates/dashboard/submissions", "/affiliates/dashboard/submissions")}.</li>
  <li class="d-step"><strong>Their submission appears in your queue</strong> at ${L("/admin/affiliates/queue", "/admin/affiliates/queue")}.</li>
  <li class="d-step"><strong>Review within 24 business hours.</strong> Copy the text, then in Claude Code:
    <span class="d-cmd">use the warden subagent on this affiliate submission: [paste]. Verdict APPROVE / EDITS / DECLINE against canon, and if EDITS, give exact line rewrites in their voice.</span></li>
  <li class="d-step"><strong>Apply the verdict</strong> in the queue UI. APPROVE ticks their counter +1. At 3 approved (developing tier) or 1 (proven tier), the gate drops and they post freely.</li>
  <li class="d-step"><strong>Tell them the moment they clear.</strong> Their first free post is the activation moment — celebrate it.</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">Why speed matters</div><p>The biggest cause of month-one churn is a review that takes a week. Warden gives you same-day. A partner whose first post is live by Day 35 stays; one still waiting on Day 45 ghosts.</p></div>
<div class="d-end"><b>When you're done:</b> each first-cohort affiliate has ≥1 approved piece and the gate-clearers are posting. Track it in ${L("/admin/affiliates/queue", "/admin/affiliates/queue")} and ${TBL("affiliates")}.</div>`,
      },
      {
        id: "w5t2",
        audit: { state: "open", note: "The machine is fully built (tracked link → pending row → auto-clear cron); the hand test hasn't been run." },
        title: "Days 35–37 — Prove a click writes a commission",
        tags: ["you", "auto"],
        automatable: true,
        bodyHtml: `
<p class="d-what">Before real traffic arrives, confirm the whole money path works: an affiliate's link → a tracked click → a purchase → a "pending" commission row → automatic clearing after the 30-day refund window. You test it once by hand; the clearing is automatic forever after.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Grab a real tracked link.</strong> From an active affiliate's dashboard at ${L("/affiliates/dashboard/links", "/affiliates/dashboard/links")}, copy their link (it routes through ${FILE("app/r/[slug]/route.ts", "the /r/[slug] redirect")}).</li>
  <li class="d-step"><strong>Test the click.</strong> Open the link in a private/incognito window and confirm it lands on the buy page. Then complete a test purchase (a Stripe test card, or a real $249 you refund after).</li>
  <li class="d-step"><strong>Verify the commission row appeared.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: show the latest rows in affiliate_attributions — affiliate slug, status, the sale amount, the commission amount, and the refund_window_closes_at date.</span>
    You want a row at status <span class="d-code">pending</span> with the window set 30 days out. If there's no row, the click→commission wiring is broken — tell me before any real partner sends traffic. View the table directly: ${TBL("affiliate_attributions")}.</li>
  <li class="d-step"><strong>The clearing is automatic.</strong> ${FILE("app/api/cron/affiliate/route.ts", "The affiliate cron")} promotes <span class="d-code">pending → cleared</span> once the 30 days pass and the purchase is still active. You never touch it.</li>
  <li class="d-step"><strong>Walk the affiliate through their dashboard</strong> at ${L("/affiliates/dashboard", "/affiliates/dashboard")} so they can see their own clicks and pending commission — that visibility stops the "am I getting credit?" emails before they start.</li>
</ol>
<div class="d-end"><b>When you're done:</b> a real test click produced a <span class="d-code">pending</span> row in ${TBL("affiliate_attributions")} with the 30-day window set.</div>
<div class="d-refs"><b>Touches</b>${FILE("app/r/[slug]/route.ts", "redirect route")} · ${TBL("affiliate_attributions")} · ${FILE("app/api/cron/affiliate/route.ts", "affiliate cron")} · ${L("/affiliates/dashboard", "affiliate dashboard")}</div>`,
      },
    ],
  },
  {
    id: "w6",
    phase: "p60",
    tag: "Week 6 · Days 38–44",
    title: "Turn on the channel.",
    intro:
      "The enterprise channel program is built and unlaunched. You flip it on — a different motion (selling to teams via partner orgs), a different buyer, the same brand. Herald is your discovery + structuring agent here.",
    tasks: [
      {
        id: "w6t1",
        audit: { state: "open", note: "Untouched; herald and the ten named channel orgs in Prospect Intel are ready." },
        title: "Days 38–40 — Build the channel target list (herald)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">"Channel partners" are organizations that put AESDR in front of whole sales teams — sales-enablement consultancies, fractional VP-Sales networks, RevOps shops, training firms — rather than individual creators. Herald is the agent that finds and structures them. End result: 3 strong channel candidates in your pipeline.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Herald has a head start.</strong> Ten named channel orgs with fit rationale already exist — see the channel section of the legacy doc at ${L("/partnerships-os", "/partnerships-os")} (Prospect Intel → channel). Verify these first.</li>
  <li class="d-step"><strong>Walk what a partner would resell</strong> (browser): ${L("/enterprise", "/enterprise")} → ${L("/enterprise/channel", "/enterprise/channel")} → ${L("/enterprise/diagnostic", "/enterprise/diagnostic")}. You can't pitch channel until you've seen the product they'd put their name on.</li>
  <li class="d-step"><strong>Source more with herald.</strong> Paste:
    <span class="d-cmd">use the herald subagent: find 10 channel candidates across sales-enablement consultants, fractional VP-Sales networks, RevOps consultancies, and training firms that LACK a junior SDR/AE curriculum. For each: what they sell, who they reach, how AESDR fills a gap without competing, and a proposed structure (referral fee / reseller margin / co-delivery).</span></li>
  <li class="d-step"><strong>Run the non-cannibalization test</strong> herald flags on each: does AESDR fill a gap in their offer, or compete with it? A firm that already sells a first-year curriculum is a competitor; keep them only with a carved-out segment.</li>
  <li class="d-step"><strong>Save the strongest 3.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: insert these 3 channel orgs into partner_pipeline with motion='channel' and status='enriched': [paste herald's output].</span></li>
</ol>
<div class="d-end"><b>When you're done:</b> 3 candidates at <span class="d-code">motion='channel'</span> in ${TBL("partner_pipeline")}.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/herald.md", "herald")} · ${L("/enterprise", "/enterprise")} · ${L("/enterprise/channel", "/enterprise/channel")} · ${L("/partnerships-os", "legacy Prospect Intel")} · ${TBL("partner_pipeline")}</div>`,
      },
      {
        id: "w6t2",
        audit: { state: "open", note: "No channel conversations opened." },
        title: "Days 41–44 — Open 3 channel conversations",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">Channel outreach is written by hand (the room's press only writes consumer affiliate templates) because the pitch leads with the specific gap you fill in <em>their</em> practice, never with a commission rate. You still route the send through the tower so it's logged in the same audit trail.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Draft each first-touch with herald.</strong> Paste:
    <span class="d-cmd">use the herald subagent: draft the channel first-touch for [org]. Lead with the gap we fill in their practice, name one structure (referral / reseller / co-delivery), keep it short, reply-to affiliates@aesdr.com.</span></li>
  <li class="d-step"><strong>Put each into a new tower draft</strong> so the send + log runs through the audited path. Most channel contacts are web forms, so these land as <span class="d-ui">manual send</span> — you submit via their form, then click <span class="d-ui">Mark sent</span> on the card.</li>
  <li class="d-step"><strong>Flag founder-sized deals now,</strong> not mid-negotiation. If a deal is big enough to need the founder on the call, say so up front.</li>
  <li class="d-step"><strong>Log the motion.</strong> Each lives at <span class="d-code">motion='channel'</span> in ${TBL("partner_pipeline")}, moving through the same ladder (contacted → replied → negotiating).</li>
</ol>
<div class="d-end"><b>When you're done:</b> 3 channel conversations open (status <span class="d-code">replied</span> or <span class="d-code">negotiating</span>) — the Day-60 milestone.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/herald.md", "herald")} · ${L("/admin/tower", "/admin/tower")} · ${TBL("partner_pipeline")}</div>`,
      },
    ],
  },
  {
    id: "w7",
    phase: "p60",
    tag: "Week 7 · Days 45–51",
    title: "Reporting goes live. First payout.",
    intro:
      "You can't manage what you can't see, and the founder can't trust what you can't show. Reporting goes from ad-hoc to standing — and the first real money moves, with the founder's sign-off.",
    tasks: [
      {
        id: "w7done1",
        audit: { state: "done", note: "The lever now lives in the machinery drawer at the bottom of the warren — there is no Agent Controls panel anymore." },
        title: "Wired and ready — the daily standup digest (start the lever to use it)",
        tags: ["auto"],
        automatable: true,
        bodyHtml: `
<p class="d-what">The old plan had you build a "Friday ritual" by hand. The daily standup is built and waits behind one lever.</p>
<p class="d-h">What runs once you start it</p>
<ol class="d-steps">
  <li class="d-step">${FILE("app/api/cron/almanac/route.ts", "The almanac cron")} fires every morning at 11:00 UTC (≈7am ET) — <em>only when the <span class="d-ui">Almanac</span> lever is started in the <strong>machinery drawer</strong> (bottom of the warren)</em>. It counts bright signals waiting, drafts in the house, workshops due, and payouts ready, and mails you the digest (subject "Tower: all clear" on a quiet day). Until you start the lever, no digest mails.</li>
  <li class="d-step">The weekly deep pull below is what you add on top — that one stays a chat dispatch.</li>
</ol>
<div class="d-end"><b>Nothing to build.</b> Just read the morning email.</div>`,
      },
      {
        id: "w7t1",
        audit: { state: "open", note: "The affiliate_weekly_report view has not been created." },
        title: "Days 45–48 — Stand up the weekly reporting pull",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">A "reporting view" is a saved database query that rolls up the weekly numbers per affiliate into one place, so the Friday founder note is one command instead of five. You build it once with ledger; after that it's reusable forever.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Build the rollup.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: create or replace a database view called affiliate_weekly_report that shows, per affiliate — clicks in the last 7 days, pending vs cleared commission, paid-to-date, and the aggregate trajectory toward $3k/mo. Show me the SQL before you create it.</span></li>
  <li class="d-step"><strong>Eyeball it once.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: select everything from affiliate_weekly_report and show me the result.</span>
    Confirm the columns read right. You can also browse the underlying tables ${TBL("affiliates")}, ${TBL("affiliate_attributions")}, and ${TBL("affiliate_links")} in ${L(SBTBL, "the table editor")}.</li>
  <li class="d-step"><strong>Make the Friday note one command.</strong> Each Friday paste:
    <span class="d-cmd">use the almanac subagent: turn this week's affiliate_weekly_report into the 8-line founder note.</span>
    Forward the result. Same time every week — predictability is its own trust signal.</li>
</ol>
<div class="d-end"><b>When you're done:</b> the <span class="d-code">affiliate_weekly_report</span> view exists (you can see it in ${L(SBTBL, "Supabase")}) and the first Friday note is sent.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE(".claude/agents/almanac.md", "almanac")} · ${TBL("affiliates")} · ${TBL("affiliate_attributions")}</div>`,
      },
      {
        id: "w7t2",
        audit: { state: "open", note: "The Payouts block and its Pay button are live on the floor; no payout has run." },
        title: "Days 49–51 — First payout dry-run (founder-approved)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">By now your earliest commissions are clearing the 30-day window. The warren's <strong>Payouts waiting</strong> block shows the dry-run automatically — who's owed what — and each affiliate has a <strong>Pay</strong> button that runs the real Stripe Connect transfer. Money review is the one place the "under 10 minutes" rule bends: take as long as you need to read the numbers; the commit is one click.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open the warren:</strong> ${L("/admin/tower", "/admin/tower")}. The <strong>Payouts waiting</strong> block appears below the band whenever there's cleared-but-unpaid commission — per-affiliate totals and the grand total. That <em>is</em> the dry-run, computed live from ${TBL("affiliate_attributions")} (status cleared, not yet paid).</li>
  <li class="d-step"><strong>Review the numbers</strong> — per-affiliate totals + the grand total. For the very first run, walk the founder through it; it's a founder-approved decision, not a solo call.</li>
  <li class="d-step"><strong>Press <span class="d-ui">Pay $X</span>.</strong> It asks you to confirm (it moves real money), then runs the production payout: aggregates that affiliate's cleared commission, inserts the payout record, sends a Stripe Connect transfer, marks everything paid, and emails the affiliate. One click, end to end.</li>
  <li class="d-step"><strong>If a card says "Stripe not connected,"</strong> that affiliate hasn't finished Stripe onboarding — the transfer would be rejected. Have them complete onboarding from their ${L("/affiliates/dashboard", "dashboard")} first; then the Pay button enables.</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">Want a deeper pre-check first?</div><p>You can still dispatch ledger for an itemized audit before pressing Pay: <span class="d-cmd">use the ledger subagent: list every cleared-but-unpaid commission per affiliate and flag a refund rate over 15% or one affiliate over 60% of volume. Report only; do not pay.</span></p></div>
<div class="d-end"><b>When you're done:</b> Stripe shows the transfer, the affiliate's dashboard reads "paid," and ${TBL("affiliate_payouts")} has the record. The Payouts card empties as each is paid.</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower — Payouts card")} · ${FILE("app/admin/tower/PayoutButton.tsx", "PayoutButton")} · ${FILE("app/actions/affiliate.ts", "runAffiliatePayoutBatch")} · ${TBL("affiliate_attributions")} · ${TBL("affiliate_payouts")}</div>`,
      },
    ],
  },
  {
    id: "w8",
    phase: "p60",
    tag: "Week 8 · Days 52–60",
    title: "Both motions breathing.",
    intro:
      "Lock the milestones: 10 affiliates active, 3 channel conversations open, reporting live. Then stabilize so Phase 90 compounds instead of firefighting.",
    tasks: [
      {
        id: "w8t1",
        audit: { state: "open" },
        title: "Days 52–56 — Push to 10 active affiliates",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">Convert the warm middle of your pipeline into active affiliates, and unstick anyone who stalled in the copy gate. The bar holds: 7 great affiliates beat 10 where 4 never post.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Work the warm middle first.</strong> On the tower's <strong>Pipeline</strong> board (${L("/admin/tower", "/admin/tower")}), the <span class="d-code">negotiating</span> count is your fastest path to active. Send each the onboarding follow-up and run them through the Day-23 create-affiliate flow as they say yes.</li>
  <li class="d-step"><strong>Unstick the gate-stalled.</strong> For any developing-tier affiliate sitting on an unfinished first piece, book a 15-minute co-writing call — you and warden draft their first approved post live. That revives a stalled partner faster than three rounds of async.</li>
  <li class="d-step"><strong>Refill only if thinning.</strong> If the funnel is thin the move is a fresh sweep — finished cards land in the band and you write from their rooms. Never lower the voice-fit bar to pad the count.</li>
</ol>
<div class="d-end"><b>When you're done:</b> 10 rows at <span class="d-code">active</span> in ${TBL("affiliates")} with ≥1 approved piece each — or the founder has the honest lower number and why.</div>`,
      },
      {
        id: "w8t2",
        audit: { state: "open" },
        title: "Days 57–60 — Phase-60 review + trajectory check",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Close Phase 60 by checking the three milestones and deciding the Phase-90 bet: spread wider (more affiliates) or go deeper (overinvest in the top performers). This late, deeper usually wins.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Check the three milestones against artifacts:</strong> 10 active → ${TBL("affiliates")} count; 3 channel conversations → <span class="d-code">motion='channel'</span> rows at replied/negotiating in ${TBL("partner_pipeline")}; reporting live → the <span class="d-code">affiliate_weekly_report</span> view + a sent Friday note.</li>
  <li class="d-step"><strong>Get the trajectory math.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: show cleared plus pending commission by month, so I can see whether we're trending toward a $3k/mo run-rate. Pending counts — it just hasn't cleared the refund window yet.</span></li>
  <li class="d-step"><strong>Write the 60-day memo and decide the bet.</strong> Paste:
    <span class="d-cmd">use the almanac subagent: write the 60-day founder memo — which affiliates are producing, which channel conversation is closest, the one bottleneck to remove for Phase 90, and a recommendation: wider or deeper?</span>
    Send it to the founder with your call.</li>
</ol>
<div class="d-end"><b>When you're done:</b> the 60-day memo is sent and the wider-vs-deeper bet is decided.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE(".claude/agents/almanac.md", "almanac")} · ${TBL("affiliates")} · ${TBL("partner_pipeline")} · ${TBL("affiliate_attributions")}</div>`,
      },
    ],
  },

  // ══════════════════════════════ PHASE 90 ══════════════════════════════
  {
    id: "w9",
    phase: "p90",
    tag: "Week 9 · Days 61–67",
    title: "Double down on what converts.",
    intro:
      "You have data now — which partners, formats, and messages convert. Stop spreading thin: pour into the winners and turn the first channel conversation into paper.",
    tasks: [
      {
        id: "w9t1",
        audit: { state: "open" },
        title: "Days 61–64 — Find your top 3 and overinvest",
        tags: ["you", "auto"],
        automatable: true,
        bodyHtml: `
<p class="d-what">Identify your three best-performing affiliates by commission, figure out <em>why</em> they work, and pour resources into them and lookalikes. One of the overinvestment moves — running a workshop — is now almost entirely automated.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Rank your performers.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: rank affiliates by attributed commission and show me the top 3, with their archetype and deal count.</span></li>
  <li class="d-step"><strong>Find the pattern.</strong> Paste:
    <span class="d-cmd">use the almanac subagent: for each of these top 3, tell me WHY they converted — format (newsletter / community / podcast), message angle, audience. I want the repeatable pattern, not praise.</span></li>
  <li class="d-step"><strong>Overinvest, three moves:</strong> (1) co-create a second piece with each; (2) run a <strong>workshop</strong> — create the workshop row and ${FILE("app/api/cron/usher/route.ts", "usher")} runs every reminder, the replay window, and the nurture touches automatically; you just host the live hour; (3) bump a proven performer to <span class="d-code">proven</span> tier in ${L("/admin/affiliates", "/admin/affiliates")} so their copy-gate drops to 1 piece.</li>
  <li class="d-step"><strong>Clone the pattern.</strong> Press whichever sweep button matches your top-3's surface — usually <span class="d-ui">Communities</span> or <span class="d-ui">Newsletters &amp; podcasts</span>. New cards land already briefed and verdict-called; write and send from the rooms that resemble your top 3.</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">Usher carries the workshop</div><p>Once a workshop row exists in ${TBL("partner_workshop")}, ${FILE("app/api/cron/usher/route.ts", "usher")} advances it through scheduled → reminded → live → replay-open → closed and queues every registrant touch pre-approved. You host; the logistics run themselves.</p></div>
<div class="d-end"><b>When you're done:</b> the top 3 are identified, each has a second piece or a workshop in motion, and scout is finding lookalikes.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE(".claude/agents/almanac.md", "almanac")} · ${FILE(".claude/agents/scout.md", "scout")} · ${FILE("app/api/cron/usher/route.ts", "usher")} · ${TBL("partner_workshop")} · ${L("/admin/affiliates", "/admin/affiliates")}</div>`,
      },
      {
        id: "w9t2",
        audit: { state: "open" },
        title: "Days 65–67 — Move the lead channel deal toward signature",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Pick the single warmest channel conversation and push it to signed-or-close. Don't split focus across all three this late. Channel deals are relationship plus paper — a founder signature carries weight yours can't.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Pick the lead</strong> — the channel org furthest along (warmest replies, at <span class="d-code">negotiating</span> in ${TBL("partner_pipeline")}).</li>
  <li class="d-step"><strong>Draft the terms with herald.</strong> Paste:
    <span class="d-cmd">use the herald subagent: draft a one-page terms doc for [org] — the structure (referral / reseller / co-delivery), how an enterprise deal traces back to them (promo code / dedicated link / manual ref), the commercial split, and the term length. One page, not a contract.</span></li>
  <li class="d-step"><strong>Bring the founder in for the close.</strong> Schedule a 3-way call. You drive the mechanics; the founder lends the gravity. Flag legal early if anything is contractual.</li>
</ol>
<div class="d-end"><b>When you're done:</b> the lead channel deal has draft terms in front of the partner and the founder is looped in.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/herald.md", "herald")} · ${TBL("partner_pipeline")}</div>`,
      },
    ],
  },
  {
    id: "w1011",
    phase: "p90",
    tag: "Week 10–11 · Days 68–81",
    title: "Make it run without heroics.",
    intro:
      "A function that only works when you're manually pushing every lever is a bottleneck with your name on it. These two weeks turn the motion into a cadence that runs on rails — which, by now, mostly means the tower.",
    tasks: [
      {
        id: "w1011t1",
        audit: { state: "open", note: "operating-cadence.md does not exist. When you write it, describe the warren and its four levers — not the cron fleet this task's body lists." },
        title: "Days 68–74 — Codify the operating cadence",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Write down the weekly rhythm so a stranger (or a future hire) could run it. The honest version of this deliverable is now short, because the cadence <em>is</em> the tower plus a few weekly dispatches.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Create the doc.</strong> In your terminal: <span class="d-code">touch docs/partnerships/operating-cadence.md</span>, then open it. (It'll live at ${FUTURE("docs/partnerships/operating-cadence.md", "docs/partnerships/operating-cadence.md")} once committed.)</li>
  <li class="d-step"><strong>Write the daily rhythm:</strong> the 7am almanac digest lands → you open ${L("/admin/tower", "/admin/tower")}, clear the chambers that need you (<em>reach out</em>, <em>your call</em>), answer anything <em>talking</em>, close the tab. That's the standup.</li>
  <li class="d-step"><strong>Write down what's continuous and automatic</strong> — the four levers in the machinery drawer, and only while started: ${FILE("app/api/cron/followup/route.ts", "followup")} hourly, ${FILE("app/api/cron/usher/route.ts", "usher")} every 30 min, ${FILE("app/api/cron/almanac/route.ts", "almanac")} daily, ${FILE("app/api/cron/contact-finder/route.ts", "contact-finder")} on its tick. Everything else is your press. (Refresh ${FILE("docs/partnerships/cron-schedule.md", "cron-schedule.md")} while you're in there — it predates the manual-only consolidation.)</li>
  <li class="d-step"><strong>Write the weekly rhythm:</strong> Friday — dispatch ledger for the report, almanac for the founder note. Paste the actual dispatch commands so they're copy-runnable.</li>
</ol>
<div class="d-end"><b>When you're done:</b> ${FUTURE("docs/partnerships/operating-cadence.md", "operating-cadence.md")} is committed and a stranger could run your week from it plus the tower. This is the role's real success deliverable — the function runs without founder day-to-day involvement.</div>`,
      },
      {
        id: "w1011t2",
        audit: { state: "open" },
        title: "Days 75–81 — Second affiliate wave + workshop pilot",
        tags: ["tower", "auto"],
        automatable: true,
        bodyHtml: `
<p class="d-what">Run a second wave of outreach at scale — almost hands-free now that the machine works — and pilot a live workshop with your strongest affiliate.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Run the second wave.</strong> Press fresh sweeps — finished cards land in the band — and pull the <span class="d-code">cold</span> rows you parked in Week 2 back onto the floor with <span class="d-ui">Reconsider</span> from their rooms. Then write and send room by room at ${L("/admin/tower", "/admin/tower")}.</li>
  <li class="d-step"><strong>Pilot a workshop.</strong> Create a row in ${TBL("partner_workshop")} (a date in US Central business hours) — ${FILE("app/api/cron/usher/route.ts", "usher")} handles every reminder and the replay window. A live workshop converts 3–5× a link drop.</li>
  <li class="d-step"><strong>Keep the funnel deep</strong> so Day 90 isn't a cliff.</li>
</ol>
<div class="d-end"><b>When you're done:</b> 25 new candidates in the funnel and one workshop scheduled with your top affiliate.</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower — the sweep row")} · ${FILE("app/api/cron/usher/route.ts", "usher")} · ${TBL("partner_pipeline")} · ${TBL("partner_workshop")}</div>`,
      },
    ],
  },
  {
    id: "w1213",
    phase: "p90",
    tag: "Week 12–13 · Days 82–90",
    title: "Prove it. Hand over a running machine.",
    intro:
      "The final stretch: hit the $3k/mo trajectory, get the channel deal signed or clearly close, and deliver the 90-day proof that the function exists and runs.",
    tasks: [
      {
        id: "w1213t1",
        audit: { state: "open" },
        title: "Days 82–86 — Hit the $3k/mo trajectory + run payouts clean",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Push the run-rate to the $3k/mo target, run a clean month-end payout (the process the founder approved in Phase 60), and check program health.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Check the run-rate.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: show booked commission (pending plus cleared) this month versus the $3k target.</span>
    If close-but-under, your lever is the Week-9 top 3 — push one more piece from each, don't chase cold partners this late.</li>
  <li class="d-step"><strong>Run the month-end payout.</strong> Open the warren's <strong>Payouts waiting</strong> block (${L("/admin/tower", "/admin/tower")}), review the per-affiliate totals, press <span class="d-ui">Pay</span> on each. Verify every dashboard reads "paid" and Stripe reconciles; records land in ${TBL("affiliate_payouts")}.</li>
  <li class="d-step"><strong>Run the health check.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: show the refund rate per affiliate. Flag anyone over 15%.</span>
    Over 15% is a partner over-promising — book a warden review + a debrief call; it's a copy problem, not a payout problem. Suspend only at 20%.</li>
</ol>
<div class="d-end"><b>When you're done:</b> run-rate at/near $3k/mo, payout ran clean (${TBL("affiliate_payouts")}), refund rate under 15%.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${L("/admin/affiliates", "/admin/affiliates")} · ${TBL("affiliate_attributions")} · ${TBL("affiliate_payouts")}</div>`,
      },
      {
        id: "w1213t2",
        audit: { state: "open" },
        title: "Days 87–90 — The 90-day proof + next-quarter plan",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Deliver the proof that the function exists and runs, evidenced with numbers and artifacts, plus a next-quarter plan. The strongest evidence isn't any single metric — it's the tower running the function while you direct it.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Build the proof.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: give me the full 90-day pull — candidates, active affiliates, attributions, commission booked, channel status.</span>
    Then: <span class="d-cmd">use the almanac subagent: write it up as the 90-day proof, evidencing each milestone with a number or an artifact.</span></li>
  <li class="d-step"><strong>Evidence all three milestones:</strong> affiliates on a $3k/mo trajectory (run-rate); one channel deal signed or close (the terms doc); both motions running (active affiliate count in ${TBL("affiliates")} + channel rows in ${TBL("partner_pipeline")}).</li>
  <li class="d-step"><strong>Show the tower as the proof of "runs without heroics"</strong> — the schedule in ${FILE("docs/partnerships/cron-schedule.md", "cron-schedule.md")}, the daily digest, and chambers that are usually already clear. That's the real success definition.</li>
  <li class="d-step"><strong>Present the next-quarter plan:</strong> the second-wave pipeline, the channel deals in flight, the top-performer pattern to clone, and the one tool the data now justifies (e.g. Rewardful at the dashboard-bottleneck trigger from your ${FUTURE("docs/partnerships/attribution-decision.md", "attribution memo")}).</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">What "overachieve" looks like here</div><p>Not 10 affiliates — 15. Not "3 conversations" — one signed channel deal plus 3 more open. Not "reporting live" — a founder who hasn't had to ask for a number in a month because it's in front of him every Friday. The bar is making the milestones look conservative.</p></div>
<div class="d-end"><b>When you're done:</b> the 90-day proof is delivered, three milestones evidenced, next-quarter plan presented.</div>`,
      },
    ],
  },
];

// ════════════════════════════════ TOOLKIT ════════════════════════════════
// The reference shelf — ported from the legacy partnerships-os doc. Static
// reference, not day-by-day tasks. Agent specs + outreach templates link to
// their canonical files (single source of truth); data that only lives here
// (prospects, levers, benchmarks, attribution, metrics) is rendered inline.
export type RefSection = { id: string; title: string; subtitle: string; audit?: Audit; bodyHtml: string };

export const REFERENCE: RefSection[] = [
  {
    id: "ref-agents",
    audit: { state: "done", note: "Brought current 2026-07-21 — describes the live machine: four levers plus your presses." },
    title: "Agent Roster",
    subtitle: "Who does what, on what cadence",
    bodyHtml: `
<p class="d-what">The function runs on your presses plus a small crew. Four <strong>levers</strong> can run on a clock (all OFF until you start them in the machinery drawer); six <strong>chat-invoked</strong> roles wait to be dispatched in Claude Code; and the sweep buttons call Claude server-side on your press. The old always-on crons — sentinel, courier, the scribe drafter, dossier auto-enrich — were retired July 2026 for the manual-only tower.</p>
<p class="d-sub">Levers (machinery drawer — run on a schedule only while started)</p>
<table class="d-table">
  <tr><th>Agent</th><th>Runs</th><th>What it does</th><th>Code</th></tr>
  <tr><td><strong>followup</strong> <span class="d-badge cron">lever</span></td><td>hourly</td><td>Drafts the +4/+9 ladder for contacted-but-silent candidates; halts on reply. Drafts only — your press sends.</td><td>${FILE("app/api/cron/followup/route.ts", "followup")}</td></tr>
  <tr><td><strong>usher</strong> <span class="d-badge cron">lever</span></td><td>every 30 min</td><td>Workshop logistics — reminders, the replay window, nurture touches.</td><td>${FILE("app/api/cron/usher/route.ts", "usher")}</td></tr>
  <tr><td><strong>almanac</strong> <span class="d-badge cron">lever</span></td><td>daily 7am ET</td><td>The standup digest. Also a chat role for the Friday + milestone memos.</td><td>${FILE("app/api/cron/almanac/route.ts", "almanac cron")} · ${FILE(".claude/agents/almanac.md", "spec")}</td></tr>
  <tr><td><strong>contact-finder</strong> <span class="d-badge cron">lever</span></td><td>on its tick</td><td>Hunts addresses for cards that landed without one, so their seal can light up.</td><td>${FILE("app/api/cron/contact-finder/route.ts", "contact-finder")}</td></tr>
</table>
<p class="d-sub">Chat-invoked (you dispatch when judgment is needed)</p>
<table class="d-table">
  <tr><th>Agent</th><th>Role</th><th>What it does</th><th>Spec</th></tr>
  <tr><td><strong>scout</strong> <span class="d-badge chat">chat</span></td><td>Discovery</td><td>Sweeps practitioner networks + paid communities, returns scored candidate rows (never a raw dump).</td><td>${FILE(".claude/agents/scout.md", "scout")}</td></tr>
  <tr><td><strong>dossier</strong> <span class="d-badge chat">chat</span></td><td>Enrichment</td><td>Takes one name, builds the pre-outreach brief: audience, cadence, voice-fit verdict, conflicts, the non-LinkedIn contact path.</td><td>${FILE(".claude/agents/dossier.md", "dossier")}</td></tr>
  <tr><td><strong>scribe</strong> <span class="d-badge chat">chat</span></td><td>Copy</td><td>The judgment version of drafting — bespoke outreach for the coach_complement / open_recruit / co_marketing motions, canon-checked.</td><td>${FILE(".claude/agents/scribe.md", "scribe")}</td></tr>
  <tr><td><strong>warden</strong> <span class="d-badge chat">chat</span></td><td>Brand-fit</td><td>Judges affiliate copy + outreach against canon. Verdict: APPROVE / EDITS / DECLINE.</td><td>${FILE(".claude/agents/warden.md", "warden")}</td></tr>
  <tr><td><strong>ledger</strong> <span class="d-badge chat">chat</span></td><td>Attribution &amp; ops</td><td>Runs Supabase queries, builds reports, reconciles payouts, extends the schema. Read-only by default; shows SQL before any write.</td><td>${FILE(".claude/agents/ledger.md", "ledger")}</td></tr>
  <tr><td><strong>herald</strong> <span class="d-badge chat">chat</span></td><td>Channel / enterprise</td><td>The enterprise counterpart to scout — researches channel partners and drafts partnership structures.</td><td>${FILE(".claude/agents/herald.md", "herald")}</td></tr>
</table>
<p class="d-sub">And the presses</p>
<p class="d-what">The sweep buttons run scout plus the dossier brief server-side in one line (${FILE("lib/partnerships/sweep.ts", "sweep.ts")}); the room's presses write, send, and file. Reading replies, drafting and sending have no cron anymore — they're yours.</p>
<div class="d-refs"><b>All specs</b>${L(`${GHT}/.claude/agents`, ".claude/agents/")}</div>`,
  },
  {
    id: "ref-prospects",
    title: "Prospect Intel",
    subtitle: "Named candidates, researched — affiliate + channel",
    bodyHtml: `
<p class="d-what">The named starting list a prior sweep produced. The <em>live</em> version (with current status) is always in ${TBL("partner_pipeline")}; this is the researched snapshot with conflict flags. "Motion" sets the angle — most are coach_complement (they run their own paid thing), which is a different pitch, not a cut.</p>
<p class="d-sub">Affiliate candidates</p>
<table class="d-table">
  <tr><th>Name</th><th>Surface</th><th>VF</th><th>Motion</th><th>Conflict</th></tr>
  <tr><td>Neil Bhuiyan</td><td><a class="d-link" href="https://happyselling.io/podcast" target="_blank" rel="noopener">SDR DiscoCall podcast</a></td><td>4</td><td>coach_complement</td><td class="warn">HappySelling course + MySalesCoach</td></tr>
  <tr><td>Florin Tatulea</td><td><a class="d-link" href="https://salesflo.substack.com" target="_blank" rel="noopener">salesflo.substack.com</a></td><td class="hi">5</td><td>affiliate</td><td>soft — Common Room employee (vendor, not a course)</td></tr>
  <tr><td>Jed Mahrle</td><td><a class="d-link" href="https://practicalprospecting.io" target="_blank" rel="noopener">practicalprospecting.io</a></td><td class="hi">5</td><td>coach_complement</td><td>soft — done-for-you outbound agency</td></tr>
  <tr><td>Elric Legloire</td><td><a class="d-link" href="https://newsletter.outbound.kitchen" target="_blank" rel="noopener">Outbound Kitchen</a></td><td>4</td><td>coach_complement</td><td>soft — paywalled Outbound Chef Kit</td></tr>
  <tr><td>Tom Slocum</td><td><a class="d-link" href="https://thesdlab.beehiiv.com" target="_blank" rel="noopener">The SD Lab</a></td><td>4</td><td>coach_complement</td><td class="warn">hard — Outbound Accelerator program</td></tr>
  <tr><td>Sam Nelson</td><td><a class="d-link" href="https://samnelson.substack.com" target="_blank" rel="noopener">samnelson.substack.com</a></td><td>4</td><td>coach_complement</td><td class="warn">hard — Agoge Prospecting School</td></tr>
  <tr><td>Stefan Conic</td><td><a class="d-link" href="https://www.skool.com/sdr-hire-community-1422" target="_blank" rel="noopener">SDR Hire (Skool)</a></td><td>4</td><td>coach_complement</td><td>soft — paid Skool courses</td></tr>
  <tr><td>Daniel Goerner</td><td><a class="d-link" href="https://www.skool.com/sdr-bdr-community-7025" target="_blank" rel="noopener">SDR/BDR community (Skool)</a></td><td>4</td><td>coach_complement</td><td>soft — paid coaching</td></tr>
  <tr><td>Collin Mitchell</td><td>Sales Transformation podcast</td><td>3</td><td>co_marketing</td><td>soft — Humantic AI evangelist (no course)</td></tr>
  <tr><td>Michael Gagliano</td><td><a class="d-link" href="https://sdrnation.com" target="_blank" rel="noopener">SDR Nation</a></td><td>3</td><td>co_marketing</td><td class="warn">SDR Nation × JB Sales partnership</td></tr>
</table>
<p class="d-sub">Reclassified / disqualified</p>
<table class="d-table">
  <tr><th>Name</th><th>Verdict</th></tr>
  <tr><td>Morgan J Ingram</td><td class="warn">Disqualifier (the one true cut) — Director at JBarrows, a competitor's employee.</td></tr>
  <tr><td>Jason Bay (Outbound Squad)</td><td>coach_complement — runs courses; approachable on the complement angle.</td></tr>
  <tr><td>Belal Batrawy</td><td>coach_complement — runs Death to Fluff Bootcamp; approachable on the complement angle.</td></tr>
</table>
<p class="d-sub">Channel candidates (motion = channel)</p>
<table class="d-table">
  <tr><th>Org</th><th>Type</th><th>Proposed structure</th><th>Conflict</th></tr>
  <tr><td><a class="d-link" href="https://vendux.org" target="_blank" rel="noopener">Vendux</a></td><td>Fractional VP-Sales network</td><td>Referral / co-sell</td><td>N</td></tr>
  <tr><td><a class="d-link" href="https://martal.ca" target="_blank" rel="noopener">Martal Group</a></td><td>SDR outsourcing</td><td>White-label ramp module</td><td>N</td></tr>
  <tr><td><a class="d-link" href="https://skaled.com" target="_blank" rel="noopener">Skaled</a></td><td>Sales-enablement consultancy</td><td>Content bundle in engagements</td><td>N</td></tr>
  <tr><td><a class="d-link" href="https://revopsconsulting.io" target="_blank" rel="noopener">RevOps Consulting</a></td><td>RevOps consultancy</td><td>Bundle w/ CRM implementation</td><td>N</td></tr>
  <tr><td><a class="d-link" href="https://revopsgroup.com" target="_blank" rel="noopener">The Revenue Operations Group</a></td><td>RevOps consultancy</td><td>Referral fee</td><td>N</td></tr>
  <tr><td><a class="d-link" href="https://activatedscale.com" target="_blank" rel="noopener">Activated Scale</a></td><td>Fractional RevOps/sales</td><td>Referral fee</td><td>N</td></tr>
  <tr><td><a class="d-link" href="https://belkins.io" target="_blank" rel="noopener">Belkins</a></td><td>SDR outsourcing</td><td>Content bundle</td><td>N</td></tr>
  <tr><td><a class="d-link" href="https://salesassembly.com" target="_blank" rel="noopener">Sales Assembly</a></td><td>Training firm / community</td><td>Referral for individual SDRs/AEs</td><td class="warn">Moderate</td></tr>
  <tr><td><a class="d-link" href="https://factor8.com" target="_blank" rel="noopener">Factor 8</a></td><td>Sales training firm</td><td>Bundle, startup ICP only</td><td class="warn">Y — competing curriculum</td></tr>
  <tr><td><a class="d-link" href="https://winningbydesign.com" target="_blank" rel="noopener">Winning by Design</a></td><td>Sales training firm</td><td>Co-sell sub-$10M ARR segment</td><td class="warn">Y — sells SDR/AE courses</td></tr>
</table>
<div class="d-refs"><b>Live data</b>${TBL("partner_pipeline")} · <b>Seed</b>${FILE("docs/partnerships/seed-partner-pipeline-2026-06-01.sql", "seed-partner-pipeline-2026-06-01.sql")}</div>`,
  },
  {
    id: "ref-resources",
    title: "Resource Vault",
    subtitle: "Where the partners live (no LinkedIn)",
    bodyHtml: `
<p class="d-sub">Paid communities (owner = the candidate)</p>
<p class="d-what">${L("https://www.skool.com/discovery", "Skool discovery")} · ${L("https://www.mightynetworks.com", "Mighty Networks")} · ${L("https://circle.so", "Circle")} · ${L("https://www.geneva.com", "Geneva")} · Apex BDR Club (warm) · ${L("https://modernsalespros.com", "Modern Sales Pros")} · ${L("https://www.joinpavilion.com", "Pavilion")} · ${L("https://salesconfidence.com", "Sales Confidence (UK)")}.</p>
<p class="d-sub">Voices — newsletters, podcasts, networks</p>
<p class="d-what">${L("https://30mpc.com", "30 Minutes to President's Club")} · ${L("https://outboundsquad.com", "Outbound Squad")} · ${L("https://repvue.com", "RepVue")} · independent Substack/Beehiiv operator newsletters · operator-host podcasts (find via ${L("https://www.listennotes.com", "Listen Notes")}) · ${L("https://www.reddit.com/r/sales", "r/sales")} heavy contributors.</p>
<p class="d-sub">Discovery tools</p>
<p class="d-what">${L("https://www.commonroom.io", "Common Room")} (community intelligence — $1k/mo min, revisit at 50+ partners) · ${L("https://www.clay.com", "Clay")} (enrichment + list-building) · Apollo / Listen Notes / Podchaser · the Skool + Mighty directories (free, highest brand-fit signal).</p>
<p class="d-sub">Explicitly avoid</p>
<p class="d-what" style="color:#a14400;">Rakuten, CJ (Commission Junction), ShareASale, Impact-as-a-marketplace (fine as attribution infra, never for discovery), and <strong>LinkedIn</strong> — per founder direction, not a channel for this role, no exceptions.</p>`,
  },
  {
    id: "ref-templates",
    title: "Outreach Library",
    subtitle: "The 8 canon templates + 4 worked drafts",
    bodyHtml: `
<p class="d-what">Each template lives as a file in ${L(`${GHT}/content/partnerships/outreach`, "content/partnerships/outreach/")} — that file is the single source of truth (the room's press and the chat scribe both use them). The first two sentences are the only bespoke part; the economics + ask are locked.</p>
<p class="d-sub">First-touch templates</p>
<table class="d-table">
  <tr><th>Template</th><th>When</th><th>File</th></tr>
  <tr><td>Newsletter writer</td><td>cold, newsletter operator</td><td>${FILE("content/partnerships/outreach/first-touch-newsletter.md", "first-touch-newsletter.md")}</td></tr>
  <tr><td>Community owner</td><td>cold, paid community</td><td>${FILE("content/partnerships/outreach/first-touch-community.md", "first-touch-community.md")}</td></tr>
  <tr><td>Podcast host</td><td>cold, operator-host show</td><td>${FILE("content/partnerships/outreach/first-touch-podcast.md", "first-touch-podcast.md")}</td></tr>
  <tr><td>Coach complement</td><td>they run their own paid offer</td><td>${FILE("content/partnerships/outreach/first-touch-coach-complement.md", "first-touch-coach-complement.md")}</td></tr>
  <tr><td>Open recruit</td><td>they promote a competitor</td><td>${FILE("content/partnerships/outreach/first-touch-open-recruit.md", "first-touch-open-recruit.md")}</td></tr>
  <tr><td>Co-marketing</td><td>collaboration &gt; a link</td><td>${FILE("content/partnerships/outreach/first-touch-co-marketing.md", "first-touch-co-marketing.md")}</td></tr>
</table>
<p class="d-sub">Follow-up ladder</p>
<table class="d-table">
  <tr><th>Step</th><th>When</th><th>File</th></tr>
  <tr><td>Follow-up 1 (value, not a nag)</td><td>+4 days, no reply</td><td>${FILE("content/partnerships/outreach/follow-up-1.md", "follow-up-1.md")}</td></tr>
  <tr><td>Follow-up 2 (honest close)</td><td>+9 days, then mark cold</td><td>${FILE("content/partnerships/outreach/follow-up-2.md", "follow-up-2.md")}</td></tr>
</table>
<p class="d-sub">Worked drafts (real, dossier-cleared, canon-passed examples)</p>
<p class="d-what">One personalized first-touch per motion — Stacy Tan (affiliate), Neil Bhuiyan (coach_complement), Tajh Walker (open_recruit), Michael Gagliano (co_marketing). They live in ${L(`${GHT}/content/partnerships/outreach/drafts`, "content/partnerships/outreach/drafts/")}. Drafts only — never sent.</p>`,
  },
  {
    id: "ref-precall",
    title: "Pre-Call Bundle",
    subtitle: "Send these before the 15-minute call",
    bodyHtml: `
<p class="d-what">The bundle does the convincing so the call is a fit-check, not a pitch. Send 24–48h before. Per-candidate pieces are built fresh; build-once pieces are reusable.</p>
<table class="d-table">
  <tr><th>#</th><th>Asset</th><th>Type</th><th>Who builds it / where</th><th>Why</th></tr>
  <tr><td>1</td><td>Audience-sized earnings 1-pager</td><td>per-candidate</td><td>scribe + ledger (their list size × the benchmark scenarios × 40%)</td><td>Personalized math lifts call-conversion ~2×.</td></tr>
  <tr><td>2</td><td>90-second founder video</td><td>per-candidate</td><td>you, recorded fresh on ${L("https://loom.com", "loom")}</td><td>Face + name beats a deck; reply rate lifts 3–5×.</td></tr>
  <tr><td>3</td><td>Course preview / sample lesson</td><td>build-once</td><td>${L("/affiliates/kit", "/affiliates/kit")} (or a /affiliates/preview if you add one)</td><td>They can't recommend what they haven't tasted.</td></tr>
  <tr><td>4</td><td>Public kit URL</td><td>live</td><td>${L("/affiliates/kit", "/affiliates/kit")}</td><td>The kit IS the demo; self-qualification cuts dead calls.</td></tr>
  <tr><td>5</td><td>Refund + completion stats page</td><td>build-once</td><td>ledger query → a /affiliates/transparency page</td><td>Answers the silent objection: "will this hurt my audience's trust?"</td></tr>
  <tr><td>6</td><td>One real affiliate's anonymized earnings</td><td>build-once</td><td>ledger query → a proof-point card in the kit</td><td>One real number beats a benchmark table.</td></tr>
  <tr><td>7</td><td>Pre-written call framing</td><td>live</td><td>already in the ${L("https://calendar.app.google/wFRpSWG2ehvNhgd4A", "booking-schedule description")}</td><td>Reframes the call as a fit-check, not a pitch.</td></tr>
  <tr><td>8</td><td>Draft post in their voice</td><td>per-candidate</td><td>scribe (anchor on a recent piece of theirs)</td><td>Removes the "what would I even say?" friction.</td></tr>
</table>`,
  },
  {
    id: "ref-levers",
    title: "Conversion Levers",
    subtitle: "14 moves, ranked by phase and leverage",
    bodyHtml: `
<p class="d-sub">Phase 30</p>
<table class="d-table">
  <tr><th>Move</th><th>Why it works</th></tr>
  <tr><td><strong>Charter cohort (first 10)</strong></td><td>Locked 40% + a charter badge + first crack at workshops. The 10 recruit your next 10 free.</td></tr>
  <tr><td><strong>Founder-led every onboarding call</strong></td><td>Not a CSM — you. The moat against "managed" programs. Don't scale past ~50.</td></tr>
  <tr><td><strong>The "honest no" guarantee</strong></td><td>"If your audience isn't a fit I'll tell you." Reverses social pressure; you only sign fits.</td></tr>
  <tr><td><strong>Single-page e-signable contract</strong></td><td>No 12-page legal doc. Faster signature at the moment of yes.</td></tr>
</table>
<p class="d-sub">Phase 60</p>
<table class="d-table">
  <tr><th>Move</th><th>Why it works</th></tr>
  <tr><td><strong>Custom landing page per affiliate</strong> (/[slug]/welcome)</td><td>Their name on a page that talks to their people. Same pattern as the existing /[slug]/workshop route.</td></tr>
  <tr><td><strong>Public earnings transparency page</strong></td><td>Anonymized payouts + refund rate. A trust signal a SaaS tool can't manufacture.</td></tr>
  <tr><td><strong>Kit-first ask in every first-touch</strong></td><td>Default to "want the kit?" not "want a call?" Self-qualification clears 80% of dead calls.</td></tr>
  <tr><td><strong>Workshop co-host as the close</strong></td><td>Propose a co-hosted live workshop, not "post about us." 3–5× a link drop. System already built.</td></tr>
  <tr><td><strong>Stripe dashboard tour mid-call</strong></td><td>Show the real interface with a pending balance. Concrete defeats every dollar objection.</td></tr>
  <tr><td><strong>Performance ladders</strong></td><td>3 sales = feature; 10 = workshop slot; 25 = tier bump to proven. Affiliates run on micro-wins.</td></tr>
</table>
<p class="d-sub">Phase 90+</p>
<table class="d-table">
  <tr><th>Move</th><th>Why it works</th></tr>
  <tr><td><strong>Reframe the gate as co-writing</strong></td><td>"Your first 3 posts, we draft together on a call." The most-objected-to part becomes a feature.</td></tr>
  <tr><td><strong>Founder Friday note CC'd to affiliates</strong></td><td>They feel like operators inside the company, not vendors. Retention lever.</td></tr>
  <tr><td><strong>Quarterly transparency report</strong></td><td>GMV / payouts / refund / NPS public PDF. Every affiliate forwards it to recruit the next 10.</td></tr>
  <tr><td><strong>Audience-sized earnings calculator</strong> <span class="d-badge cron">live</span></td><td>Built — a prospect enters their list size and gets the scenario table at ${L("/affiliates/calculator", "/affiliates/calculator")}. Drop it in outreach and the kit.</td></tr>
</table>`,
  },
  {
    id: "ref-benchmarks",
    title: "Benchmarks",
    subtitle: "Commission, conversion math, refund thresholds",
    bodyHtml: `
<p class="d-sub">Commission rate vs. market</p>
<table class="d-table">
  <tr><th>Program</th><th>Rate</th><th>Product</th></tr>
  <tr><td>HigherLevels (SDR/AE career courses)</td><td>40%</td><td>$997–$2,000+ one-time — closest direct comparable</td></tr>
  <tr><td>General digital / info product</td><td>20–50%</td><td>wide range</td></tr>
  <tr><td>B2B SaaS (subscription)</td><td>15–30% recurring</td><td>recurring inflates perceived value</td></tr>
  <tr><td class="hi">AESDR</td><td class="hi">40%</td><td class="hi">$249/$299 one-time — top of market on rate</td></tr>
</table>
<p class="d-sub">Per-affiliate monthly trajectory (5k audience unless noted)</p>
<table class="d-table">
  <tr><th>Scenario</th><th>Click %</th><th>Conv %</th><th>Sales/mo</th><th>Affiliate earns</th></tr>
  <tr><td>Conservative</td><td>1.0%</td><td>1.0%</td><td>0.5</td><td>$50</td></tr>
  <tr><td>Mid</td><td>2.0%</td><td>1.5%</td><td>1.5</td><td>$150</td></tr>
  <tr><td>Optimistic</td><td>2.5%</td><td>2.5%</td><td>3.1</td><td>$308</td></tr>
  <tr><td>Strong endorsement</td><td>3.5%</td><td>3.0%</td><td>5.25</td><td>$523</td></tr>
  <tr><td class="hi">$3k GMV target (15k aud, 2× sends)</td><td>2.5%</td><td>2.0%</td><td>7.5</td><td>$1,200+</td></tr>
</table>
<p class="d-sub">Refund-rate health</p>
<table class="d-table">
  <tr><th>Tier</th><th>Rate</th><th>Note</th></tr>
  <tr><td>Well-structured professional dev</td><td>3–5%</td><td>typical for quality career content</td></tr>
  <tr><td class="hi">AESDR target</td><td class="hi">&lt;5%</td><td class="hi">flag an affiliate at 15%, suspend at 20%</td></tr>
</table>`,
  },
  {
    id: "ref-attribution",
    title: "Attribution Decision",
    subtitle: "Four contenders, verified May 2026",
    bodyHtml: `
<table class="d-table">
  <tr><th>&nbsp;</th><th>Custom (Supabase+Stripe)</th><th>Rewardful</th><th>PartnerStack</th><th>Impact</th></tr>
  <tr><td>Fit for one-time product</td><td class="hi">Native — already built</td><td>Excellent (Stripe-native)</td><td>Built for SaaS recurring</td><td>Enterprise; overkill</td></tr>
  <tr><td>Monthly cost</td><td class="hi">~$0</td><td>$49–$99/mo</td><td>~$800+/mo + surcharge</td><td>$30/mo or 3% + 2.5% network tax</td></tr>
  <tr><td>Setup time</td><td class="hi">~0 (working today)</td><td>~1 day</td><td>~1 week</td><td>weeks</td></tr>
  <tr><td>Best when</td><td class="hi">≤25 partners, you control the stack</td><td>self-serve dashboards become the bottleneck</td><td>you need a full PRM</td><td>large channel program, later</td></tr>
</table>
<div class="d-callout"><div class="d-callout-title">Verdict</div><p>Per the ${FILE("docs/partnerships/attribution-build-cost.md", "May-2026 build-cost audit")}, the custom system is not a "build" option — it's functional end-to-end in production today (partner dashboard, payout pipeline, link-click tracking all built). <strong>Stay on custom</strong> through at least Phase 30. Adopt <strong>Rewardful at $49/mo</strong> only when a trigger fires: active affiliates &gt;25 with a polish backlog, "where's my dashboard?" inquiries &gt;2/week, or a Stripe edge case the custom code can't handle. Skip PartnerStack and Impact until a full PRM is needed.</p></div>`,
  },
  {
    id: "ref-metrics",
    title: "Milestone Tracker",
    subtitle: "The 30 / 60 / 90 targets",
    bodyHtml: `
<table class="d-table">
  <tr><th>By Day 30</th><th>By Day 60</th><th>By Day 90</th></tr>
  <tr>
    <td>Discovery documented · 25 candidates in the pipeline · cold outreach started · attribution decision made.</td>
    <td>10 affiliates active · 3 channel conversations open · weekly reporting live · first payout run clean.</td>
    <td>Top affiliates on a $3k/mo trajectory · one channel deal signed or close · both motions running without daily founder involvement.</td>
  </tr>
</table>
<p class="d-what">Check these against artifacts, not vibes — pipeline counts in ${TBL("partner_pipeline")}, active affiliates in ${TBL("affiliates")}, commission in ${TBL("affiliate_attributions")}, payouts in ${TBL("affiliate_payouts")}, and the live counts on ${L("/admin/tower", "the tower's Board")}.</p>`,
  },
  {
    id: "ref-cli",
    title: "CLI Vault",
    subtitle: "The handful of terminal commands you'll actually use",
    bodyHtml: `
<p class="d-what">Most work is now agents-in-chat or buttons-in-the-tower. These are the few raw commands worth knowing.</p>
<table class="d-table">
  <tr><th>Do this</th><th>Command</th></tr>
  <tr><td>Open Claude Code in the repo</td><td><span class="d-code">cd ~/code/aesdr &amp;&amp; claude</span></td></tr>
  <tr><td>Get the latest code</td><td><span class="d-code">git pull</span></td></tr>
  <tr><td>Create a new doc (e.g. a memo)</td><td><span class="d-code">touch docs/partnerships/your-file.md</span></td></tr>
  <tr><td>Run the brand-voice checker</td><td><span class="d-code">node scripts/canon-check.mjs --soft</span></td></tr>
  <tr><td>Save &amp; publish a change</td><td><span class="d-code">git add -A &amp;&amp; git commit -m "msg" &amp;&amp; git push</span></td></tr>
</table>
<p class="d-what">Database work goes through ${FILE(".claude/agents/ledger.md", "ledger")} (which shows you SQL before any write) or directly in ${L(SBTBL, "the Supabase editor")} — you rarely need raw <span class="d-code">psql</span>. The full automated-job schedule is ${FILE("docs/partnerships/cron-schedule.md", "docs/partnerships/cron-schedule.md")}.</p>`,
  },
];

// ════════════════════════════════ THE MANUAL ════════════════════════════════
// Plain-language reference: what the master switch governs, what every agent
// does and when, the order things run in, and the one-time go-live steps.
export const MANUAL: RefSection[] = [
  {
    id: "ref-wiki",
    audit: { state: "done", note: "Brought current 2026-07-21 — describes the live machine: the switch, the four levers, what was retired and what replaced it." },
    title: "How it all runs",
    subtitle: "The switch, the agents, the order — in plain language",
    bodyHtml: `
<p class="d-what">Nothing in the partnerships system runs on its own until <strong>you</strong> turn it on — and after the manual-only consolidation of July 2026, most of it doesn't run on its own at all. The machine prepares; your press decides. This card is the whole picture: the switch, the four levers, what was retired, and the order things happen in.</p>

<p class="d-sub">The master switch</p>
<p class="d-what">There's a table, ${TBL("agent_switches")}, with one row per agent and an on/off flag. Every scheduled agent checks it before doing anything and <strong>fails safe to OFF</strong> — if the table is missing, the row is missing, the flag is false, or anything errors, the agent does nothing and returns "disabled." You control it from the <strong>machinery drawer</strong> at the bottom of ${L("/admin/tower", "the warren")}, where each lever has a <span class="d-ui">Start</span> / <span class="d-ui">Pause</span> button. Starting one asks you to confirm first.</p>

<p class="d-sub">The 4 levers ON the switch (the only things that run on a clock)</p>
<table class="d-table">
  <tr><th>Agent</th><th>When it would run</th><th>What it does</th><th>When paused</th></tr>
  <tr><td><strong>followup</strong></td><td>hourly</td><td>Drafts the +4-day / +9-day follow-ups for contacted-but-silent candidates; halts the instant they reply. <strong>Drafts only</strong> — your press sends.</td><td>No follow-ups are drafted. Contacted candidates just sit.</td></tr>
  <tr><td><strong>usher</strong></td><td>every 30 min</td><td>Runs workshop logistics (reminders, replay window) for workshops in ${TBL("partner_workshop")}.</td><td>No workshop reminders go out.</td></tr>
  <tr><td><strong>almanac</strong></td><td>daily 7am ET</td><td>Emails you the morning standup digest of what's waiting on the floor.</td><td>No digest email.</td></tr>
  <tr><td><strong>contact-finder</strong> <span class="d-badge warn">spends API tokens</span></td><td>on its tick</td><td>Hunts addresses for cards that landed without one, so their seal can light up.</td><td>No hunts; attach addresses by hand in the room.</td></tr>
</table>

<p class="d-sub">Retired (July 2026) — and what replaced each</p>
<table class="d-table">
  <tr><th>Was</th><th>Now</th></tr>
  <tr><td><strong>scribe drafter</strong> (cron, every 15 min)</td><td>One press in the room writes the letter, canon-checked on save. Nothing fills the tower by itself.</td></tr>
  <tr><td><strong>courier</strong> (cron, every 5 min)</td><td>The ceramic press sends instantly — suppression re-check at send, a claim that makes double-send impossible, the sent record + <em>delivered ✓</em> stamp.</td></tr>
  <tr><td><strong>sentinel</strong> (cron, every 10 min)</td><td>Replies land in your inbox and in each room's replies fold; you make the call and press the seal.</td></tr>
  <tr><td><strong>dossier auto-enrich</strong> (cron, hourly)</td><td>The brief runs inside the sweep itself — every new find is briefed and verdict-called before the run reports done.</td></tr>
</table>
<p class="d-what" style="color:#2E7D32;"><strong>The safety guarantee:</strong> nothing reaches a real person and no money moves without your press — and every Claude call (sweeps, briefs, hunts) is metered by the $10/day postage wall, which fails closed.</p>

<p class="d-sub">Which Claude model the machine uses</p>
<p class="d-what">Two calls use an LLM — the <strong>sweep</strong> (find + fit) and the <strong>brief</strong> that runs inside it. Both pickers live in the machinery drawer:</p>
<table class="d-table">
  <tr><th>Call</th><th>Default model</th><th>Why</th><th>Picker lives at</th></tr>
  <tr><td><strong>Sweep model</strong> (scout)</td><td>Sonnet 4.6</td><td>Volume list-building. 5× cheaper per sweep than Opus.</td><td>${L("/admin/tower", "/admin/tower → machinery")}</td></tr>
  <tr><td><strong>Brief model</strong> (dossier)</td><td>Opus 4.6</td><td>Judgment work — sharper voice-fit verdicts and conflict reads.</td><td>${L("/admin/tower", "/admin/tower → machinery")}</td></tr>
</table>
<p class="d-what">Available models in this SDK version: Opus 4.6 (newest), Opus 4.5, Opus 4.1, Sonnet 4.6. Changes take effect on the next sweep press.</p>

<p class="d-sub">NOT on the switch (so you know the full picture)</p>
<table class="d-table">
  <tr><th>Thing</th><th>Why it's not on the switch</th></tr>
  <tr><td><strong>scout, dossier, scribe, warden, ledger, herald (chat)</strong></td><td>These never run on their own — they only do something the moment you type them into Claude Code. Inert until dispatched. Specs: ${L(`${GHT}/.claude/agents`, ".claude/agents/")}.</td></tr>
  <tr><td><strong>The sweep buttons</strong></td><td>Fire only on your press, run the whole line, and report done. Server-side: ${FILE("lib/partnerships/sweep.ts", "sweep.ts")}, ${FILE("lib/partnerships/anthropic-agents.ts", "anthropic-agents.ts")}.</td></tr>
  <tr><td><strong>Payouts</strong></td><td>Money never moves automatically. The Payouts block shows what's owed; the transfer runs only when you press <span class="d-ui">Pay</span> and confirm.</td></tr>
  <tr><td><strong>The older course crons</strong> (drip, abandonment, dropoff, review, retention)</td><td>Pre-existing course-side email automations, unrelated to partnerships. They've run all along.</td></tr>
  <tr><td><strong>The affiliate-clearing cron</strong> (${FILE("app/api/cron/affiliate/route.ts", "/api/cron/affiliate")})</td><td>Daily job that flips a commission from "pending" to "cleared" after its 30-day refund window. Benign — moves no money, sends nothing.</td></tr>
</table>

<p class="d-sub">The order things run in (the whole loop)</p>
<table class="d-table">
  <tr><th>#</th><th>Step</th><th>Who</th><th>Your part</th></tr>
  <tr><td>1</td><td>Sweep → finished cards (verdict + brief + address) land in the band</td><td>the sweep line</td><td><strong>you press Sweep</strong></td></tr>
  <tr><td>2</td><td>Card → the letter written, canon-checked</td><td>the room</td><td><strong>you press "write the letter"</strong></td></tr>
  <tr><td>3</td><td>Letter → sent (suppression re-check, no-double-send claim)</td><td>the send path</td><td><strong>you press the seal</strong></td></tr>
  <tr><td>4</td><td>Sent → <span class="d-code">contacted</span>, ladder clock stamped, sent record written</td><td>automatic</td><td>none</td></tr>
  <tr><td>5</td><td>Delivered → <em>delivered ✓</em> stamp on the sent record</td><td>the delivery webhook</td><td>none</td></tr>
  <tr><td>6</td><td>No reply at +4d / +9d → follow-up letters appear in their rooms</td><td>followup (lever, if ON)</td><td><strong>you press the seal</strong></td></tr>
  <tr><td>7</td><td>A reply lands → your inbox + the room's fold; ladder halts</td><td>the inbound pipe</td><td>you reply + press "they wrote back"</td></tr>
  <tr><td>8</td><td>Sale attributed → commission <span class="d-code">pending</span> → <span class="d-code">cleared</span> at +30d</td><td>affiliate cron</td><td>none</td></tr>
  <tr><td>9</td><td>Cleared commission → the Payouts block</td><td>the warren</td><td><strong>you press Pay</strong></td></tr>
</table>
<p class="d-what">Read it as: <strong>the machine prepares; you decide.</strong> Steps 4, 5, 7, 8 happen on their own. Everything a real person receives — the letter, the follow-up, the money — waits on your press.</p>
<div class="d-refs"><b>Control panel</b>${L("/admin/tower", "/admin/tower → machinery")} · <b>Switch table</b>${TBL("agent_switches")} · <b>The line</b>${FILE("lib/partnerships/sweep.ts", "sweep.ts")} · <b>Send path</b>${FILE("lib/partnerships/courier-send.ts", "courier-send.ts")} · <b>Gate code</b>${FILE("lib/partnerships/agent-switch.ts", "agent-switch.ts")}</div>`,
  },
  {
    id: "ref-golive",
    audit: { state: "done", note: "Go-live happened: the switch table and these migrations are live in production, and the newest one (20260715, delivery stamps) ran 2026-07-21." },
    title: "Go-live",
    subtitle: "The one-time setup, in order",
    bodyHtml: `
<p class="d-what"><strong>This already ran</strong> — kept as the record of the one-time setup (all five migrations are live in production, plus the 20260715 delivery-stamp migration that followed). If you ever stand the system up again, this is the order: the OFF switch deploys first, then the database columns, then you start the levers by hand. Each dark block below is click-to-copy.</p>

<p class="d-sub">Step 1 — Confirm the OFF switch is deployed</p>
<p class="d-what">In ${L("https://vercel.com", "Vercel")} → the <strong>aesdr</strong> project → <span class="d-ui">Deployments</span>, confirm the latest deploy is <strong>Ready</strong>. From this deploy on, every agent is paused by default — even if a database column exists, the agent won't act until you start its lever. (This is the safety net: do this before Step 2.)</p>

<p class="d-sub">Step 2 — Apply the five migrations</p>
<p class="d-what">Open the ${L("https://supabase.com/dashboard/project/jwhjysjvehqslzcfpehl/sql/new", "Supabase SQL editor")} and run these. They're additive and idempotent — safe to paste all five into one window and run once. None of them start anything.</p>

<p class="d-what"><strong>20260606 — the signal board</strong></p>
<span class="d-cmd">alter table partner_signals add column if not exists handled_at timestamptz;
alter table partner_signals add column if not exists handled_by text;
create index if not exists partner_signals_unhandled_idx
  on partner_signals (created_at desc) where handled_at is null;</span>

<p class="d-what"><strong>20260607 — outbound send-channel</strong></p>
<span class="d-cmd">alter table partner_outbound_queue
  add column if not exists send_channel text not null default 'email'
    check (send_channel in ('email','manual'));
alter table partner_outbound_queue
  add column if not exists draft_source text;
alter table partner_outbound_queue
  add column if not exists personalization_note text;</span>

<p class="d-what"><strong>20260608 — follow-up ladder</strong></p>
<span class="d-cmd">alter table partner_pipeline add column if not exists first_touch_at timestamptz;
alter table partner_pipeline add column if not exists ladder_step int not null default 0;
alter table partner_pipeline add column if not exists last_ladder_at timestamptz;
create index if not exists pp_ladder_idx
  on partner_pipeline (first_touch_at)
  where status = 'contacted' and first_touch_at is not null;</span>

<p class="d-what"><strong>20260609 — the master switch</strong></p>
<span class="d-cmd">create table if not exists agent_switches (
  agent       text primary key,
  enabled     boolean not null default false,
  updated_at  timestamptz not null default now(),
  updated_by  text
);
alter table agent_switches enable row level security;</span>

<p class="d-what"><strong>20260610 — per-agent model preference</strong></p>
<span class="d-cmd">alter table agent_switches add column if not exists model text;</span>

<p class="d-sub">Step 3 — Start the levers you want, by hand</p>
<p class="d-what">Open ${L("/admin/tower", "/admin/tower")} → the <strong>machinery drawer</strong> at the bottom of the floor. Everything reads <em>paused</em>. Start them one at a time as you're ready — a sensible order:</p>
<ol class="d-steps">
  <li class="d-step"><strong>almanac</strong> first — it just emails you a morning digest. Harmless, and it confirms the plumbing works.</li>
  <li class="d-step"><strong>followup</strong> once first touches are out — it starts drafting the +4/+9 ladder into their rooms (drafts only; your press sends).</li>
  <li class="d-step"><strong>contact-finder</strong> if cards keep landing without addresses.</li>
  <li class="d-step"><strong>usher</strong> later, once workshops are in motion.</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">You can pause any of them, any time</div><p>Pausing is instant and needs no confirm. If anything ever looks off, hit <span class="d-ui">Pause</span> on that agent and it stops on its next tick — nothing in flight, nothing sent without your approval anyway.</p></div>
<div class="d-end"><b>That's the whole setup.</b> After this, day-to-day is just: open the tower, clear the Decisions lane, done.</div>`,
  },
];
