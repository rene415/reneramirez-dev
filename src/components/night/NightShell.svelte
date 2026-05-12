<script>
  import { onMount } from 'svelte';
  import { channels } from '../../data/channels';

  // ── state ──────────────────────────────────────────────────
  let index = 0;
  let holding = false;
  let holdProgress = 0;          // 0–1
  let transitioning = false;
  const HOLD_MS = 800;
  let holdStartedAt = 0;
  let rafId = 0;

  $: current = channels[index];
  $: accentColor = accentToVar(current?.accent);

  function accentToVar(a) {
    switch (a) {
      case 'cyan':    return 'var(--night-cyan, #00f0ff)';
      case 'green':   return 'var(--night-green, #4dff88)';
      case 'amber':   return 'var(--night-amber, #ffb74d)';
      default:        return 'var(--accent)';
    }
  }

  // ── glitch sound (synthesized, brief static burst + click) ─
  function glitchSound() {
    if (!window.__rrSoundOn) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;
    // static burst
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t); src.stop(t + 0.18);
    // sharp click on top
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.15, t + 0.005);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(og).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.07);
  }

  // ── transition to a new channel ────────────────────────────
  async function go(target) {
    if (transitioning || target === index) return;
    transitioning = true;
    glitchSound();
    // micro pause for glitch to land
    await new Promise((r) => setTimeout(r, 220));
    index = target;
    await new Promise((r) => setTimeout(r, 480));
    transitioning = false;
  }

  function next() { go((index + 1) % channels.length); }
  function prev() { go((index - 1 + channels.length) % channels.length); }

  // ── hold-to-progress loop ──────────────────────────────────
  function tick(now) {
    if (!holding) { holdProgress = 0; return; }
    const elapsed = now - holdStartedAt;
    holdProgress = Math.min(1, elapsed / HOLD_MS);
    if (holdProgress >= 1) {
      holding = false;
      holdProgress = 0;
      next();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startHold() {
    if (holding || transitioning) return;
    holding = true;
    holdStartedAt = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function endHold() {
    holding = false;
    holdProgress = 0;
    cancelAnimationFrame(rafId);
  }

  // ── keyboard ───────────────────────────────────────────────
  function onKeyDown(e) {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      startHold();
    }
    // digit jumps 1..5 → channel index
    if (e.key >= '1' && e.key <= '5' && !transitioning) {
      const t = parseInt(e.key, 10) - 1;
      if (t < channels.length) go(t);
    }
    // arrow keys
    if (e.key === 'ArrowRight' && !transitioning) { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft'  && !transitioning) { e.preventDefault(); prev(); }
  }
  function onKeyUp(e) {
    if (e.code === 'Space') { e.preventDefault(); endHold(); }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    // block default scroll while we're the active view
    document.body.style.overflow = 'hidden';
    // cleanup (runs only on client, never during SSR)
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      document.body.style.overflow = '';
    };
  });
</script>

<div class="night" aria-label="B-side">
  <!-- ambient layers -->
  <div class="scanlines" aria-hidden="true"></div>
  <div class="vignette"  aria-hidden="true"></div>

  <!-- channel index strip (top-right) -->
  <div class="hud-top">
    <span class="ch-tag" style="color: {accentColor}">{current.number}</span>
    <span class="ch-name">{current.name}</span>
  </div>

  <!-- channel content -->
  <div class="stage" class:transitioning>
    <article class="channel" data-id={current.id} key={current.id}>
      <div class="ch-marker" style="color: {accentColor}">{current.number}</div>
      <h2 class="ch-title" style="text-shadow: 0 0 28px {accentColor.replace('var(--', '').replace(')', '')}55">
        {current.name}
      </h2>
      <p class="ch-tagline" style="color: {accentColor}">{current.tagline}</p>
      {#if current.body}
        <p class="ch-body">{current.body}</p>
      {/if}

      {#if current.alias && current.alias.length}
        <div class="aliases">
          {#each current.alias as a, i}
            <span class="alias" style="color: {accentColor}">{a}</span>
            {#if i < current.alias.length - 1}<span class="sep">/</span>{/if}
          {/each}
        </div>
      {/if}

      {#if current.facts && current.facts.length}
        <dl class="facts">
          {#each current.facts as f}
            <div class="fact"><dt>{f.k}</dt><dd>{f.v}</dd></div>
          {/each}
        </dl>
      {/if}

      {#if current.links && current.links.length}
        <ul class="links">
          {#each current.links as l}
            <li>
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                 style="--ch-accent: {accentColor};">
                <span class="lbl">{l.label}</span>
                {#if l.handle}<span class="hdl">{l.handle}</span>{/if}
              </a>
            </li>
          {/each}
        </ul>
      {/if}

      {#if current.photos && current.photos.length}
        <div class="photos">
          {#each current.photos as p}
            <figure>
              <img src={p.src} alt={p.alt} loading="lazy" />
            </figure>
          {/each}
        </div>
      {:else if current.id === 'lenses' || current.id === 'garage'}
        <p class="photo-empty">
          [drop photos in <code>public/photos/{current.id}/</code> and reference them in
          <code>src/data/channels.ts</code>]
        </p>
      {/if}
    </article>
  </div>

  <!-- glitch overlay during transitions -->
  <div class="glitch" class:active={transitioning} aria-hidden="true">
    <div class="glitch-bar"></div>
    <div class="glitch-bar b"></div>
    <div class="static"></div>
  </div>

  <!-- bottom HUD: channel strip + hold meter -->
  <div class="hud-bottom">
    <div class="channels-strip">
      {#each channels as c, i}
        <button
          class="ch-dot"
          class:active={i === index}
          on:click={() => go(i)}
          aria-label={`Channel ${i + 1}: ${c.name}`}
          title={`${i + 1}. ${c.name}`}
        >
          <span class="ch-dot-num">{i + 1}</span>
        </button>
      {/each}
    </div>
    <div class="hold-meter" class:active={holding}>
      <div class="hold-fill" style="transform: scaleX({holdProgress})"></div>
    </div>
    <div class="hint">
      hold <kbd>SPACE</kbd> for next channel · <kbd>1</kbd>–<kbd>5</kbd> to jump · <kbd>←</kbd><kbd>→</kbd> · <kbd>ESC</kbd> to return
    </div>
  </div>
</div>

<style>
  .night {
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse at 50% 0%, #2a0a4a 0%, transparent 60%),
      radial-gradient(ellipse at 100% 100%, #4a0a2a 0%, transparent 60%),
      var(--bg);
    color: var(--fg);
    font-family: 'JetBrains Mono', monospace;
    overflow: hidden;
  }
  .scanlines {
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(
      0deg, transparent 0, transparent 2px,
      rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px);
    pointer-events: none;
    z-index: 2;
  }
  .vignette {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
    z-index: 2;
  }

  /* hud top */
  .hud-top {
    position: absolute;
    top: 1.25rem; left: 1.25rem;
    z-index: 5;
    font-size: 0.78rem;
    letter-spacing: 0.2em;
    display: flex; gap: 1rem; align-items: center;
  }
  .ch-tag { font-weight: 500; }
  .ch-name { color: var(--muted); text-transform: lowercase; }

  /* stage / channel */
  .stage {
    position: absolute; inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(4rem, 8vh, 6rem) clamp(1.5rem, 6vw, 4rem) 8rem;
    z-index: 3;
    transition: opacity 400ms ease, transform 400ms ease, filter 400ms ease;
  }
  .stage::-webkit-scrollbar { width: 0; }
  .stage.transitioning {
    opacity: 0.2;
    transform: translateY(8px);
    filter: blur(2px);
  }

  .channel {
    max-width: 760px; margin: 0 auto;
    animation: chIn 700ms ease forwards;
  }
  @keyframes chIn {
    from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
  }

  .ch-marker {
    font-size: 0.85rem;
    letter-spacing: 0.3em;
    margin-bottom: 0.75rem;
  }
  .ch-title {
    font-family: 'VT323', monospace;
    font-size: clamp(2.5rem, 9vw, 5rem);
    line-height: 1;
    margin-bottom: 1rem;
    letter-spacing: 0.02em;
  }
  .ch-tagline {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    margin-bottom: 1.25rem;
    letter-spacing: 0.02em;
  }
  .ch-body {
    color: var(--muted);
    line-height: 1.7;
    max-width: 52ch;
    margin-bottom: 1.5rem;
  }

  .aliases {
    margin: 1rem 0 1.5rem;
    font-size: 0.95rem;
    letter-spacing: 0.05em;
  }
  .alias { padding: 0 0.25rem; }
  .sep   { color: var(--muted); padding: 0 0.15rem; }

  .facts {
    display: grid; gap: 0.5rem;
    margin: 1.5rem 0;
    max-width: 36rem;
  }
  .fact {
    display: grid; grid-template-columns: 11rem 1fr;
    gap: 1rem;
    padding: 0.65rem 0;
    border-top: 1px solid var(--line);
    font-size: 0.93rem;
  }
  .fact:last-child { border-bottom: 1px solid var(--line); }
  .fact dt { color: var(--muted); letter-spacing: 0.1em; }
  .fact dd { color: var(--fg); }

  .links {
    list-style: none;
    margin-top: 1.5rem;
    display: grid; gap: 0.6rem;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    max-width: 720px;
  }
  .links a {
    display: flex; flex-direction: column; gap: 0.25rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--line);
    border-radius: 3px;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  .links a:hover {
    border-color: var(--ch-accent, var(--accent));
    background: rgba(255,255,255,0.03);
    transform: translateX(2px);
  }
  .links .lbl { color: var(--fg); font-size: 0.95rem; }
  .links .hdl { color: var(--muted); font-size: 0.78rem; }

  .photos {
    margin-top: 1.75rem;
    display: grid; gap: 0.75rem;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  .photos figure {
    margin: 0;
    border: 1px solid var(--line);
    border-radius: 3px;
    overflow: hidden;
    aspect-ratio: 4 / 3;
  }
  .photos img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-empty {
    margin-top: 1.5rem;
    color: var(--muted);
    font-size: 0.85rem;
    padding: 0.85rem;
    border: 1px dashed var(--line);
    border-radius: 3px;
    max-width: 52ch;
  }
  .photo-empty code {
    background: rgba(255,255,255,0.05);
    padding: 1px 5px;
    border-radius: 2px;
    font-size: 0.85em;
  }

  /* hud bottom */
  .hud-bottom {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 1rem 1.5rem 1.25rem;
    background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
    z-index: 6;
    display: grid; gap: 0.6rem;
    justify-items: center;
    text-align: center;
  }
  .channels-strip {
    display: flex; gap: 0.6rem;
    align-items: center;
  }
  .ch-dot {
    width: 2.1rem; height: 2.1rem;
    border: 1px solid var(--line);
    background: transparent;
    border-radius: 50%;
    color: var(--muted);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: grid; place-items: center;
  }
  .ch-dot:hover { color: var(--fg); border-color: var(--accent); }
  .ch-dot.active {
    color: var(--bg);
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 14px rgba(255, 43, 138, 0.4);
  }

  .hold-meter {
    width: min(320px, 60vw);
    height: 2px;
    background: var(--line);
    overflow: hidden;
    border-radius: 2px;
    opacity: 0.4;
    transition: opacity 0.2s ease;
  }
  .hold-meter.active { opacity: 1; }
  .hold-fill {
    height: 100%;
    background: var(--accent);
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 80ms linear;
    box-shadow: 0 0 8px var(--accent);
  }

  .hint {
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.08em;
  }
  .hint kbd {
    font-family: 'JetBrains Mono', monospace;
    padding: 1px 6px;
    margin: 0 1px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--line);
    border-radius: 3px;
    font-size: 0.78rem;
    color: var(--fg);
  }

  /* glitch */
  .glitch {
    position: absolute; inset: 0;
    pointer-events: none;
    z-index: 4;
    opacity: 0;
    transition: opacity 60ms linear;
  }
  .glitch.active { opacity: 1; }
  .glitch-bar {
    position: absolute;
    left: 0; right: 0; height: 30%;
    background: linear-gradient(to bottom,
      transparent 0,
      rgba(255, 43, 138, 0.18) 30%,
      rgba(0, 240, 255, 0.18) 70%,
      transparent 100%);
    top: 20%;
    animation: glitchSlide 0.65s steps(8) infinite;
  }
  .glitch-bar.b { top: 55%; animation-direction: reverse; animation-duration: 0.45s; }
  .static {
    position: absolute; inset: 0;
    background-image:
      repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 3px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px);
    mix-blend-mode: screen;
  }
  @keyframes glitchSlide {
    0%   { transform: translateX(-30%) skewX(-3deg); opacity: 0.6; }
    50%  { transform: translateX(40%)  skewX(2deg);  opacity: 0.9; }
    100% { transform: translateX(-20%) skewX(-2deg); opacity: 0.5; }
  }
</style>
