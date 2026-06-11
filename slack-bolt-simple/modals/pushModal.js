/**
 * Modals for the /viewspush command — demonstrates views.push.
 *
 * PUSH_MODAL_STEP_1  — opened first via views.open
 * PUSH_MODAL_STEP_2  — pushed on top via views.push when "Next Step" is clicked
 *                      The simulator will show a ← back chevron in the header.
 */

export const PUSH_MODAL_STEP_1 = {
  type: "modal",
  callback_id: "push_modal_step_1",
  notify_on_close: true,
  title: { type: "plain_text", text: "Step 1 of 2" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome to the views.push demo!*\n\nThis is the first modal. Click *Next Step →* below and a second modal will be pushed on top — you'll see the ← back chevron appear in the header.",
      },
    },
    { type: "divider" },
    {
      type: "actions",
      block_id: "push_step_1_actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Next Step →" },
          style: "primary",
          action_id: "push_next_step",
        },
      ],
    },
  ],
};

export const PUSH_MODAL_STEP_2 = {
  type: "modal",
  callback_id: "push_modal_step_2",
  notify_on_close: true,
  title: { type: "plain_text", text: "Step 2 of 2" },
  submit: { type: "plain_text", text: "Done" },
  close: { type: "plain_text", text: "Back" },
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "✅ *You've reached Step 2!*\n\nThis modal was pushed on top of Step 1 using `views.push`. Notice the ← back chevron in the header — clicking it returns to Step 1.",
      },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: "Click *Done* to close both modals, or ← to go back." },
      ],
    },
  ],
};
