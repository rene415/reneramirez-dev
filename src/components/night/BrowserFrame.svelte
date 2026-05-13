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
    <div class="url" role="textbox" aria-readonly="true" aria-label="URL">
      <span class="lock" aria-hidden="true">🔒</span>
      <span class="scheme">https://</span><span class="host">{displayUrl}</span>
    </div>
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
  <div class="caption">
    <span>↗ open in new tab</span>
    <a href={src} target="_blank" rel="noopener noreferrer">{displayUrl}</a>
  </div>
</div>

<style>
  .bw {
    width: 100%;
    max-width: 880px;
    margin-top: 1.5rem;
    border-radius: 10px;
    overflow: hidden;
    background: #0f0820;
    border: 1px solid var(--accent);
    box-shadow:
      0 0 0 1px rgba(255, 43, 138, 0.18),
      0 14px 50px rgba(0, 0, 0, 0.55),
      0 0 80px rgba(255, 43, 138, 0.22);
  }

  /* ── chrome ─────────────────────────────────────────────── */
  .chrome {
    display: flex; align-items: center; gap: 0.85rem;
    padding: 0.6rem 0.9rem;
    background: linear-gradient(180deg, #1a0f33 0%, #0a0420 100%);
    border-bottom: 1px solid rgba(255, 43, 138, 0.25);
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 43, 138, 0.18);
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    color: var(--muted);
    user-select: text;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .url .lock   { font-size: 0.72rem; line-height: 1; }
  .url .scheme { color: var(--muted); }
  .url .host   { color: var(--fg); }

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
    height: min(72vh, 680px);
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
    box-shadow: inset 0 0 36px rgba(255, 43, 138, 0.18);
  }

  /* ── caption row beneath the frame ─────────────────────── */
  .caption {
    padding: 0.55rem 0.95rem;
    background: linear-gradient(180deg, #0a0420 0%, #08041a 100%);
    border-top: 1px solid rgba(255, 43, 138, 0.18);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;
  }
  .caption a {
    color: var(--fg);
    text-decoration: none;
    border-bottom: 1px dotted var(--accent);
  }
  .caption a:hover { color: var(--accent); }

  @media (max-width: 540px) {
    .screen   { height: min(60vh, 460px); }
    .url      { font-size: 0.7rem; padding: 0.2rem 0.55rem; }
    .url .scheme { display: none; }
    .caption  { font-size: 0.65rem; }
  }
</style>
