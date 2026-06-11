import pkg from "@slack/bolt";
const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-save",
  signingSecret: "slacksim-secret-save",
  socketMode: true,
  appToken: "xapp-slacksim-save",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

/**
 * DM a user with a saved message card.
 */
/**
 * Returns a human-readable label for the source channel/DM.
 * <#C...> renders as a channel link.
 * D... = DM, G... = group DM — <#> won't resolve for these.
 */
function formatSource(channel) {
  if (!channel) return "unknown";
  if (channel.startsWith("C")) return `<#${channel}>`;       // public/private channel
  if (channel.startsWith("D")) return "a direct message";    // 1:1 DM
  if (channel.startsWith("G")) return "a group DM";          // MPIM / group DM
  return `\`${channel}\``;                                    // fallback
}

async function sendSavedMessageDM(client, { userId, text, author, channel, ts, trigger }) {
  const authorMention = author ? `<@${author}>` : "Someone";
  const quotedText = text.replace(/\n/g, "\n> ");

  console.log(`[save-bot] channel id="${channel}" → source="${formatSource(channel)}"`);

  // Fetch permalink if we have a ts — gracefully skip if the API isn't supported
  let permalink = null;
  if (channel && ts) {
    try {
      const result = await client.chat.getPermalink({ channel, message_ts: ts });
      permalink = result.permalink ?? null;
      console.log(`[save-bot] permalink=${permalink}`);
    } catch (err) {
      console.warn("[save-bot] chat.getPermalink failed — skipping:", err?.data?.error ?? err.message);
    }
  }

  const contextText = permalink
    ? `Saved from ${formatSource(channel)} · <${permalink}|View message>`
    : `Saved from ${formatSource(channel)}`;

  await client.chat.postMessage({
    channel: userId,
    text: `${trigger} You saved a message from ${authorMention}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${trigger} *You saved a message from ${authorMention}:*`,
        },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `> ${quotedText}` },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: contextText },
        ],
      },
    ],
  });
}

// ── reaction_added ────────────────────────────────────────────────────────────
// Slack sends reaction as an emoji name string e.g. "eyes", "rocket".
// event.item_user is the author of the reacted-to message.
// event.item.channel + event.item.ts identify the message — fetch text via history.

app.event("reaction_added", async ({ event, client }) => {
  console.log(`[save-bot] reaction_added: reaction="${event.reaction}" user=${event.user}`);

  if (event.reaction !== "eyes") {
    console.log(`[save-bot] ignoring "${event.reaction}" — not eyes`);
    return;
  }

  if (event.item.type !== "message") {
    console.log(`[save-bot] ignoring item type "${event.item.type}"`);
    return;
  }

  try {
    const history = await client.conversations.history({
      channel: event.item.channel,
      latest: event.item.ts,
      limit: 5,
      inclusive: true,
    });

    const message = history.messages?.find((m) => m.ts === event.item.ts)
      ?? history.messages?.[0];

    if (!message) {
      console.log("[save-bot] message not found — aborting");
      return;
    }

    await sendSavedMessageDM(client, {
      userId:  event.user,
      text:    message.text || "_No text content_",
      author:  event.item_user,
      channel: event.item.channel,
      ts:      event.item.ts,
      trigger: "👀",
    });

    console.log(`[save-bot] 👀 DM sent to ${event.user} ✅`);
  } catch (err) {
    console.error("[save-bot] reaction_added error:", err?.data ?? err);
  }
});

// ── reaction_removed ──────────────────────────────────────────────────────────

app.event("reaction_removed", async ({ event }) => {
  console.log(`[save-bot] reaction_removed: reaction="${event.reaction}" user=${event.user} channel=${event.item?.channel} ts=${event.item?.ts}`);
});

// ── pin_added ─────────────────────────────────────────────────────────────────
// event.item.message contains the full message (text, user, ts) — no API call needed.

app.event("pin_added", async ({ event, client }) => {
  const channel = event.channel_id ?? event.item?.channel;
  console.log(`[save-bot] pin_added: user=${event.user} channel=${channel}`);

  if (event.item?.type !== "message") {
    console.log(`[save-bot] ignoring pin on item type "${event.item?.type}"`);
    return;
  }

  try {
    const message = event.item.message;

    await sendSavedMessageDM(client, {
      userId:  event.user,
      text:    message.text || "_No text content_",
      author:  message.user,
      channel,
      ts:      message.ts,
      trigger: "📌",
    });

    console.log(`[save-bot] 📌 DM sent to ${event.user} ✅`);
  } catch (err) {
    console.error("[save-bot] pin_added error:", err?.data ?? err);
  }
});

// ── pin_removed ───────────────────────────────────────────────────────────────

app.event("pin_removed", async ({ event }) => {
  console.log(`[save-bot] pin_removed: user=${event.user} channel=${event.channel_id}`);
});

(async () => {
  await app.start();
  console.log("🤖 Save Bot connected to Slack Simulator");
})();
