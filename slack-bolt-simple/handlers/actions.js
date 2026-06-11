/**
 * Block Actions handlers — registered via app.action()
 *
 * open_form       → opens the demo form modal (views.open)
 * delete_item     → posts a "delete clicked" message to the channel
 * push_next_step  → pushes Step 2 modal on top of Step 1 (views.push)
 * select_category → updates the open modal in place (views.update)
 */
import { channelByViewId } from "../store.js";
import { DEMO_MODAL } from "../modals/demoModal.js";
import { PUSH_MODAL_STEP_1, PUSH_MODAL_STEP_2 } from "../modals/pushModal.js";
import { buildUpdateModal } from "../modals/updateModal.js";

export function registerActionHandlers(app) {
  // ── /demo ──────────────────────────────────────────────────────────────────

  app.action("open_form", async ({ ack, client, body }) => {
    await ack();
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: DEMO_MODAL,
    });
    if (body.channel?.id && result.view?.id) {
      channelByViewId.set(result.view.id, body.channel.id);
    }
  });

  app.action("delete_item", async ({ ack, client, body }) => {
    await ack();
    if (body.channel?.id) {
      await client.chat.postMessage({
        channel: body.channel.id,
        text: `🗑️ Delete clicked by <@${body.user.id}>`,
      });
    }
  });

  // ── /viewspush ─────────────────────────────────────────────────────────────

  // "Start →" button in channel — open Step 1 modal
  app.action("open_push_demo", async ({ ack, client, body }) => {
    await ack();
    await client.views.open({
      trigger_id: body.trigger_id,
      view: PUSH_MODAL_STEP_1,
    });
  });

  // "Next Step →" button inside Step 1 modal — push Step 2 on top
  app.action("push_next_step", async ({ ack, client, body }) => {
    await ack();
    await client.views.push({
      trigger_id: body.trigger_id,
      view: PUSH_MODAL_STEP_2,
    });
  });

  // ── /viewsupdate ───────────────────────────────────────────────────────────

  // "Open Modal" button in channel — open the update demo modal
  app.action("open_update_demo", async ({ ack, client, body }) => {
    await ack();
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildUpdateModal(),
    });
  });

  // Category dropdown changed inside modal — update the modal in place
  app.action("select_category", async ({ ack, action, client, body }) => {
    await ack();
    const selected = action.selected_option?.value;
    await client.views.update({
      view_id: body.view.id,
      view: buildUpdateModal(selected),
    });
  });
}
