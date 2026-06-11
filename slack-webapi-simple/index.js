import { WebClient } from "@slack/web-api";

const slack = new WebClient("xoxb-slacksim-default", {
  slackApiUrl: "http://localhost:4500/api/",
});

console.log("🤖 slack-webapi-simple started");

// Should appear in the SPA immediately
const posted = await slack.chat.postMessage({
  channel: "C001", // #general
  text: "Hey everyone! How's it going?",
});

// Add a reaction to the message we just posted
// await slack.reactions.add({
//   channel: "C001",
//   name: "👍",
//   timestamp: posted.ts,
// });

// Find the seeded "First thread test" message and reply into its thread
// const history = await slack.conversations.history({ channel: "C001" });
// const threadParent = history.messages.find((m) =>
//   m.text.startsWith("First thread test"),
// );

// await slack.chat.postMessage({
//   channel: "C001",
//   text: "This is a thread reply!",
//   thread_ts: threadParent.ts,
// });

// List channels — should return general, random, dev
// const result = await slack.conversations.list();
// console.log(result.channels);
