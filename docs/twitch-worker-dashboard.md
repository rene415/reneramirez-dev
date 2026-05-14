# Twitch live Worker — Cloudflare dashboard walkthrough

A step-by-step for setting up the live detector via the Cloudflare web UI.
~15 minutes start to finish. No CLI required.

## What you'll end up with

- `https://reneramirez.dev/api/twitch-live` → a Cloudflare Worker that
  asks Twitch every minute (cached) whether `psychosaucequatch` is live.
- When live, the Decks channel on the night side swaps from the music
  page to the Twitch stream embed, and the local music pauses.

## Step 1 — Twitch app

1. Open <https://dev.twitch.tv/console> and sign in with your Twitch
   account.
2. Top right: **"Register Your Application"**.
3. Fill out:
   - **Name**: `reneramirez-dev live indicator` (or anything)
   - **OAuth Redirect URLs**: `http://localhost` *(required, we never use it)*
   - **Category**: `Application Integration`
   - **Client Type**: `Confidential`
4. Click **Create**.
5. On the app's page you'll see **Client ID** at the top — copy it.
6. Below: **New Secret** button → click → confirm. You'll see the
   **Client Secret**. **Copy it now — it's only shown once.**

Keep both values in a sticky note / password manager — we'll paste them
into Cloudflare in step 5.

## Step 2 — Find Workers in the Cloudflare dashboard

1. Open <https://dash.cloudflare.com>.
2. Look at the **left sidebar**. You're looking for one of these,
   depending on how recently Cloudflare reshuffled their UI:
   - **"Workers & Pages"** (most common)
   - **"Compute (Workers)"**
   - **"Compute"** → "Workers"
3. Click it. You'll land on a list of your Workers + Pages. Probably
   empty if you haven't used them before.

## Step 3 — Create the Worker

1. Click **"Create"** (top right) → choose **"Workers"** (not Pages).
2. You'll get one of two flows:
   - **"Hello World"** template flow: click **"Hello World"** →
     **"Deploy"**. It creates a stock worker and deploys it.
   - **Start from scratch** flow: pick **"Start from a template" →
     "Hello World"** or **"Get started"**.
3. **Name** it: `twitch-live`
4. Click **Deploy**.
5. After deploy you'll see "Successfully deployed" and the worker's
   URL: `https://twitch-live.<your-account>.workers.dev` — click it
   to confirm it returns "Hello World!"

## Step 4 — Replace the code

1. On the worker page, click **"Edit code"** (or **"Quick edit"** —
   depending on the UI version. Both open the inline editor).
2. **Delete everything** in the editor on the left side.
3. **Paste** the contents of `workers/twitch-live/src/index.js` from
   this repo.
4. Click **"Save and deploy"** (or just "Deploy" — top right of the
   editor).
5. The worker is now deployed but will return
   `{"live":false,"error":"token"}` because we haven't added the
   Twitch secrets yet. That's expected — we'll fix it in step 6.

## Step 5 — Create a KV namespace

KV is Cloudflare's tiny key/value store. The worker uses it to cache
the Twitch response for 60 s so we don't hammer the API.

1. Back to the **left sidebar** → **"Workers & Pages"**.
2. In the submenu (or at the top of the page) find **"KV"**.
   If you don't see it directly, look under **"Storage & Databases"**
   (Cloudflare moved KV in late 2024).
3. Click **"Create a namespace"** (or **"Create namespace"**).
4. Name: `TWITCH_LIVE_CACHE`. Click **"Add"** / **"Create"**.
5. You'll see it listed. We don't need to do anything inside it.

## Step 6 — Bind KV + add secrets on the Worker

Back to your `twitch-live` worker.

1. Click **"Settings"** (top tab on the Worker page).
2. Look for a section called **"Variables"** or **"Bindings"**
   (renamed in late 2024 — should be the same place).

### Bind the KV namespace

3. Inside Variables/Bindings, find the **"KV Namespace Bindings"**
   subsection.
4. Click **"Add binding"**.
5. **Variable name**: `KV` *(this must match exactly — the code reads
   `env.KV`)*
6. **KV namespace**: choose `TWITCH_LIVE_CACHE` from the dropdown.
7. **Save**.

### Add the Twitch secrets

8. In the same Variables area, find **"Environment Variables"** (or
   **"Plain text variables"** / **"Secrets"** depending on UI).
9. Click **"Add variable"**:
   - **Variable name**: `TWITCH_ID`
   - **Value**: paste the **Client ID** from step 1.
   - **Type / encrypt**: choose **"Encrypt"** or toggle the "Encrypt"
     padlock so it's stored as a secret rather than plain text.
10. Click **"Add variable"** again:
    - **Variable name**: `TWITCH_SECRET`
    - **Value**: paste the **Client Secret** from step 1.
    - **Encrypt**: ON.
11. **Save and deploy** (button at the bottom; you may need to click
    "Deploy" again on the worker after changing variables).

### Quick sanity check

Visit your worker's `*.workers.dev` URL again. You should now see:
```json
{"live":false}
```
(or `true` with details if you happen to be streaming right now).

If you still see `{"error":"token"}`, double-check that `TWITCH_ID`
and `TWITCH_SECRET` are spelled exactly right and have no leading/
trailing spaces.

## Step 7 — Route the Worker on your domain

Right now the Worker is reachable at the workers.dev URL but not at
`reneramirez.dev`. Let's fix that.

1. **Left sidebar** → **"Websites"** (or your account's home with the
   list of zones) → click **`reneramirez.dev`**.
2. In the zone sidebar, find **"Workers Routes"** (not "Workers & Pages"
   — Workers Routes is a per-zone setting). Sometimes listed under
   **"Compute" → "Workers Routes"**, or under **"Rules"**.
3. Click **"Add route"**.
4. Fill out:
   - **Route**: `reneramirez.dev/api/twitch-live`
   - **Worker**: choose `twitch-live` from the dropdown.
5. **Save**.

Test it:
```bash
curl https://reneramirez.dev/api/twitch-live
# expected: {"live":false}
```

If it still hits a Cloudflare error page, give it 1–2 minutes for
Cloudflare's edge to pick up the new route, then retry.

## Step 8 — Watch it work on the site

1. Open <https://reneramirez.dev>.
2. Flip the cassette → land in Night.
3. Press **`1`** to make sure you're on the Decks channel.
4. Open Twitch in another tab and **start streaming on
   `psychosaucequatch`**.
5. Wait up to 60 s for the cache to expire.
6. The site should show a red "LIVE on Twitch" pill, embed the player,
   and pause whatever music was playing.
7. End the stream → after another 60 s the music page returns and a
   random Decks track resumes.

## Troubleshooting

- **`{"live":false,"error":"token"}`** — secrets aren't set right.
  Re-paste `TWITCH_ID` and `TWITCH_SECRET` exactly, no whitespace.
- **Worker returns 1101 / Cloudflare error page** — the route hasn't
  propagated yet. Wait a minute and retry.
- **Stream embed shows "this content cannot be played"** — the
  `parent=` value in the iframe URL must be `reneramirez.dev`. The
  code hard-codes it; only an issue if you're testing from
  `localhost` or the local server IP.
- **Live state shows but music doesn't pause** — clear the KV cache
  (delete the `twitch-live:psychosaucequatch` key in the namespace
  via the dashboard) so the next request is fresh; the site itself
  polls every 60 s so just wait a beat.
