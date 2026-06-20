import pkg from "@slack/bolt";
const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-ack",
  signingSecret: "slacksim-secret-ack",
  socketMode: true,
  appToken: "xapp-slacksim-ack",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

// ── member_joined_channel ─────────────────────────────────────────────────────

app.event("member_joined_channel", async ({ event, say }) => {
  await say(`Welcome onboard, <@${event.user}>! 👋`);
});

// ── channel_created ───────────────────────────────────────────────────────────
// event.channel = { id, name, created, creator }

app.event("channel_created", async ({ event, client }) => {
  const { id, name } = event.channel;
  console.log(`[ack-bot] channel_created: #${name} (${id})`);

  await client.chat.postMessage({
    channel: id,
    text: `Welcome to <#${id}>! 🎉`,
  });
});

// ── channel_archive ───────────────────────────────────────────────────────────
// event.channel = channel ID string (not an object).
// Can't post into an archived channel — post to #general instead.

app.event("channel_archive", async ({ event, client }) => {
  const actor = event.actor_id ?? event.user;
  console.log(`[ack-bot] channel_archive: ${event.channel} by ${actor}`);

  // Post in #general since the archived channel can't receive messages
  await client.chat.postMessage({
    channel: "C001",
    text: `Goodbye <#${event.channel}>! 👋 The channel has been archived.`,
  });

  // DM the user who archived it
  if (actor) {
    await client.chat.postMessage({
      channel: actor,
      text: `You archived <#${event.channel}>. 🗄️`,
    });
  }
});

// ── channel_unarchive ─────────────────────────────────────────────────────────
// event.channel = channel ID string. Channel is open again so post directly.

app.event("channel_unarchive", async ({ event, client }) => {
  console.log(`[ack-bot] channel_unarchive: ${event.channel}`);

  await client.chat.postMessage({
    channel: event.channel,
    text: `Welcome back to <#${event.channel}>! 🙌 This channel has been unarchived.`,
  });
});

(async () => {
  await app.start();
  console.log("🤖 Acknowledge Bot is running");
})();
