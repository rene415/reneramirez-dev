# twitch-live Worker

Cloudflare Worker that returns `{ live: boolean }` for the Twitch user
`psychosaucequatch`. Routed at `reneramirez.dev/api/twitch-live`.

When the site detects a `live: true` response, the Decks channel
swaps from the music page to a Twitch player embed.

## Deploy (dashboard path)

See `../../docs/twitch-worker-dashboard.md` for the full walkthrough.
TL;DR:

1. Register a Twitch app at https://dev.twitch.tv/console
2. Create a Cloudflare Worker named `twitch-live`, paste `src/index.js`
3. Create a KV namespace, bind it as `KV` on the Worker
4. Add `TWITCH_ID` + `TWITCH_SECRET` as encrypted environment variables
5. Add a route: `reneramirez.dev/api/twitch-live` → this Worker

## Deploy (CLI path)

```bash
cd workers/twitch-live
npx wrangler login                                    # one-time
npx wrangler kv namespace create TWITCH_LIVE_CACHE    # copy the id into wrangler.toml
npx wrangler secret put TWITCH_ID                     # paste your Client ID
npx wrangler secret put TWITCH_SECRET                 # paste your Client Secret
npx wrangler deploy
```

## Test

```bash
curl https://reneramirez.dev/api/twitch-live
# {"live":false}
# or when live:
# {"live":true,"title":"...","game":"...","viewers":5,"startedAt":"..."}
```
