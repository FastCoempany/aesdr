import 'dotenv/config';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!TOKEN || !GUILD_ID) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID in .env');
  process.exit(1);
}

const API = 'https://discord.com/api/v10';

const CHANNEL_TYPES = {
  GUILD_TEXT: 0,
  GUILD_CATEGORY: 4,
};

const PERMS = {
  VIEW_CHANNEL: BigInt('0x0000000000000400'),
  SEND_MESSAGES: BigInt('0x0000000000000800'),
};

const structure = [
  {
    category: 'START HERE',
    channels: [
      { name: 'welcome', mode: 'read_only' },
      { name: 'introductions', mode: 'open' },
    ],
  },
  {
    category: 'MEMBER FLOOR',
    channels: [
      { name: 'wins', mode: 'open' },
      { name: 'pipeline-help', mode: 'open' },
      { name: 'questions', mode: 'open' },
    ],
  },
  {
    category: 'RESOURCES',
    channels: [
      { name: 'resources', mode: 'read_only' },
    ],
  },
  {
    category: 'SUPPORT',
    channels: [
      { name: 'support-tickets', mode: 'read_only' },
    ],
  },
];

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

async function getGuildRoles() {
  return api(`/guilds/${GUILD_ID}/roles`);
}

async function getGuildChannels() {
  return api(`/guilds/${GUILD_ID}/channels`);
}

async function createChannel(payload) {
  return api(`/guilds/${GUILD_ID}/channels`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function modifyChannel(channelId, payload) {
  return api(`/channels/${channelId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function buildEveryoneOverwrite(mode, everyoneRoleId) {
  const allow = [];
  const deny = [];

  // Everyone can always view these channels
  allow.push(PERMS.VIEW_CHANNEL);

  // But only "open" channels allow sending
  if (mode === 'open') {
    allow.push(PERMS.SEND_MESSAGES);
  } else {
    deny.push(PERMS.SEND_MESSAGES);
  }

  return {
    id: everyoneRoleId,
    type: 0, // role
    allow: orFlags(allow),
    deny: orFlags(deny),
  };
}

function orFlags(flags) {
  return flags.reduce((acc, flag) => acc | flag, 0n).toString();
}

function normalizeName(name) {
  return name.toLowerCase();
}

async function ensureCategory(existingChannels, categoryName) {
  let category = existingChannels.find(
    (c) => c.type === CHANNEL_TYPES.GUILD_CATEGORY && c.name === categoryName
  );

  if (!category) {
    console.log(`Creating category: ${categoryName}`);
    category = await createChannel({
      name: categoryName,
      type: CHANNEL_TYPES.GUILD_CATEGORY,
    });
    existingChannels.push(category);
  } else {
    console.log(`Category exists: ${categoryName}`);
  }

  return category;
}

async function ensureTextChannel(existingChannels, categoryId, channelName, overwrite) {
  let channel = existingChannels.find(
    (c) =>
      c.type === CHANNEL_TYPES.GUILD_TEXT &&
      c.name === channelName &&
      c.parent_id === categoryId
  );

  if (!channel) {
    console.log(`Creating channel: #${channelName}`);
    channel = await createChannel({
      name: channelName,
      type: CHANNEL_TYPES.GUILD_TEXT,
      parent_id: categoryId,
      permission_overwrites: [overwrite],
    });
    existingChannels.push(channel);
  } else {
    console.log(`Channel exists: #${channelName} — syncing permissions`);
    channel = await modifyChannel(channel.id, {
      parent_id: categoryId,
      permission_overwrites: [overwrite],
    });

    const index = existingChannels.findIndex((c) => c.id === channel.id);
    if (index >= 0) existingChannels[index] = channel;
  }

  return channel;
}

async function run() {
  const roles = await getGuildRoles();
  const everyoneRole = roles.find((r) => r.name === '@everyone');

  if (!everyoneRole) {
    throw new Error('Could not find @everyone role.');
  }

  const existingChannels = await getGuildChannels();

  for (const group of structure) {
    const category = await ensureCategory(existingChannels, group.category);

    for (const channelConfig of group.channels) {
      const overwrite = buildEveryoneOverwrite(
        channelConfig.mode,
        everyoneRole.id
      );

      await ensureTextChannel(
        existingChannels,
        category.id,
        normalizeName(channelConfig.name),
        overwrite
      );
    }
  }

  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});