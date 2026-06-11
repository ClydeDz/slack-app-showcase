/**
 * Slash command: /vote
 *
 * Usage: /vote "Question?" "Option A" "Option B" "Option C"
 * Parses quoted strings, creates a poll in the store, and posts it to the channel.
 */
import { polls, nextPollId } from "../store.js";
import { buildPollBlocks } from "../pollBlocks.js";

/** Extract all "quoted strings" from the command text. */
function parseQuotedArgs(text) {
  const matches = [];
  const re = /"([^"]+)"/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

export function registerCommandHandlers(app) {
  app.command("/vote", async ({ command, ack, respond, client }) => {
    await ack();

    const args = parseQuotedArgs(command.text);

    if (args.length < 3) {
      await respond(
        'Usage: `/vote "Question?" "Option A" "Option B" ...`\nYou need a question and at least 2 options.',
      );
      return;
    }

    const [question, ...options] = args;

    const poll = {
      id: nextPollId(),
      question,
      options,
      votes: new Map(options.map((_, i) => [i, new Set()])),
      channel: command.channel_id,
      ts: null,
      open: true,
    };

    polls.set(poll.id, poll);

    // Post the poll message and capture the ts for future chat.update calls
    const result = await client.chat.postMessage({
      channel: poll.channel,
      text: `📊 Poll: ${question}`,
      blocks: buildPollBlocks(poll),
    });

    poll.ts = result.ts;
  });
}
