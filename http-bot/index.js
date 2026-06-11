import pkg from "@slack/bolt";
const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-third",
  signingSecret: "slacksim-secret-third",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

// Guard: ignore bot messages to prevent infinite loops.
// In real Slack, Bolt does this automatically because bot messages have
// subtype: "bot_message". If the simulator omits the subtype, we guard manually.
function isHuman(message) {
  return !message.bot_id && !message.subtype;
}

// Reply when anyone sends a message containing "hello" (case-insensitive)
app.message(/hello/i, async ({ message, say }) => {
  if (!isHuman(message)) return;
  await say(`Hey <@${message.user}>, you said: \`${message.text}\``);
});

// React when the bot is mentioned
app.event("app_mention", async ({ event, say }) => {
  await say({
    text: `Yes, <@${event.user}>? You mentioned me! 👋`,
    thread_ts: event.ts,
  });
});

// Reply "Pong! 🏓" in a thread when anyone sends "/ping"
app.message("/ping", async ({ message, say }) => {
  if (!isHuman(message)) return;
  await say({ text: "Pong! 🏓", thread_ts: message.ts });
});

// Start the app and post a startup message to #general
(async () => {
  await app.start(4003);
  console.log("⚡️ Bolt app is running");

  // await app.client.chat.postMessage({
  //   channel: "C001", // #general
  //   text: "Bot is online 🤖",
  // });
})();
