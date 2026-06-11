/**
 * Message listeners
 * Registered via app.message()
 */

// "hello" → reply in channel
export function registerMessageHandlers(app) {
  app.message(/hello/i, async ({ message, say }) => {
    await say(`Hey <@${message.user}>, you said: \`${message.text}\``);
  });

  // "ghost" → ephemeral reply visible only to the sender
  app.message(/ghost/i, async ({ message, client }) => {
    await client.chat.postEphemeral({
      channel: message.channel,
      user: message.user,
      text: "👻 Boo! Only you can see this message.",
    });
  });

  // "/ping" → reply in thread
  app.message("/ping", async ({ message, say }) => {
    await say({ text: "Pong! 🏓", thread_ts: message.thread_ts || message.ts });
  });

  // "/demoblock" → post a Block Kit demo
  app.message("/demoblock", async ({ message, client }) => {
    await client.chat.postMessage({
      channel: message.channel,
      text: "Here is a Block Kit demo",
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "🧱 Block Kit Demo" },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Welcome to Block Kit!*\nThis message was triggered by `/demoblock`.\n_Rich layouts, right in the simulator._",
          },
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Status:*\n✅ All systems go" },
            { type: "mrkdwn", text: "*Environment:*\n`local simulator`" },
            { type: "mrkdwn", text: `*Triggered by:*\n<@${message.user}>` },
            { type: "mrkdwn", text: `*Channel:*\n<#${message.channel}>` },
          ],
        },
        { type: "divider" },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Buttons are visual-only for now — interactivity coming soon.",
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Approve" },
              style: "primary",
              action_id: "approve",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Reject" },
              style: "danger",
              action_id: "reject",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Dismiss" },
              action_id: "dismiss",
            },
          ],
        },
      ],
    });
  });
}
