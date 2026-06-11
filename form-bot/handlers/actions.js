/**
 * Block Actions handlers.
 *
 * open_form_modal   → opens Page 1 of the form (views.open)
 * select_department → department dropdown changed; rebuild Page 1 with the
 *                     new conditional field visible (views.update)
 */

import { buildFormPage1, DEPT_OPTIONS } from "../modals/formPage1.js";

export function registerActionHandlers(app) {
  // ── "Open Form →" button in channel ────────────────────────────────────────
  app.action("open_form_modal", async ({ ack, client, body }) => {
    await ack();

    const channelId = body.channel?.id ?? "";

    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildFormPage1(null, channelId),
    });
  });

  // ── Department dropdown changed inside Page 1 ───────────────────────────────
  // Because the select lives in an `actions` block it fires here on every change.
  // We update the modal in place to swap the conditional field.
  app.action("select_department", async ({ ack, action, client, body }) => {
    await ack();

    const department = action.selected_option?.value ?? null;

    // Recover channelId from the existing private_metadata so it survives the update
    let channelId = "";
    try {
      const meta = JSON.parse(body.view?.private_metadata ?? "{}");
      channelId = meta.channelId ?? "";
    } catch (_) {}

    await client.views.update({
      view_id: body.view.id,
      view: buildFormPage1(department, channelId),
    });
  });
}
