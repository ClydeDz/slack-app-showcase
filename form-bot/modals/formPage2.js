/**
 * Page 2 of the 2-page request form.
 *
 * Demonstrates:
 *  - static_select in an input block (priority — required)
 *  - plain_text_input (target date — optional)
 *  - plain_text_input (summary — required, validated: min 10 chars)
 *  - plain_text_input multiline (description — required)
 *  - plain_text_input multiline (expected impact — optional)
 *  - hint text on inputs
 *  - Receiving page 1 data via private_metadata
 *
 * private_metadata carries all page 1 values so the final submission
 * handler can DM the user a complete record of both pages.
 */

export const PRIORITY_OPTIONS = [
  { text: { type: "plain_text", text: "🔴 Critical" }, value: "critical" },
  { text: { type: "plain_text", text: "🟠 High" },     value: "high"     },
  { text: { type: "plain_text", text: "🟡 Medium" },   value: "medium"   },
  { text: { type: "plain_text", text: "🟢 Low" },      value: "low"      },
];

/**
 * Build the Page 2 modal definition.
 *
 * @param {object} page1Data - values collected on page 1, forwarded via private_metadata
 * @param {string} page1Data.channelId
 * @param {string} page1Data.department
 * @param {string} page1Data.name
 * @param {string} page1Data.email
 * @param {string} page1Data.conditionalValue
 * @param {string} page1Data.conditionalLabel
 */
export function buildFormPage2(page1Data) {
  return {
    type: "modal",
    callback_id: "form_page_2",
    notify_on_close: true,
    // Carry all page 1 data through to the final submit handler
    private_metadata: JSON.stringify(page1Data),
    title: { type: "plain_text", text: "New Request — 2/2" },
    submit: { type: "plain_text", text: "Submit" },
    // "Back" closes this pushed modal, revealing page 1 underneath intact
    close: { type: "plain_text", text: "Back" },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Step 2 of 2* — Request details\n_Submitting will send you a DM with the full submission record._`,
        },
      },

      // ── Required: Priority (static_select in input block) ─────────────────
      {
        type: "input",
        block_id: "priority_block",
        label: { type: "plain_text", text: "Priority" },
        hint: {
          type: "plain_text",
          text: "How urgently does this need to be addressed?",
        },
        element: {
          type: "static_select",
          action_id: "priority_input",
          placeholder: { type: "plain_text", text: "Select priority…" },
          options: PRIORITY_OPTIONS,
        },
      },

      // ── Optional: Target Date ──────────────────────────────────────────────
      {
        type: "input",
        block_id: "due_date_block",
        label: { type: "plain_text", text: "Target Date" },
        optional: true,
        hint: { type: "plain_text", text: "When do you need this by? (YYYY-MM-DD)" },
        element: {
          type: "plain_text_input",
          action_id: "due_date_input",
          placeholder: { type: "plain_text", text: "e.g. 2025-09-30" },
        },
      },

      { type: "divider" },

      // ── Required: Summary (validated: min 10 chars) ────────────────────────
      {
        type: "input",
        block_id: "summary_block",
        label: { type: "plain_text", text: "Request Summary" },
        hint: {
          type: "plain_text",
          text: "One clear sentence describing what you need. Min 10 characters — validated on submit.",
        },
        element: {
          type: "plain_text_input",
          action_id: "summary_input",
          placeholder: {
            type: "plain_text",
            text: "e.g. Update the onboarding flow for mobile users",
          },
        },
      },

      // ── Required: Description (multiline) ─────────────────────────────────
      {
        type: "input",
        block_id: "description_block",
        label: { type: "plain_text", text: "Description" },
        hint: {
          type: "plain_text",
          text: "Provide as much context as possible.",
        },
        element: {
          type: "plain_text_input",
          action_id: "description_input",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "Describe the request in detail…",
          },
        },
      },

      // ── Optional: Expected Impact (multiline) ─────────────────────────────
      {
        type: "input",
        block_id: "impact_block",
        label: { type: "plain_text", text: "Expected Impact" },
        optional: true,
        hint: { type: "plain_text", text: "Who benefits and how? (optional)" },
        element: {
          type: "plain_text_input",
          action_id: "impact_input",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "e.g. Reduces friction for ~20% of new users during sign-up…",
          },
        },
      },
    ],
  };
}
