/**
 * Block Actions handlers
 *
 * poll_vote  — user clicks a vote button; records/switches their vote, updates the message
 * poll_close — creator clicks Close Poll; marks poll closed, updates message with final tally
 */
import { polls } from "../store.js";
import { buildPollBlocks } from "../pollBlocks.js";

export function registerActionHandlers(app) {
  // Vote button clicked
  app.action("poll_vote", async ({ action, ack, client, body }) => {
    await ack();

    const [pollId, rawIndex] = action.value.split(":");
    const optionIndex = parseInt(rawIndex, 10);
    const userId = body.user.id;
    const poll = polls.get(pollId);

    if (!poll || !poll.open) return;

    // Remove this user's previous vote (if any) so they can switch
    for (const voters of poll.votes.values()) {
      voters.delete(userId);
    }

    // Record the new vote
    poll.votes.get(optionIndex).add(userId);

    await client.chat.update({
      channel: poll.channel,
      ts: poll.ts,
      text: `📊 Poll: ${poll.question}`,
      blocks: buildPollBlocks(poll),
    });
  });

  // Close Poll button clicked
  app.action("poll_close", async ({ action, ack, client, body }) => {
    await ack();

    const pollId = action.value;
    const poll = polls.get(pollId);

    if (!poll || !poll.open) return;

    poll.open = false;

    await client.chat.update({
      channel: poll.channel,
      ts: poll.ts,
      text: `📊 Poll closed: ${poll.question}`,
      blocks: buildPollBlocks(poll),
    });
  });
}
