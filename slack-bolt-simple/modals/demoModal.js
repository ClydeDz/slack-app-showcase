/**
 * Modal for /demo → "Open Form" button.
 * Collects name, topic (select), and optional notes.
 */
export const DEMO_MODAL = {
  type: "modal",
  callback_id: "demo_modal",
  notify_on_close: true,
  title: { type: "plain_text", text: "Submit Details" },
  submit: { type: "plain_text", text: "Submit" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "input",
      block_id: "name_block",
      label: { type: "plain_text", text: "Your name" },
      element: {
        type: "plain_text_input",
        action_id: "name_input",
        placeholder: { type: "plain_text", text: "e.g. Jane Smith" },
      },
    },
    {
      type: "input",
      block_id: "topic_block",
      label: { type: "plain_text", text: "Topic" },
      element: {
        type: "static_select",
        action_id: "topic",
        placeholder: { type: "plain_text", text: "Select a topic" },
        options: [
          { text: { type: "plain_text", text: "Bug Report" },     value: "bug_report"      },
          { text: { type: "plain_text", text: "Feature Request" }, value: "feature_request" },
          { text: { type: "plain_text", text: "General" },         value: "general"         },
        ],
      },
    },
    {
      type: "input",
      block_id: "notes_block",
      label: { type: "plain_text", text: "Notes" },
      optional: true,
      element: {
        type: "plain_text_input",
        action_id: "notes_input",
        multiline: true,
      },
    },
  ],
};
