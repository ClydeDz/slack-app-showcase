/**
 * View (modal) submission and close handlers.
 *
 * form_page_1 (submission)
 *   → Validate name (required) and email (format).
 *   → On error: ack with response_action "errors" — shows inline error messages.
 *   → On success: ack with response_action "push" — pushes Page 2 on top.
 *     Page 1 data is forwarded to Page 2 via private_metadata.
 *
 * form_page_2 (submission)
 *   → Validate summary (min 10 chars).
 *   → On error: ack with response_action "errors".
 *   → On success: ack → DM the submitting user a full Block Kit summary.
 *
 * form_page_1 / form_page_2 (closed)
 *   → Log the dismissal.
 */

import { buildFormPage2, PRIORITY_OPTIONS } from "../modals/formPage2.js";
import { DEPT_OPTIONS } from "../modals/formPage1.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Basic email format check: must contain @ and a dot after it. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Read a plain_text_input value from view.state.values. */
function getInput(values, blockId, actionId) {
  return values?.[blockId]?.[actionId]?.value?.trim() ?? "";
}

/** Read a static_select value from view.state.values. */
function getSelect(values, blockId, actionId) {
  const field = values?.[blockId]?.[actionId];
  return (
    field?.selected_option?.value ??
    field?.selected_option?.text?.text ??
    field?.value ??
    ""
  );
}

/** Find the human-readable label for a value in an options array. */
function labelFor(options, value) {
  return options.find((o) => o.value === value)?.text?.text ?? value ?? "—";
}

// ── Handlers ───────────────────────────────────────────────────────────────────

export function registerViewHandlers(app) {
  // ── Page 1 submission ────────────────────────────────────────────────────────
  app.view("form_page_1", async ({ view, ack, body }) => {
    const values = view.state.values;

    const name  = getInput(values, "name_block",  "name_input");
    const email = getInput(values, "email_block",  "email_input");

    // Conditional field is only present when a department was selected
    const conditionalValue = getInput(values, "conditional_block", "conditional_input");

    // Department + channelId were stored in private_metadata (actions block value)
    let department = null;
    let channelId  = "";
    let conditionalLabel = "";
    try {
      const meta = JSON.parse(view.private_metadata ?? "{}");
      department       = meta.department ?? null;
      channelId        = meta.channelId  ?? "";
    } catch (_) {}

    // Map department value → conditional field label for the DM summary
    const deptFieldMap = {
      engineering: "GitHub Username",
      design:      "Figma File URL",
      marketing:   "Campaign Name",
      operations:  "Team Slack Channel",
    };
    conditionalLabel = department ? deptFieldMap[department] : "";

    // ── Validation ─────────────────────────────────────────────────────────────
    const errors = {};

    if (!name) {
      errors.name_block = "Full name is required.";
    }

    if (!email) {
      errors.email_block = "Work email is required.";
    } else if (!isValidEmail(email)) {
      errors.email_block = "Please enter a valid email address (e.g. jane@example.com).";
    }

    if (Object.keys(errors).length > 0) {
      // Show inline validation errors — modal stays open
      await ack({ response_action: "errors", errors });
      return;
    }

    // ── Push Page 2 on success ─────────────────────────────────────────────────
    // response_action "push" keeps Page 1 underneath; clicking Back on Page 2
    // reveals Page 1 with the user's values still intact.
    await ack({
      response_action: "push",
      view: buildFormPage2({
        channelId,
        department,
        name,
        email,
        conditionalLabel,
        conditionalValue,
      }),
    });
  });

  // ── Page 1 closed (Cancel / ✕) ────────────────────────────────────────────
  app.view(
    { callback_id: "form_page_1", type: "view_closed" },
    async ({ view, ack }) => {
      await ack();
      console.log(`[form-bot] form_page_1 dismissed (view id: ${view.id})`);
    }
  );

  // ── Page 2 submission ────────────────────────────────────────────────────────
  app.view("form_page_2", async ({ view, ack, client, body }) => {
    const values = view.state.values;

    const priority    = getSelect(values, "priority_block",    "priority_input");
    const dueDate     = getInput(values,  "due_date_block",    "due_date_input");
    const summary     = getInput(values,  "summary_block",     "summary_input");
    const description = getInput(values,  "description_block", "description_input");
    const impact      = getInput(values,  "impact_block",      "impact_input");

    // Page 1 data forwarded via private_metadata
    let page1 = {};
    try {
      page1 = JSON.parse(view.private_metadata ?? "{}");
    } catch (_) {}

    const { name, email, department, conditionalLabel, conditionalValue } = page1;

    // ── Validation ─────────────────────────────────────────────────────────────
    const errors = {};

    if (summary.length < 10) {
      errors.summary_block =
        "Summary must be at least 10 characters. Be a little more descriptive!";
    }

    if (Object.keys(errors).length > 0) {
      await ack({ response_action: "errors", errors });
      return;
    }

    // Close both modals
    await ack();

    // ── DM the submitting user a full Block Kit summary ─────────────────────
    const userId = body.user.id;

    const priorityLabel = labelFor(PRIORITY_OPTIONS, priority);
    const deptLabel     = labelFor(DEPT_OPTIONS,     department);

    const dmBlocks = [
      {
        type: "header",
        text: { type: "plain_text", text: "📋 Request Submitted" },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Here's a record of your submission. Keep this for your reference.",
        },
      },
      { type: "divider" },

      // ── Step 1 summary ───────────────────────────────────────────────────────
      {
        type: "section",
        text: { type: "mrkdwn", text: "*Step 1 — Your details*" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Full Name*\n${name || "—"}` },
          { type: "mrkdwn", text: `*Work Email*\n${email || "—"}` },
          { type: "mrkdwn", text: `*Department*\n${deptLabel || "—"}` },
          ...(conditionalLabel && conditionalValue
            ? [{ type: "mrkdwn", text: `*${conditionalLabel}*\n${conditionalValue}` }]
            : []),
        ],
      },
      { type: "divider" },

      // ── Step 2 summary ───────────────────────────────────────────────────────
      {
        type: "section",
        text: { type: "mrkdwn", text: "*Step 2 — Request details*" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Priority*\n${priorityLabel || "—"}` },
          { type: "mrkdwn", text: `*Target Date*\n${dueDate || "Not specified"}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Summary*\n${summary || "—"}` },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Description*\n${description || "—"}` },
      },
      ...(impact
        ? [
            {
              type: "section",
              text: { type: "mrkdwn", text: `*Expected Impact*\n${impact}` },
            },
          ]
        : []),
      { type: "divider" },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Submitted by <@${userId}> · Form Bot`,
          },
        ],
      },
    ];

    try {
      await client.chat.postMessage({
        channel: userId, // DM to the submitting user
        text: `Your request has been submitted: "${summary}"`,
        blocks: dmBlocks,
      });
      console.log(`[form-bot] DM sent to ${userId} ✅`);
    } catch (err) {
      console.error("[form-bot] Failed to DM user:", err?.data ?? err);
    }
  });

  // ── Page 2 closed (Back / ✕) ─────────────────────────────────────────────
  app.view(
    { callback_id: "form_page_2", type: "view_closed" },
    async ({ view, ack }) => {
      await ack();
      console.log(`[form-bot] form_page_2 dismissed (view id: ${view.id})`);
    }
  );
}
