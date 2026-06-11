/**
 * In-memory poll store.
 *
 * Poll shape:
 * {
 *   id:       string,
 *   question: string,
 *   options:  string[],
 *   votes:    Map<number, Set<string>>,  // optionIndex → set of userIds (prevents duplicates)
 *   channel:  string,                   // channel the poll was posted in
 *   ts:       string,                   // message ts needed for chat.update
 *   open:     boolean,
 * }
 */
export const polls = new Map(); // pollId → poll

let _seq = 0;
export function nextPollId() {
  return `poll_${Date.now()}_${++_seq}`;
}
