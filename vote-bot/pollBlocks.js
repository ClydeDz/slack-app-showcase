/**
 * Builds the Block Kit blocks for a poll message.
 * Called both when first posting and when updating after a vote / close.
 */
export function buildPollBlocks(poll) {
  // Tally line per option
  const tallyLines = poll.options.map((opt, i) => {
    const count = poll.votes.get(i)?.size ?? 0;
    const bar = count > 0 ? "█".repeat(count) + " " : "";
    return `${bar}*${opt}* — ${count} vote${count !== 1 ? "s" : ""}`;
  });

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "📊 Poll" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*${poll.question}*` },
    },
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: tallyLines.join("\n") },
    },
  ];

  if (poll.open) {
    // One vote button per option + a Close Poll button
    blocks.push({
      type: "actions",
      block_id: `poll_actions_${poll.id}`,
      elements: [
        ...poll.options.map((opt, i) => ({
          type: "button",
          text: { type: "plain_text", text: opt },
          action_id: "poll_vote",
          value: `${poll.id}:${i}`,
        })),
        {
          type: "button",
          text: { type: "plain_text", text: "Close Poll 🔒" },
          action_id: "poll_close",
          style: "danger",
          value: poll.id,
        },
      ],
    });
  } else {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: "🔒 This poll is now closed." }],
    });
  }

  return blocks;
}
