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
/** A repo file reference → links to the file on GitHub. */
const FILE = (path: string, label?: string) => L(`${GH}/${path}`, label || path);

export type Tag = "you" | "tower" | "auto" | "done";
export type Task = {
  id: string;
  title: string;
  tags: Tag[];
  automatable?: boolean;
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

// Reusable explainer (first time the plan tells you to dispatch an agent).
const DISPATCH_EXPLAINER = `
<div class="d-callout d-callout-note">
  <div class="d-callout-title">First time? What "dispatch an agent" actually means</div>
  <p>Your agents are saved roles that live as files in ${L(`${GHT}/.claude/agents`, ".claude/agents/")} — ${FILE(".claude/agents/scout.md", "scout.md")}, ${FILE(".claude/agents/dossier.md", "dossier.md")}, ${FILE(".claude/agents/scribe.md", "scribe.md")}, ${FILE(".claude/agents/warden.md", "warden.md")}, ${FILE(".claude/agents/ledger.md", "ledger.md")}, ${FILE(".claude/agents/herald.md", "herald.md")}, ${FILE(".claude/agents/almanac.md", "almanac.md")}. To use one:</p>
  <ol class="d-steps">
    <li class="d-step"><strong>Open your terminal</strong> (macOS: <span class="d-ui">⌘ + Space</span> → type <span class="d-code">Terminal</span>; Windows: <span class="d-ui">⊞ Win</span> → <span class="d-code">PowerShell</span>).</li>
    <li class="d-step"><strong>Go into the repo:</strong> type <span class="d-code">cd ~/code/aesdr</span> and press Enter. (If you haven't cloned it yet, that's a one-time setup — ask in chat and I'll walk you through it.)</li>
    <li class="d-step"><strong>Start Claude Code:</strong> type <span class="d-code">claude</span> and press Enter. You now have a prompt.</li>
    <li class="d-step"><strong>Type the instruction in plain English</strong>, starting with "use the [name] subagent:". The exact text to paste is in the dark boxes below each step. The agent reads the repo, does the work, and prints a result you can copy.</li>
  </ol>
  <p>That's it. "Dispatch scout" just means "type the scout instruction into Claude Code." You'll do this a handful of times a week.</p>
</div>`;

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
        title: "Day 1, 9:00am — Walk the tower (everything that runs without you)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">The Control Tower is your home base for the next 90 days — the screen where the system shows you the few things that need a human decision and hides everything it already handled. Before you do any real work, learn its layout cold so you can read it at a glance.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open the cockpit.</strong> In your browser go to ${L("/admin/tower", "aesdr.com/admin/tower")}. If you're asked to sign in, use your founder email — you're a permanent admin, so you land straight in.</li>
  <li class="d-step"><strong>Read the one line at the top.</strong> It says either "All clear" or "N waiting on you." That number is the entire job for the day. If it's 0, you can close the tab.</li>
  <li class="d-step"><strong>Find the two halves.</strong> The top half is <strong>DECISIONS</strong> — drafts ready to send, and bright signals (people who replied with interest). The bottom half is <strong>BOARD</strong> — read-only situational awareness: your pipeline by stage, recent sends, and quiet "soft" signals.</li>
  <li class="d-step"><strong>Look at the "sentinel last swept" stamp</strong> (top-right). The system checks for new replies every 10 minutes; this stamp shows when it last ran. If it ever reads more than ~30 minutes, something stopped — tell me and I'll look.</li>
  <li class="d-step"><strong>Bookmark it.</strong> Press <span class="d-ui">⌘/Ctrl + D</span>. The tower is your default tab now.</li>
</ol>
<div class="d-end"><b>When you're done:</b> you can describe the tower's two halves without looking. You'll find it any time at ${L("/admin/tower", "/admin/tower")}, or via the <strong>Control Tower</strong> item in the admin nav, or the <strong>admin-mode menu</strong> (the floating button, bottom-right).</div>
<div class="d-refs"><b>Links in this task</b>${L("/admin/tower", "/admin/tower — the cockpit")}</div>`,
      },
      {
        id: "w1t2",
        title: "Day 1, 10:00am — Confirm where your alerts land",
        tags: ["you", "auto"],
        bodyHtml: `
<p class="d-what">The system emails you in two situations: a real-time ping the moment someone replies with genuine interest (a "bright signal"), and a once-a-day standup digest at 7am ET. Both go to one address. This task is just confirming that address is one you actually read.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Default is <span class="d-code">antaeus.coe@gmail.com</span></strong> (your permanent-admin email). If that's the inbox you live in, you're done — skip to the last step.</li>
  <li class="d-step"><strong>To send alerts somewhere else,</strong> open the Vercel dashboard at ${L("https://vercel.com", "vercel.com")} → the <strong>aesdr</strong> project → <span class="d-ui">Settings</span> → <span class="d-ui">Environment Variables</span>.</li>
  <li class="d-step"><strong>Add a variable</strong> named <span class="d-code">PARTNER_ALERT_EMAIL</span>, value = the address you want, environment = <strong>Production</strong>. Click <span class="d-ui">Save</span>.</li>
  <li class="d-step"><strong>Redeploy</strong> so the new value takes effect: Vercel → <span class="d-ui">Deployments</span> → the top row → <span class="d-ui">⋯</span> → <span class="d-ui">Redeploy</span>.</li>
  <li class="d-step"><strong>Wait for tomorrow's 7am digest</strong> to confirm it arrives (subject line "Tower: all clear" on a quiet day — that's proof the whole system is alive).</li>
