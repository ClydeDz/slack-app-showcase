/**
 * Event listeners
 * Registered via app.event()
 */

// app_mention → reply in thread + DM the user
export function registerEventHandlers(app) {
  app.event("app_mention", async ({ event, say, client }) => {
    // Reply in the thread where the mention happened
    await say({
      text: `Yes, <@${event.user}>? You mentioned me! 👋`,
      thread_ts: event.ts,
    });

    // Also send a DM to the user who mentioned the bot
    await client.chat.postMessage({
      channel: event.user,
      text: `Hey! You just mentioned me in <#${event.channel}>. Need something? 😊`,
    });
  });
}
