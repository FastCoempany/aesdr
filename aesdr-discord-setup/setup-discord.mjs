const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const BASE = `https://discord.com/api/v10/guilds/${GUILD_ID}/channels`;

const structure = [
  {
    category: 'START HERE',
    channels: ['welcome', 'introductions'],
  },
  {
    category: 'MEMBER FLOOR',
    channels: ['wins', 'pipeline-help', 'questions'],
  },
  {
    category: 'RESOURCES',
    channels: ['resources'],
  },
  {
    category: 'SUPPORT',
    channels: ['support-tickets'],
  },
];

async function createChannel(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed: ${res.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function run() {
  for (const group of structure) {
    console.log(`Creating category: ${group.category}`);

    const category = await createChannel({
      name: group.category,
      type: 4, // GUILD_CATEGORY
    });

    for (const name of group.channels) {
      console.log(`  Creating channel: #${name}`);
      await createChannel({
        name,
        type: 0, // GUILD_TEXT
        parent_id: category.id,
      });
    }
  }

  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});