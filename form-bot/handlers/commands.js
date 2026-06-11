/**
 * Slash command handlers.
 *
 * /form  → Posts a button message to the channel.
 *          Clicking the button opens the form modal.
 *
 * Note: The simulator may not send a valid trigger_id with slash commands,
 * so we post a button first and open the modal from the button's block_actions
 * trigger_id (which is always fresh and valid).
 */

export function registerCommandHandlers(app) {
  app.command("/form", async ({ command, ack, client }) => {
    await ack();

    await client.chat.postMessage({
      channel: command.channel_id,
      text: "Open the request form",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "📋 *New Request Form*\nFill out a 2-page form demonstrating Block Kit inputs, `views.update` (conditional fields), `views.push` (multi-step), validation, and a DM summary on submit.",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Open Form →" },
              style: "primary",
              action_id: "open_form_modal",
              value: "open_form",
            },
          ],
        },
      ],
    });
  });
}
