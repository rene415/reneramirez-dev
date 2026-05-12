# reneramirez.dev

Personal site. Two modes:

- **Day** — minimalist editorial, work-facing
- **Night** — gamelike, music + photography + motorcycles, hidden depths

The toggle is the event, not a button. (Cassette flip, coming in Phase 1.)

## Stack

| Layer | Tech |
|---|---|
| Framework | Astro (static-first, islands for interactivity) |
| Future islands | Svelte |
| Styling | Tailwind + handwritten CSS for retro effects |
| Animation | GSAP |
| Audio | Howler.js |
| Server | Caddy in a single Docker container |
| Deploy | Portainer git-stack on a DMZ Docker host |
| Dynamic APIs | Cloudflare Workers + KV (Twitch live, GitHub, etc.) |
| Media | Cloudflare R2 (photo mirror) |

## Development

```bash
npm install
npm run dev      # local dev at http://localhost:4321
npm run build    # static build -> /dist
```

Don't have Node locally? Use Docker:

```bash
docker run --rm -it -p 4321:4321 -v $PWD:/app -w /app node:22-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

## Deploy

Portainer git-stack `reneramirezdev-site` watches `main`. Push to GitHub →
hit "Pull and redeploy" in Portainer (or trigger via webhook) →
container rebuilds → live.

Origin port on the host: `32779`. Reverse-proxied later by NPM at
`reneramirez.dev`, fronted by Cloudflare.

## Roadmap

- **Phase 0 — Foundation** (✓ current): repo, container, "under construction" placeholder live on local IP.
- **Phase 1 — Two-mode skeleton:** cassette toggle, both layouts wired with placeholder content.
- **Phase 2 — Day content:** real bio, project tiles, work, contact.
- **Phase 3 — Night content:** channels (Decks / Lenses / Garage / Cartridges / Lab).
- **Phase 4 — Live data via Workers:** Twitch live indicator, GitHub feed, optional now-playing.
- **Phase 5 — Weirdness:** Konami code, terminal mode, hidden routes, source-code art.

## Structure (planned)

```
src/
├── pages/
│   ├── index.astro           # switchboard (day default, night toggleable)
│   ├── 404.astro             # don't ship a default 404
│   └── api/                  # client-side fetchers for Workers
├── layouts/
│   ├── DayLayout.astro
│   └── NightLayout.astro
├── components/
│   ├── CassetteToggle.svelte
│   ├── day/                  # editorial bits
│   └── night/                # channels, terminal, easter eggs
├── styles/
│   ├── tokens.css            # shared design tokens
│   ├── day.css
│   └── night.css
└── data/
    ├── projects.ts
    └── links.ts              # platform URLs (pre-populated)

public/
├── fonts/
├── photos/                   # local fallback / curated set
└── sounds/                   # cassette click, ambient pad, UI sfx

workers/                      # Cloudflare Workers, deployed separately
```