</ol>
<div class="d-callout">
  <div class="d-callout-title">Where these emails are built</div>
  <p>The alert + digest templates live in ${FILE("lib/partner-alerts.ts", "lib/partner-alerts.ts")} if you ever want to change the wording. You don't need to touch it — this is just so nothing is a black box.</p>
</div>
<div class="d-end"><b>When you're done:</b> you know which inbox bright-signal pings and the daily digest land in, and how to change it. The sender code is ${FILE("lib/partner-alerts.ts", "lib/partner-alerts.ts")}.</div>`,
      },
      {
        id: "w1t3",
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
        title: "Already done — the infrastructure the old plan built in Week 1",
        tags: ["done"],
        bodyHtml: `
<p class="d-what">The original 90-day plan spent Week 1 standing up systems by hand. All of it is permanently in place now, so you skip it. This card is just so you know what exists and where.</p>
<p class="d-h">What's already built</p>
<ol class="d-steps">
  <li class="d-step"><strong>The agent roster.</strong> Four agents run automatically on a schedule — ${FILE("app/api/cron/sentinel/route.ts", "sentinel")} (watches replies), ${FILE("app/api/cron/courier/route.ts", "courier")} (sends approved mail), ${FILE("app/api/cron/usher/route.ts", "usher")} (workshop logistics), ${FILE("app/api/cron/almanac/route.ts", "almanac")} (daily digest). Six are saved roles you call in chat — ${FILE(".claude/agents/scout.md", "scout")}, ${FILE(".claude/agents/dossier.md", "dossier")}, ${FILE(".claude/agents/scribe.md", "scribe")}, ${FILE(".claude/agents/warden.md", "warden")}, ${FILE(".claude/agents/ledger.md", "ledger")}, ${FILE(".claude/agents/herald.md", "herald")}.</li>
  <li class="d-step"><strong>The database.</strong> Your partner tables already exist: ${TBL("partner_pipeline")} (the candidate CRM), ${TBL("partner_inbound_email")}, ${TBL("partner_outbound_queue")} (the draft house), ${TBL("partner_sent_log")}, ${TBL("partner_signals")}, ${TBL("partner_workshop")} — plus the affiliate tables ${TBL("affiliates")}, ${TBL("affiliate_attributions")}, ${TBL("affiliate_payouts")}, ${TBL("affiliate_links")}, ${TBL("affiliate_applications")}.</li>
  <li class="d-step"><strong>The inbound email pipe.</strong> Mail to <span class="d-code">affiliates@aesdr.com</span> is caught by a Cloudflare Worker, forwarded to your inbox, and dropped into ${TBL("partner_inbound_email")} for sentinel to read. The schedule of every automated job is documented in ${FILE("docs/partnerships/cron-schedule.md", "docs/partnerships/cron-schedule.md")}.</li>
</ol>
<div class="d-end"><b>Nothing to do here.</b> You start Day 1 with a tower already breathing.</div>`,
      },
      {
        id: "w1t4",
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
      "The highest-leverage week of the quarter. You live in scout and dossier (two chat-invoked agents) to build a tight, scored target list — then the drafting agent fills your tower automatically.",
    tasks: [
      {
        id: "w2t1",
        title: "Days 6–7 — Run three discovery sweeps (target: 50 scored candidates)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">A "sweep" is when you send the scout agent out to find candidate partners on a specific kind of platform and return them as a scored list — not a raw dump. You run three sweeps so the results don't blur together, then have dossier deepen each promising one, then save them to your pipeline. End result: ~50 real, scored candidates sitting in the database, ready to rank.</p>
${DISPATCH_EXPLAINER}
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>You already have a head start.</strong> A prior sweep seeded the pipeline — open ${L(SBTBL, "the Supabase table editor")}, choose the ${TBL("partner_pipeline")} table, and you'll see the existing candidates (also documented in ${FILE("docs/partnerships/seed-partner-pipeline-2026-06-01.sql", "the seed file")}). Your job: verify them and extend toward 50.</li>
  <li class="d-step"><strong>Sweep 1 — paid communities.</strong> In Claude Code, paste:
    <span class="d-cmd">use the scout subagent to find 15 sales/SDR/AE community owners on Skool, Mighty Networks, and Circle (50–2,000 members each). Score voice-fit 1–5. Contact path must NOT be LinkedIn.</span>
    It prints a table of names with scores. Copy it somewhere (a note, a doc).</li>
  <li class="d-step"><strong>Sweep 2 — newsletters + podcasts.</strong> Paste:
    <span class="d-cmd">use the scout subagent to find 15 independent sales newsletters (Substack/Beehiiv) and operator-host podcasts for first-2-year SDRs/AEs. Contact path = reply-to email or guest-pitch form, never LinkedIn.</span></li>
  <li class="d-step"><strong>Sweep 3 — practitioner figures.</strong> Paste:
    <span class="d-cmd">use the scout subagent to find 15 active contributors in 30MPC, Outbound Squad, RepVue, Modern Sales Pros, Apex BDR Club, Pavilion who have their OWN audience (not just members).</span></li>
  <li class="d-step"><strong>Deepen the good ones with dossier.</strong> For every candidate scoring 3 or higher, paste (one at a time):
    <span class="d-cmd">use the dossier subagent on [paste the name]: build the pre-outreach brief — real audience size, posting cadence, voice-fit verdict against canon, any conflicts, and the non-LinkedIn contact path.</span>
    Dossier returns a one-screen brief per person. This is what turns a name into a decision.</li>
  <li class="d-step"><strong>Save the survivors to the database.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: insert these enriched candidates into partner_pipeline at status='enriched'. Here are the rows: [paste dossier's output]. <span class="c">// ledger will show you the exact SQL it's about to run and wait for your OK before writing anything — that's its safety default.</span></span>
    In plain terms: this writes each person as a row in your ${TBL("partner_pipeline")} CRM with a status of "enriched" (meaning: researched, not yet contacted).</li>
</ol>
<div class="d-end"><b>When you're done:</b> ~50 rows at status <span class="d-code">enriched</span> in ${TBL("partner_pipeline")}. Verify by reloading the tower's <strong>Pipeline</strong> board (${L("/admin/tower", "/admin/tower")}) — the "enriched" count should jump.</div>
<div class="d-refs"><b>Touches</b>${TBL("partner_pipeline")} · ${FILE("docs/partnerships/seed-partner-pipeline-2026-06-01.sql", "seed file")} · ${FILE(".claude/agents/scout.md", "scout")} · ${FILE(".claude/agents/dossier.md", "dossier")} · ${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE("docs/partnerships/discovery-doctrine.md", "doctrine")}</div>`,
      },
      {
        id: "w2t2",
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
        title: "Day 10 — Review the drafts that filled the tower by themselves",
        tags: ["auto", "tower"],
        automatable: true,
        bodyHtml: `
<p class="d-what">This is the step that used to take a day of writing and now mostly happens on its own. Every 15 minutes, a drafting job looks at your strongest enriched candidates and writes each one a first-touch email from the right canon template, runs it through the mechanical brand-check, and drops it into your tower as a ready-to-review draft. Your job shrinks to: read each one, add a personal sentence where asked, and approve.</p>
<p class="d-h">How it works (so it's not a black box)</p>
<p class="d-what">The drafting job is ${FILE("app/api/cron/scribe/route.ts", "the scribe cron")}. It picks the template by the candidate's surface from ${L(`${GHT}/content/partnerships/outreach`, "content/partnerships/outreach/")} — ${FILE("content/partnerships/outreach/first-touch-newsletter.md", "newsletter")}, ${FILE("content/partnerships/outreach/first-touch-community.md", "community")}, or ${FILE("content/partnerships/outreach/first-touch-podcast.md", "podcast")} — fills in the name and the research detail, then checks it against the banned-word list in ${FILE("lib/partnerships/canon-mechanical.ts", "canon-mechanical.ts")}. It writes the result into ${TBL("partner_outbound_queue")} as a "ready" row.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open the tower:</strong> ${L("/admin/tower", "/admin/tower")}. The DECISIONS section now reads "N drafts in the house."</li>
  <li class="d-step"><strong>Read each card's two chips.</strong> <span class="d-ui">warden ✓</span> means it's brand-clean and fully written — ready to send as-is. <span class="d-ui">needs eye</span> means a personal sentence is still a placeholder (like <span class="d-code">[SPECIFIC PIECE]</span>) or a word tripped the check — the card tells you exactly what.</li>
  <li class="d-step"><strong>Finish the "needs eye" ones right there.</strong> Click <span class="d-ui">Edit draft</span> on the card, replace the placeholder with one real, specific sentence (the actual piece of theirs you read, the real detail), then click <span class="d-ui">Save &amp; re-check canon</span>. It re-runs the check and flips to <span class="d-ui">warden ✓</span> if clean. <em>That one sentence per non-community candidate is the only writing you do.</em></li>
  <li class="d-step"><strong>Check the channel chip.</strong> <span class="d-ui">email</span> = the system can send it for you once you approve. <span class="d-ui">manual send</span> = the only contact path is a DM or a web form, so you'll copy the text and send it yourself, then click <span class="d-ui">Mark sent</span> (that happens in Week 3).</li>
</ol>
<div class="d-callout">
  <div class="d-callout-title">What still needs a human writer</div>
  <p>The drafting job only does clean affiliate first-touches. The relationship-heavy angles — coach_complement (needs the specific thing they made), open_recruit (names a competitor), co_marketing (proposes a real collaboration) — want your judgment, so for those dispatch the ${FILE(".claude/agents/scribe.md", "scribe")} agent in chat and paste its output into a new tower draft. The templates for those angles are ${FILE("content/partnerships/outreach/first-touch-coach-complement.md", "coach-complement")}, ${FILE("content/partnerships/outreach/first-touch-open-recruit.md", "open-recruit")}, ${FILE("content/partnerships/outreach/first-touch-co-marketing.md", "co-marketing")}.</p>
</div>
<div class="d-end"><b>When you're done:</b> every draft in the house shows <span class="d-ui">warden ✓</span>. They live in ${TBL("partner_outbound_queue")} (status "ready") and on the tower's DECISIONS board.</div>
<div class="d-refs"><b>Touches</b>${FILE("app/api/cron/scribe/route.ts", "scribe cron")} · ${TBL("partner_outbound_queue")} · ${L(`${GHT}/content/partnerships/outreach`, "outreach templates")} · ${FILE("lib/partnerships/canon-mechanical.ts", "canon check")} · ${L("/admin/tower", "/admin/tower")}</div>`,
      },
    ],
  },
  {
    id: "w3",
    phase: "p30",
    tag: "Week 3 · Days 11–15",
    title: "First contact — the trigger-pull.",
    intro:
      "The cold-outreach gate happens this week. You stand at the tower with ~25 finished drafts and pull the trigger — one button at a time, or in batches. Then you work the replies the system surfaces.",
    tasks: [
      {
        id: "w3done1",
        title: "Already done — confirm the affiliates@ inbox delivers",
        tags: ["done"],
        bodyHtml: `
<p class="d-what">The old plan made you manually verify that mail to <span class="d-code">affiliates@aesdr.com</span> gets caught and routed before sending to 25 real people. That whole pipe is live and was tested end-to-end.</p>
<p class="d-h">What's running</p>
<ol class="d-steps">
  <li class="d-step">A Cloudflare Email Worker (source in ${L(`${GHT}/infra/cloudflare`, "infra/cloudflare/")}) catches every inbound message, forwards a copy to your personal inbox, and posts the raw message to ${FILE("app/api/webhooks/inbound-email/route.ts", "the inbound webhook")}, which stores it in ${TBL("partner_inbound_email")}.</li>
  <li class="d-step">${FILE("app/api/cron/sentinel/route.ts", "Sentinel")} reads that table every 10 minutes, decides whether each reply is interested ("bright"), polite-no ("soft"), an unsubscribe, or noise, and surfaces the bright ones to you.</li>
</ol>
<div class="d-end"><b>Nothing to do.</b> Replies to your outreach will arrive in your inbox <em>and</em> on the tower.</div>`,
      },
      {
        id: "w3t1",
        title: "Days 11–13 — Approve the first 25 cold sends (in three waves of ~8)",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">This is the moment outreach actually goes out. Every draft you approve is sent for you within ~5 minutes. You go in waves of about 8 (not all 25 at once) so you can watch the first replies and tweak the message before the next wave.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Open the tower:</strong> ${L("/admin/tower", "/admin/tower")} → the DECISIONS section, "N drafts in the house."</li>
  <li class="d-step"><strong>Wave 1 (Day 11) — approve ~8.</strong> On the first 8 email-channel cards, read the preview and click <span class="d-ui">Send</span> (one click each). If something reads wrong, click <span class="d-ui">Hold</span> instead — it pulls that draft off the send path so you can fix it later. <em>Do not</em> click "Send all" yet.</li>
  <li class="d-step"><strong>What "Send" actually does:</strong> it flips the row to "approved." The ${FILE("app/api/cron/courier/route.ts", "courier")} job picks up approved rows every 5 minutes, sends the email, and writes a permanent record so the same message can never go out twice. You'll see it appear under "Courier — recent sends" on the BOARD.</li>
  <li class="d-step"><strong>Wave 2 (Day 12) — approve ~8 more, adjusted.</strong> If Wave 1 got replies to the "15-minute call" ask, leave it. If nobody bit, click <span class="d-ui">Edit draft</span> on the remaining cards to switch the ask to "want the kit?" then Send.</li>
  <li class="d-step"><strong>Wave 3 (Day 13) — approve the final ~9.</strong> Same pattern. The point of waving is reaction time; don't blast all 25 in one hour.</li>
  <li class="d-step"><strong>For "manual send" cards</strong> (DM/form only): click into the card, copy the body, send it through their channel yourself, then click <span class="d-ui">Mark sent</span> so it's logged in the same audit trail.</li>
</ol>
<div class="d-end"><b>When you're done:</b> ~25 messages sent or marked-sent. See them under "Courier — recent sends" on ${L("/admin/tower", "/admin/tower")}, and as rows in ${TBL("partner_sent_log")}. The pipeline rows move to <span class="d-code">contacted</span>.</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower")} · ${FILE("app/api/cron/courier/route.ts", "courier")} · ${TBL("partner_outbound_queue")} · ${TBL("partner_sent_log")}</div>`,
      },
      {
        id: "w3t2",
        title: "Days 14–15 — Work the replies the tower surfaces",
        tags: ["you", "auto"],
        bodyHtml: `
<p class="d-what">As people reply, the system reads each one and pushes the genuinely interested ones to you in real time. Replying is human work — but you never have to watch an inbox; the bright ones come to you. Same-day replies are the whole game here.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>When a bright signal lands,</strong> you get an email ping <em>and</em> a card appears in the tower's DECISIONS section. Open the card; the ping email also includes a short excerpt of what they said.</li>
  <li class="d-step"><strong>Reply same day from your AESDR address.</strong> A warm reply that waits 48 hours goes cold.</li>
  <li class="d-step"><strong>For a "yes, tell me more":</strong> send them the kit at ${L("/affiliates/kit", "/affiliates/kit")} plus your booking link ${L(BOOKING, "(15-min AESDR partner intro)")}.</li>
  <li class="d-step"><strong>For "what's the commission?":</strong> the honest numbers — 40% commission, 30-day attribution window, $249/$299 one-time product, paid through Stripe. Transparency is the pitch; don't hedge.</li>
  <li class="d-step"><strong>When you've replied, click <span class="d-ui">Mark handled</span></strong> on the card so it leaves the DECISIONS board.</li>
  <li class="d-step"><strong>Silence is fine</strong> — those stay at <span class="d-code">contacted</span> and the follow-up ladder handles them later. Soft signals (polite no, auto-replies, unsubscribes) drop to the read-only BOARD with no action needed.</li>
</ol>
<div class="d-end"><b>When you're done:</b> every bright signal is replied to within 24h and marked handled. The booking calendar is ${L(BOOKING, "this Google Appointment link")} (cross-checks your personal calendars for conflicts).</div>
<div class="d-refs"><b>Touches</b>${L("/admin/tower", "/admin/tower")} · ${FILE("app/api/cron/sentinel/route.ts", "sentinel")} · ${L("/affiliates/kit", "/affiliates/kit")} · ${L(BOOKING, "booking link")}</div>`,
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
        title: "Days 16–19 — Run partner intro calls (target: 8–10)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">These are 15-minute fit-check calls, not hard sells. You send a prep bundle beforehand so the call itself is short and mutual. The goal of each call is a clear yes/maybe/no, logged.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Send the Pre-Call Bundle 24–48h before each call:</strong> the audience-sized one-pager, the founder video, the course preview, the kit, and the transparency page. These assets live in ${L(`${GHT}/content/partnerships/precall`, "content/partnerships/precall/")} (and the kit is at ${L("/affiliates/kit", "/affiliates/kit")}). The bundle does the convincing so the call is a conversation.</li>
  <li class="d-step"><strong>Two minutes before the call,</strong> reopen that candidate's dossier brief and the one specific piece of theirs you referenced in outreach, so your opening line names something real they made.</li>
  <li class="d-step"><strong>Hit four beats:</strong> (1) why you reached out to <em>them</em> specifically; (2) the mechanics — 40% / 30-day window / tracked link + kit; (3) the brand-fit gate, framed as protecting <em>their</em> audience's trust ("we read your first few posts so they sound like you, not an ad — then you post freely"); (4) their questions — let this be most of the call.</li>
  <li class="d-step"><strong>Close on a binary:</strong> "I send the kit today and we talk again [day], OR I set your link up this week — which is easier?" Never end on "let me think."</li>
  <li class="d-step"><strong>Log it right after.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: set [name] in partner_pipeline to status 'negotiating' <span class="c">// a yes or maybe</span> — or 'passed' if it was a no.</span></li>
</ol>
<div class="d-end"><b>When you're done:</b> 8–10 calls done, each candidate moved to <span class="d-code">negotiating</span> or <span class="d-code">passed</span> in ${TBL("partner_pipeline")}.</div>
<div class="d-refs"><b>Touches</b>${L(`${GHT}/content/partnerships/precall`, "precall bundle")} · ${L("/affiliates/kit", "kit")} · ${TBL("partner_pipeline")} · ${FILE(".claude/agents/ledger.md", "ledger")}</div>`,
      },
      {
        id: "w4t2",
        title: "Days 20–22 — Decide the attribution platform & write the memo",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">You now know your real numbers — roughly 25 contacted, 8–10 in conversation, a feel for payout cadence. That's enough to make the attribution call you opened on Day 5. The deliverable is a one-page memo to the founder, not just a private decision.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Re-read the audit:</strong> ${FILE("docs/partnerships/attribution-build-cost.md", "attribution-build-cost.md")}.</li>
  <li class="d-step"><strong>Make the call.</strong> The likely answer: keep the custom Supabase+Stripe system ($0) for now, and switch to <strong>Rewardful</strong> ($49/mo) the moment partner self-serve dashboards become the bottleneck. Name the exact trigger condition that would flip you.</li>
  <li class="d-step"><strong>Write the memo.</strong> Create ${FILE("docs/partnerships/attribution-decision.md", "docs/partnerships/attribution-decision.md")} (in your terminal: <span class="d-code">touch docs/partnerships/attribution-decision.md</span>, then open it in your editor). One page: what you chose, the gaps it closes, the trigger that flips you to Rewardful, the cost both ways.</li>
  <li class="d-step"><strong>Send it to the founder</strong> by email — this is a founder-aligned strategic call, not just a commit.</li>
</ol>
<div class="d-end"><b>When you're done:</b> the memo exists at ${FILE("docs/partnerships/attribution-decision.md", "attribution-decision.md")} and is in the founder's inbox. The clearing automation is already live (${FILE("app/api/cron/affiliate/route.ts", "affiliate cron")}), so there's no plumbing to add if you stay custom.</div>`,
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
        title: "Days 28–30 — Phase-30 review + the founder memo",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Close the phase by checking the four milestones against real evidence and sending the founder an 8-line memo. The four milestones: discovery documented, 25 candidates identified, outreach started, attribution platform chosen.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Pull the numbers.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: for a phase-30 review, return these counts — total affiliate candidates in partner_pipeline, how many at status 'contacted', how many at 'call_booked' or 'negotiating', how many affiliates are 'active', and total rows in affiliate_attributions.</span></li>
  <li class="d-step"><strong>Check each milestone against an artifact:</strong> discovery documented → ${FILE("docs/partnerships/discovery-doctrine.md", "discovery-doctrine.md")} exists; 25 candidates → ${TBL("partner_pipeline")} count ≥ 25; outreach started → "recent sends" on ${L("/admin/tower", "/admin/tower")}; platform chosen → ${FILE("docs/partnerships/attribution-decision.md", "attribution-decision.md")} sent. If any is short, that's the lead of the memo, not something to hide.</li>
  <li class="d-step"><strong>Draft the memo.</strong> Paste:
    <span class="d-cmd">use the almanac subagent: write the 30-day founder memo from ledger's numbers. Cover numbers vs each milestone, what converted, what didn't, and the one change for Phase 60. Eight lines, not a report.</span></li>
  <li class="d-step"><strong>Send it</strong> to the founder.</li>
</ol>
<div class="d-end"><b>When you're done:</b> a four-milestone-evidenced memo is in the founder's inbox.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE(".claude/agents/almanac.md", "almanac")} · ${TBL("partner_pipeline")} · ${FILE("docs/partnerships/discovery-doctrine.md", "doctrine")} · ${FILE("docs/partnerships/attribution-decision.md", "decision memo")}</div>`,
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
        title: "Days 41–44 — Open 3 channel conversations",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">Channel outreach is written by hand (the auto-drafter only does consumer affiliate templates) because the pitch leads with the specific gap you fill in <em>their</em> practice, never with a commission rate. You still route the send through the tower so it's logged in the same audit trail.</p>
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
        title: "Already running — the daily standup digest",
        tags: ["done", "auto"],
        bodyHtml: `
<p class="d-what">The old plan had you build a "Friday ritual" by hand. The daily standup is automatic now.</p>
<p class="d-h">What's running</p>
<ol class="d-steps">
  <li class="d-step">${FILE("app/api/cron/almanac/route.ts", "The almanac cron")} emails you a digest every morning at 7am ET — bright signals waiting, drafts in the house, workshops due. On a quiet day it says "all clear" (proof it's alive). The weekly deep pull below is what you add on top.</li>
</ol>
<div class="d-end"><b>Nothing to build.</b> Just read the morning email.</div>`,
      },
      {
        id: "w7t1",
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
        title: "Days 49–51 — First payout dry-run (founder-approved)",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">By now your earliest commissions are clearing the 30-day window. Before any real money moves, you run a "dry-run" — a report of who is owed what — and walk the founder through it. Real money is the one place the "under 10 minutes" rule bends: take as long as you need to review it. The actual transfer happens in the admin UI with founder sign-off.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Run the dry-run.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: list every cleared-but-unpaid commission, totaled per affiliate (status='cleared' and not yet paid). Flag anything unusual — a refund rate over 15%, or one affiliate making up more than 60% of volume. Report only; do not pay anything.</span>
    Ledger reports; it never moves money.</li>
  <li class="d-step"><strong>Walk the founder through the numbers</strong> before any transfer — per-affiliate totals, the grand total, anything ledger flagged. This first run is a founder-approved decision, not a solo call.</li>
  <li class="d-step"><strong>Run the real transfer in the UI.</strong> With approval, go to <span class="d-where">/admin/affiliates/[slug]</span> (click the affiliate in ${L("/admin/affiliates", "/admin/affiliates")}) → the payout helper → confirm the amount → execute. This sends a Stripe Connect transfer and writes ${TBL("affiliate_payouts")}.</li>
</ol>
<div class="d-callout d-callout-warn"><div class="d-callout-title">Coming to the tower</div><p>A <strong>Payouts</strong> card in the cockpit — the cleared-but-unpaid run as a one-review, one-commit money gate. Until it ships, payouts run via the ledger dry-run + the admin UI above.</p></div>
<div class="d-end"><b>When you're done:</b> Stripe shows the transfer, the affiliate's dashboard reads "paid," and ${TBL("affiliate_payouts")} has the record.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${L("/admin/affiliates", "/admin/affiliates")} · ${TBL("affiliate_attributions")} · ${TBL("affiliate_payouts")}</div>`,
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
        title: "Days 52–56 — Push to 10 active affiliates",
        tags: ["you", "tower"],
        bodyHtml: `
<p class="d-what">Convert the warm middle of your pipeline into active affiliates, and unstick anyone who stalled in the copy gate. The bar holds: 7 great affiliates beat 10 where 4 never post.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Work the warm middle first.</strong> On the tower's <strong>Pipeline</strong> board (${L("/admin/tower", "/admin/tower")}), the <span class="d-code">negotiating</span> count is your fastest path to active. Send each the onboarding follow-up and run them through the Day-23 create-affiliate flow as they say yes.</li>
  <li class="d-step"><strong>Unstick the gate-stalled.</strong> For any developing-tier affiliate sitting on an unfinished first piece, book a 15-minute co-writing call — you and warden draft their first approved post live. That revives a stalled partner faster than three rounds of async.</li>
  <li class="d-step"><strong>Refill only if thinning.</strong> The auto-drafter keeps the cold lane fed from enriched candidates, so if the funnel is thin the move is a fresh ${FILE(".claude/agents/scout.md", "scout")} sweep (which feeds the drafter) — never lower the voice-fit bar to pad the count.</li>
</ol>
<div class="d-end"><b>When you're done:</b> 10 rows at <span class="d-code">active</span> in ${TBL("affiliates")} with ≥1 approved piece each — or the founder has the honest lower number and why.</div>`,
      },
      {
        id: "w8t2",
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
  <li class="d-step"><strong>Clone the pattern.</strong> Paste:
    <span class="d-cmd">use the scout subagent: find 10 more partners who look like these top 3 — same surface, same archetype.</span>
    They flow into ${TBL("partner_pipeline")}, get enriched, and the auto-drafter queues their first-touch in the tower without you writing it.</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">Usher carries the workshop</div><p>Once a workshop row exists in ${TBL("partner_workshop")}, ${FILE("app/api/cron/usher/route.ts", "usher")} advances it through scheduled → reminded → live → replay-open → closed and queues every registrant touch pre-approved. You host; the logistics run themselves.</p></div>
<div class="d-end"><b>When you're done:</b> the top 3 are identified, each has a second piece or a workshop in motion, and scout is finding lookalikes.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${FILE(".claude/agents/almanac.md", "almanac")} · ${FILE(".claude/agents/scout.md", "scout")} · ${FILE("app/api/cron/usher/route.ts", "usher")} · ${TBL("partner_workshop")} · ${L("/admin/affiliates", "/admin/affiliates")}</div>`,
      },
      {
        id: "w9t2",
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
        title: "Days 68–74 — Codify the operating cadence",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Write down the weekly rhythm so a stranger (or a future hire) could run it. The honest version of this deliverable is now short, because the cadence <em>is</em> the tower plus a few weekly dispatches.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Create the doc.</strong> In your terminal: <span class="d-code">touch docs/partnerships/operating-cadence.md</span>, then open it. (It'll live at ${FILE("docs/partnerships/operating-cadence.md", "docs/partnerships/operating-cadence.md")} once committed.)</li>
  <li class="d-step"><strong>Write the daily rhythm:</strong> the 7am almanac digest lands → you open ${L("/admin/tower", "/admin/tower")}, clear the DECISIONS lane (approve drafts, handle bright signals), close the tab. That's the standup.</li>
  <li class="d-step"><strong>Write down what's continuous and automatic,</strong> citing the schedule in ${FILE("docs/partnerships/cron-schedule.md", "cron-schedule.md")}: ${FILE("app/api/cron/sentinel/route.ts", "sentinel")} every 10 min, ${FILE("app/api/cron/scribe/route.ts", "scribe drafter")} every 15, ${FILE("app/api/cron/courier/route.ts", "courier")} every 5, ${FILE("app/api/cron/usher/route.ts", "usher")} every 30, ${FILE("app/api/cron/almanac/route.ts", "almanac")} daily.</li>
  <li class="d-step"><strong>Write the weekly rhythm:</strong> Friday — dispatch ledger for the report, almanac for the founder note. Paste the actual dispatch commands so they're copy-runnable.</li>
</ol>
<div class="d-end"><b>When you're done:</b> ${FILE("docs/partnerships/operating-cadence.md", "operating-cadence.md")} is committed and a stranger could run your week from it plus the tower. This is the role's real success deliverable — the function runs without founder day-to-day involvement.</div>`,
      },
      {
        id: "w1011t2",
        title: "Days 75–81 — Second affiliate wave + workshop pilot",
        tags: ["tower", "auto"],
        automatable: true,
        bodyHtml: `
<p class="d-what">Run a second wave of outreach at scale — almost hands-free now that the machine works — and pilot a live workshop with your strongest affiliate.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Run the second wave.</strong> Dispatch ${FILE(".claude/agents/scout.md", "scout")}, let dossier + ledger enrich into ${TBL("partner_pipeline")}, and the ${FILE("app/api/cron/scribe/route.ts", "auto-drafter")} fills the tower with first-touches. You approve in batches at ${L("/admin/tower", "/admin/tower")}. Pull from the <span class="d-code">cold</span> rows you parked in Week 2 plus fresh scout results.</li>
  <li class="d-step"><strong>Pilot a workshop.</strong> Create a row in ${TBL("partner_workshop")} (a date in US Central business hours) — ${FILE("app/api/cron/usher/route.ts", "usher")} handles every reminder and the replay window. A live workshop converts 3–5× a link drop.</li>
  <li class="d-step"><strong>Keep the funnel deep</strong> so Day 90 isn't a cliff.</li>
</ol>
<div class="d-end"><b>When you're done:</b> 25 new candidates in the funnel and one workshop scheduled with your top affiliate.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/scout.md", "scout")} · ${FILE("app/api/cron/scribe/route.ts", "scribe drafter")} · ${FILE("app/api/cron/usher/route.ts", "usher")} · ${TBL("partner_pipeline")} · ${TBL("partner_workshop")} · ${L("/admin/tower", "/admin/tower")}</div>`,
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
        title: "Days 82–86 — Hit the $3k/mo trajectory + run payouts clean",
        tags: ["you"],
        bodyHtml: `
<p class="d-what">Push the run-rate to the $3k/mo target, run a clean month-end payout (the process the founder approved in Phase 60), and check program health.</p>
<p class="d-h">Click by click</p>
<ol class="d-steps">
  <li class="d-step"><strong>Check the run-rate.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: show booked commission (pending plus cleared) this month versus the $3k target.</span>
    If close-but-under, your lever is the Week-9 top 3 — push one more piece from each, don't chase cold partners this late.</li>
  <li class="d-step"><strong>Run the month-end payout.</strong> Ledger dry-run → review → the payout helper at <span class="d-where">/admin/affiliates/[slug]</span> → execute. Verify every dashboard reads "paid" and Stripe reconciles; records land in ${TBL("affiliate_payouts")}.</li>
  <li class="d-step"><strong>Run the health check.</strong> Paste:
    <span class="d-cmd">use the ledger subagent: show the refund rate per affiliate. Flag anyone over 15%.</span>
    Over 15% is a partner over-promising — book a warden review + a debrief call; it's a copy problem, not a payout problem. Suspend only at 20%.</li>
</ol>
<div class="d-end"><b>When you're done:</b> run-rate at/near $3k/mo, payout ran clean (${TBL("affiliate_payouts")}), refund rate under 15%.</div>
<div class="d-refs"><b>Touches</b>${FILE(".claude/agents/ledger.md", "ledger")} · ${L("/admin/affiliates", "/admin/affiliates")} · ${TBL("affiliate_attributions")} · ${TBL("affiliate_payouts")}</div>`,
      },
      {
        id: "w1213t2",
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
  <li class="d-step"><strong>Show the tower as the proof of "runs without heroics"</strong> — the schedule in ${FILE("docs/partnerships/cron-schedule.md", "cron-schedule.md")}, the daily digest, and a DECISIONS lane that's usually already empty. That's the real success definition.</li>
  <li class="d-step"><strong>Present the next-quarter plan:</strong> the second-wave pipeline, the channel deals in flight, the top-performer pattern to clone, and the one tool the data now justifies (e.g. Rewardful at the dashboard-bottleneck trigger from your ${FILE("docs/partnerships/attribution-decision.md", "attribution memo")}).</li>
</ol>
<div class="d-callout d-callout-note"><div class="d-callout-title">What "overachieve" looks like here</div><p>Not 10 affiliates — 15. Not "3 conversations" — one signed channel deal plus 3 more open. Not "reporting live" — a founder who hasn't had to ask for a number in a month because it's in front of him every Friday. The bar is making the milestones look conservative.</p></div>
<div class="d-end"><b>When you're done:</b> the 90-day proof is delivered, three milestones evidenced, next-quarter plan presented.</div>`,
      },
    ],
  },
];
