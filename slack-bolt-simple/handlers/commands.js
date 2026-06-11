/**
 * Slash command listeners — registered via app.command()
 *
 * /echo         → reply with user text wrapped in a section block
 * /demo         → post Block Kit message with Open Form + Delete buttons
 * /viewspush    → open a two-step modal that demonstrates views.push
 * /viewsupdate  → open a modal that demonstrates views.update on select change
 */
import { buildUpdateModal } from "../modals/updateModal.js";

export function registerCommandHandlers(app) {
  // ── /echo ──────────────────────────────────────────────────────────────────

  app.command("/echo", async ({ command, ack, respond }) => {
    await ack();
    const text = command.text.trim();
    if (!text) {
      await respond("Usage: `/echo <your message>`");
      return;
    }
    await respond({
      blocks: [{ type: "section", text: { type: "mrkdwn", text } }],
    });
  });

  // ── /demo ──────────────────────────────────────────────────────────────────

  app.command("/demo", async ({ command, ack, respond }) => {
    await ack();
    await respond({
      text: "Block Kit interactivity demo",
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "✨ Block Kit Interactivity Demo" },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Triggered by:* <@${command.user_id}>\n*Command:* \`/demo\`\n_Click a button below to try Block Kit interactivity:_`,
          },
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: "*Type:*\nSlash command" },
            { type: "mrkdwn", text: "*Status:*\n✅ Interactive" },
            { type: "mrkdwn", text: `*Channel:*\n\`${command.channel_name}\`` },
            { type: "mrkdwn", text: "*Bot:*\n`Second Bot`" },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: '"Open Form" opens a modal · "Delete" posts a confirmation message.',
            },
          ],
        },
        {
          type: "actions",
          block_id: "demo_actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Open Form" },
              style: "primary",
              action_id: "open_form",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Delete" },
              style: "danger",
              action_id: "delete_item",
            },
          ],
        },
      ],
    });
  });

  // ── /viewspush ─────────────────────────────────────────────────────────────
  // The simulator doesn't send a valid trigger_id with slash commands, so we
  // post a message with a button instead — the button's block_actions payload
  // carries a fresh trigger_id that views.open/push can use.

  app.command("/viewspush", async ({ command, ack, client }) => {
    await ack();
    await client.chat.postMessage({
      channel: command.channel_id,
      text: "views.push demo",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*views.push demo* — Click the button to open Step 1. Then click *Next Step →* inside the modal to see a second modal pushed on top with a ← back chevron.",
          },
        },
        {
          type: "actions",
          block_id: "viewspush_actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Start →" },
              style: "primary",
              action_id: "open_push_demo",
            },
          ],
        },
      ],
    });
  });

  // ── /viewsupdate ───────────────────────────────────────────────────────────

  app.command("/viewsupdate", async ({ command, ack, client }) => {
    await ack();
    await client.chat.postMessage({
      channel: command.channel_id,
      text: "views.update demo",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*views.update demo* — Click the button to open a modal. Change the dropdown inside and watch the modal content update in place.",
          },
        },
        {
          type: "actions",
          block_id: "viewsupdate_actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Open Modal" },
              style: "primary",
              action_id: "open_update_demo",
            },
          ],
        },
      ],
    });
  });
}
