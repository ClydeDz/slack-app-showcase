/**
 * View (modal) event handlers
 * Registered via app.view()
 *
 * demo_modal (submission) → validate name field; on success post a summary to the channel
 * demo_modal (closed)     → log dismissal and optionally notify the channel
 */
import { channelByViewId } from "../store.js";

export function registerViewHandlers(app) {
  // view_submission — user clicked Submit
  app.view("demo_modal", async ({ view, ack, client }) => {
    const values = view.state.values;
    const name = values?.name_block?.name_input?.value?.trim();
    const notes = values?.notes_block?.notes_input?.value?.trim() || "none";

    // Debug: log the raw topic field so we can see exactly what the simulator returns
    console.log("[views] topic_block raw:", JSON.stringify(values?.topic_block, null, 2));

    const topicField = values?.topic_block?.topic;
    const topic =
      topicField?.selected_option?.text?.text   // standard Slack shape
      ?? topicField?.selected_option?.value      // fallback: use value string
      ?? topicField?.value                       // some simulators flatten it here
      ?? "none";

    // Validate: name is required
    if (!name) {
      await ack({
        response_action: "errors",
        errors: { name_block: "Name is required" },
      });
      return;
    }

    // Ack with no response action — closes the modal
    await ack();

    // Post the result back to the originating channel
    const channel = channelByViewId.get(view.id);
    channelByViewId.delete(view.id); // clean up

    if (channel) {
      await client.chat.postMessage({
        channel,
        text: `Form submitted! Name: ${name}, Topic: ${topic}, Notes: ${notes}`,
      });
    }
  });

  // view_submission for push demo Step 2 — just ack to close the modal
  app.view("push_modal_step_2", async ({ ack }) => {
    await ack();
  });

  // view_closed — user clicked Cancel / dismissed the modal
  app.view(
    { callback_id: "demo_modal", type: "view_closed" },
    async ({ view, ack, client }) => {
      await ack();
      console.log(`[views] demo_modal dismissed (view id: ${view.id})`);

      const channel = channelByViewId.get(view.id);
      channelByViewId.delete(view.id); // clean up

      if (channel) {
        await client.chat.postMessage({
          channel,
          text: "Modal was dismissed.",
        });
      }
    }
  );
}
