# Language-patch supplement to the consumer brand-voice canon

> **Status:** Supplement to `2026-05-19-consumer-brand-voice-canon.md`.
> Adds eight rules (R-G1 through R-G8), an expanded blocklist, and an
> AI-tell hygiene section. Read the base canon first; this supplement
> extends it.
> **Owner:** Antaeus Coe.
> **Trigger:** founder direction 2026-05-19. Specific patterns flagged
> as off-canon: single-word abstract nouns asked to carry meaning
> ("the move," "the wedge," "the verdict," "the ledger," "account
> heat," "pressure"), sentences trailing into pronouns the reader has
> to back-reference, three-short-sentences-in-a-row AI cadence,
> manufactured startup-speak ("decision-grade proof"), and literary
> verbs ("showed", "demonstrated") that dress up a noun without
> adding meaning.
> **Last revised:** 2026-05-19 (v2 — rewritten after every example in
> v1 violated its own rule).

This supplement names the rules I want enforced on every surface and
every lesson. The examples below are the bar. If a future canon
update introduces an example that's vaguer than what's here, the
update fails.

---

## R-G1 · Single-word abstract nouns can't carry a concept on their own

A noun like *the move*, *the wedge*, *the verdict*, *the ledger* asks
the reader to decode what it means. The author saves three words; the
reader pays them back with interest. Cut it.

### Don't write
- "That's the move."
- "Build the wedge."
- "Account heat is what to focus on this week."
- "Run the play."
- "That's the unlock."

Each one assumes the reader already knows the concept, which is the
opposite of what the sentence is supposed to do.

### Write instead
- "That's the email you'd send your VP at 8am Monday before she opens her dashboard."
- "Pick Lesson 3 — the one on managing your manager — and start there. Lesson 1 is useful, but Lesson 3 changes how you walk into Tuesday's 1:1."
- "Spend Thursday afternoon on the four accounts where your champion would lose her job if the deal didn't close this quarter. Those are the accounts that wait for nobody."
- "Send your prospect the screenshot of your last quarter's commit-to-close ratio. Then ask her if her CFO has seen anything that clean."

Each replacement names the time, the person, the artifact, or the
specific situation. The reader doesn't have to decode anything; the
sentence does the work.

### What stays allowed
Named tools from the curriculum (*The 30% Rule*, *The Friday five-line*,
*The Manager Archetype Map*, *The 72-Hour Strike Plan*) are not abstract
nouns. They are proper nouns referring to specific artefacts in the
course. R-G1 governs concept-by-shorthand, not named-things.

### Test
If a single-word noun in the sentence is doing conceptual work, ask:
"would a second-year SDR, two beers in on a Friday, name this thing
this way?" If no, name it the way they would.

---

## R-G2 · No sentence ends on a pronoun the reader has to back-reference

When a sentence ends on "it," "this," "that," "them," "the rest," "the
other thing," or "and so on," the reader has to scroll up the page to
figure out what those words point to. The author has handed the
decoding job to the reader. Take it back.

### Don't write
- "Build a proof you can carry into the room without losing it."
- "Hit the number and the rest sorts itself out."
- "Get it on the page."
- "Bring the math and they'll come around."
- "It's a lot, but it works."

### Write instead
- "Build a single-page pipeline math sheet your CFO doesn't argue with."
- "Hit eighty percent of quota in Q2 and your comp conversation in Q3 stops being a negotiation."
- "Put the next step, the dollar amount, and the close date on one page in your CRM. Nothing else."
- "Bring the pipeline math to your QBR; the math is the part your VP reads first and forwards second."
- "Three lessons in a week is too much. One lesson in a week, the same window every Tuesday, gets you done in twelve weeks."

Each ending is a concrete noun, a specific time, or a named role.
Nothing trails.

### The hard cases
Sometimes "it" or "this" reads fine because the noun was named two
words earlier in the same clause. That's not what R-G2 bans. R-G2
bans the sentence ending on a pronoun whose referent is far enough
back that the reader has to look for it.

Pass: "She read the lesson and printed it."
Fail: "She read the lesson — and after a week of thinking about what
her manager would say, and what her AE would think, and where her
quota number landed last month, she printed it."

### Test
Re-read the last three words of every sentence in the paragraph. If
any of those three words is a pronoun or a vague qualifier, rewrite.

---

## R-G3 · Three short declarative sentences in a row reads as AI cadence

Subject, verb, period. Subject, verb, period. Subject, verb, period.
The pattern feels punchy on first read and hollow on second. It is
the most recognisable signature of auto-generated marketing prose.

### Don't write
- "Signals are time-limited. Heat ranks them. Motion comes from the account ledger — not from research piling up."
- "Pipeline is math. Math is honest. Honesty wins."
- "We don't sell software. We sell craft. The craft is teachable."

### Write instead
Mix sentence lengths in the paragraph. One long sentence followed by
one short one is the AESDR pattern. Not three short ones stacked.

- "Most of the accounts in your pipeline this Tuesday won't matter in
  three weeks; they age out faster than your research keeps up. The
  ones worth a Thursday-afternoon hour are the ones a competitor would
  close while you're still pulling Apollo data."

The long sentence carries the argument. The short sentence lands it.
Together they read as one human's voice, not a generator's three-
beat cadence.

### Test
Count consecutive sentences under eight words. Three in a row anywhere
in the paragraph means rewrite the paragraph. Mix in a longer sentence or cut
one of the three.

---

## R-G4 · The manufactured-concept blocklist

Terms that have leaked from internal strategy docs into buyer-facing
copy. Each one reads as startup-speak to a reader who hasn't sat in
the strategy meeting. Banned outright. ESLint rule will flag these in
JSX strings.

### Hard ban (ESLint-enforced)

These terms are not allowed in any buyer-facing surface. The ESLint
rule flags them on every commit.

| Banned | Why it fails |
|---|---|
| *decision-grade* (anything) | Saying the proof is decision-grade is a way of saying the proof is good without showing it. |
| *the wedge* / *our wedge* | The reader doesn't know what's being wedged into what. |
| *the verdict* | Sounds like a courtroom; we're not in court. |
| *the move* / *that's the move* | The reader needs the move, not the announcement that there is one. |
| *the ledger* | A double-entry bookkeeping metaphor for "the spreadsheet." Use *the spreadsheet*. |
| *account heat* | An NBA term retrofitted to sales. Say which accounts. |
| *pressure* (as standalone noun) | Pressure of what kind, on whom, from where? Say it. |
| *the operating system* / *our OS* | A 2018 startup-pitch trope. The reader has an operating system already; it's called Tuesday morning. |
| *surface area* | Geometry doesn't help. Say which surface, which area. |
| *step-change* | A real shift in something specific. Name the shift. |
| *table stakes* | The thing every serious buyer expects. Say what every serious buyer expects. |
| *unlock* (as verb in business prose) | A door metaphor for "make possible." Say what's now possible. |
| *level up* / *level-up* | Motivational register. Say the specific skill. |
| *crush* (already banned base canon) | Repeated here. |
| *masterclass* | Course or lesson. |
| *reimagine* / *reinvent* / *transform* (as marketing verbs) | The thing being reimagined is what to write about. |
| *flywheel* (unless naming Jim Collins or Bezos) | Otherwise the metaphor is a tell. |
| *moat* (unless naming Buffett) | Same. |
| *leverage* (as a verb in business contexts) | A weightlifting metaphor for *use*. Use *use*. |
| *scale* (as a verb in marketing contexts) | "Scaling X" usually means "doing more X." Say what's being done. |
| *synergy* / *synergistic* | Parody-level corporate. The collaboration is what's interesting; describe it. |
| *ecosystem* | Biology metaphor for "set of products." Name the products. |
| *best practices* | Whose best, by what measure? Name the practice. |
| *thought leadership* | Conference-speak. Either the thinking leads to action, or it doesn't; say which. |
| *value-add* | A hyphenated noun for "useful." Use *useful*. |
| *deep dive* | Diving metaphor for "long meeting." Say what's being covered. |
| *circle back* | Geometry metaphor for "talk again." Say when. |
| *low-hanging fruit* | Picking metaphor for "easy task." Say what's easy. |

### Soft ban (canon-only, requires human judgment)

These terms have legitimate uses in some contexts and shouldn't fire
the ESLint rule on every match. PR review still flags them; the
reviewer decides if the use is defensible.

| Soft-banned | When it's defensible |
|---|---|
| *playbook* | When naming a specific named playbook in the curriculum (*The Friday five-line*, *The AE/SDR Alignment Contract*). Generic "our playbook" still fails. |
| *north star* | When citing a specific company that's used the phrase about itself (rare). Defaults to fail. |
| *source of truth* | When the sentence is naming a specific database or system as the canonical record. Defaults to fail. |

### Test
If a draft contains any hard-banned term, the sentence is not
finished. Replace the term with what it stands for, or rewrite the
sentence to not need it. Soft-banned terms get a sentence in the PR
description defending the use.

---

## R-G5 · Read every sentence over twelve words out loud before shipping

If reading the sentence aloud makes the reader stumble — an awkward
consonant run, a nested clause that needs re-parsing, a pronoun whose
antecedent is three commas back — the sentence is broken.

### Pass
"Five days since you were last in the course. Probably nothing —
week got loud, board prep, a deal slipped, normal stuff."

Long sentence followed by a short list of real things. Reads aloud
cleanly.

### Fail
"Pipeline coverage that decision-grade math validates as defensible
is the metric on which the conversation pivots."

Five abstract nouns, two passive clauses, no anchors. Try saying it.

### Test
Stumble once on a sentence: rewrite the sentence. Stumble twice in a
paragraph: rewrite the paragraph.

---

## R-G6 · Would a second-year SDR say this at a bar on a Friday, sober?

The bar test fails when:
- The sentence needs a glossary.
- The sentence is doing more impressing than informing.
- The cadence sounds workshopped — three-part list followed by a punchy line.
- The sentence ends on *and so on*, *etc.*, *across the board*, or any other phrase the reader has to fill in.
- The vocabulary is deck-vocabulary: *leverage* (verb), *operationalize*, *step-change*, *flywheel*.

The bar test passes when:
- The sentence is in operator-vocabulary: *number*, *quota*, *forecast*, *comp plan*, *bad month*, *Slack*, *Salesforce*, *CFO*.
- The sentence has the small frictions a person speaking has — a parenthetical aside, a self-correction, an occasional mild profanity (in surface-appropriate places only — emails to customers, no; founder-voice in /about, yes if it earns it).
- A friend outside of sales would still follow the meaning without being lost.

### Fail
"Operationalising your discovery motion is table stakes for any AE at scale."

### Pass
"By month four your discovery calls should sound less like you reading
from a script and more like you and your prospect figuring something
out together. If that hasn't happened, Lesson 6 is where I'd start."

---

## R-G7 · AI-tell hygiene

The constructions below read as auto-generated. Every one of them
adds zero meaning to the sentence and signals to the reader that
the prose was written without care or by a model.

### Phrase-level bans
- *Let me explain*
- *Here's the thing*
- *In essence* / *At its core* / *Fundamentally* / *Ultimately*
- *It's worth noting that*
- *That said,* / *That being said,*
- *Moreover* / *Furthermore* / *Additionally* (in body prose; fine in
  formal procurement / legal writing)
- *Welcome to the future of*
- *Reimagine X*
- *X, but better*
- *We don't just X — we Y*
- *It's not about X. It's about Y.* (as a paragraph opener)
- *X is the new Y*
- *Today, more than ever,*

### Structural bans
- Three-part rhetorical lists where each item is one word ("Faster.
  Smarter. Better.") — instant tell.
- Em-dash overuse: more than two em-dashes per paragraph violates the
  base canon's punctuation rule. (One per paragraph is the AESDR
  sweet spot.)
- "First of all... Second... Finally..." in body prose.
- Closing a paragraph by restating the paragraph's thesis in a single
  sentence ("That's why X.").
- Opening a paragraph with "Imagine X."
- Bullet lists where every item is a complete sentence ending in a
  period — pure AI cadence. Mix fragment-bullets and sentence-bullets
  in the same list.

### Test
Paste the paragraph into a private ChatGPT window and ask it to
generate prose like it. If the model produces something that reads
close to your draft on the first try, your draft is too close to the
generator.

---

## R-G8 · Prefer the plain noun over the literary verb

When a noun already names the thing, don't dress it up with a verb
that abstracts it.

### Don't write
- "The Q3 data showed weakness in mid-stage pipeline."
- "His career demonstrated a pattern of ducking difficult accounts."
- "The lesson reveals what good actually looks like."
- "Her last quarter exhibited declining win rates."
- "The framework illustrates the difference between coaching and counting."

The verbs *showed*, *demonstrated*, *revealed*, *exhibited*,
*illustrated* are doing nothing the noun couldn't do on its own.
They buy time and dilute meaning.

### Write instead
- "Mid-stage pipeline was weak in Q3 — coverage at 2.4x against a
  target of 3.5x."
- "He ducked the difficult accounts every quarter for three years. His
  pipeline got cleaner; his quota got harder."
- "Lesson 4 names what good actually looks like, on a Wednesday, in a
  1:1 your manager isn't paying attention to."
- "Her win rate dropped from 34% to 22% across the last four quarters."
- "Some managers coach; others count. Lesson 4 sorts which kind you
  have."

### The verbs to watch
*Showed, demonstrated, revealed, exhibited, illustrated, indicated,
suggested, conveyed, evidenced, manifested, expressed, communicated*
(in the abstract sense).

### Test
If the sentence contains one of those verbs, ask: "could the noun
do the work directly?" If yes, cut the verb.

---

## Expanded substitution table

Extends §4 of the base canon. Concrete replacements for the
manufactured concepts in R-G4. Each replacement names a real thing —
a tool, a time, a person, an artifact — rather than another
abstraction.

| Don't write | Write instead |
|---|---|
| the wedge | the lesson you'd read aloud to a brand-new SDR in week one |
| the verdict | what I'd do if I were sitting in your seat tomorrow morning |
| the move | name the actual move — the email you'd send, the call you'd take, the slide you'd build |
| the ledger | the spreadsheet / the CRM / the line in Salesforce |
| account heat | which accounts would lose value this Thursday if you waited until next Thursday |
| pressure (noun) | what's loud this week / what's about to break / what your VP is going to ask about on Friday |
| operating system | (avoid; name the behaviour) |
| surface area | which surface, which area — name them |
| source of truth | the spreadsheet your manager keeps open / the line in Salesforce |
| north star | the thing we'd shut down the company to protect |
| table stakes | what every serious buyer expects to see in the first ten minutes |
| unlock (verb) | open up / make possible / make available |
| level up | get better at the specific skill — name it |
| step-change | a real shift in [the specific thing] |
| reimagine | rebuild / re-think (use only in internal docs, never in marketing) |
| crush quota | hit number / exceed quota / clear quota |
| masterclass | course / lesson / training |
| best-in-class | (delete the phrase; describe what's good about it) |
| decision-grade proof | the math your CFO signs off on / the slide your VP forwards without rewriting |
| leverage (verb) | use / draw on / put to work |
| scale (verb, marketing) | grow / expand / do more of [name the activity] |
| synergy / synergistic | (delete; name what the collaboration produces) |
| ecosystem | the set of [products / vendors / partners] — name them |
| best practices | what worked at [specific company / specific situation] |
| thought leadership | writing / talks / podcasts / the specific output |
| value-add | useful / helpful / worth paying for |
| deep dive | the long meeting / the detailed review / the workshop |
| circle back | follow up on Tuesday / talk again Friday / send a note |
| low-hanging fruit | the easy fix — name it (the spelling error, the broken link, the missing CTA) |

---

## Updated quick tests (extends §9 of base canon)

Run these eight checks before shipping any consumer or curriculum
string:

1. **Wrote *rep*?** Replace with AE / SDR.
2. **Wrote *crush*, *unleash*, *world-class*, *best-in-class*,
   *revolutionary*?** Rewrite.
3. **Numerical claim without a citation?** Add the citation or cut
   the number.
4. **Could this sentence appear on three other SaaS sales courses?**
   Rewrite to be specific.
5. **Buried out-clause anywhere?** Surface it explicitly.
6. **Used a manufactured concept from R-G4?** Replace with what it
   stands for.
7. **Paragraph failed the read-aloud or bar test?** Rewrite.
8. **Used *showed*, *demonstrated*, *revealed* with a noun that
   could do the work?** Cut the verb.

Eight tests. Two minutes. Cheaper than the post-ship rewrite.

---

## Appendix C · Worked example (the paragraph the founder flagged on 2026-05-19)

The founder flagged this paragraph as off-canon:

**Original (fails R-G3, R-G4, R-G1, R-G7).**

> "Signals are time-limited. Heat ranks them. Motion comes from the
> account ledger — not from research piling up."

What's wrong with each sentence:
- *Signals are time-limited.* — "Signals" is doing concept work
  without a referent. Time-limited how? On what clock?
- *Heat ranks them.* — "Heat" is the R-G4 banned NBA-borrowed term.
  Three-word telegraphic sentence stacks the R-G3 violation.
- *Motion comes from the account ledger — not from research piling up.*
  — "Motion" and "ledger" are both gummy. The em-dash is the third
  beat in a three-beat AI cadence.

**Rewrite (passes all eight tests).**

> "Most of the accounts in your pipeline this Tuesday won't matter
> in three weeks; they age out faster than your research keeps up.
> The ones worth a Thursday-afternoon hour are the ones a competitor
> would close while you're still pulling Apollo data on them."

What works:
- Names the day (Tuesday, Thursday).
- Names the time window (three weeks).
- Names a real tool (Apollo).
- Names a real situation (a competitor closing during your research).
- No single-word abstract nouns. No banned terms. No three-beat cadence.
- Reads aloud cleanly. A second-year SDR would say this at a bar.

---

## Appendix D · How this supplement is enforced

See `2026-05-19-plan-to-canon-process.md` for the full lifecycle. In
short:

- ESLint blocklist for the R-G4 manufactured-concept terms in JSX
  strings (mechanical).
- Pre-merge PR checklist referencing R-G1 through R-G8 (taste).
- Quarterly review for new patterns leaking in (cultural).

Until the ESLint rule lands, R-G4 violations get caught by hand in
PR review. The sweep planned in
`2026-05-19-language-patch-master-plan.md` removes the existing
violations from production surfaces.
