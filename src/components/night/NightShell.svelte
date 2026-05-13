<script>
  import { onMount } from 'svelte';
  import { channels } from '../../data/channels';
  import { tracks } from '../../data/music';

  // ── state ──────────────────────────────────────────────────
  let index = 0;
  let holding = false;
  let holdProgress = 0;
  let transitioning = false;
  let glitchVariant = 'vhs';
  // 5-second buildup. Hold SPACE → filter sweeps from 20kHz → 260Hz over
  // this duration (the "tension"), then at completion the channel changes
  // and filter snaps back to 20kHz with a gain swell (the "drop").
  // For quick channel changes without the buildup, use number keys 1–5
  // or the arrow keys.
  const HOLD_MS = 5000;
  let holdStartedAt = 0;
  let rafId = 0;

  // music
  let trackIndex = 0;
  let isPlaying = false;
  let soundOn = false;
  let audioCtx, audioEl, sourceNode, filterNode, gainNode;
  const GLITCH_VARIANTS = ['vhs', 'rgb', 'corrupt', 'pinch', 'tear'];

  $: current = channels[index];
  $: accentColor = accentToVar(current?.accent);
  $: currentTrack = tracks[trackIndex];

  function accentToVar(a) {
    switch (a) {
      case 'cyan':  return 'var(--night-cyan, #00f0ff)';
      case 'green': return 'var(--night-green, #4dff88)';
      case 'amber': return 'var(--night-amber, #ffb74d)';
      default:      return 'var(--accent)';
    }
  }

  // ── audio plumbing (lazy init on first play) ───────────────
  function setupAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioEl = new Audio();
    // 'auto' so the first track starts downloading the moment sound is
    // enabled — by the time the cassette flip finishes, audio is ready.
    audioEl.preload = 'auto';
    audioEl.crossOrigin = 'anonymous';
    audioEl.src = currentTrack.src;     // start fetching immediately
    audioEl.addEventListener('ended', nextTrack);
    sourceNode = audioCtx.createMediaElementSource(audioEl);
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 20000;
    filterNode.Q.value = 1.1;
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.55;
    sourceNode.connect(filterNode).connect(gainNode).connect(audioCtx.destination);
  }

  async function play() {
    if (!soundOn) return;
    setupAudio();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    if (!audioEl.src.endsWith(encodeURI(currentTrack.src).split('/').pop())) {
      audioEl.src = currentTrack.src;
    }
    try { await audioEl.play(); isPlaying = true; } catch (_) {}
  }
  function pause()      { if (audioEl) { audioEl.pause(); isPlaying = false; } }
  function nextTrack() {
    trackIndex = (trackIndex + 1) % tracks.length;
    if (audioEl) { audioEl.src = currentTrack.src; if (isPlaying) audioEl.play(); }
  }
  function prevTrack() {
    trackIndex = (trackIndex - 1 + tracks.length) % tracks.length;
    if (audioEl) { audioEl.src = currentTrack.src; if (isPlaying) audioEl.play(); }
  }
  function togglePlay() { isPlaying ? pause() : play(); }

  // ── filter automation tied to hold ─────────────────────────
  function holdFilterDown() {
    if (!filterNode) return;
    const t = audioCtx.currentTime;
    filterNode.frequency.cancelScheduledValues(t);
    filterNode.frequency.setValueAtTime(filterNode.frequency.value, t);
    filterNode.frequency.exponentialRampToValueAtTime(260, t + HOLD_MS / 1000);
    // soft duck on volume too
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.exponentialRampToValueAtTime(0.32, t + HOLD_MS / 1000);
  }
  function holdFilterUp(dropMode) {
    if (!filterNode) return;
    const t = audioCtx.currentTime;
    const currentFreq = filterNode.frequency.value;
    const currentGain = gainNode.gain.value;
    filterNode.frequency.cancelScheduledValues(t);
    filterNode.frequency.setValueAtTime(currentFreq, t);
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(currentGain, t);

    // Only stage a real "drop" if there was an actual buildup — i.e.
    // user held space and the filter is currently muffled. If they
    // tapped 1–5 or clicked a channel dot without holding, just keep
    // playing smoothly (no surprise volume burst — that was making
    // channel changes feel like a new song starting).
    const wasBuilding = currentFreq < 5000 || currentGain < 0.5;

    if (dropMode && wasBuilding) {
      // THE DROP — filter sweeps open over ~150ms (smooth, not a slam),
      // gain briefly swells then settles
      filterNode.frequency.exponentialRampToValueAtTime(20000, t + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.78, t + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.55, t + 0.8);
    } else if (dropMode) {
      // channel change without buildup — gentle normalize, no drop
      filterNode.frequency.linearRampToValueAtTime(20000, t + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.55, t + 0.1);
    } else {
      // hold cancelled — graceful return
      filterNode.frequency.exponentialRampToValueAtTime(20000, t + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.55, t + 0.5);
    }
  }

  // ── transition glitch (variant + sound) ────────────────────
  function glitchSound() {
    if (!soundOn) return;
    setupAudio();
    const ctx = audioCtx;
    const t = ctx.currentTime;
    // static burst (filtered noise)
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.22, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1500 + Math.random() * 2000;
    f.Q.value = 1.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t); src.stop(t + 0.22);
    // sharp click
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100 + Math.random() * 80, t);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.18, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(og).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.08);
  }

  async function go(target) {
    if (transitioning || target === index) return;
    transitioning = true;
    glitchVariant = GLITCH_VARIANTS[Math.floor(Math.random() * GLITCH_VARIANTS.length)];
    glitchSound();
    holdFilterUp(true);              // ⇦ "the drop"
    await new Promise((r) => setTimeout(r, 250));
    index = target;
    await new Promise((r) => setTimeout(r, 500));
    transitioning = false;
  }

  function next() { go((index + 1) % channels.length); }
  function prev() { go((index - 1 + channels.length) % channels.length); }

  // ── hold loop ──────────────────────────────────────────────
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
    holdFilterDown();
    rafId = requestAnimationFrame(tick);
  }
  function endHold() {
    if (!holding) return;
    holding = false;
    holdProgress = 0;
    cancelAnimationFrame(rafId);
    holdFilterUp(false);             // cancelled — gracefully return
  }

  // ── keyboard ───────────────────────────────────────────────
  function onKeyDown(e) {
    // Only react in Night mode (component stays mounted across modes)
    if (document.body.dataset.mode !== 'night') return;
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      startHold();
    }
    if (e.key >= '1' && e.key <= '5' && !transitioning) {
      const t = parseInt(e.key, 10) - 1;
      if (t < channels.length) go(t);
    }
    if (e.key === 'ArrowRight' && !transitioning) { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft'  && !transitioning) { e.preventDefault(); prev(); }
  }
  function onKeyUp(e) {
    if (document.body.dataset.mode !== 'night') return;
    if (e.code === 'Space') { e.preventDefault(); endHold(); }
  }

  // ── mount / mode-sync ──────────────────────────────────────
  onMount(() => {
    const onSound = (e) => {
      const wasOff = !soundOn;
      soundOn = !!(e && e.detail);
      if (!soundOn) { pause(); return; }
      // Eager setup so AudioContext is ready before user enters Night.
      // (User just clicked the sound toggle = valid gesture for new AudioContext.)
      if (!audioCtx) setupAudio();
      // If already in Night when sound is enabled, start immediately
      if (wasOff && document.body.dataset.mode === 'night') play();
    };
    soundOn = !!window.__rrSoundOn;
    window.addEventListener('rr-sound', onSound);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    // when the body mode flips to night, start music (if sound is on)
    const modeObserver = new MutationObserver(() => {
      const m = document.body.dataset.mode;
      if (m === 'night') {
        if (soundOn) play();
      } else {
        pause();
        if (holding) endHold();
      }
    });
    modeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-mode'] });

    return () => {
      window.removeEventListener('rr-sound', onSound);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      modeObserver.disconnect();
      pause();
    };
  });
