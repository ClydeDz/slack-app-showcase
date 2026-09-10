import pkg from "@slack/bolt";
import dotenv from "dotenv";

dotenv.config();

const { App } = pkg;

// Real Slack
// const app = new App({
//   token: process.env.BOT_TOKEN,
//   // signingSecret: process.env.SIGNING_SECRET,
//   socketMode: true,
//   appToken: process.env.APP_TOKEN,
// });

// Slack Simulator
const app = new App({
  token: "xoxb-slacksim-demo", // Bot User OAuth Token
  // signingSecret: "slacksim-secret-demo", // from app credentials page
  socketMode: true,
  appToken: "xapp-slacksim-demo", // app level tokens
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
  if (!isHuman(event)) return;

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

// /echo slash command → echo back whatever text is provided
app.command("/echo", async ({ command, ack, respond }) => {
  await ack();
  if (command.text) {
    await respond(command.text);
  } else {
    await respond("Echo: (nothing to echo)");
  }
});

(async () => {
  await app.start();
  console.log("🤖 Demo Bot is running");
})();
