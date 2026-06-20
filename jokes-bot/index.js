import pkg from "@slack/bolt";
const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-jokes",
  signingSecret: "slacksim-secret-jokes",
  socketMode: true,
  appToken: "xapp-slacksim-jokes",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

// ── /joke slash command ────────────────────────────────────────────────────────

app.command("/joke", async ({ ack, client, body }) => {
  await ack();

  const message = await client.chat.postMessage({
    channel: body.channel_id,
    text: "Fetching a joke...",
  });

  try {
    const response = await fetch("https://api.chucknorris.io/jokes/random");
    const data = await response.json();

    await client.chat.update({
      channel: body.channel_id,
      ts: message.ts,
      text: data.value,
    });
  } catch (error) {
    console.error("[jokes-bot] Error fetching joke:", error);
    await client.chat.update({
      channel: body.channel_id,
      ts: message.ts,
      text: "Sorry, I couldn't fetch a joke right now. 😕",
    });
  }
});

(async () => {
  await app.start();
  console.log("🤖 Jokes Bot is running");
})();
