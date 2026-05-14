// Cloudflare Worker — returns { live: boolean, ...stream info } for
// psychosaucequatch on Twitch. Caches in KV for 60 seconds.
//
// Required environment variables (encrypted secrets in dashboard):
//   TWITCH_ID      = your Twitch Client ID
//   TWITCH_SECRET  = your Twitch Client Secret
//
// Required KV namespace binding:
//   KV  → any KV namespace (used to cache responses)
//
// Route this worker at: reneramirez.dev/api/twitch-live

const TWITCH_USER  = 'psychosaucequatch';
const CACHE_KEY    = `twitch-live:${TWITCH_USER}`;
const CACHE_TTL_S  = 60;

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET',
  'content-type': 'application/json',
  'cache-control': `public, max-age=${CACHE_TTL_S}`,
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: CORS });

export default {
  async fetch(_req, env) {
    // Wrap everything so missing bindings / unexpected errors return
    // diagnostic JSON instead of a Cloudflare 1101 page.
    try {
      // ── pre-flight: make sure bindings + secrets exist ────────
      if (!env.KV || typeof env.KV.get !== 'function') {
        return json({
          live: false,
          error: 'kv-not-bound',
          hint: "On the Worker's Settings → Variables: add a KV Namespace Binding with variable name 'KV'.",
        }, 500);
      }
      if (!env.TWITCH_ID) {
        return json({
          live: false,
          error: 'env-missing',
          which: 'TWITCH_ID',
          hint: "On the Worker's Settings → Variables: add an encrypted Environment Variable 'TWITCH_ID' with your Twitch Client ID.",
        }, 500);
      }
      if (!env.TWITCH_SECRET) {
        return json({
          live: false,
          error: 'env-missing',
          which: 'TWITCH_SECRET',
          hint: "On the Worker's Settings → Variables: add an encrypted Environment Variable 'TWITCH_SECRET' with your Twitch Client Secret.",
        }, 500);
      }

      // ── 1. Cache lookup ───────────────────────────────────────
      const cached = await env.KV.get(CACHE_KEY);
      if (cached) return new Response(cached, { headers: CORS });

      // ── 2. Fetch a fresh app token ────────────────────────────
      let token;
      try {
        const tokRes = await fetch('https://id.twitch.tv/oauth2/token', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: env.TWITCH_ID,
            client_secret: env.TWITCH_SECRET,
            grant_type: 'client_credentials',
          }),
        });
        if (!tokRes.ok) {
          const detail = await tokRes.text().catch(() => '');
          return json({
            live: false,
            error: 'twitch-token-rejected',
            status: tokRes.status,
            detail: detail.slice(0, 200),
            hint: 'Twitch rejected your Client ID/Secret. Re-check the secrets — no leading/trailing whitespace.',
          }, 500);
        }
        const tokData = await tokRes.json();
        token = tokData.access_token;
        if (!token) {
          return json({
            live: false,
            error: 'twitch-token-empty',
            detail: tokData,
          }, 500);
        }
      } catch (e) {
        return json({ live: false, error: 'twitch-token-fetch', detail: String(e) }, 500);
      }

      // ── 3. Check streams endpoint ─────────────────────────────
      try {
        const streamRes = await fetch(
          `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER}`,
          {
            headers: {
              'client-id': env.TWITCH_ID,
              authorization: `Bearer ${token}`,
            },
          }
        );
        if (!streamRes.ok) {
          const detail = await streamRes.text().catch(() => '');
          return json({
            live: false,
            error: 'helix-rejected',
            status: streamRes.status,
            detail: detail.slice(0, 200),
          }, 500);
        }
        const streamData = await streamRes.json();
        const live = Array.isArray(streamData.data) && streamData.data.length > 0;
        const result = { live };
        if (live) {
          const s = streamData.data[0];
          result.title     = s.title;
          result.game      = s.game_name;
          result.viewers   = s.viewer_count;
          result.startedAt = s.started_at;
        }
        const body = JSON.stringify(result);
        await env.KV.put(CACHE_KEY, body, { expirationTtl: CACHE_TTL_S });
        return new Response(body, { headers: CORS });
      } catch (e) {
        return json({ live: false, error: 'helix-fetch', detail: String(e) }, 500);
      }
    } catch (e) {
      // Anything we didn't anticipate
      return json({ live: false, error: 'worker-exception', detail: String(e) }, 500);
    }
  },
};
