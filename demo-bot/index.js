import pkg from "@slack/bolt";
import { registerMessageHandlers } from "./handlers/messages.js";
import { registerEventHandlers } from "./handlers/events.js";
import { registerCommandHandlers } from "./handlers/commands.js";
import { registerActionHandlers } from "./handlers/actions.js";
import { registerViewHandlers } from "./handlers/views.js";

const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-second",
  signingSecret: "slacksim-secret-second",
  socketMode: true,
  appToken: "xapp-slacksim-second",
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

// "ghost" → ephemeral reply visible only to the sender
app.message(/ghost/i, async ({ message, client }) => {
  if (!isHuman(message)) return;
  await client.chat.postEphemeral({
    channel: message.channel,
    user: message.user,
    text: "👻 Boo! Only you can see this message.",
  });
});

// "ping" → reply in thread
app.message(/ping/i, async ({ message, say }) => {
  if (!isHuman(message)) return;
  await say({ text: "Pong! 🏓", thread_ts: message.thread_ts || message.ts });
});

// app_mention → reply in thread + DM the user
app.event("app_mention", async ({ event, say, client }) => {
  if (!isHuman(message)) return;

  // Reply in the thread where the mention happened
  await say({
    text: `Yes, <@${event.user}>? You mentioned me! 👋`,
    thread_ts: event.ts,
  });

  // Also send a DM to the user who mentioned the bot
  await client.chat.postMessage({
    channel: event.user,
    text: `Hey! You just mentioned me in <#${event.channel}>. Need something? 😊`,
  });
});

(async () => {
  await app.start();
  console.log("🤖 Demo Bot is running");
})();
