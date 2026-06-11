import pkg from "@slack/bolt";
const { App } = pkg;

import { registerCommandHandlers } from "./handlers/commands.js";
import { registerActionHandlers }  from "./handlers/actions.js";
import { registerViewHandlers }    from "./handlers/views.js";

const app = new App({
  token:         "xoxb-slacksim-form",
  signingSecret: "slacksim-secret-form",
  socketMode:    true,
  appToken:      "xapp-slacksim-form",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

registerCommandHandlers(app);
registerActionHandlers(app);
registerViewHandlers(app);

(async () => {
  await app.start();
  console.log("📋 Form Bot connected to Slack Simulator");
})();
