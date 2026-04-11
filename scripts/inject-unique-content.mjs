#!/usr/bin/env node
/**
 * Inject unique content into all 36 lesson files:
 * 1. Propagate IIFE v2 from L1U1 prototype (collision-free _getAttest)
 * 2. Replace ATTEST array per file with unique phrases (zero repeats across app)
 * 3. Add conscience: property to every homework gate
 * 4. Replace sidebar conscience text with lesson-specific text
 * 5. Fix old time-slot references in SCHED arrays
 * 6. Update IIFE fallback conscience text
 *
 * Run: node scripts/inject-unique-content.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content/lessons/html');
const PROTOTYPE = path.join(ROOT, 'lesson-01', 'aesdr_course01_v1.html');

// ─── STEP 1: Extract IIFE from prototype ───
const protoHTML = fs.readFileSync(PROTOTYPE, 'utf-8');
const iifeStartMarker = '/*  AESDR Accountability Gates v2';
const iifeEndMarker = '})(window.AESDR);';
const iifeStart = protoHTML.indexOf(iifeStartMarker);
const iifeEnd = protoHTML.indexOf(iifeEndMarker, iifeStart) + iifeEndMarker.length;
if (iifeStart === -1 || iifeEnd === -1) { console.error('IIFE not found in prototype'); process.exit(1); }
const NEW_IIFE = protoHTML.substring(iifeStart, iifeEnd);

// ─── STEP 2: Generate 540+ unique attestation phrases ───
// All phrases follow "[prefix] because [reason]" — the "because " split drives iris shimmer
const PREFIXES = [
  "I did this",
  "I completed this",
  "I wrote this",
  "I showed up for this",
  "I pushed through this",
  "I committed to this",
  "I dug into this",
  "I faced this head on",
  "I told the truth here",
  "I took this seriously",
  "I went deep on this",
  "I stayed honest here",
  "I owned this moment",
  "I invested in this",
  "I put real thought into this",
  "I challenged myself here",
  "I refused to fake this",
  "I followed through on this",
  "I made this count",
  "I gave this my real attention",
  "I sat with the discomfort of this",
  "I built something real here",
  "I proved something to myself here",
  "I chose substance over shortcuts here",
  "I wrestled with this honestly",
  "I put my name on this",
  "I did the work that matters here",
  "I held myself accountable here",
  "I went all in on this",
  "I didn\u0027t phone this in",
  "I was real with myself here",
  "I earned this checkmark",
  "I put in the effort here",
  "I confronted the hard part here",
  "I kept it real here",
  "I treated this like it matters",
  "I honored the process here",
  "I brought my best here",
  "I leaned into the work here",
  "I respected my own time here",
];

const REASONS = [
  "growth doesn\u0027t happen by accident",
  "what I do when no one checks matters more than what I do when they\u0027re watching",
  "my reputation is built one honest action at a time",
  "shortcuts only cheat the person in the mirror",
  "real professionals do the uncomfortable work first",
  "this is how trust gets built \u2014 one kept promise at a time",
  "excellence isn\u0027t a single act, it\u0027s a habit I\u0027m building right now",
  "saying I care means nothing if I don\u0027t act like it",
  "the difference between good and great is follow-through",
  "I\u0027m investing in the version of me that wins",
  "no one successful ever half-assed the fundamentals",
  "my future self needs me to be honest right now",
  "talking about growth is easy \u2014 doing it is the point",
  "I refuse to be the person who shows up unprepared",
  "accountability starts with what I write when no one reads it",
  "the small moments define who I actually am",
  "I\u0027m building discipline, not just completing a task",
  "the people who make it do the work others skip",
  "being real with myself is the only way forward",
  "I don\u0027t want to be the person who clicks through and learns nothing",
  "my word matters even when it\u0027s just between me and this page",
  "effort compounds \u2014 every honest answer builds on the last",
  "the gap between knowing and doing is exactly this kind of work",
  "I\u0027m not here to perform productivity \u2014 I\u0027m here to actually grow",
  "this is where the real ones separate from the pretenders",
  "integrity is doing the right thing when it\u0027s easier not to",
  "I know the difference between completing a task and actually learning",
  "mediocrity is a choice I\u0027m actively refusing right now",
  "my career is built on what I do in moments like this",
  "I owe it to the people who bet on me to take this seriously",
  "half-effort produces half-results and I\u0027m done with half",
  "the best version of tomorrow starts with what I write today",
  "complacency kills careers faster than failure ever could",
  "I\u0027m choosing to be the person who does the hard thing",
  "this is the work that separates thinkers from doers",
  "I know that consistency is the only real competitive advantage",
];

// Generate all unique phrases by cross-product
const ALL_PHRASES = [];
for (const prefix of PREFIXES) {
  for (const reason of REASONS) {
    ALL_PHRASES.push(prefix + ' because ' + reason);
  }
}
// Deterministic shuffle using seed
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const SHUFFLED = seededShuffle(ALL_PHRASES, 42);
console.log(`Generated ${SHUFFLED.length} unique attest phrases`);

// ─── STEP 3: Conscience texts per lesson (keyed by dir/file pattern) ───
// These appear in two places: (A) sidebar paragraph, (B) homework gate conscience: property
const CONSCIENCE = {
  'lesson-01/aesdr_course01_v1': 'Structure is the difference between surviving and flaming out. Every answer you write here is a promise to the person who hired you that you take Day 1 seriously.',
  'lesson-01/aesdr_course01_2_v1': 'Camaraderie isn\u0027t built by hoping it happens. Every answer here is a concrete step toward earning trust from the people you work with every single day.',
  'lesson-01/aesdr_course01_3_v1': 'Coaching defines whether your SDR thrives or quietly drowns. What you write here is the difference between being a manager and being a leader.',
  'lesson-02/aesdr_course02_1_v1': 'Silos don\u0027t announce themselves \u2014 they silently destroy pipeline. Every answer you write here exposes a gap you can actually fix this week.',
  'lesson-02/aesdr_course02_2_v1': 'Your workspace is either helping you sell or quietly sabotaging you. What you commit to here determines whether your environment works for you or against you.',
  'lesson-02/aesdr_course02_3_v1': 'Ego kills more deals than bad product ever will. Every honest answer here is a step toward the kind of partnership that actually produces revenue.',
  'lesson-03/aesdr_course03_1_v1': 'Performance pitfalls don\u0027t fix themselves \u2014 they compound. What you identify here is the first step to breaking a pattern before it breaks your pipeline.',
  'lesson-03/aesdr_course03_2_v1': 'Survival in SaaS sales isn\u0027t dramatic \u2014 it\u0027s daily. Every answer here builds the habits that keep you off the layoff list.',
  'lesson-03/aesdr_course03_3_v1': 'Managing up isn\u0027t optional \u2014 it\u0027s a survival skill. What you write here determines whether you control your career or let someone else control it for you.',
  'lesson-04/aesdr_course04_1_v1': 'SDR managers can make or break your trajectory. Every answer here is preparation for navigating the politics that nobody warns you about.',
  'lesson-04/aesdr_course04_2_v1': 'Culture isn\u0027t the ping pong table \u2014 it\u0027s how decisions get made when things get hard. What you write here reveals whether you actually understand the environment you\u0027re in.',
  'lesson-04/aesdr_course04_3_v1': 'Async work either sets you free or lets you disappear. Every answer here is a commitment to being visible and valuable without anyone watching over your shoulder.',
  'lesson-05/aesdr_course05_1_v1': 'A playbook is only as good as the person running it. What you write here proves you\u0027re not just reading plays \u2014 you\u0027re internalizing them.',
  'lesson-05/aesdr_course05_2_v1': 'Execution separates SDRs who get promoted from SDRs who get managed out. Every answer here is a rep that builds the muscle memory winners rely on.',
  'lesson-05/aesdr_course05_3_v1': 'Being irreplaceable isn\u0027t about working more hours \u2014 it\u0027s about being the person no one can afford to lose. What you write here defines your value.',
  'lesson-06/aesdr_course06_1_v1': 'The playbook gets you started \u2014 what you do beyond it is what gets you promoted. Every answer here pushes you past the safe and into the strategic.',
  'lesson-06/aesdr_course06_2_v1': 'Networking isn\u0027t collecting LinkedIn connections \u2014 it\u0027s building relationships that open doors you didn\u0027t know existed. Every answer here is a real connection plan.',
  'lesson-06/aesdr_course06_3_v1': 'Knowing just enough to be dangerous is the sweet spot between ignorance and analysis paralysis. What you write here proves you can operate in the gray.',
  'lesson-07/aesdr_course07_1_v1': 'Prospecting isn\u0027t just the SDR\u0027s job \u2014 and pretending it is will cost you pipeline. Every answer here confronts a comfortable lie.',
  'lesson-07/aesdr_course07_2_v1': 'Self-sourced meetings are the only meetings you fully control. What you commit to here determines whether you own your pipeline or rent someone else\u0027s.',
  'lesson-07/aesdr_course07_3_v1': 'The question isn\u0027t whether SaaS is worth it \u2014 it\u0027s whether you\u0027re building the version of yourself that makes it worth it. Every answer here matters.',
  'lesson-08/aesdr_course08_1_v1': 'The 30% Rule exposes the math most salespeople ignore. What you write here forces you to confront reality instead of hiding behind optimism.',
  'lesson-08/aesdr_course08_2_v1': 'Potential is the most expensive lie in sales. Every answer here strips away the story you\u0027ve been telling yourself and replaces it with what\u0027s actually happening.',
  'lesson-08/aesdr_course08_3_v1': 'The hardest question in sales is whether you\u0027re the problem. What you write here requires a level of honesty most people avoid their entire career.',
  'lesson-09/aesdr_course09_1_v1': 'Salesforce isn\u0027t the enemy \u2014 your relationship with it is. Every answer here builds the CRM discipline that separates professionals from amateurs.',
  'lesson-09/aesdr_course09_2_v1': 'Slack can be your greatest tool or your biggest distraction. What you commit to here determines which side you land on.',
  'lesson-09/aesdr_course09_3_v1': 'Tools don\u0027t close deals \u2014 people who master their tools do. Every answer here is a step toward fluency instead of fumbling.',
  'lesson-10/aesdr_course10_1_v1': 'Commission math is the math no one teaches you until it\u0027s too late. What you write here proves you understand the real economics of your paycheck.',
  'lesson-10/aesdr_course10_2_v1': 'Quotas are designed to push you \u2014 not define you. Every honest answer here separates your self-worth from a number someone else picked.',
  'lesson-10/aesdr_course10_3_v1': 'Feast-or-famine is the emotional rollercoaster nobody prepares you for. What you write here builds the emotional discipline to survive it.',
  'lesson-11/aesdr_course11_1_v1': 'Sober selling is about being present when everyone else is performing. Every answer here commits you to showing up as yourself, not a character.',
  'lesson-11/aesdr_course11_2_v1': 'Conference culture can accelerate your career or derail it in a single night. What you write here is your plan to make it count without losing yourself.',
  'lesson-11/aesdr_course11_3_v1': 'Professional presence isn\u0027t about looking the part \u2014 it\u0027s about being the part. Every answer here builds the reputation that follows you between companies.',
  'lesson-12/aesdr_course12_1_v1': 'Relationships in SaaS outlast every job, every quota, every company. What you write here invests in the network that will carry your entire career.',
  'lesson-12/aesdr_course12_2_v1': 'The home office is either your fortress or your prison. Every answer here is a concrete decision about which one you\u0027re building.',
  'lesson-12/aesdr_course12_3_v1': 'Staying single-threaded on your craft is the most counterintuitive career advice that actually works. What you write here proves you understand why focus wins.',
};

// ─── STEP 4: Per-section sidebar texts (Rowan Pope + Michael Scott style) ───
const SIDEBAR_MAP = {
  'lesson-01/aesdr_course01_v1': ["Structure is the difference between surviving and flaming out.","You have to be twice as good to get half of what they have. That is not a request.","Would I rather be feared or loved? Both. I want people afraid of how much they love my pipeline.","Cold call carelessly.","I declare... PIPELINE!"],
  'lesson-01/aesdr_course01_2_v1': ["Camaraderie isn\u2019t a vibe. It\u2019s a strategy.","You don\u2019t get to be liked. You get to be respected. Then liked.","I knew exactly what you wanted before you said it. That\u2019s partnership.","Friends first, colleagues second. Wait, reverse that.","Trust is earned in drops and lost in buckets."],
  'lesson-01/aesdr_course01_3_v1': ["Coaching is not optional. It\u2019s the whole job.","I run things. Things don\u2019t run me.","A good manager makes their people better. A great one makes them dangerous.","Sometimes I\u2019ll start a sentence and I don\u2019t even know where it\u2019s going. I just hope I find it along the way.","Your SDR doesn\u2019t need a cheerleader. They need a mirror."],
  'lesson-02/aesdr_course02_1_v1': ["Silos are where pipeline goes to die.","I am the wall. And I am the one who takes them down.","If you have a silo, you have a problem. If you don\u2019t know you have a silo, you are the problem.","Cross-functional is not a buzzword. It\u2019s a survival skill.","Information hoarding is just fear wearing a suit."],
  'lesson-02/aesdr_course02_2_v1': ["Your workspace is either a weapon or a coffin.","Control your environment or it will control you.","I am fast. To give you a reference point, I am somewhere between a snake and a mongoose.","Clean desk, clean mind. Messy desk, messy pipeline.","Your setup should sell for you even when you\u2019re not selling."],
  'lesson-02/aesdr_course02_3_v1': ["Ego kills more deals than bad product ever will.","You think you\u2019re the smartest person in the room? Wrong room.","I don\u2019t have a problem with ego. I just leave mine at the door.","Nobody ever got promoted by proving they were right in an argument.","Check your ego or your pipeline will check it for you."],
  'lesson-03/aesdr_course03_1_v1': ["Patterns don\u2019t fix themselves. They compound.","Do not test me. I don\u2019t do well when tested.","The definition of insanity is doing the same call and expecting a different meeting.","If you keep falling into the same pitfall, eventually it becomes your grave.","Your pipeline doesn\u2019t lie. It just whispers truths you ignore."],
  'lesson-03/aesdr_course03_2_v1': ["Survival isn\u2019t dramatic. It\u2019s daily.","I made them. And I can unmake them.","Layoffs don\u2019t target the person who ships. They target the person who hides.","The first person cut is always the last person who spoke up.","Survive this quarter. Then survive the next one. That\u2019s the whole playbook."],
  'lesson-03/aesdr_course03_3_v1': ["Managing up isn\u2019t optional. It\u2019s a survival skill.","The only person you can control is yourself. Start there.","My philosophy is basically this: know what you know. And know what you don\u2019t.","Your manager has a manager. Act accordingly.","Nobody advocates for you louder than you. Nobody."],
  'lesson-04/aesdr_course04_1_v1': ["Your manager can make or break you. Navigate accordingly.","Power is not something that is given. It is taken.","Would I rather have a good boss or a good salary? Trick question. Both.","Politics isn\u2019t dirty. Ignoring politics is naive.","The person who controls the narrative controls the outcome."],
  'lesson-04/aesdr_course04_2_v1': ["Culture isn\u2019t the ping pong table. It\u2019s the hard decisions.","You want to know what happens in this room? Everything.","People will forget what you said. They\u2019ll never forget how you made them feel at the Keurig.","Culture eats strategy for breakfast. Sales eats everything else.","The vibe check is never about the vibe. It\u2019s about the work."],
  'lesson-04/aesdr_course04_3_v1': ["Async either sets you free or lets you disappear.","Visibility is not vanity. It is survival.","If you\u2019re not visible when you\u2019re remote, you\u2019re optional.","An email at 6 PM doesn\u2019t make you dedicated. Shipping results does.","Out of sight, out of mind, out of a job."],
  'lesson-05/aesdr_course05_1_v1': ["The playbook gets you started. What you do beyond it gets you promoted.","I don\u2019t follow rules. I make them.","There\u2019s no such thing as a natural-born closer. Just a well-practiced one.","The playbook is the floor, not the ceiling.","Run the play. Then make one up."],
  'lesson-05/aesdr_course05_2_v1': ["Execution separates promoted from managed out.","The speed of the leader is the speed of the gang.","Talk is cheap. Pipeline is expensive.","Plans are worthless. Planning is everything.","Don\u2019t tell me what you\u2019re going to do. Show me what you did."],
  'lesson-05/aesdr_course05_3_v1': ["Be the person no one can afford to lose.","I am not a toy. I am not a thing to be toyed with.","Make yourself so useful that firing you would be more expensive than keeping you.","Irreplaceable people don\u2019t ask for promotions. They get offered them.","You\u2019re either a line item or an asset. Choose."],
  'lesson-06/aesdr_course06_1_v1': ["Past the playbook is where the real growth starts.","There are things you can fix, and things you can fight.","The comfort zone is beautiful. But nothing grows there.","Innovation isn\u2019t invention. It\u2019s iteration on what already works.","The best reps steal from everyone and credit no one."],
  'lesson-06/aesdr_course06_2_v1': ["Your network is your net worth. Build it before you need it.","Connections without context are just contacts.","Every person in your life is a door. Or a wall. Learn the difference.","LinkedIn is not networking. Coffee is networking.","The person you help today hires you tomorrow."],
  'lesson-06/aesdr_course06_3_v1': ["Know just enough to be dangerous. Then learn the rest.","Knowledge is power. But only if you use it.","You don\u2019t need to know everything. You need to know the one thing they care about.","The gray area is where deals happen.","Confidence is not knowing it all. It\u2019s knowing you can figure it out."],
  'lesson-07/aesdr_course07_1_v1': ["Prospecting is everyone\u2019s job. Full stop.","I will not be purged. I will not be outworked.","Waiting for inbound is just unemployment with extra steps.","The phone is not your enemy. Silence is.","Your pipeline is a garden. Neglect it and weeds win."],
  'lesson-07/aesdr_course07_2_v1': ["Self-sourced is self-made. Own your pipeline.","Sometimes you have to take matters into your own hands.","Every meeting you book yourself is a meeting nobody can take from you.","Dependency is fragility. Self-sourcing is armor.","The reps who own their pipeline own their career."],
  'lesson-07/aesdr_course07_3_v1': ["SaaS is worth it. But only for the version of you that works.","The question was never whether this was hard. It was whether you were harder.","Do I need to be liked? Absolutely not. I like to be liked. But it\u2019s not necessary.","The money is real. The grind is real. Your choice.","SaaS will eat you alive if you let it. Don\u2019t let it."],
  'lesson-08/aesdr_course08_1_v1': ["The math doesn\u2019t lie. You might.","The truth will set you free. But first, it will make you miserable.","Optimism without math is just denial with better vibes.","Hope is not a strategy. Neither is wishful thinking.","Your forecast is a mirror. Look harder."],
  'lesson-08/aesdr_course08_2_v1': ["Potential is the most expensive lie in sales.","If wishes were pipeline, reps would never miss quota.","Potential energy does zero work. Kinetic energy closes deals.","Stop telling yourself what could happen. Look at what is happening.","Your story doesn\u2019t matter. Your numbers do."],
  'lesson-08/aesdr_course08_3_v1': ["Are you the problem? Only honest people ask.","Am I the problem? That\u2019s the first sign you\u2019re not. But keep checking.","The mirror never lies. Your CRM might.","Self-awareness is a competitive advantage nobody teaches.","The hardest deal to close is the one with yourself."],
  'lesson-09/aesdr_course09_1_v1': ["Salesforce isn\u2019t the enemy. Your habits are.","Discipline is the bridge between goals and accomplishment.","Bad CRM hygiene is just lying with extra steps.","Your Salesforce is your r\u00e9sum\u00e9. Act like it.","Data in, deals out. Garbage in, unemployment out."],
  'lesson-09/aesdr_course09_2_v1': ["Slack is a weapon or a distraction. You decide.","Focus is saying no to the other hundred things.","Every notification is someone else\u2019s priority disguised as yours.","DND is not rude. It\u2019s professional.","The best reps are terrible at Slack. On purpose."],
  'lesson-09/aesdr_course09_3_v1': ["Tools don\u2019t close deals. People who master them do.","A sword is only as sharp as the person wielding it.","You don\u2019t get credit for knowing where the button is. You get credit for clicking it.","Fluency beats fumbling. Every single time.","Master your tools or they will master your calendar."],
  'lesson-10/aesdr_course10_1_v1': ["Commission math is the math no one teaches you. Until it\u2019s too late.","Money doesn\u2019t grow on trees. It grows on closed-won.","Know your comp plan better than your manager knows it.","If you can\u2019t calculate your check, you can\u2019t optimize it.","OTE means on target. Are you on target?"],
  'lesson-10/aesdr_course10_2_v1': ["Quotas push you. They don\u2019t define you.","A number is just a number. Until it\u2019s your number.","Missing quota doesn\u2019t make you a failure. Accepting it does.","The number is the mountain. Your habits are the legs.","Quota is a conversation with the future version of you."],
  'lesson-10/aesdr_course10_3_v1': ["Feast or famine is the ride nobody prepares you for.","Emotional discipline is the skill they never put in the job description.","Celebrate the wins. Grieve the losses. Never for longer than 24 hours.","The rollercoaster doesn\u2019t stop. You just get better at holding on.","Consistency is boring. Consistency also pays your rent."],
  'lesson-11/aesdr_course11_1_v1': ["Show up as yourself. That\u2019s the whole strategy.","Presence is not performance. It\u2019s power.","I don\u2019t need a drink to be interesting. My pipeline speaks for itself.","Being real in a room full of performers is the ultimate power move.","Sobriety isn\u2019t a limitation. It\u2019s a competitive advantage."],
  'lesson-11/aesdr_course11_2_v1': ["Conferences can accelerate or derail you. In one night.","Your reputation arrives before you do. And stays after you leave.","What happens at the conference absolutely does not stay at the conference.","Network before noon. Everything after midnight is a liability.","The goal is connections, not confessions."],
  'lesson-11/aesdr_course11_3_v1': ["Presence isn\u2019t about looking the part. It\u2019s being the part.","Walk into every room like you belong there. Because you do.","Dress for the job you want. But also close for the job you have.","Your brand follows you between companies. Build it intentionally.","People buy from people they trust. Be trustworthy."],
  'lesson-12/aesdr_course12_1_v1': ["Relationships outlast every job. Every quota. Every company.","The network you build today is the career you live tomorrow.","People forget deals. They never forget how you treated them.","Relationships are compound interest. Start depositing now.","Your Rolodex is your safety net."],
  'lesson-12/aesdr_course12_2_v1': ["Your home office is a fortress or a prison. You\u2019re building one.","Where you work shapes how you work.","Working from home is not a vacation. It\u2019s a test.","The commute is gone. The excuses should be too.","Boundaries don\u2019t build themselves. Neither does discipline."],
  'lesson-12/aesdr_course12_3_v1': ["Focus wins. Every time.","Multi-tasking is just failing at two things simultaneously.","The person who chases two rabbits catches neither.","Single-threaded focus is the most counterintuitive hack that works.","Depth beats breadth. Always."],
};

// ─── STEP 5: Custom attest reason pool (unique per checkbox, no repeats) ───
const CUSTOM_REASONS = [
  "the version of me that wins starts right here",
  "discipline is the bridge between goals and achievement",
  "what I build today becomes my foundation tomorrow",
  "the gap between intention and impact is execution",
  "showing up matters more than showing off",
  "real progress starts where comfort ends",
  "the person I\u2019m becoming depends on what I do right now",
  "small actions compound into big results",
  "this is the work most people skip \u2014 and that\u2019s exactly why it matters",
  "words without action are just wishes",
  "I\u2019m not here to perform growth \u2014 I\u2019m here to actually grow",
  "the scoreboard doesn\u2019t care about my excuses",
  "every rep counts even when no one is watching",
  "talent without discipline is just wasted potential",
  "I\u2019d rather be uncomfortable and improving than comfortable and stuck",
  "this moment is the only one I can control",
  "the best time to start was yesterday \u2014 the second best time is right now",
  "average is a choice and I\u2019m choosing differently",
  "the work I do in private determines the success I earn in public",
  "honesty with myself is the most valuable skill I can develop",
  "being good isn\u2019t good enough when you can be great",
  "consistency beats intensity every single day",
  "my standards don\u2019t lower just because no one is checking",
  "the path to mastery runs through moments exactly like this",
  "I refuse to let today\u2019s comfort steal tomorrow\u2019s success",
  "the only person I need to outwork is the version of me from yesterday",
  "results don\u2019t lie and neither should I",
  "every moment of practice is a deposit in my future",
  "progress isn\u2019t always visible but it\u2019s always happening when I show up",
  "I\u2019m building a reputation one action at a time",
  "the person who does the boring work always beats the person who waits for the exciting work",
  "this is where the difference gets made \u2014 not in the big moments, in these ones",
  "self-discipline is just self-respect in action",
  "I don\u2019t need motivation \u2014 I need commitment",
  "the work speaks louder than the intention ever could",
  "my trajectory changes every time I choose effort over ease",
  "there is no substitute for doing the actual work",
  "I\u2019m investing in competence, not just confidence",
  "the details others skip are the details that separate winners",
  "this isn\u2019t about being perfect \u2014 it\u2019s about being relentless",
  "ownership starts with the small things",
  "the gap between where I am and where I want to be is filled with work exactly like this",
  "excuses are just dreams I\u2019ve given up on",
  "the grind is the gift \u2014 I just don\u2019t always see it yet",
  "my commitment to this process is my commitment to myself",
  "every challenge I face honestly makes the next one easier",
  "I\u2019m not cutting corners because I\u2019m not building something I want to fall apart",
  "professionalism isn\u2019t a switch \u2014 it\u2019s a habit",
  "what separates good from great is exactly this kind of effort",
  "I\u2019m writing the story of my career with every response I give here",
  "preparation is the unsexy secret behind every great performance",
  "I\u2019m choosing substance over speed",
  "the person who shows up every day beats the person who shows up when they feel like it",
  "growth requires friction and I\u2019m leaning into it",
  "my word to myself matters even more than my word to others",
  "the uncomfortable work is the only work that actually changes me",
  "being honest about my gaps is the first step to closing them",
  "I\u2019m trading short-term comfort for long-term capability",
  "the version of me that does this well is the version that gets ahead",
  "real learning happens in the doing, not the reading",
  "I don\u2019t get to skip the fundamentals and still expect expert results",
  "the standard I accept is the standard I\u2019ll become",
  "my actions here are a preview of my actions under pressure",
  "there are no shortcuts to anywhere worth going",
  "the habits I set today become the results I measure tomorrow",
  "I trust the process because I\u2019ve seen what happens when I don\u2019t",
  "discipline isn\u2019t punishment \u2014 it\u2019s freedom",
  "the best investment I can make is in my own competence",
  "I refuse to be the weakest link in my own story",
  "every challenge I take on honestly makes me harder to replace",
  "commitment is doing the thing long after the feeling has left",
  "I\u2019m not here for participation credit \u2014 I\u2019m here for real improvement",
  "the work no one sees is the work that matters most",
  "my future self is counting on what I do right now",
  "progress is built on honest reps, not perfect ones",
  "I\u2019m earning my confidence through action, not affirmation",
  "there\u2019s no version of success that doesn\u2019t include this kind of effort",
  "what I practice in private I perform in public",
  "being deliberate beats being busy every single time",
  "the bridge between who I am and who I want to be is built with work like this",
];

// ─── STEP 6: AE replacement pools ───
const AE_ATTEST_POOL = [
  "someone I trust","a teammate","a partner","someone on the team",
  "someone I respect","a colleague","someone who challenges me",
];
const AE_TASK_POOL = [
  "a partner","a teammate","someone on the team","someone you trust",
  "someone you respect","a colleague","a peer",
];

// ─── STEP 7: Process all files ───
const lessonDirs = fs.readdirSync(ROOT).filter(d => d.startsWith('lesson-')).sort();
let updated = 0;
let skipped = [];
let phraseIdx = 0;
let customReasonIdx = 0;
let aeCounter = 0;

for (const dir of lessonDirs) {
  const dirPath = path.join(ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html')).sort();

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    let html = fs.readFileSync(filePath, 'utf-8');
    let changes = 0;
    const fileKey = dir + '/' + file.replace('.html', '');
    const conscience = CONSCIENCE[fileKey];
    const isProto = filePath === PROTOTYPE;

    // ── 7a. Replace IIFE (propagate from prototype) ──
    if (!isProto) {
      let oldStart = html.indexOf('/*  AESDR Accountability Gates v2');
      if (oldStart === -1) oldStart = html.indexOf('/*  AESDR Accountability Gates v1');
      if (oldStart !== -1) {
        const oldEnd = html.indexOf('})(window.AESDR);', oldStart);
        if (oldEnd !== -1) {
          html = html.substring(0, oldStart) + NEW_IIFE + html.substring(oldEnd + '})(window.AESDR);'.length);
          changes++;
        }
      }
    }

    // ── 7b. Replace ATTEST array with file-specific unique phrases ──
    const attestStart = html.indexOf('var ATTEST = [');
    if (attestStart !== -1) {
      const bracketOpen = html.indexOf('[', attestStart);
      let depth = 0, attestEnd = -1;
      for (let ci = bracketOpen; ci < html.length; ci++) {
        if (html[ci] === '[') depth++;
        if (html[ci] === ']') { depth--; if (depth === 0) { attestEnd = ci + 1; break; } }
      }
      if (attestEnd !== -1 && html[attestEnd] === ';') attestEnd++;
      if (attestEnd !== -1) {
        const fileAttest = SHUFFLED.slice(phraseIdx, phraseIdx + 15);
        phraseIdx += 15;
        const newAttest = 'var ATTEST = [\n' +
          fileAttest.map(p => '    "' + p.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"').join(',\n') +
          '\n  ];';
        html = html.substring(0, attestStart) + newAttest + html.substring(attestEnd);
        changes++;
      }
    }

    // ── 7c. Add conscience: to homework gates ──
    if (conscience && !html.includes("conscience:")) {
      const hwRe = /type:\s*'homework'\s*,/g;
      let hwMatch;
      while ((hwMatch = hwRe.exec(html)) !== null) {
        const insertPos = hwMatch.index + hwMatch[0].length;
        const conscienceStr = "\n    conscience: '" + conscience.replace(/'/g, "\\'") + "',";
        html = html.substring(0, insertPos) + conscienceStr + html.substring(insertPos);
        hwRe.lastIndex = insertPos + conscienceStr.length;
        changes++;
      }
    }

    // ── 7d. Replace sidebar text and add id="sidebarMotto" ──
    if (conscience) {
      // Replace old "You can treat this..." pattern
      const sidebarRe = /<p style="[^"]*iris[^"]*">[^<]*You can treat this like just another course[^<]*<\/p>/;
      if (sidebarRe.test(html)) {
        html = html.replace(sidebarRe,
          `<p id="sidebarMotto" style="font-family:'Inter',-apple-system,sans-serif;font-size:13px;font-weight:700;line-height:1.65;background:var(--iris);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:iris 3s linear infinite">${conscience}</p>`);
        changes++;
      }
      // Add id to existing sidebar <p> without id
      if (!html.includes('id="sidebarMotto"')) {
        html = html.replace(
          /<p style="font-family:'Inter',-apple-system,sans-serif;font-size:13px;font-weight:700/,
          '<p id="sidebarMotto" style="font-family:\'Inter\',-apple-system,sans-serif;font-size:13px;font-weight:700'
        );
        changes++;
      }
    }

    // ── 7e. Fix old font-style:italic ──
    const oldSidebarStyle = /(<p style="font-family:var\(--serif\);font-size:13px;)font-style:italic;(line-height)/;
    if (oldSidebarStyle.test(html)) {
      html = html.replace(oldSidebarStyle, "$1font-weight:700;$2");
      changes++;
    }

    // ── 7f. CSS max-width removal (all content areas) ──
    const before7f = html;
    // Pass 1: max-width with trailing semicolon (mid-rule), skip POW popup box
    html = html.replace(/max-width:\s*\d+px;\s*(?!animation:powBounce)/g, '');
    // Pass 2: max-width as last property before } (no trailing semicolon)
    html = html.replace(/;max-width:\s*\d+px(?=\})/g, '');
    if (html !== before7f) changes++;

    // ── 7g. Inject SIDEBAR_TEXTS array ──
    const sidebarTexts = SIDEBAR_MAP[fileKey];
    if (sidebarTexts && !html.includes('SIDEBAR_TEXTS')) {
      const sidebarJS = 'const SIDEBAR_TEXTS = [\n' +
        sidebarTexts.map(t => '  "' + t.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"').join(',\n') +
        '\n];\n\n';
      html = html.replace('function init(){', sidebarJS + 'function init(){');
      changes++;
    }

    // ── 7h. Add dynamic sidebar update in render() ──
    if (!html.includes("getElementById('sidebarMotto')")) {
      html = html.replace(
        "document.getElementById('btnNext').disabled=!canContinue();",
        "document.getElementById('btnNext').disabled=!canContinue();\n  var sbp=document.getElementById('sidebarMotto');\n  if(sbp&&typeof SIDEBAR_TEXTS!=='undefined'){var si=SEC[cur]||0;sbp.textContent=SIDEBAR_TEXTS[si]||SIDEBAR_TEXTS[0];}"
      );
      changes++;
    }

    // ── 7i. Replace AE language in task/attest/placeholder strings (skip prototype) ──
    // Separate passes for single-quoted and double-quoted strings to avoid
    // the " inside '...' problem (e.g. task:'...the "I Don\'t Know"...your AE...')
    if (!isProto) {
      const before7i = html;
      // SQ = single-quote string interior, DQ = double-quote
      const SQ = String.raw`(?:[^'\\]|\\.)*?`;
      const DQ = String.raw`(?:[^"\\]|\\.)*?`;

      function aeReplace(prop, aePhrase, pool) {
        for (const [qo, qc, S] of [["'", "'", SQ], ['"', '"', DQ]]) {
          const escaped = aePhrase.replace(/\s/g, '\\s');
          const re = new RegExp(`(${prop}:\\s*${qo})(${S})\\b${escaped}\\b(${S})(${qc})`, 'g');
          html = html.replace(re, (m, p1, before, after, q) => {
            const rep = pool[aeCounter++ % pool.length];
            // Preserve "with " prefix when replacing "with your AE" / "with my AE"
            if (aePhrase.startsWith('with ')) return p1 + before + 'with ' + rep + after + q;
            return p1 + before + rep + after + q;
          });
        }
      }

      // attest: values
      for (const phrase of ['my AE', 'your AE']) aeReplace('attest', phrase, AE_ATTEST_POOL);

      // task: values — "with ..." first, then bare
      for (const phrase of ['with your AE', 'with my AE', 'your AE', 'my AE']) aeReplace('task', phrase, AE_TASK_POOL);

      // placeholder: values
      for (const phrase of ['with my AE', 'with your AE', 'my AE', 'your AE']) aeReplace('placeholder', phrase, AE_TASK_POOL);

      if (html !== before7i) changes++;
    }

    // ── 7j. Make custom attest "because" reasons unique (skip prototype) ──
    if (!isProto) {
      const before7j = html;
      const SQ2 = String.raw`(?:[^'\\]|\\.)*?`;
      const DQ2 = String.raw`(?:[^"\\]|\\.)*?`;
      for (const [qo, qc, S] of [["'", "'", SQ2], ['"', '"', DQ2]]) {
        html = html.replace(new RegExp(`(attest:\\s*${qo})(${S})\\bbecause\\s(${S})(${qc})`, 'g'), (m, p1, prefix, reason, q) => {
          const newReason = CUSTOM_REASONS[customReasonIdx % CUSTOM_REASONS.length];
          customReasonIdx++;
          return p1 + prefix + 'because ' + newReason + q;
        });
      }
      if (html !== before7j) changes++;
    }

    // ── 7k. Replace AE in SCHED-like arrays ──
    if (!isProto) {
      html = html.replace(/act:\s*"Daily huddle with AE"/g, 'act:"Daily team huddle"');
      html = html.replace(/goal:\s*"Role-play with AE or peer\."/g, 'goal:"Role-play with a partner or peer."');
      html = html.replace(/act:\s*"AE\/SDR feedback session"/g, 'act:"Feedback & debrief session"');
    }

    // ── 7l. Persistence: screen position save in go() ──
    if (!html.includes('aesdr_screen_')) {
      html = html.replace(
        /function go\(n\)\{\s*if\(window\.parent!==window\)/,
        'function go(n){\n  try{localStorage.setItem(\'aesdr_screen_\'+location.pathname.replace(/[^a-z0-9]/gi,\'_\'),n)}catch(e){}\n  if(window.parent!==window)'
      );
      changes++;
    }

    // ── 7m-a. Update go(n) to persist state, send fullState, and signal completion ──
    {
      const before7ma = html;
      // Replace gateData() with fullState() everywhere in the file
      if (html.includes('AESDR.gateData')) {
        html = html.replace(/AESDR\.gateData\b/g, 'AESDR.fullState');
      }
      // Add persistNow() call in go(n) if not already present
      if (!html.includes('AESDR.persistNow') && html.includes('function go(n)')) {
        html = html.replace(
          /(try\{localStorage\.setItem\('aesdr_screen_'\+location\.pathname\.replace\(\/\[\^a-z0-9\]\/gi,'_'\),n\)\}catch\(e\)\{\})\s*\n/,
          "$1\n  if(window.AESDR&&AESDR.persistNow) AESDR.persistNow();\n"
        );
      }
      // Add aesdr:complete postMessage when reaching final screen
      if (!html.includes('aesdr:complete') && html.includes('function go(n)')) {
        html = html.replace(
          /if\(window\.parent!==window\)\{try\{window\.parent\.postMessage\(\{type:"aesdr:progress"/,
          'if(n===TOTAL-1&&window.parent!==window){try{window.parent.postMessage({type:"aesdr:complete"},"*")}catch(e){}}\n  if(window.parent!==window){try{window.parent.postMessage({type:"aesdr:progress"'
        );
      }
      if (html !== before7ma) changes++;
    }

    // ── 7m-b. Add "Continue to Journey" button on completion screen ──
    if (!html.includes('Continue to Journey')) {
      // Match both "Restart Course" and "Restart Lesson" button variants
      html = html.replace(
        /<div style="margin-top:28px"><button class="btn btn-fill" onclick="go\(0\)"><span>↩ Restart (?:Course|Lesson)<\/span><\/button><\/div>/,
        '<div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">\n' +
        '          <button class="btn btn-fill" onclick="if(window.parent!==window){window.parent.postMessage({type:\'aesdr:navigate\',href:\'/dashboard\'},\'*\')}else{location.href=\'/dashboard\'}"><span>Continue to Journey &rarr;</span></button>\n' +
        '          <button class="btn" onclick="go(0)" style="border:1px solid var(--mid);color:var(--mid)"><span>↩ Restart</span></button>\n' +
        '        </div>'
      );
      changes++;
    }

    // ── 7n. Persistence: AESDR.restoreState() in init() ──
    if (!html.includes('AESDR.restoreState()')) {
      html = html.replace(
        /(\s*\/\/ Build UI components[^\n]*\n)/,
        '\n  // Restore saved gate state from localStorage\n  AESDR.restoreState();\n\n$1'
      );
      changes++;
    }

    // ── 7o. Persistence: screen position restore ──
    if (!html.includes('_savedScreen')) {
      html = html.replace(
        /(\s*)(render\(\);\s*\n\})/,
        '$1// Restore saved screen position\n$1var _savedScreen = 0;\n$1try { _savedScreen = parseInt(localStorage.getItem(\'aesdr_screen_\' + location.pathname.replace(/[^a-z0-9]/gi, \'_\'))) || 0; } catch(e) {}\n$1if (_savedScreen > 0 && _savedScreen < TOTAL) { cur = _savedScreen; document.getElementById(\'s0\').classList.remove(\'active\'); document.getElementById(\'s\'+cur).classList.add(\'active\'); }\n\n$1$2'
      );
      changes++;
    }

    if (changes === 0) {
      skipped.push(`${dir}/${file} — no changes needed`);
      continue;
    }

    // ── Validate JS syntax ──
    const scripts = [];
    const re = /<script>([\s\S]*?)<\/script>/g;
    let m;
    while ((m = re.exec(html)) !== null) scripts.push(m[1]);
    let valid = true;
    for (const script of scripts) {
      try { new Function(script); } catch(e) {
        valid = false;
        console.log(`\u2717 ${dir}/${file} — JS error: ${e.message}`);
        break;
      }
    }
    if (!valid) { skipped.push(`${dir}/${file} — syntax error`); continue; }

    fs.writeFileSync(filePath, html, 'utf-8');
    updated++;
    console.log(`\u2713 ${dir}/${file} (${changes} changes)`);
  }
}

console.log(`\nDone: ${updated} files updated.`);
console.log(`Total unique attest phrases assigned: ${phraseIdx}`);
console.log(`Total custom attest reasons assigned: ${customReasonIdx}`);
console.log(`Total AE replacements: ${aeCounter}`);
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`);
  skipped.forEach(s => console.log(`  ${s}`));
}

// Verify no duplicate ATTEST phrases
const allAssigned = SHUFFLED.slice(0, phraseIdx);
const uniqueCheck = new Set(allAssigned);
if (uniqueCheck.size !== allAssigned.length) {
  console.error('WARNING: Duplicate ATTEST phrases detected!');
} else {
  console.log(`\u2713 All ${allAssigned.length} ATTEST phrases are unique across entire app`);
}
