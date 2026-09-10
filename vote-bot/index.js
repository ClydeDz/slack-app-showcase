import pkg from "@slack/bolt";
import { registerMessageHandlers } from "./handlers/messages.js";
import { registerEventHandlers } from "./handlers/events.js";
import { registerCommandHandlers } from "./handlers/commands.js";
import { registerActionHandlers } from "./handlers/actions.js";
import { registerViewHandlers } from "./handlers/views.js";

const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-vote",
  // signingSecret: "slacksim-secret-vote",
  socketMode: true,
  appToken: "xapp-slacksim-vote",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

registerMessageHandlers(app);
registerEventHandlers(app);
registerCommandHandlers(app);
registerActionHandlers(app);
registerViewHandlers(app);

(async () => {
  await app.start();
  console.log("🤖 Vote Bot is running");
})();
