/**
 * Page 1 of the 2-page request form.
 *
 * Demonstrates:
 *  - plain_text_input (name, email)
 *  - static_select in an actions block → fires block_actions on change
 *    so the bot can call views.update to swap in the conditional field
 *  - Conditional field: label/placeholder changes based on selected department
 *  - Required field validation (name, email format)
 *  - hint text on inputs
 *  - optional inputs
 *
 * The department select lives in an `actions` block (not `input`) so that
 * changing it fires block_actions immediately — allowing views.update to
 * swap the conditional field in real time.
 *
 * Because `actions` blocks are excluded from view.state.values, the selected
 * department is persisted via private_metadata on every views.update call.
 */

export const DEPT_OPTIONS = [
  {
    text: { type: "plain_text", text: "🛠 Engineering" },
    value: "engineering",
  },
  { text: { type: "plain_text", text: "🎨 Design" }, value: "design" },
  { text: { type: "plain_text", text: "📣 Marketing" }, value: "marketing" },
  { text: { type: "plain_text", text: "📊 Operations" }, value: "operations" },
];

/** Label + placeholder that appears for each department selection. */
const CONDITIONAL_FIELD = {
  engineering: {
    label: "GitHub Username",
    placeholder: "@octocat",
    hint: "Your GitHub handle — we'll use this to add you to the repo.",
  },
  design: {
    label: "Figma File URL",
    placeholder: "https://www.figma.com/file/…",
    hint: "Paste the share link to your Figma file.",
  },
  marketing: {
    label: "Campaign Name",
    placeholder: "e.g. Q3 Product Launch",
    hint: "The campaign this request relates to.",
  },
  operations: {
    label: "Team Slack Channel",
    placeholder: "#ops-team",
    hint: "Which channel should updates be posted to?",
  },
};

/**
 * Build the Page 1 modal definition.
 *
 * @param {string|null} department - currently selected department value, or null
 * @param {string}      channelId  - originating channel (stored in private_metadata)
 */
export function buildFormPage1(department = null, channelId = "") {
  const conditionalField = department ? CONDITIONAL_FIELD[department] : null;

  // When a department is selected: input block (value captured on submit).
  // When no department selected: context block explaining what will appear.
  const conditionalBlock = conditionalField
    ? {
        type: "input",
        block_id: "conditional_block",
        label: { type: "plain_text", text: conditionalField.label },
        optional: true,
        hint: { type: "plain_text", text: conditionalField.hint },
        element: {
          type: "plain_text_input",
          action_id: "conditional_input",
          placeholder: {
            type: "plain_text",
            text: conditionalField.placeholder,
          },
        },
      }
    : {
        type: "context",
        block_id: "conditional_block",
        elements: [
          {
            type: "mrkdwn",
            text: "💡 _Select a department above — a department-specific field will appear here._",
          },
        ],
      };

  return {
    type: "modal",
    callback_id: "form_page_1",
    notify_on_close: true,
    // Store channelId + department here — `actions` blocks aren't in state.values
    private_metadata: JSON.stringify({ channelId, department }),
    title: { type: "plain_text", text: "New Request — 1/2" },
    submit: { type: "plain_text", text: "Next →" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Step 1 of 2* — Your details\n_Fields marked as required must be filled before you can continue._",
        },
      },

      // ── Required: Full Name ────────────────────────────────────────────────
      {
        type: "input",
        block_id: "name_block",
        label: { type: "plain_text", text: "Full Name" },
        hint: { type: "plain_text", text: "First and last name." },
        element: {
          type: "plain_text_input",
          action_id: "name_input",
          placeholder: { type: "plain_text", text: "e.g. Jane Smith" },
        },
      },

      // ── Required: Work Email ───────────────────────────────────────────────
      {
        type: "input",
        block_id: "email_block",
        label: { type: "plain_text", text: "Work Email" },
        hint: {
          type: "plain_text",
          text: "Must be a valid email address — validated on submission.",
        },
        element: {
          type: "plain_text_input",
          action_id: "email_input",
          placeholder: { type: "plain_text", text: "jane@example.com" },
        },
      },

      { type: "divider" },

      // ── Department select (actions block → fires block_actions on change) ──
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Department*\nSelect your team — the field below updates accordingly.",
        },
      },
      {
        type: "actions",
        block_id: "department_block",
        elements: [
          {
            type: "static_select",
            action_id: "select_department",
            placeholder: {
              type: "plain_text",
              text: "Choose your department…",
            },
            // Restore the previously-selected option after views.update
            ...(department && {
              initial_option: DEPT_OPTIONS.find((o) => o.value === department),
            }),
            options: DEPT_OPTIONS,
          },
        ],
      },

      // ── Conditional field (swapped by views.update) ────────────────────────
      conditionalBlock,
    ],
  };
}
