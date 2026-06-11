/**
 * Shared in-memory store.
 * Used to pass the originating channel from a block_actions event
 * through to the subsequent view_submission / view_closed handler.
 *
 * Key:   view.id  (returned by views.open)
 * Value: channel ID where the triggering message lived
 */
export const channelByViewId = new Map();
