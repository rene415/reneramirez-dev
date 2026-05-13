# Music

Audio files live here on the host **but are not committed to git**
(see `.gitignore` — they're bind-mounted into the container at runtime
via `docker-compose.yml`).

## Add a track

1. Drop the file in this folder.
2. Open `src/data/music.ts` and add an entry:
   ```ts
   { src: m('your-file-name.wav'), title: 'Display Title', date: '2026-05-13' },
   ```
3. `git add` the data file, push, and rebuild the stack.
   The audio file itself doesn't need to be pushed.

## Format note

WAV is huge (5–50 MB per track). Browsers play them fine but visitors pay
the bandwidth on every play. To convert in one line per track:

```bash
ffmpeg -i input.wav -b:a 192k output.mp3
```

192 kbps MP3 is indistinguishable in a browser and drops files ~10×.

When you're ready, consider hosting these on Cloudflare R2 instead of the
DMZ server — same speed, less self-hosted bandwidth, free under quota.
