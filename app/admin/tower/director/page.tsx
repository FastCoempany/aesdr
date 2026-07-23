import type { Metadata } from "next";
import Link from "next/link";

import { createAdminClient } from "@/utils/supabase/admin";
import { extractEmail, firstTouchIdemKey } from "@/lib/partnerships/outreach-templates";
import { openChannelDoors, runMoneyTest } from "./actions";
import styles from "./hall.module.css";

/**
 * The Director — the hall of doors (founder pick 2026-07-22).
 *
 * The 90-day plan, grossly simplified into one hallway. Every motion is a
 * door: a lit green lamp over a door means the work behind it is finished
 * and you can go look at it; the open doors are the ones to walk through
 * now; dashed doors only open from the other side (other people, or the
 * 30-day money clock).
 *
 * Clickomate canon: every noun on this page carries its object. Numbers are
 * live from the database, buttons fire real actions, lists are the actual
 * lists, and every click-by-click lives one click beneath ("how, exactly"),
 * never on the face of the page. Plain speech throughout — no shorthand.
 */

export const metadata: Metadata = {
  title: "Director · Control Tower | AESDR",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Sp = { ok?: string; err?: string };

export default async function DirectorPage({
  searchParams,
}: {
  searchParams: Promise<Sp>;
}) {
  const sp = await searchParams;
  const supabase = createAdminClient();
  const since = new Date(Date.now() - WEEK_MS).toISOString();

  // Every read is tolerant: a missing table or column turns into a zero or a
  // dash, never a broken hall.
  async function count(fn: () => PromiseLike<{ count: number | null }>): Promise<number> {
    try {
      const { count: c } = await fn();
      return c ?? 0;
    } catch {
      return 0;
    }
  }

  const [
    sentTotal,
    sentWeek,
    deliveredTotal,
    lettersOut,
    replies,
    inboundWeek,
    doorsOpenedAll,
    doorsOpenedWeek,
    activeAffiliates,
    salesWeek,
  ] = await Promise.all([
    count(() => supabase.from("partner_sent_log").select("id", { count: "exact", head: true })),
    count(() => supabase.from("partner_sent_log").select("id", { count: "exact", head: true }).gte("sent_at", since)),
    count(() => supabase.from("partner_sent_log").select("id", { count: "exact", head: true }).eq("delivery_status", "delivered")),
    count(() => supabase.from("partner_pipeline").select("id", { count: "exact", head: true }).eq("status", "contacted")),
    count(() => supabase.from("partner_pipeline").select("id", { count: "exact", head: true }).eq("status", "replied")),
    count(() => supabase.from("partner_inbound_email").select("id", { count: "exact", head: true }).gte("created_at", since)),
    count(() => supabase.from("affiliate_prospect_events").select("id", { count: "exact", head: true }).eq("name", "link_opened")),
    count(() => supabase.from("affiliate_prospect_events").select("id", { count: "exact", head: true }).eq("name", "link_opened").gte("created_at", since)),
    count(() => supabase.from("affiliates").select("id", { count: "exact", head: true }).eq("status", "active")),
    count(() => supabase.from("affiliate_attributions").select("id", { count: "exact", head: true }).gte("created_at", since)),
  ]);

  // Money owed to partners right now (cleared, not yet paid).
  let owedCents = 0;
  try {
    const { data } = await supabase
      .from("affiliate_attributions")
      .select("commission_amount_cents")
      .eq("status", "cleared")
      .is("paid_at", null);
    owedCents = (data ?? []).reduce((s, a) => s + ((a.commission_amount_cents as number) ?? 0), 0);
  } catch {
    /* pre-migration — stays zero */
  }

  // The research door reads the last sweep run — including why it failed.
  type SweepRun = { status: string; phase: string | null; created_at: string };
  let lastRun: SweepRun | null = null;
  try {
    const { data } = await supabase
      .from("scout_sweep_runs")
      .select("status, phase, created_at")
      .order("created_at", { ascending: false })
      .limit(1);
    lastRun = ((data?.[0] as unknown) as SweepRun | undefined) ?? null;
  } catch {
    /* table absent — door stays open with the generic line */
  }
  const researchWorks = lastRun?.status === "done";

  // The money-test door: the test partner's link, and whether money ever
  // actually flowed (any attribution row proves the plumbing, not just ours).
  let testLinkSlug: string | null = null;
  try {
    const { data } = await supabase
      .from("affiliate_links")
      .select("slug")
      .eq("affiliate_slug", "money-test")
      .limit(1);
    testLinkSlug = (data?.[0]?.slug as string) ?? null;
  } catch {
    /* absent */
  }
  const attributionsEver = await count(() =>
    supabase.from("affiliate_attributions").select("id", { count: "exact", head: true }),
  );
  const moneyProven = attributionsEver > 0;

  // The channel door: the ten companies as live cards, with the whole path
  // per company — address found, letter sent, letter delivered.
  type ChRow = {
    id: string;
    name: string;
    contact_path: string | null;
    found_email: string | null;
    status: string;
  };
  let channel: ChRow[] = [];
  try {
    const { data } = await supabase
      .from("partner_pipeline")
      .select("id, name, contact_path, found_email, status")
      .eq("motion", "channel")
      .order("name");
    channel = (data ?? []) as ChRow[];
  } catch {
    /* absent */
  }
  const chKeys = channel.map((c) => firstTouchIdemKey(c.id));
  const chSent = new Map<string, string>(); // idem key -> delivery status ("sent" if none yet)
  if (chKeys.length > 0) {
    try {
      const { data } = await supabase
        .from("partner_sent_log")
        .select("idempotency_key, delivery_status")
        .in("idempotency_key", chKeys);
      for (const r of data ?? []) {
        chSent.set(r.idempotency_key as string, (r.delivery_status as string | null) ?? "sent");
      }
    } catch {
      /* pre-migration — counts stay conservative */
    }
  }
  const chWithAddress = channel.filter((c) => extractEmail(c.contact_path) || c.found_email).length;
  const chSentCount = channel.filter((c) => chSent.has(firstTouchIdemKey(c.id))).length;
  const chDelivered = channel.filter(
    (c) => chSent.get(firstTouchIdemKey(c.id)) === "delivered",
  ).length;
  const channelAllSent = channel.length >= 10 && chSentCount >= channel.length;

  // The money clock: when does the first pending sale clear?
  let clockLine = "No sale yet — the payout clock starts ticking with the first one.";
  try {
    const { data } = await supabase
      .from("affiliate_attributions")
      .select("refund_window_closes_at")
      .eq("status", "pending")
      .order("refund_window_closes_at", { ascending: true })
      .limit(1);
    const at = data?.[0]?.refund_window_closes_at as string | undefined;
    if (at) {
      const d = new Date(at).toLocaleDateString("en-US", { month: "long", day: "numeric" });
      clockLine = `The first sale's money finishes clearing on ${d} — that is the 30-day refund promise doing its job.`;
    } else if (owedCents > 0) {
      clockLine = `Money has cleared and is waiting to be paid — the Payouts block on the warren floor has the button.`;
    }
  } catch {
    /* keep the default line */
  }

  const usd = (cents: number) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
  const lettersLit = sentTotal >= 25;

  return (
    <main className={styles.hall}>
      <header className={styles.head}>
        <div>
          <p className={styles.kick}>The Director · one hallway, every door</p>
          <h1 className={styles.title}>The hall of doors.</h1>
          <p className={styles.lede}>
            A lit lamp over a door means the work behind it is finished — you can go look
            at it. Open doors are yours to walk through now. Dashed doors only open from
            the other side. Every number on this page is live from the database, and every
            &ldquo;how, exactly&rdquo; is one click beneath.
          </p>
        </div>
        <figure className={styles.doorman}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot/leponeus-verdict-sm.png" alt="Leponeus, keeper of the hall" />
          <figcaption>the doorman keeps the hall</figcaption>
        </figure>
      </header>

      {sp.ok === "channel" && (
        <p className={styles.notice}>
          The ten channel doors are open — cards made, letters drafted, address hunts running.
        </p>
      )}
      {sp.ok === "moneytest" && (
        <p className={styles.notice}>The test partner and their tracked link are ready below.</p>
      )}
      {sp.err && <p className={styles.noticeErr}>That press failed: {sp.err}</p>}

      {/* ── finished doors ── */}
      <p className={styles.group}>Finished — it exists, you can go look at it</p>

      <Door lit text="The hunting machine works. One press on the warren floor finds people, studies each one, decides who fits, and writes their card.">
        <How steps={[
          <>Open <Link href="/admin/tower">the warren</Link> and press any of the three search buttons at the top.</>,
          <>The button itself narrates what it is doing, and finished cards land in the band below it.</>,
        ]} />
      </Door>
      <Door lit text="Sending is safe. A letter cannot go out twice, and it will never go to someone who asked us to stop.">
        <How steps={[
          <>Every send re-checks the do-not-contact list at the moment of sending, and writes a permanent receipt before the letter leaves.</>,
          <>The receipts live at <Link href="/admin/tower/sent">the sent record</Link>, each with its delivery stamp.</>,
        ]} />
      </Door>
      <Door lit text="Every letter leads with a private door — a link made for that one person — and we can watch when they walk through it.">
        <How steps={[
          <>The link is minted the moment a letter is drafted; you never make one by hand.</>,
          <>Watch who walked through at <a href="https://www.aesdr.com/x/ops" target="_blank" rel="noopener noreferrer">the visitors desk</a> (password page).</>,
        ]} />
      </Door>
      <Door lit text="The front gate at aesdr.com sells the house instead of hiding it — and takes an address from anyone who wants a letter.">
        <How steps={[
          <>See it as a stranger would: open <a href="https://www.aesdr.com/coming-soon" target="_blank" rel="noopener noreferrer">aesdr.com</a> in a private window.</>,
          <>Addresses people leave land in the same table as the free-download leads, marked as gate visitors.</>,
        ]} />
      </Door>
      <Door lit text="The money plumbing exists end to end — a partner's link remembers who sent the buyer, and their cut is counted by itself.">
        <How steps={[
          <>The proof door below runs the whole path once so you can watch it with your own eyes.</>,
        ]} />
      </Door>

      {/* ── open doors ── */}
      <p className={`${styles.group} ${styles.groupNow}`}>Open doors — each press makes a real thing happen</p>

      <Door
        lit={researchWorks}
        open={!researchWorks}
        text={
          researchWorks
            ? "The research button works again — the last search finished clean."
            : "Fix why the research button failed. The machine now names the exact reason instead of guessing."
        }
      >
        {!researchWorks && lastRun && (
          <p className={styles.liveLine}>
            what the last try said: <b>{lastRun.phase || lastRun.status}</b>
          </p>
        )}
        <p className={styles.go}>
          <Link href="/admin/tower">press a search button and read its note</Link>
          {" · "}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">
            the research account, where the money goes
          </a>
        </p>
        <How steps={[
          <>Open <Link href="/admin/tower">the warren</Link>, press one search button (not all three), and wait for it to finish talking.</>,
          <>If it fails, the reason appears under the button in plain words. Most likely it says the research account is out of money.</>,
          <>Money goes in at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a> → Billing → add credits. Then press the button once more.</>,
        ]} />
      </Door>

      <Door
        lit={lettersLit}
        open={!lettersLit}
        text="Send the first 25 letters — three small batches, a day apart, so the wording can be fixed between batches."
      >
        <p className={styles.liveLine}>
          so far: <b>{sentTotal}</b> sent · <b>{deliveredTotal}</b> delivered ✓
        </p>
        <p className={styles.go}>
          <Link href="/admin/tower">open the reach-out stack</Link>
        </p>
        <How steps={[
          <>Open <Link href="/admin/tower">the warren</Link> and click the stack called <b>reach out</b>.</>,
          <>Open the first card. The letter is already written — read it once, change any sentence right there if it reads wrong.</>,
          <>Press the round button. It asks once if you are sure, then sends and shows the receipt.</>,
          <>A card with no email address: paste one in if you have it, or copy the letter, deliver it where they live, and press mark-sent.</>,
          <>About eight today, eight tomorrow, nine the day after.</>,
        ]} />
      </Door>

      <Door
        lit={moneyProven}
        open={!moneyProven}
        text={
          moneyProven
            ? "Proven: a sale pays a partner. The money table has real rows in it."
            : "Prove a sale pays a partner: click the test link, buy, and this lamp lights by itself when the money row appears."
        }
      >
        {testLinkSlug ? (
          <>
            <p className={styles.liveLine}>
              your test link: <b>https://www.aesdr.com/r/{testLinkSlug}</b>
            </p>
            <p className={styles.pay}>
              1. open that link in a private window · 2. buy the course · 3. this door lights
              itself. Card: if the shop is in test mode use 4242 4242 4242 4242, any future
              date, any 3 digits. If it is live, buy for real and refund yourself after —
              the same promise partners get.
            </p>
          </>
        ) : (
          <form action={runMoneyTest}>
            <button type="submit" className={styles.pressBtn}>
              Make the test partner and their tracked link
            </button>
          </form>
        )}
        <p className={styles.go}>
          <Link href="/admin/affiliates">watch the money table</Link>
        </p>
        <How steps={[
          <>The press creates a partner named &ldquo;The Money Test&rdquo; and mints them a tracked link — nothing else, no emails go anywhere.</>,
          <>When you buy through the link, the shop writes a money row for that partner with a 30-day clearing date.</>,
          <>This page checks for that row on every load; the lamp lights the moment it exists.</>,
        ]} />
      </Door>

      <Door
        lit={channelAllSent}
        open={!channelAllSent}
        text={
          channel.length === 0
            ? "Open the ten channel-company doors — cards made, letters drafted, and the machine hunts each company's right person so you never research an inbox."
            : "The ten channel companies — every one is a room with its letter drafted; press each room's send button as its address lands."
        }
      >
        {channel.length === 0 ? (
          <form action={openChannelDoors}>
            <button type="submit" className={styles.pressBtn}>
              Open the ten doors
            </button>
          </form>
        ) : (
          <>
            <p className={styles.liveLine}>
              <b>{channel.length}</b> companies · <b>{chWithAddress}</b> addresses found ·{" "}
              <b>{chSentCount}</b> sent · <b>{chDelivered}</b> delivered ✓
            </p>
            <p className={styles.roster}>
              {channel.map((c) => {
                const key = firstTouchIdemKey(c.id);
                const glyph = chSent.get(key) === "delivered"
                  ? " ✓✓"
                  : chSent.has(key)
                    ? " ✓"
                    : extractEmail(c.contact_path) || c.found_email
                      ? " ✉"
                      : " …";
                return (
                  <Link key={c.id} href={`/admin/tower/candidate/${c.id}`}>
                    {c.name}
                    {glyph}
                  </Link>
                );
              })}
            </p>
          </>
        )}
        <How steps={[
          <>The press creates the ten companies as cards (marked channel, kept apart from the affiliates), drafts each opening letter into its room, and starts hunting each company&rsquo;s right inbox.</>,
          <>As addresses land, each room offers use-found-address. Open the room, greet the right person by name, press the round button.</>,
          <>Next to each name: … still hunting · ✉ address found · ✓ sent · ✓✓ delivered.</>,
        ]} />
      </Door>

      {/* ── the window — always current, nothing to set up ── */}
      <p className={styles.group}>The window — the weekly numbers keep themselves fresh</p>
      <div className={styles.windowRow}>
        <span className={styles.nums}>
          last 7 days · <b>{sentWeek}</b> letters out · <b>{doorsOpenedWeek}</b> private doors
          opened · <b>{inboundWeek}</b> replies · <b>{salesWeek}</b> sales through partner
          links · <b>{usd(owedCents)}</b> waiting to be paid
        </span>
      </div>

      {/* ── dashed doors ── */}
      <p className={styles.group}>Doors that open from the other side</p>

      <Door dashed text={`Replies. ${lettersOut} letters are out with people right now, ${replies} conversations are open, and ${doorsOpenedAll} private doors have been walked through all-time. When a reply lands, answer it the same day.`} />
      <Door
        dashed
        text={
          activeAffiliates > 0
            ? `${activeAffiliates} partner${activeAffiliates === 1 ? " is" : "s are"} on the books — their first posts get read together before they go out.`
            : "First partners saying yes — the first yes turns this door on, and their first posts get read together before they go out."
        }
      />
      <Door dashed text={clockLine} />

      <p className={styles.footnote}>
        Everything not in this hallway is either finished plumbing you never have to think
        about, or waiting on other people and the money clock — none of it needs you.
      </p>
    </main>
  );
}

// ── the door row ──
function Door({
  lit,
  open,
  dashed,
  text,
  children,
}: {
  lit?: boolean;
  open?: boolean;
  dashed?: boolean;
  text: string;
  children?: React.ReactNode;
}) {
  const cls = lit
    ? `${styles.door} ${styles.doorLit}`
    : dashed
      ? `${styles.door} ${styles.doorDashed}`
      : open
        ? `${styles.door} ${styles.doorOpen}`
        : styles.door;
  return (
    <div className={styles.row}>
      <span className={cls} aria-hidden="true">
        <i />
      </span>
      <div className={styles.rowBody}>
        <p className={styles.rowText}>{text}</p>
        {children}
      </div>
    </div>
  );
}

function How({ steps }: { steps: React.ReactNode[] }) {
  return (
    <details className={styles.how}>
      <summary>how, exactly</summary>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </details>
  );
}
