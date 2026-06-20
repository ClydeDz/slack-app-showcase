import pkg from "@slack/bolt";
const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-third",
  signingSecret: "slacksim-secret-third",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

// /echo
app.command("/echo", async ({ command, ack, respond }) => {
  await ack();
  const text = command.text.trim();
  if (!text) {
    await respond("Usage: `/echo <your message>`");
    return;
  }
  await respond({
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `You said ${text}` } },
    ],
  });
});

(async () => {
  await app.start();
  console.log("🤖 Http Bot is running");
})();
