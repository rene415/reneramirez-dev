<script>
  // Vintage browser-window wrapper around an iframe. Chrome has macOS-style
  // traffic-light dots, a fake URL bar showing the host, and a refresh
  // button that re-loads the iframe content.

  export let src = 'https://madm3x.com';
  export let displayUrl = 'madm3x.com';

  let key = 0;  // bumping this with {#key} forces iframe re-mount
  function refresh() { key++; }
</script>

<div class="bw">
  <div class="chrome">
    <div class="dots" aria-hidden="true">
      <span class="dot red"></span>
      <span class="dot yellow"></span>
      <span class="dot green"></span>
    </div>
    <a
      class="url"
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${displayUrl} in a new tab`}
    >
      <span class="lock" aria-hidden="true">🔒</span>
      <span class="scheme">https://</span><span class="host">{displayUrl}</span>
      <span class="open-hint" aria-hidden="true">↗</span>
    </a>
    <button class="refresh" on:click={refresh} aria-label="Refresh" title="Refresh">↻</button>
  </div>
  <div class="screen">
    {#key key}
      <iframe
        {src}
        loading="lazy"
        title="MADM3X gallery"
        referrerpolicy="no-referrer"
      ></iframe>
    {/key}
    <div class="scanlines" aria-hidden="true"></div>
    <div class="glow-edge" aria-hidden="true"></div>
  </div>
  <a class="go-to-site" href={src} target="_blank" rel="noopener noreferrer">
    <span class="go-label">go to site</span>
    <span class="go-host">{displayUrl}</span>
    <span class="go-arrow" aria-hidden="true">↗</span>
  </a>
</div>

<style>
  .bw {
    /* Fills the parent container — caller is responsible for width
       (Night/Lenses uses .channel.wide; Day/SelectedWork uses .container). */
    width: 100%;
    margin-top: 1.5rem;
    border-radius: 10px;
    overflow: hidden;
    /* Theme-aware: cream chrome on Day, deep purple on Night. */
    background: var(--bg);
    border: 1px solid var(--accent);
    box-shadow:
      0 0 0 1px rgba(var(--accent-rgb), 0.18),
      0 14px 50px rgba(0, 0, 0, 0.4),
      0 0 80px rgba(var(--accent-rgb), 0.18);
  }

  /* ── chrome ─────────────────────────────────────────────── */
  .chrome {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.6rem 0.9rem;
    /* Subtle accent tint at the top fading to bg — works in both themes. */
    background: linear-gradient(180deg,
      color-mix(in oklab, var(--bg), var(--fg) 5%) 0%,
      color-mix(in oklab, var(--bg), var(--fg) 2%) 100%);
    border-bottom: 1px solid rgba(var(--accent-rgb), 0.25);
  }
  .dots { display: flex; gap: 0.45rem; }
  .dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    display: inline-block;
    box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.25);
  }
  .dot.red    { background: linear-gradient(135deg, #ff7a72, #ff5e58); }
  .dot.yellow { background: linear-gradient(135deg, #ffcf52, #ffbd2e); }
  .dot.green  { background: linear-gradient(135deg, #4fdb6a, #28ca42); }

  .url {
    flex: 1;
    display: inline-flex; align-items: center; gap: 0.45rem;
    padding: 0.28rem 0.8rem;
    background: color-mix(in oklab, var(--bg), var(--fg) 3%);
    border: 1px solid rgba(var(--accent-rgb), 0.18);
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--muted);
    text-decoration: none;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
  }
  .url:hover {
    color: var(--fg);
    background: rgba(var(--accent-rgb), 0.08);
    border-color: var(--accent);
  }
  .url:hover .open-hint { opacity: 1; transform: translate(2px, -2px); }
  .url:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .url .lock   { font-size: 0.72rem; line-height: 1; }
  .url .scheme { color: var(--muted); }
  .url .host   { color: var(--fg); }
  .url .open-hint {
    margin-left: auto;
    color: var(--accent);
    font-size: 0.78rem;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.25s cubic-bezier(.2,.85,.4,1);
  }

  .refresh {
    background: transparent;
    border: 1px solid var(--line);
    color: var(--muted);
    width: 28px; height: 28px;
    border-radius: 50%;
    font-size: 1.05rem;
    line-height: 1;
    cursor: pointer;
    display: grid; place-items: center;
    transition: color 0.2s ease, border-color 0.2s ease, transform 0.4s cubic-bezier(.2,.85,.4,1);
  }
  .refresh:hover {
    color: var(--accent);
    border-color: var(--accent);
    transform: rotate(-180deg);
  }

  /* ── iframe screen ─────────────────────────────────────── */
  .screen {
    position: relative;
    width: 100%;
    /* Taller now that the frame is wider — feels more like an
       actual browser window, less like a phone preview. */
    height: min(75vh, 800px);
    background: #ffffff;
  }
  iframe {
    width: 100%; height: 100%;
    border: 0; display: block;
    color-scheme: light;  /* iframe document picks its own theme */
  }
  /* subtle CRT scanlines overlaid on top, so the embedded site reads
     as 'on screen' inside our dark UI */
  .scanlines {
    position: absolute; inset: 0;
    pointer-events: none;
    background-image: repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 2px,
      rgba(0, 0, 0, 0.05) 2px,
      rgba(0, 0, 0, 0.05) 3px
    );
    mix-blend-mode: multiply;
  }
  .glow-edge {
    position: absolute; inset: 0;
    pointer-events: none;
    box-shadow: inset 0 0 36px rgba(var(--accent-rgb), 0.18);
  }

  /* ── go-to-site button beneath the frame ───────────────── */
  .go-to-site {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    padding: 0.85rem 1.1rem;
    background: linear-gradient(180deg,
      color-mix(in oklab, var(--bg), var(--fg) 5%) 0%,
      color-mix(in oklab, var(--bg), var(--fg) 2%) 100%);
    border-top: 1px solid rgba(var(--accent-rgb), 0.25);
    color: var(--muted);
    text-decoration: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.92rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    transition: background 0.25s ease, color 0.2s ease, letter-spacing 0.3s ease;
  }
  .go-to-site:hover {
    color: var(--fg);
    background: linear-gradient(180deg,
      color-mix(in oklab, var(--bg), var(--accent) 14%) 0%,
      color-mix(in oklab, var(--bg), var(--accent) 6%) 100%);
    letter-spacing: 0.24em;
  }
  .go-to-site:hover .go-arrow { transform: translate(4px, -4px); }
  .go-label { color: var(--accent); }
  .go-host {
    color: var(--fg);
    border-bottom: 1px dotted var(--accent);
    padding-bottom: 1px;
    text-transform: none;
    letter-spacing: 0.05em;
  }
  .go-arrow {
    color: var(--accent);
    font-size: 1.1rem;
    line-height: 1;
    transition: transform 0.25s cubic-bezier(.2,.85,.4,1);
  }

  @media (max-width: 540px) {
    .screen      { height: min(60vh, 460px); }
    .url         { font-size: 0.7rem; padding: 0.2rem 0.55rem; }
    .url .scheme { display: none; }
    .go-to-site  { font-size: 0.78rem; padding: 0.7rem 0.85rem; gap: 0.5rem; letter-spacing: 0.12em; }
  }
</style>
