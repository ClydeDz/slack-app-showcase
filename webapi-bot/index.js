import { WebClient } from "@slack/web-api";

const slack = new WebClient("xoxb-slacksim-default", {
  slackApiUrl: "http://localhost:4500/api/",
});

console.log("🤖 Web API Bot is running");

const posted = await slack.chat.postMessage({
  channel: "C001", // #general in the Slack Simulator
  text: "Hey everyone! How's it going?", // Should appear in the SPA immediately
});
