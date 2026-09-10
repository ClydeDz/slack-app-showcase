import pkg from "@slack/bolt";
const { App } = pkg;

const app = new App({
  token: "xoxb-slacksim-gif",
  // signingSecret: "slacksim-secret-gif",
  socketMode: true,
  appToken: "xapp-slacksim-gif",
  clientOptions: { slackApiUrl: "http://localhost:4500/api/" },
});

const GIPHY_FAVICON =
  "https://www.google.com/s2/favicons?domain=giphy.com&sz=32";

/**
 * Extract a Giphy GIF ID from a giphy.com URL.
 *
 * Handles these shapes:
 *   https://giphy.com/gifs/some-slug-GIFID       → last hyphen-separated segment
 *   https://giphy.com/gifs/GIFID
 *   https://media.giphy.com/media/GIFID/giphy.gif
 *   https://media0.giphy.com/media/GIFID/giphy.gif
 */
function extractGifId(url) {
  // media.giphy.com/media/GIFID/...
  const mediaMatch = url.match(/media\d*\.giphy\.com\/media\/([a-zA-Z0-9]+)/);
  if (mediaMatch) return mediaMatch[1];

  // giphy.com/gifs/some-slug-GIFID
  // The GIF ID is always the LAST hyphen-separated segment of the path slug.
  const gifsMatch = url.match(/giphy\.com\/gifs\/([^/?#]+)/);
  if (gifsMatch) {
    const parts = gifsMatch[1].split("-");
    return parts[parts.length - 1]; // e.g. "lP4jmO461gq9uLzzYc"
  }

  return null;
}

function buildGifMediaUrl(gifId) {
  return `https://media.giphy.com/media/${gifId}/giphy.gif`;
}

// ── link_shared ───────────────────────────────────────────────────────────────
// Fired when a giphy.com URL is posted in a channel this bot is in.
// We call chat.unfurl with a custom Block Kit preview for each link.

app.event("link_shared", async ({ event, client }) => {
  console.log(
    `[gif-bot] link_shared in ${event.channel}, ${event.links?.length} link(s)`,
  );

  const unfurls = {};

  for (const link of event.links ?? []) {
    if (!link.url.includes("giphy.com")) continue;

    const gifId = extractGifId(link.url);
    console.log(`[gif-bot] url=${link.url} → gifId=${gifId}`);

    if (!gifId) {
      console.warn(
        `[gif-bot] could not extract GIF ID from ${link.url} — skipping`,
      );
      continue;
    }

    const mediaUrl = buildGifMediaUrl(gifId);

    unfurls[link.url] = {
      blocks: [
        {
          type: "image",
          image_url: mediaUrl,
          alt_text: "GIF from Giphy",
        },
        {
          type: "context",
          elements: [
            {
              type: "image",
              image_url: GIPHY_FAVICON,
              alt_text: "Giphy favicon",
            },
            {
              type: "mrkdwn",
              text: "Powered by GIF Bot",
            },
          ],
        },
      ],
    };
  }

  if (Object.keys(unfurls).length === 0) {
    console.log("[gif-bot] no unfurlable links found — skipping");
    return;
  }

  try {
    await client.chat.unfurl({
      channel: event.channel,
      ts: event.message_ts,
      unfurls,
    });
    console.log(`[gif-bot] unfurled ${Object.keys(unfurls).length} link(s) ✅`);
  } catch (err) {
    console.error("[gif-bot] chat.unfurl error:", err?.data ?? err);
  }
});

(async () => {
  await app.start();
  console.log("🤖 GIF Bot is running");
})();