</script>

<!-- CRT-frame border — fills around the whole viewport as you hold -->
<svg
  class="crt-frame"
  class:active={holding}
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  <rect
    x="0.5" y="0.5" width="99" height="99"
    fill="none" stroke="currentColor" stroke-width="1"
    pathLength="400"
    stroke-dasharray="400"
    stroke-dashoffset={400 - holdProgress * 400}
    vector-effect="non-scaling-stroke"
  />
</svg>

<div class="night" aria-label="B-side">
  <div class="scanlines" aria-hidden="true"></div>
  <div class="vignette"  aria-hidden="true"></div>

  <!-- hud top — channel index only (now-playing moved to bottom HUD) -->
  <div class="hud-top">
    <span class="ch-tag" style="color: {accentColor}">{current.number}</span>
    <span class="ch-name">{current.name}</span>
  </div>

  <!-- channel content -->
  <div class="stage" class:transitioning>
    <article class="channel" data-id={current.id}>
      <div class="ch-marker" style="color: {accentColor}">{current.number}</div>
      <h2 class="ch-title">{current.name}</h2>
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
      {:else if current.id === 'lenses'}
        <p class="photo-empty">
          [drop photos in <code>public/photos/lenses/</code> and reference them in
          <code>src/data/channels.ts</code>]
        </p>
      {/if}
    </article>
  </div>

  <!-- glitch overlay — variant chosen randomly per transition -->
  <div class="glitch glitch-{glitchVariant}" class:active={transitioning} aria-hidden="true">
    <div class="g-l1"></div>
    <div class="g-l2"></div>
    <div class="g-l3"></div>
    <div class="g-static"></div>
  </div>

  <!-- bottom HUD: media player + channels + keymap hint -->
  <div class="hud-bottom">
    <div class="now-playing" class:playing={isPlaying}>
      <button class="np-btn" on:click={prevTrack} aria-label="previous">‹</button>
      <button class="np-btn play" on:click={togglePlay} aria-label={isPlaying ? 'pause' : 'play'}>
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <button class="np-btn" on:click={nextTrack} aria-label="next">›</button>
      <span class="np-title">{currentTrack.title}</span>
      <span class="np-date">{currentTrack.date}</span>
    </div>
    <div class="channels-strip">
      {#each channels as c, i}
        <button
          class="ch-dot"
          class:active={i === index}
          on:click={() => go(i)}
          aria-label={`Channel ${i + 1}: ${c.name}`}
          title={`${i + 1}. ${c.name}`}
        >{i + 1}</button>
      {/each}
    </div>
    <div class="hint">
      hold <kbd>SPACE</kbd> for buildup · <kbd>1</kbd>–<kbd>5</kbd> jump · <kbd>←</kbd><kbd>→</kbd> · <kbd>ESC</kbd> for A-side
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
    pointer-events: none; z-index: 2;
  }
  .vignette {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%);
    pointer-events: none; z-index: 2;
  }

  /* ── CRT frame (fills as you hold) ─────────────────────── */
  .crt-frame {
    position: fixed; inset: 0;
    width: 100%; height: 100%;
    color: var(--accent);
    pointer-events: none;
    z-index: 9000;
    opacity: 0;
    transition: opacity 200ms ease;
    filter: drop-shadow(0 0 6px currentColor);
  }
  .crt-frame.active { opacity: 1; animation: crtFlicker 0.45s ease-in-out infinite; }
  @keyframes crtFlicker {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.78; }
  }

  /* ── HUD top ───────────────────────────────────────────── */
  .hud-top {
    position: absolute;
    top: 1rem; left: 1.25rem;
    z-index: 5;
    display: flex; gap: 1rem; align-items: center;
    font-size: 0.78rem;
    letter-spacing: 0.2em;
  }
  .ch-tag { font-weight: 500; }
  .ch-name { color: var(--muted); text-transform: lowercase; }

  /* now-playing media player — bottom HUD, centered above channels */
  .now-playing {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.45rem 0.85rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    font-size: 0.78rem;
    color: var(--muted);
    letter-spacing: 0.06em;
    max-width: min(90vw, 520px);
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
  }
  .now-playing.playing {
    border-color: var(--accent);
    color: var(--fg);
    box-shadow: 0 0 16px rgba(255,43,138,0.25);
  }
  .np-btn {
    background: transparent; border: none;
    color: inherit; cursor: pointer;
    padding: 0.15rem 0.35rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    line-height: 1;
  }
  .np-btn:hover { color: var(--accent); }
  .np-btn.play  { color: var(--fg); font-size: 0.95rem; }
  .np-title {
    color: var(--fg);
    margin-left: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 14rem;
  }
  .np-date  { font-size: 0.7rem; color: var(--muted); opacity: 0.7; }
  @media (max-width: 540px) {
    .np-date { display: none; }
    .np-title { max-width: 8rem; }
  }

  /* ── stage / channel ───────────────────────────────────── */
  .stage {
    position: absolute; inset: 0;
    overflow-y: auto; overflow-x: hidden;
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

  .ch-marker { font-size: 0.85rem; letter-spacing: 0.3em; margin-bottom: 0.75rem; }
  .ch-title {
    font-family: 'VT323', monospace;
    font-size: clamp(2.5rem, 9vw, 5rem);
    line-height: 1; margin-bottom: 1rem; letter-spacing: 0.02em;
  }
  .ch-tagline { font-size: clamp(1rem, 2.5vw, 1.2rem); margin-bottom: 1.25rem; letter-spacing: 0.02em; }
  .ch-body { color: var(--muted); line-height: 1.7; max-width: 52ch; margin-bottom: 1.5rem; }

  .aliases { margin: 1rem 0 1.5rem; font-size: 0.95rem; letter-spacing: 0.05em; }
  .alias { padding: 0 0.25rem; }
  .sep { color: var(--muted); padding: 0 0.15rem; }

  .facts { display: grid; gap: 0.5rem; margin: 1.5rem 0; max-width: 36rem; }
  .fact {
    display: grid; grid-template-columns: 11rem 1fr;
    gap: 1rem; padding: 0.65rem 0;
    border-top: 1px solid var(--line);
    font-size: 0.93rem;
  }
  .fact:last-child { border-bottom: 1px solid var(--line); }
  .fact dt { color: var(--muted); letter-spacing: 0.1em; }
  .fact dd { color: var(--fg); }

  .links {
    list-style: none; margin-top: 1.5rem;
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
    margin-top: 1.5rem; color: var(--muted);
    font-size: 0.85rem;
    padding: 0.85rem;
    border: 1px dashed var(--line);
    border-radius: 3px;
    max-width: 52ch;
  }
  .photo-empty code {
    background: rgba(255,255,255,0.05);
    padding: 1px 5px; border-radius: 2px; font-size: 0.85em;
  }

  /* ── HUD bottom ────────────────────────────────────────── */
  .hud-bottom {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 1rem 1.5rem 1.25rem;
    background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
    z-index: 6;
    display: grid; gap: 0.6rem; justify-items: center; text-align: center;
  }
  .channels-strip { display: flex; gap: 0.6rem; align-items: center; }
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
    color: var(--bg); background: var(--accent); border-color: var(--accent);
    box-shadow: 0 0 14px rgba(255, 43, 138, 0.4);
  }
  .hint { font-size: 0.72rem; color: var(--muted); letter-spacing: 0.08em; }
  .hint kbd {
    font-family: 'JetBrains Mono', monospace;
    padding: 1px 6px; margin: 0 1px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--line);
    border-radius: 3px;
    font-size: 0.78rem;
    color: var(--fg);
  }

  /* ── glitch overlay (5 variants) ───────────────────────── */
  .glitch {
    position: absolute; inset: 0;
    pointer-events: none;
    z-index: 4;
    opacity: 0;
    transition: opacity 60ms linear;
  }
  .glitch.active { opacity: 1; }
  .glitch > div { position: absolute; inset: 0; }

  /* --- VHS: 3 sliding chromatic bands + static --- */
  .glitch-vhs .g-l1 {
    background: linear-gradient(to bottom, transparent 30%, rgba(255,43,138,0.35) 50%, transparent 70%);
    animation: vhsSlide 0.65s steps(8) infinite;
  }
  .glitch-vhs .g-l2 {
    background: linear-gradient(to bottom, transparent 20%, rgba(0,240,255,0.3) 40%, transparent 60%);
    animation: vhsSlide 0.45s steps(8) infinite reverse;
  }
  .glitch-vhs .g-l3 {
    background: linear-gradient(to bottom, transparent 65%, rgba(255,255,255,0.18) 80%, transparent 100%);
    animation: vhsSlide 0.85s steps(6) infinite;
  }
  .glitch-vhs .g-static {
    background-image:
      repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px);
    mix-blend-mode: screen;
  }
  @keyframes vhsSlide {
    0%   { transform: translateY(-15%) skewX(-4deg); opacity: 0.6; }
    50%  { transform: translateY(30%)  skewX(2deg);  opacity: 0.9; }
    100% { transform: translateY(-10%) skewX(-3deg); opacity: 0.5; }
  }

  /* --- RGB-split: three offset solid color layers --- */
  .glitch-rgb { mix-blend-mode: screen; }
  .glitch-rgb .g-l1 { background: rgba(255,43,138,0.45);  animation: rgbShiftR 0.4s ease-in-out infinite; }
  .glitch-rgb .g-l2 { background: rgba(0,240,255,0.4);    animation: rgbShiftG 0.5s ease-in-out infinite; }
  .glitch-rgb .g-l3 { background: rgba(77,255,136,0.35);  animation: rgbShiftB 0.55s ease-in-out infinite; }
  .glitch-rgb .g-static {
    background-image:
      repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px);
  }
  @keyframes rgbShiftR { 0%,100% { transform: translateX(-8px); } 50% { transform: translateX(10px); } }
  @keyframes rgbShiftG { 0%,100% { transform: translateX(8px); }  50% { transform: translateX(-10px); } }
  @keyframes rgbShiftB { 0%,100% { transform: translateY(-4px); } 50% { transform: translateY(6px); } }

  /* --- corrupt: random pixel-blocks --- */
  .glitch-corrupt .g-l1 {
    background:
      linear-gradient(90deg, transparent 12%, var(--accent) 12% 22%, transparent 22% 60%, rgba(0,240,255,0.55) 60% 72%, transparent 72%);
    height: 14%; top: 32%;
    animation: corruptShift 0.18s steps(3) infinite;
  }
  .glitch-corrupt .g-l2 {
    background:
      linear-gradient(90deg, transparent 5%, rgba(77,255,136,0.6) 5% 18%, transparent 18% 70%, var(--accent) 70% 88%, transparent 88%);
    height: 8%; top: 55%;
    animation: corruptShift 0.13s steps(4) infinite reverse;
  }
  .glitch-corrupt .g-l3 {
    background:
      linear-gradient(90deg, transparent 30%, rgba(255,183,77,0.5) 30% 38%, transparent 38% 65%, rgba(255,255,255,0.4) 65% 75%, transparent 75%);
    height: 6%; top: 72%;
    animation: corruptShift 0.21s steps(5) infinite;
  }
  .glitch-corrupt .g-static {
    background-image:
      repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 5px),
      repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0 1px, transparent 1px 3px);
  }
  @keyframes corruptShift {
    0%   { transform: translateX(0)   scaleX(1); }
    50%  { transform: translateX(-8%) scaleX(0.97); }
    100% { transform: translateX(6%)  scaleX(1.02); }
  }

  /* --- CRT pinch: vertical collapse like old TV power-off --- */
  .glitch-pinch .g-l1 {
    background: var(--bg);
    animation: pinchTop 0.7s ease-in-out;
  }
  .glitch-pinch .g-l2 {
    background: var(--bg);
    animation: pinchBot 0.7s ease-in-out;
  }
  .glitch-pinch .g-l3 {
    background: rgba(255,255,255,0.85);
    height: 2px; top: 50%;
    animation: pinchLine 0.7s ease-in-out;
    box-shadow: 0 0 12px var(--accent);
  }
  @keyframes pinchTop { 0%{height:0;top:0;} 60%{height:48%;top:0;} 100%{height:50%;top:0;} }
  @keyframes pinchBot { 0%{height:0;bottom:0;top:auto;} 60%{height:48%;bottom:0;top:auto;} 100%{height:50%;bottom:0;top:auto;} }
  @keyframes pinchLine {
    0%   { opacity: 0; transform: scaleX(0); }
    40%  { opacity: 1; transform: scaleX(1.05); }
    100% { opacity: 0; transform: scaleX(0); }
  }

  /* --- tear: diagonal cut with opposing slide --- */
  .glitch-tear .g-l1 {
    background: var(--bg);
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 55%);
    animation: tearTop 0.55s ease-in-out;
  }
  .glitch-tear .g-l2 {
    background: var(--bg);
    clip-path: polygon(0 55%, 100% 45%, 100% 100%, 0 100%);
    animation: tearBot 0.55s ease-in-out;
  }
  .glitch-tear .g-l3 {
    background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%);
    height: 8%; top: 46%;
    animation: tearStatic 0.55s ease-in-out;
    mix-blend-mode: screen;
  }
  @keyframes tearTop { 0%{transform:translateX(0);} 50%{transform:translateX(-6%);} 100%{transform:translateX(0);} }
  @keyframes tearBot { 0%{transform:translateX(0);} 50%{transform:translateX(6%);}  100%{transform:translateX(0);} }
  @keyframes tearStatic { 0%,100%{opacity:0;} 50%{opacity:1;} }
</style>
