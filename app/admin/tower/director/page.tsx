import type { Metadata } from "next";
import Link from "next/link";

import styles from "./director.module.css";

/**
 * Director's tab — the partnerships 90-day operator playbook, embedded in the
 * Control Tower. The strategic-temporal view: where are we in the 90, what's
 * this week's spine, what's today's click-by-click. The tower's other tabs
 * are the operational right-now view; this is the calendar above them.
 *
 * Rebuilt top-to-bottom against tower-era reality:
 *   - [DONE] — was Day-1-setup work, now permanent infrastructure (don't redo)
 *   - [AUTO] — a cron in the tower handles it automatically (just watch)
 *   - [TOWER] — handled by clicking inside /admin/tower (one gesture)
 *   - [YOU]   — genuine human moment, click-by-click instructions below
 *
 * Phase 30 is fully rebuilt in this turn. Phases 60/90 + auxiliary sections
 * (Resources, Attribution Matrix, Benchmarks, Outreach Library, Agents) carry
 * an explicit "rebuild in progress" marker with a link to the legacy doc at
 * /partnerships-os for the original content until they flow through here.
 */

export const metadata: Metadata = {
  title: "Director · Control Tower | AESDR",
  robots: { index: false, follow: false },
};

const PHASES = [
  {
    num: "Phase · Days 1–30",
    title: "Foundation & First Contact",
    goal: "Roster discovered · 25 candidates in the pipeline · cold outreach approved · attribution decision made.",
  },
  {
    num: "Phase · Days 31–60",
    title: "Activation & The Channel Switch",
    goal: "10 affiliates active · 3 channel conversations open · payouts running clean.",
  },
  {
    num: "Phase · Days 61–90",
    title: "Compounding & Proof",
    goal: "Top affiliates on a $3k/mo trajectory · one channel deal signed or close · the machine runs without your hand on every lever.",
  },
];

const NAV = [
  { group: "The 90 days", items: [
    { href: "#overview", label: "Overview", num: "00" },
    { href: "#phase-30", label: "Phase 30 · Foundation", num: "P30" },
    { href: "#phase-60", label: "Phase 60 · Activation", num: "P60" },
    { href: "#phase-90", label: "Phase 90 · Proof", num: "P90" },
  ]},
  { group: "The board", items: [
    { href: "/admin/tower", label: "Control Tower ↩", num: "" },
    { href: "#agents", label: "Agent Roster", num: "" },
    { href: "#resources", label: "Resources", num: "" },
    { href: "#attribution", label: "Attribution Matrix", num: "" },
  ]},
];

