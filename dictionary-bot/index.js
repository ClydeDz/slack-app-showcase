import pkg from "@slack/bolt";
const { App } = pkg;
import dotenv from "dotenv";

dotenv.config();

const app = new App({
  token: "xoxb-slacksim-dictionary",
  // signingSecret: "slacksim-secret-dictionary",
  socketMode: true,
  appToken: "xapp-slacksim-dictionary",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

// ── app_mention ───────────────────────────────────────────────────────────────

app.event("app_mention", async ({ event, client }) => {
  const { text, user, channel } = event;

  const dictionaryBotMention = `@dictionary`;

  if (!text.includes(dictionaryBotMention)) {
    return;
  }

  // Remove the dictionary bot mention from the text
  const queryWithoutBotMention = text
    .replaceAll(dictionaryBotMention, "")
    .trim();

  if (!queryWithoutBotMention) {
    await client.chat.postMessage({
      channel,
      text: `Please provide a word to look up, <@${user}>. 📚`,
    });
    return;
  }

  const message = await client.chat.postMessage({
    channel,
    text: `Looking up... 📖`,
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a dictionary. Your only purpose is to provide definitions for words.
                  A user will ask you to define a word. Understand the request, the word to be defined, and respond with its definition. 
                  Keep your response concise and focused on the meaning. Do not engage in conversation or provide additional context beyond the definition. 
                  Do not repeat the user's query in your response. Just respond in natural language.
                  ---
                  Use the following format for your response:
                  The meaning of the <word> is <definition>
                  ---
                  User query: "${queryWithoutBotMention}"
                  `,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const definition = data.candidates[0].content.parts[0].text;

    await client.chat.update({
      channel,
      ts: message.ts,
      text: definition,
    });
  } catch (error) {
    console.error("[dictionary-bot] Error calling Gemini API:", error);
    await client.chat.update({
      channel,
      ts: message.ts,
      text: `Sorry, I couldn't look up "${queryWithoutBotMention}" right now. 😕`,
    });
  }
});

(async () => {
  await app.start();
  const authResult = await app.client.auth.test();
  console.log("🤖 Dictionary Bot is running", authResult.user_id);
})();
