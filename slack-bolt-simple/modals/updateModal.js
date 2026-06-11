/**
 * Modal for the /viewsupdate command — demonstrates views.update.
 *
 * buildUpdateModal(selected) returns a fresh modal definition.
 * Called both on open (selected = null) and on every select change,
 * so the bot can call views.update to refresh the content in place.
 */

const CATEGORY_DETAILS = {
  design: {
    label: "🎨 Design",
    description: "UI/UX work, mockups, design system tokens, Figma reviews.",
  },
  engineering: {
    label: "⚙️ Engineering",
    description: "Code, architecture, PRs, infra, and technical debt.",
  },
  marketing: {
    label: "📣 Marketing",
    description: "Campaigns, copy, brand guidelines, and launch plans.",
  },
};

const CATEGORY_OPTIONS = [
  { text: { type: "plain_text", text: "🎨 Design" },      value: "design"      },
  { text: { type: "plain_text", text: "⚙️ Engineering" }, value: "engineering" },
  { text: { type: "plain_text", text: "📣 Marketing" },   value: "marketing"   },
];

export function buildUpdateModal(selected = null) {
  const detail = selected ? CATEGORY_DETAILS[selected] : null;

  const previewBlock = detail
    ? {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${detail.label}*\n${detail.description}`,
        },
      }
    : {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_Select a category above to see details here. The modal will update in place using `views.update`._",
        },
      };

  return {
    type: "modal",
    callback_id: "update_modal",
    notify_on_close: true,
    title: { type: "plain_text", text: "Live Modal Update" },
    close: { type: "plain_text", text: "Close" },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*views.update demo*\nChange the dropdown — the modal content below refreshes instantly without closing.",
        },
      },
      { type: "divider" },
      {
        // actions block (not input) so selection fires block_actions immediately
        type: "actions",
        block_id: "update_category_block",
        elements: [
          {
            type: "static_select",
            action_id: "select_category",
            placeholder: { type: "plain_text", text: "Choose a category…" },
            ...(selected && { initial_option: CATEGORY_OPTIONS.find((o) => o.value === selected) }),
            options: CATEGORY_OPTIONS,
          },
        ],
      },
      { type: "divider" },
      previewBlock,
    ],
  };
}