export default function DirectorPage() {
  return (
    <div className={styles.shell}>
      <p className={styles.eyebrow}>
        <span className={styles.irisText}>Director</span> · Partnerships · 90-day playbook
      </p>
      <h1 className={styles.headline}>You direct the function.<br />The tower runs it.</h1>
      <p className={styles.lede}>
        This is the calendar above the cockpit. Open it on Monday to see what the
        week needs. Open it on Day 47 to see whether you&rsquo;re on the line. <em>The
        90-day arc is yours; the daily execution moved into the tower so you
        don&rsquo;t have to remember it.</em>
      </p>
      <p className={styles.lede}>
        Every step on this page is tagged: <span className={`${styles.tag} ${styles.you}`}>YOU</span> means
        a real human moment (click-by-click follows); <span className={`${styles.tag} ${styles.tower}`}>TOWER</span> means
        you act inside <Link href="/admin/tower" style={{ color: "#8B1A1A", textDecoration: "underline" }}>the cockpit</Link>;{" "}
        <span className={`${styles.tag} ${styles.auto}`}>AUTO</span> means a cron handles it (just watch the board);
        and <span className={styles.tag}>DONE</span> means it was Week-1 setup work and is now permanent.
      </p>

      <div className={styles.frame}>
        {/* ─── Sidebar ─── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <div className={styles.sidebarTag}>The First 90</div>
            <div className={styles.sidebarTitle}>Director</div>
          </div>
          {NAV.map((g) => (
            <div key={g.group}>
              <div className={styles.navGroup}>{g.group}</div>
              {g.items.map((it) => (
                <a key={it.href} href={it.href} className={styles.navItem}>
                  <span className={styles.navNum}>{it.num}</span>
                  {it.label}
                </a>
              ))}
            </div>
          ))}
        </aside>

        {/* ─── Main ─── */}
        <main className={styles.main}>

          {/* ════ OVERVIEW ════ */}
          <section id="overview" className={styles.section}>
            <p className={styles.secEyebrow}>Overview · the arc</p>
            <h2 className={styles.secTitle}>Three phases. One running machine at the end.</h2>
            <div className={styles.ribbon}>
              {PHASES.map((p, i) => (
                <div key={i} className={styles.ribCard}>
                  <div className={styles.ribNum}>{p.num}</div>
                  <div className={styles.ribTitle}>{p.title}</div>
                  <div className={styles.ribGoal}>{p.goal}</div>
                </div>
              ))}
            </div>
            <div className={`${styles.callout} ${styles.done}`}>
              <div className={styles.calloutTitle}>Already done before Day 1</div>
              <p>
                The infrastructure the original 90-day plan stood up in Week 1 —
                Supabase schema, Cloudflare email routing, the partner_pipeline
                CRM, the agent roster, the cron handlers, the brand canon — is
                permanently in place. You start at <strong>Day 1, with a tower
                already breathing</strong>, not at Day 1 wiring screws.
              </p>
            </div>
          </section>

          {/* ════ PHASE 30 ════ */}
          <section id="phase-30" className={styles.section}>
            <p className={styles.secEyebrow}>Phase 30 · Foundation &amp; first contact</p>
            <h2 className={styles.secTitle}>Get the lay of the land. Build the list. Open the first 25 conversations.</h2>
            <p className={styles.secLede}>
              You don&rsquo;t set up infrastructure. You don&rsquo;t hand-roll a
              pipeline table. The tower watches inbound. Almanac emails you the
              standup. Sentinel pings you when a bright signal lands. Your job in
              Phase 30 is to discover, qualify, and approve the first cold sends
              — every other piece runs without you.
            </p>

            {/* ── WEEK 1 ── */}
            <div className={styles.week}>
              <div className={styles.weekHead}>
                <span className={styles.weekTag}>Week 1 · Days 1–5</span>
                <span className={styles.weekTitle}>See the whole board. Know the canon.</span>
              </div>
              <div className={styles.weekIntro}>
                Reconnaissance, not construction. You don&rsquo;t send a single
                outreach this week — you walk the tower, read the canon until you
                can hear the voice, and confirm the 25 already-named prospect
                candidates Scout left you.
              </div>
              <div className={styles.weekBody}>

                {/* Day 1 morning */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>Day 1, 9:00am — Walk the tower (everything that runs without you)</strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.day}`}>Day 1</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Open the cockpit.</strong> In your browser, go to{" "}
                      <span className="where">aesdr.com/admin/tower</span>. Sign in if
                      prompted (your email is permanent-admin, so you&rsquo;ll land directly).
                    </li>
                    <li className={styles.step}>
                      <strong>Read the top line.</strong> It says either &ldquo;All clear&rdquo;
                      or &ldquo;N waiting on you.&rdquo; That number is your job for the day.
                      Everything below the line is read-only situational awareness.
                    </li>
                    <li className={styles.step}>
                      <strong>Find the four sections.</strong> In order: <em>Decisions</em>{" "}
                      (drafts ready to send, bright signals), then <em>Board</em>{" "}
                      (pipeline by stage, courier&rsquo;s recent sends, soft signals).
                      Click each header so the muscle memory sets.
                    </li>
                    <li className={styles.step}>
                      <strong>Notice the &ldquo;sentinel last swept&rdquo;</strong> stamp at
                      the top right. That ticks every 10 minutes. If it ever reads &gt;30
                      minutes, the clock has stopped — escalate to the founder.
                    </li>
                    <li className={styles.step}>
                      <strong>Set a tab pin.</strong> The tower is your home page now. Cmd/Ctrl-D
                      to bookmark. <span className={styles.inlineCode}>/admin/tower</span>
                      lives on top of your browser stack for the next 90 days.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    you can describe the tower&rsquo;s four sections without looking.
                  </div>
                </div>

                {/* Day 1 mid-morning — alerts setup */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Day 1, 10:00am — Confirm bright-signal alerts reach you
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.auto}`}>AUTO</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Default alert recipient is <code>antaeus.coe@gmail.com</code></strong>{" "}
                      — the permanent-admin email. If that&rsquo;s the inbox you live in, no
                      action needed; skip to step 4.
                    </li>
                    <li className={styles.step}>
                      <strong>If you want alerts elsewhere</strong> (a Slack-routing address,
                      a dedicated inbox), open the Vercel dashboard:{" "}
                      <span className="where">vercel.com</span> → AESDR project →{" "}
                      <span className="ui">Settings</span> → <span className="ui">Environment Variables</span> → add{" "}
                      <code>PARTNER_ALERT_EMAIL</code> with the address you want, scope to{" "}
                      <strong>Production</strong> → <span className="ui">Save</span>.
                    </li>
                    <li className={styles.step}>
                      <strong>Redeploy</strong> by pushing any small commit, or in Vercel:{" "}
                      <span className="ui">Deployments</span> → latest → <span className="ui">⋯</span> →{" "}
                      <span className="ui">Redeploy</span>. The new env var only takes
                      effect on the next deploy.
                    </li>
                    <li className={styles.step}>
                      <strong>Watch for the daily digest tomorrow morning at 7am ET.</strong>{" "}
                      The almanac cron mails one digest per day even if there&rsquo;s nothing
                      waiting (subject line: <em>Tower: all clear</em> — proof the system is alive).
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    you can describe where alerts land and how to change it.
                  </div>
                </div>

                {/* Day 1 afternoon — canon */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Day 1, 2:00pm — Read the canon until you can hear it
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>You cannot approve cold sends</strong> from the tower until
                      you can hear the AESDR voice. Read in this order, in-repo.
                    </li>
                    <li className={styles.step}>
                      <strong>Read 1 (15 min)</strong> — open{" "}
                      <code>AGENTS.md</code> then{" "}
                      <code>AFFILIATE_BRAND_CANON.md</code> at the repo root. The base
                      brand-voice canon and the affiliate-side overlap.
                    </li>
                    <li className={styles.step}>
                      <strong>Read 2 (30 min)</strong> — open the folder{" "}
                      <code>docs/canon-revisions/</code> and read every dated{" "}
                      <code>.md</code> file oldest→newest. Memorize: the R-G blocklist
                      (R-G1→R-G8) is what Warden runs against every queued draft.
                    </li>
                    <li className={styles.step}>
                      <strong>Read 3 (10 min) — walk the buyer surfaces</strong>:{" "}
                      <span className="where">aesdr.com</span>,{" "}
                      <span className="where">aesdr.com/affiliates</span>,{" "}
                      <span className="where">aesdr.com/affiliates/kit</span>,{" "}
                      <span className="where">aesdr.com/enterprise</span>. Read out
                      loud — that&rsquo;s the R-G5 test.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    you can name five R-G blocklist terms from memory.
                  </div>
                </div>

                {/* What WAS Day 2 — now done */}
                <div className={`${styles.callout} ${styles.done}`}>
                  <div className={styles.calloutTitle}>Already done · was &ldquo;Day 2: build the agent roster&rdquo;</div>
                  <p>
                    The seven agents are wired. <strong>Sentinel</strong>, <strong>courier</strong>,{" "}
                    <strong>usher</strong>, and <strong>almanac</strong> run as crons on
                    a schedule. <strong>Scout</strong>, <strong>dossier</strong>,{" "}
                    <strong>scribe</strong>, <strong>warden</strong>, <strong>herald</strong>,{" "}
                    and <strong>ledger</strong> are chat-invoked subagents you dispatch when
                    a moment calls for judgment. See the <a href="#agents">Agent Roster</a> below.
                  </p>
                </div>

                {/* What WAS Day 2-3 — map the machine */}
                <div className={`${styles.callout} ${styles.done}`}>
                  <div className={styles.calloutTitle}>Already done · was &ldquo;Day 2: map the affiliate machine&rdquo;</div>
                  <p>
                    The five live tables (<code>affiliates</code>,{" "}
                    <code>affiliate_attributions</code>, <code>affiliate_payouts</code>,{" "}
                    <code>affiliate_links</code>, <code>affiliate_applications</code>) + the
                    six partner-agent tables (<code>partner_pipeline</code>,{" "}
                    <code>partner_inbound_email</code>, <code>partner_outbound_queue</code>,{" "}
                    <code>partner_sent_log</code>, <code>partner_signals</code>,{" "}
                    <code>partner_workshop</code>) all exist. You read them via the tower,
                    not via psql.
                  </p>
                </div>

                {/* Day 4 — discovery doctrine */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Day 4 — Read the discovery doctrine (don&rsquo;t rewrite it)
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.day}`}>Day 4</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>The doctrine exists at <code>docs/partnerships/discovery-doctrine.md</code>{" "}
                      at v2.0.</strong> Open it in GitHub:{" "}
                      <span className="where">github.com/fastcoempany/aesdr/blob/main/docs/partnerships/discovery-doctrine.md</span>.
                      Read it once cover-to-cover.
                    </li>
                    <li className={styles.step}>
                      <strong>Internalize the six rules:</strong> (1) sourcing — practitioner
                      networks, never marketplaces, never LinkedIn; (2) voice-fit bar 1–5;
                      (3) the four archetype targets; (4) the narrow disqualifiers; (5) §4.5
                      motion tags — affiliate / coach_complement / open_recruit / co_marketing;
                      (6) the Dossier-before-Scribe rule.
                    </li>
                    <li className={styles.step}>
                      <strong>The doctrine is a filter, not a formality.</strong> When you
                      see a 100k-follower guru-coded creator in the pipeline, the doctrine
                      is what lets you tag them <em>passed</em> without re-litigating it.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    you can recite the six rules without looking.
                  </div>
                </div>

                {/* Day 5 — attribution decision */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Day 5 — Open the attribution-decision evaluation (the JD calls it by Day 30)
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.day}`}>Decide by Day 25</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Read the existing memo</strong> at{" "}
                      <code>docs/partnerships/attribution-build-cost.md</code> (in-repo). It&rsquo;s
                      the May-2026 audit and is the baseline.
                    </li>
                    <li className={styles.step}>
                      <strong>The honest default for AESDR&rsquo;s stage:</strong> extend the
                      custom Supabase+Stripe system for the first ~25 partners ($0), adopt{" "}
                      <strong>Rewardful at $49/mo</strong> the moment partner self-serve dashboards
                      become the bottleneck. Today&rsquo;s your read-and-think; the decision
                      happens around Day 25.
                    </li>
                    <li className={styles.step}>
                      <strong>The cron that promotes pending → cleared after the 30-day refund window</strong>{" "}
                      already ticks daily at 08:00 UTC ({" "}
                      <code>/api/cron/affiliate</code> in <code>vercel.json</code>). One less
                      thing to think about.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    you&rsquo;ve read the memo and named your tentative pick.
                  </div>
                </div>
              </div>
            </div>

            {/* ── WEEK 2 ── */}
            <div className={styles.week}>
              <div className={styles.weekHead}>
                <span className={styles.weekTag}>Week 2 · Days 6–10</span>
                <span className={styles.weekTitle}>The list. Fifty names, scored.</span>
              </div>
              <div className={styles.weekIntro}>
                The highest-leverage week of the quarter. You live in Scout and
                Dossier — both chat-invoked subagents.
              </div>
              <div className={styles.weekBody}>

                {/* Days 6-7 */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 6–7 — Run three Scout sweeps (target: 50 scored rows)
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.day}`}>Day 6</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Scout has a head start.</strong> Ten named affiliate candidates
                      with motion tags already exist — see the legacy <strong>Prospect Intel</strong>{" "}
                      section in the original doc. Your job: Dossier-verify each, then extend
                      to 50.
                    </li>
                    <li className={styles.step}>
                      <strong>Dispatch Scout three times, scoped to three surfaces.</strong>{" "}
                      Open Claude Code in this repo. Run each as a separate dispatch:
                    </li>
                    <li className={styles.step}>
                      <strong>Sweep 1 — paid communities.</strong> Type:{" "}
                      <code>use the scout subagent to find 15 sales/SDR/AE community owners on Skool, Mighty Networks, and Circle (50–2,000 members each), score voice-fit 1–5, no LinkedIn-only contact paths</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Sweep 2 — newsletters + podcasts.</strong>{" "}
                      <code>use the scout subagent to find 15 independent sales newsletters (Substack/Beehiiv) + operator-host podcasts. Contact path must be reply-to email or guest-pitch form, never LinkedIn</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Sweep 3 — practitioner figures.</strong>{" "}
                      <code>use the scout subagent to find 15 active contributors in 30MPC, Outbound Squad, RepVue, Modern Sales Pros, Apex BDR Club, Pavilion who have their own audience</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Pipe each result with voice-fit ≥3 to Dossier.</strong>{" "}
                      In the same chat: <code>use the dossier subagent on [name]: build the pre-outreach brief — audience size, cadence, voice-fit verdict, conflicts, the non-LinkedIn contact path</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Have ledger write survivors into the pipeline.</strong>{" "}
                      {/* eslint-disable-next-line no-restricted-syntax -- 'ledger' here is the literal name of the .claude/agents/ledger.md subagent slug used in the dispatch syntax, not the R-G4 bookkeeping metaphor. */}
                      <code>use the ledger subagent to insert these N rows into partner_pipeline at status=&apos;enriched&apos;</code>{" "}
                      and paste Dossier&rsquo;s output. Show SQL before write (ledger&rsquo;s
                      default).
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    50 rows sit at <code>status=&apos;enriched&apos;</code> in{" "}
                    <code>partner_pipeline</code> by end of Day 7. Verify in the tower&rsquo;s
                    Pipeline board.
                  </div>
                </div>

                {/* Days 8-9 */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 8–9 — Score, rank, and cut to the top 25
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Dispatch ledger to rank.</strong> In Claude Code:{" "}
                      {/* eslint-disable-next-line no-restricted-syntax -- agent slug, not bookkeeping metaphor */}
                      <code>use the ledger subagent: rank partner_pipeline where motion=&apos;affiliate&apos; and status=&apos;enriched&apos; by composite = voice_fit×3 + least(audience_est,20000)/4000×2; return top 25 with name, surface, audience, voice_fit, composite, contact_path</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Why reachability matters:</strong> a 5k newsletter with an open
                      reply address beats a 50k audience locked behind a gatekeeper. The
                      formula caps audience influence so unreachable can&rsquo;t buy its way up.
                    </li>
                    <li className={styles.step}>
                      <strong>Apply the cuts (in the chat or in psql):</strong> cut anyone
                      voice-fit ≤2 regardless of audience. Cut a competitor&rsquo;s{" "}
                      <em>employee</em>, sub-1k engaged audience, or a vendor sponsorship whose
                      lessons you&rsquo;d contradict. <strong>Do NOT cut competing-course owners</strong>{" "}
                      — under doctrine v2.0 they&rsquo;re coach_complement candidates.
                    </li>
                    <li className={styles.step}>
                      <strong>Set <code>status=&apos;cold&apos;</code> for the cuts</strong> (not
                      deleted — they&rsquo;re your Phase-90 second wave). Top 25 stay{" "}
                      <code>enriched</code>.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    the tower&rsquo;s Pipeline board shows 25 at <em>enriched</em> and the rest at <em>cold</em>.
                  </div>
                </div>

                {/* Day 10 — pre-write outreach */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Day 10 — Pre-stage the outreach drafts into the tower&rsquo;s queue
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.tower}`}>TOWER</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>For each of the top 25, dispatch scribe to draft.</strong> In
                      Claude Code:{" "}
                      <code>use the scribe subagent with this dossier brief: [paste]. Draft a first-touch + 3-step follow-up ladder for an AFFILIATE partner, AESDR voice, ≤120 words first-touch, disclose 40%/30-day/$249-$299 plain, reply-to affiliates@aesdr.com</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Then dispatch warden against each draft.</strong>{" "}
                      <code>use the warden subagent on this draft: [paste]. Verdict: APPROVE / EDITS / DECLINE</code>.
                      Iterate until APPROVE.
                    </li>
                    <li className={styles.step}>
                      <strong>Have ledger queue each approved draft into <code>partner_outbound_queue</code></strong>{" "}
                      at <code>status=&apos;ready&apos;</code>, <code>warden_cleared=true</code>,
                      <code>tier=&apos;cold&apos;</code> (the gated tier — these are first-contact sends).
                      A future scribe→warden→courier inline wiring will collapse these three steps
                      into one; until then, dispatch them yourself.
                    </li>
                  </ol>
                  <div className={`${styles.callout} ${styles.stub}`}>
                    <div className={styles.calloutTitle}>Coming in the next build pass</div>
                    <p>
                      &ldquo;Scribe drafts directly into <code>partner_outbound_queue</code>{" "}
                      after warden clears&rdquo; — eliminates the manual paste loop above. When
                      that ships, this step compresses to a single dispatch.
                    </p>
                  </div>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    the tower&rsquo;s <em>Decisions</em> board shows 25 drafts waiting on
                    your approval, each warden-cleared.
                  </div>
                </div>
              </div>
            </div>

            {/* ── WEEK 3 ── */}
            <div className={styles.week}>
              <div className={styles.weekHead}>
                <span className={styles.weekTag}>Week 3 · Days 11–15</span>
                <span className={styles.weekTitle}>First contact — the trigger-pull.</span>
              </div>
              <div className={styles.weekIntro}>
                The cold-tier gate happens this week. You stand at the tower with
                25 drafts waiting and pull the trigger — one button at a time,
                or in batches.
              </div>
              <div className={styles.weekBody}>

                {/* Day 11 — verify inbound (already automatic) */}
                <div className={`${styles.callout} ${styles.done}`}>
                  <div className={styles.calloutTitle}>Already done · was &ldquo;Day 11: confirm <code>affiliates@</code> delivers&rdquo;</div>
                  <p>
                    The Cloudflare Worker is live and posts every inbound mail to{" "}
                    <code>partner_inbound_email</code>. Sentinel polls it every 10
                    minutes, classifies bright/soft/unsubscribe/noise, and pings you
                    for brights. The forward to your inbox is also preserved. <strong>One
                    less Day-11 worry.</strong>
                  </p>
                </div>

                {/* Days 11-13 — approve the first 25 */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 11–13 — Approve the first 25 cold sends (paced, three waves of ~8)
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.tower}`}>TOWER</span>
                      <span className={`${styles.tag} ${styles.day}`}>Day 11</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Open the tower.</strong>{" "}
                      <Link href="/admin/tower" className={styles.towerBtn}>Open /admin/tower</Link>
                    </li>
                    <li className={styles.step}>
                      <strong>Find the Decisions board.</strong> &ldquo;25 drafts ready to
                      send.&rdquo; Don&rsquo;t click <em>Send all 25</em> — go in waves of 8 so
                      early replies can shape Wave 2&rsquo;s tone.
                    </li>
                    <li className={styles.step}>
                      <strong>Wave 1 — 8 sends.</strong> Click <span className="ui">Send</span>{" "}
                      on the first 8 cards (one click each), or skim each preview and{" "}
                      <span className="ui">Hold</span> if anything reads wrong. Courier
                      transmits within 5 minutes of approval.
                    </li>
                    <li className={styles.step}>
                      <strong>Wave 2 (Day 12) — 8 sends, adjusted.</strong> If Wave 1 got
                      replies to the &ldquo;15-min call&rdquo; ask, leave the ask alone. If
                      no one bit on it, dispatch scribe to swap to the &ldquo;want the kit?&rdquo; ask
                      and re-queue. Then approve.
                    </li>
                    <li className={styles.step}>
                      <strong>Wave 3 (Day 13) — final 9.</strong> Same pattern. Don&rsquo;t blast
                      all 25 in an hour; you want time to react.
                    </li>
                  </ol>
                  <div className={`${styles.callout} ${styles.note}`}>
                    <div className={styles.calloutTitle}>What the tower does for you</div>
                    <p>
                      Each approve writes <code>approved_by</code> and{" "}
                      <code>approved_at</code> automatically. Courier sends within 5 minutes,
                      logs to <code>partner_sent_log</code>, and the unique idempotency_key
                      index hard-blocks double sends. You never see this — you click
                      Send, the row moves to <em>recent sends</em> on the Board.
                    </p>
                  </div>
                </div>

                {/* Days 14-15 — work replies */}
                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 14–15 — Work the replies (sentinel surfaces them)
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.auto}`}>AUTO</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Sentinel watches affiliates@.</strong> When a reply lands, it
                      classifies. Bright signals (interest language) get a real-time email ping{" "}
                      <em>and</em> appear on the tower&rsquo;s Decisions board.
                    </li>
                    <li className={styles.step}>
                      <strong>For each bright signal in the tower:</strong> read the summary,
                      click into the message (the alert email also contains a short excerpt).
                      Reply <strong>same day</strong> from your AESDR address — a warm reply
                      that waits 48h cools.
                    </li>
                    <li className={styles.step}>
                      <strong>The booking link is live:</strong>{" "}
                      <span className="where">calendar.app.google/wFRpSWG2ehvNhgd4A</span>{" "}
                      — Google Calendar Appointment Schedule on <code>hello@aesdr.com</code>,
                      15-min &ldquo;AESDR partner intro,&rdquo; checks{" "}
                      <code>antaeus.coe@gmail.com</code> + <code>mrcoe7@gmail.com</code>{" "}
                      for conflicts. Drop it in every yes-reply.
                    </li>
                    <li className={styles.step}>
                      <strong>When you&rsquo;ve replied, click <span className="ui">Mark handled</span></strong>{" "}
                      on the tower card. The signal leaves the Decisions board.
                    </li>
                    <li className={styles.step}>
                      <strong>Soft signals</strong> (unsubscribes, polite no, auto-replies) go
                      straight to the read-only Board feed — no action required.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    every bright signal is replied-to within 24h and marked handled in the tower.
                  </div>
                </div>
              </div>
            </div>

            {/* ── WEEK 4 ── */}
            <div className={styles.week}>
              <div className={styles.weekHead}>
                <span className={styles.weekTag}>Week 4 · Days 16–22</span>
                <span className={styles.weekTitle}>First conversations + the attribution call.</span>
              </div>
              <div className={styles.weekIntro}>
                Real candidates on calendar holds. You make the attribution-platform
                decision the JD put on your desk by Day 30.
              </div>
              <div className={styles.weekBody}>

                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 16–19 — Run partner intro calls (target: 8–10)
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Send the Pre-Call Bundle 24–48h before each call:</strong> the
                      audience-sized 1-pager + founder Loom + course preview + kit + transparency
                      page. The bundle does the convincing so the call is a fit-check, not a pitch.
                      (Bundle assets live in <code>content/partnerships/precall/</code>.)
                    </li>
                    <li className={styles.step}>
                      <strong>Use the verbatim script</strong> in the legacy doc&rsquo;s{" "}
                      <em>Pre-Call Bundle</em> section: 0:00 open → 1:00 mechanics → 3:00
                      why it&rsquo;s easy → 4:00 the gate → 6:00 hand over → 13:00 binary close.
                    </li>
                    <li className={styles.step}>
                      <strong>2 minutes before each call:</strong> reopen the candidate&rsquo;s
                      Dossier brief and the one specific piece you referenced in outreach,
                      so the 0:00 open names a real thing they made.
                    </li>
                    <li className={styles.step}>
                      <strong>Hit the four beats:</strong> (1) why you reached out to THEM
                      specifically, (2) mechanics — 40% / 30-day window / tracked link + kit,
                      (3) brand-fit gate as audience-trust protection, (4) their questions —
                      this is most of the call.
                    </li>
                    <li className={styles.step}>
                      <strong>Close on the binary</strong> at 13:00: &ldquo;I send the kit
                      today and we talk again [day], OR I set your link up this week — which
                      is easier?&rdquo; Never end on &ldquo;let me think.&rdquo;
                    </li>
                    <li className={styles.step}>
                      <strong>Log immediately after:</strong> dispatch ledger to set
                      <code>partner_pipeline</code> status to <code>negotiating</code> (yes/maybe)
                      or <code>passed</code> (no) for that candidate.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    8–10 calls are done and each candidate is moved to negotiating or passed.
                  </div>
                </div>

                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 20–22 — Make the attribution-platform call + write the memo
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.day}`}>JD milestone</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>You now know your real numbers</strong> — ~25 contacted,
                      ~8–10 in conversation, a sense of payout cadence and how much
                      partner-facing polish matters. Decide.
                    </li>
                    <li className={styles.step}>
                      <strong>The default for AESDR&rsquo;s stage:</strong> extend the custom
                      Supabase+Stripe system for the first ~25 partners ($0), adopt{" "}
                      <strong>Rewardful at $49/mo</strong> when partner self-serve dashboards
                      become the bottleneck.
                    </li>
                    <li className={styles.step}>
                      <strong>Write the memo:</strong> open Terminal in the repo,{" "}
                      <code>touch docs/partnerships/attribution-decision.md</code>, fill one page —
                      what you chose, the three gaps it closes, the exact trigger condition that
                      flips you to Rewardful, cost both ways.
                    </li>
                    <li className={styles.step}>
                      <strong>Send it to the founder</strong> by email (don&rsquo;t just commit
                      it). This is a founder-aligned strategic call.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    the memo is sent and the choice is implemented (the affiliate cron is already
                    scheduled — that&rsquo;s the only plumbing).
                  </div>
                </div>
              </div>
            </div>

            {/* ── WEEK 4½ — close phase 30 ── */}
            <div className={styles.week}>
              <div className={styles.weekHead}>
                <span className={styles.weekTag}>Week 4½ · Days 23–30</span>
                <span className={styles.weekTitle}>Close the phase. Hit the milestone.</span>
              </div>
              <div className={styles.weekIntro}>
                Convert verbal yeses into tracked affiliates and lock the four
                Phase-30 milestones.
              </div>
              <div className={styles.weekBody}>

                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 23–27 — Onboard the first 3–5 affiliates (the gate begins)
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                      <span className={`${styles.tag} ${styles.tower}`}>TOWER</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Create each affiliate in the browser:</strong>{" "}
                      <span className="where">aesdr.com/admin/affiliates/new</span> → fill
                      display name, email, archetype (from their Dossier brief), tier{" "}
                      <strong>developing</strong> → <span className="ui">Create</span>. This
                      mints the slug, writes the row, fires the onboarding email automatically.
                    </li>
                    <li className={styles.step}>
                      <strong>Flip status to active:</strong> click into the new affiliate at{" "}
                      <span className="where">/admin/affiliates/[slug]</span> → status{" "}
                      <code>vetting</code> → <code>active</code>. Confirm{" "}
                      <code>commission_pct=40</code>, <code>attribution_window_days=30</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Send them two links</strong> in one email from your AESDR
                      address: their kit access at <span className="where">/affiliates/kit-private</span>{" "}
                      and the playbook for their archetype at{" "}
                      <span className="where">/affiliates/dashboard/playbooks</span>.
                    </li>
                    <li className={styles.step}>
                      <strong>Review their first copy in <span className="where">/admin/affiliates/queue</span></strong>{" "}
                      as it lands. Dispatch warden:{" "}
                      <code>use the warden subagent on this submission: [paste]</code> →
                      APPROVE / EDITS / DECLINE. First-timers get EDITS with line rewrites,
                      never DECLINE — you&rsquo;re teaching the voice.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    3–5 affiliates read <code>active</code>, kit links sent, first copy in review.
                  </div>
                </div>

                <div className={styles.task}>
                  <div className={styles.taskHead}>
                    <strong className={styles.taskTitle}>
                      Days 28–30 — Phase-30 review + the founder memo
                    </strong>
                    <div className={styles.taskTags}>
                      <span className={`${styles.tag} ${styles.you}`}>YOU</span>
                    </div>
                  </div>
                  <ol className={styles.steps}>
                    <li className={styles.step}>
                      <strong>Dispatch ledger first</strong> for the clean metrics pull:{" "}
                      {/* eslint-disable-next-line no-restricted-syntax -- agent slug, not bookkeeping metaphor */}
                      <code>use the ledger subagent: return candidates, contacted, in-conversation, active affiliates, attributions_total for phase-30 review</code>.
                    </li>
                    <li className={styles.step}>
                      <strong>Check the four milestones against real artifacts:</strong>
                      ✅ discovery documented → <code>docs/partnerships/discovery-doctrine.md</code> exists;
                      ✅ 25 candidates → <code>partner_pipeline</code> count ≥25;
                      ✅ outreach started → tower&rsquo;s &ldquo;recent sends&rdquo; show wave 1–3;
                      ✅ platform chosen → <code>docs/partnerships/attribution-decision.md</code> sent.
                    </li>
                    <li className={styles.step}>
                      <strong>Dispatch almanac for the memo:</strong>{" "}
                      <code>use the almanac subagent: draft the 30-day founder memo from ledger&apos;s pull. Numbers vs milestones, what converted, what didn&apos;t, the one change for Phase 60. 8 lines, not a report.</code>
                    </li>
                    <li className={styles.step}>
                      <strong>Send it to the founder.</strong> Email or the standing Friday channel.
                    </li>
                  </ol>
                  <div className={styles.doneBar}>
                    <span className={styles.doneTag}>Done when</span>
                    the 30-day memo is sent with all four milestones evidenced.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════ PHASE 60 — STUB ════ */}
          <section id="phase-60" className={styles.section}>
            <p className={styles.secEyebrow}>Phase 60 · Activation &amp; channel</p>
            <h2 className={styles.secTitle}>From signed to selling. Turn the channel on.</h2>
            <div className={styles.stubBlock}>
              <h3>Rebuild in progress</h3>
              <p>
                Phase 60 (Weeks 5–8 — copy gate, first attributed dollars, channel
                launch, weekly reporting, first payout) is being rewritten through
                the same tower-era pattern. Until then, the legacy click-by-click
                lives at the original doc.
              </p>
              <p>
                <a href="/partnerships-os" style={{ color: "#8B1A1A", textDecoration: "underline" }}>
                  Open the legacy Partnerships OS — Phase 60 sections
                </a>
              </p>
              <p style={{ marginTop: 12, fontStyle: "italic", color: "#6B6B6B" }}>
                Next pass through here: usher&rsquo;s workshop lifecycle becomes the
                spine of Week 5–6 instead of a footnote; the first payout
                dry-run runs through a future <em>Payouts</em> tab in the cockpit
                instead of psql; sentinel + courier replace every manual
                send/log step.
              </p>
            </div>
          </section>

          {/* ════ PHASE 90 — STUB ════ */}
          <section id="phase-90" className={styles.section}>
            <p className={styles.secEyebrow}>Phase 90 · Proof</p>
            <h2 className={styles.secTitle}>Compound on what converts. Hand the founder a running machine.</h2>
            <div className={styles.stubBlock}>
              <h3>Rebuild in progress</h3>
              <p>
                Phase 90 (Weeks 9–13 — overinvest in the top 3, push the channel
                deal to signature, codify the operating cadence, hit the $3k/mo
                trajectory, deliver the 90-day proof) is being rewritten next.
              </p>
              <p>
                <a href="/partnerships-os" style={{ color: "#8B1A1A", textDecoration: "underline" }}>
                  Open the legacy Partnerships OS — Phase 90 sections
                </a>
              </p>
              <p style={{ marginTop: 12, fontStyle: "italic", color: "#6B6B6B" }}>
                Next pass through here: the &ldquo;codify the operating cadence&rdquo;
                deliverable in Week 10–11 becomes mostly &ldquo;point the founder at
                the tower&rdquo; — the tower IS the cadence, codified.
              </p>
            </div>
          </section>

          {/* ════ AGENT ROSTER ════ */}
          <section id="agents" className={styles.section}>
            <p className={styles.secEyebrow}>Agent roster</p>
            <h2 className={styles.secTitle}>Who does what, on what cadence.</h2>
            <p className={styles.secLede}>
              Four agents are <strong>autonomous crons</strong> — they run on a clock and
              fill the tower. Six are <strong>chat-invoked subagents</strong> — you dispatch
              them in Claude Code when judgment is needed.
            </p>
            <div className={styles.stubBlock}>
              <h3>Rebuild in progress</h3>
              <p>
                The full agent roster cards (with each dispatch line, what they
                read, what they write, when to call them) are being moved here
                from the legacy doc with each agent re-grounded against its live
                spec in <code>.claude/agents/</code>.
              </p>
              <p>
                <a href="/partnerships-os#sec-agents" style={{ color: "#8B1A1A", textDecoration: "underline" }}>
                  Open the legacy Agent Roster section
                </a>
              </p>
            </div>
          </section>

          {/* ════ RESOURCES ════ */}
          <section id="resources" className={styles.section}>
            <p className={styles.secEyebrow}>Resources</p>
            <h2 className={styles.secTitle}>Where the partners live (no LinkedIn).</h2>
            <div className={styles.stubBlock}>
              <h3>Rebuild in progress</h3>
              <p>
                The Resource Vault — communities, voices, discovery tools,
                explicitly avoid — moves here unchanged from the legacy doc.
              </p>
              <p>
                <a href="/partnerships-os#sec-resources" style={{ color: "#8B1A1A", textDecoration: "underline" }}>
                  Open the legacy Resource Vault
                </a>
              </p>
            </div>
          </section>

          {/* ════ ATTRIBUTION MATRIX ════ */}
          <section id="attribution" className={styles.section}>
            <p className={styles.secEyebrow}>Attribution decision</p>
            <h2 className={styles.secTitle}>Four contenders, verified May 2026.</h2>
            <div className={styles.stubBlock}>
              <h3>Rebuild in progress</h3>
              <p>
                The four-column matrix (Custom / Rewardful / PartnerStack /
                Impact), the &ldquo;honest default&rdquo; callout, and the trigger
                condition for flipping to Rewardful move here unchanged.
              </p>
              <p>
                <a href="/partnerships-os#sec-attribution" style={{ color: "#8B1A1A", textDecoration: "underline" }}>
                  Open the legacy Attribution Matrix
                </a>
              </p>
            </div>
          </section>

          <div className={styles.irisBar} style={{ marginTop: 60 }} />
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: "#6B6B6B",
            marginTop: 12,
            textAlign: "center",
          }}>
            Director · The First 90 · embedded in the AESDR Control Tower
          </p>
        </main>
      </div>
    </div>
  );
}
