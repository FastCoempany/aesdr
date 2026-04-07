import 'dotenv/config';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!TOKEN || !GUILD_ID) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID in .env');
  process.exit(1);
}

const API = 'https://discord.com/api/v10';
const SHOULD_PIN = true;

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(`Discord API ${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function getGuildChannels() {
  return api(`/guilds/${GUILD_ID}/channels`);
}

async function sendMessage(channelId, content) {
  return api(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      allowed_mentions: {
        parse: [],
      },
    }),
  });
}

async function pinMessage(channelId, messageId) {
  return api(`/channels/${channelId}/messages/pins/${messageId}`, {
    method: 'PUT',
  });
}

async function startThreadFromMessage(channelId, messageId, name) {
  return api(`/channels/${channelId}/messages/${messageId}/threads`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      auto_archive_duration: 1440,
      rate_limit_per_user: 0,
    }),
  });
}

function findChannel(channels, name) {
  return channels.find(
    (c) => c.type === 0 && c.name.toLowerCase() === name.toLowerCase()
  );
}

const POSTS = {
  welcome: [
    {
      pin: true,
      content: `# Welcome to AESDR

This server is for reps who want cleaner execution, sharper diagnosis, and fewer excuses.

## Start here
- Introduce yourself in **#introductions**
- Post a recent result in **#wins**
- Ask for help in **#pipeline-help**
- Drop broader questions in **#questions**
- Browse supporting material in **#resources**

## What this place is for
- better prospecting
- better discovery
- better deal control
- better follow-up discipline
- honest diagnosis when your pipeline is lying to you

## Rule of thumb
Do not post vague suffering.
Post specifics.

What broke.
What you tried.
What happened.
What you think is actually wrong.`,
    },
  ],

  wins: [
    {
      pin: true,
      content: `**Win example #1**

Booked 3 meetings today using the cold call framework from Lesson 3.

- segment: founder-led SaaS
- trigger: recent hiring + weak outbound motion
- what changed: stopped leading with the product and led with the friction
- result: 3 meetings from 17 real conversations`,
    },
    {
      pin: false,
      content: `**Win example #2**

Revived a dead thread by changing the follow-up angle.

- old move: “just checking in”
- new move: tied the follow-up to quarter timing and internal urgency
- persona: VP Sales
- result: meeting booked the same day`,
    },
    {
      pin: false,
      content: `**Win example #3**

Handled “send me something” without surrendering the deal.

- objection: “just send info”
- response move: narrowed the ask and forced a live decision
- result: secured next call instead of entering PDF purgatory

When you post a win, include the move. Not just the dopamine.`,
    },
  ],

  'pipeline-help': [
    {
      pin: true,
      content: `**Pipeline bottleneck check**

What is the biggest bottleneck in your pipeline right now?

Reply in the thread with:
- where deals are stalling
- what stage is leaking
- what you have already tried
- what you suspect is actually broken

Bad answer: “pipeline is slow”
Good answer: “deals die after strong disco because I am not earning a real second-step commitment”`,
      createThread: true,
      threadName: 'What is the biggest bottleneck in your pipeline right now?',
    },
  ],

  resources: [
    {
      pin: true,
      content: `**Free resources worth your time**

1. Gong blog — https://www.gong.io/blog
2. HubSpot Sales Blog — https://blog.hubspot.com/sales/all
3. Lavender blog — https://www.lavender.ai/blog

Use these as supplements.
Do not disappear into “learning” when what you need is reps, calls, and honest review.`,
    },
  ],

  questions: [
    {
      pin: true,
      content: `**Starter question**

Where do you personally lose the most deals right now?

1. opening the conversation
2. discovery depth
3. multi-threading and process control
4. follow-up and momentum
5. close-stage conviction

My own answer:
Most reps think they have a closing problem when they actually have a discovery-quality problem upstream. Weak discovery writes weak proposals and creates fake late-stage hope.`,
    },
  ],

  'support-tickets': [
    {
      pin: true,
      content: `# Need help? Submit a support ticket.

If you have an access issue, billing question, bug report, or anything else — submit a ticket and we will get back to you within 48 hours.

**→ Submit a support ticket:** https://tally.so/r/KYDb7X

You can also email **support@aesdr.com** directly.`,
    },
  ],
};

async function run() {
  const channels = await getGuildChannels();

  for (const [channelName, entries] of Object.entries(POSTS)) {
    const channel = findChannel(channels, channelName);

    if (!channel) {
      console.warn(`Skipping #${channelName} — channel not found`);
      continue;
    }

    console.log(`Seeding #${channelName}`);

    for (const entry of entries) {
      const msg = await sendMessage(channel.id, entry.content);
      console.log(`  Posted message: ${msg.id}`);

      if (entry.createThread) {
        const thread = await startThreadFromMessage(
          channel.id,
          msg.id,
          entry.threadName || 'Discussion'
        );
        console.log(`  Created thread: ${thread.name}`);
      }

      if (SHOULD_PIN && entry.pin) {
        await pinMessage(channel.id, msg.id);
        console.log(`  Pinned message: ${msg.id}`);
      }
    }
  }

  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});