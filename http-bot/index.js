import pkg from "@slack/bolt";
const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-http",
  signingSecret: "slacksim-secret-http",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

// Guard: ignore bot messages to prevent infinite loops.
// In real Slack, Bolt does this automatically because bot messages have
// subtype: "bot_message". If the simulator omits the subtype, we guard manually.
function isHuman(message) {
  return !message.bot_id && !message.subtype;
}

// "hello" → reply in channel
app.message(/hello/i, async ({ message, say }) => {
  if (!isHuman(message)) return;
  await say(`Hey <@${message.user}>, you said: \`${message.text}\``);
});

// React when the bot is mentioned
app.event("app_mention", async ({ event, say }) => {
  const httpBotMention = `@http`;

  if (!event.text.includes(httpBotMention)) {
    return;
  }

  await say({
    text: `Yes, <@${event.user}>? You mentioned me! 👋`,
    thread_ts: event.ts,
  });
});

(async () => {
  await app.start(4003);
  console.log("🤖 Http Bot is running");
})();
