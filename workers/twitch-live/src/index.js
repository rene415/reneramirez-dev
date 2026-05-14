// Cloudflare Worker — returns { live: boolean, ...stream info } for
// psychosaucequatch on Twitch. Caches in KV for 60 seconds.
//
// Required environment variables (set as encrypted secrets in dashboard):
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

export default {
  async fetch(_req, env) {
    // 1. Cache lookup
    const cached = await env.KV.get(CACHE_KEY);
    if (cached) return new Response(cached, { headers: CORS });

    // 2. Get a fresh app token (client credentials flow)
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
      const tokData = await tokRes.json();
      token = tokData.access_token;
      if (!token) throw new Error('token missing');
    } catch (_) {
      return new Response(JSON.stringify({ live: false, error: 'token' }), { headers: CORS });
    }

    // 3. Check the streams endpoint
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
      const streamData = await streamRes.json();
      const live = Array.isArray(streamData.data) && streamData.data.length > 0;
      const result = { live };
      if (live) {
        const s = streamData.data[0];
        result.title    = s.title;
        result.game     = s.game_name;
        result.viewers  = s.viewer_count;
        result.startedAt = s.started_at;
      }
      const body = JSON.stringify(result);
      await env.KV.put(CACHE_KEY, body, { expirationTtl: CACHE_TTL_S });
      return new Response(body, { headers: CORS });
    } catch (_) {
      return new Response(JSON.stringify({ live: false, error: 'helix' }), { headers: CORS });
    }
  },
};
