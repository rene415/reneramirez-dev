<script>
  import { onMount } from 'svelte';
  import CassetteSVG from './CassetteSVG.svelte';

  // ── state ──────────────────────────────────────────────────
  let mode = 'day';
  let flipping = false;
  let hinted = false;
  let soundOn = false;
  let ambientHandle = null;       // running tape whirr loop ref

  let audioCtx;

  // ── audio plumbing ─────────────────────────────────────────
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  // Cassette-into-player CHUNK click (two close clicks for the "lock" effect)
  function insertClick() {
    if (!soundOn) return;
    const ctx = getCtx();
    function oneClick(delay, freq = 220, dur = 0.04, peak = 0.22) {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    }
    oneClick(0,    180, 0.05, 0.25);
    oneClick(0.07, 130, 0.07, 0.20);
  }

  // tape spin-up "whirr" — short, plays once at the moment of transition
  function spinUpWhirr() {
    if (!soundOn) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t); src.stop(t + 0.5);
  }

  // continuous low tape-rolling ambience while in Night mode
  function startAmbient() {
    if (!soundOn || ambientHandle) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    // brown-ish noise buffer
    const bufSize = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSize; i++) {
      const w = Math.random() * 2 - 1;
      d[i] = (last + 0.02 * w) / 1.02;
      last = d[i];
      d[i] *= 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.025, t + 0.8);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start();
    ambientHandle = { src, g };
  }

  function stopAmbient() {
    if (!ambientHandle) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    const { src, g } = ambientHandle;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    setTimeout(() => { try { src.stop(); } catch (_) {} }, 600);
    ambientHandle = null;
  }

  // ── flip ───────────────────────────────────────────────────
  async function flip() {
    if (flipping) return;
    flipping = true;
    insertClick();
    setTimeout(spinUpWhirr, 200);

    // wait for cassette to ride the rotateY
    await new Promise((r) => setTimeout(r, 800));

    mode = mode === 'day' ? 'night' : 'day';
    document.body.dataset.mode = mode;
    document.documentElement.dataset.mode = mode;

    if (mode === 'night') startAmbient(); else stopAmbient();

    await new Promise((r) => setTimeout(r, 700));
    flipping = false;
  }

  // ── dot pulse hint ─────────────────────────────────────────
  onMount(() => {
    const t = setTimeout(() => { hinted = true; }, 4500);

    const handler = (e) => {
      soundOn = !!(e && e.detail);
      // if already in night and sound just got enabled, start ambient
      if (soundOn && mode === 'night' && !ambientHandle) startAmbient();
      if (!soundOn && ambientHandle) stopAmbient();
    };
    window.addEventListener('rr-sound', handler);
    // initial sync from SoundToggle
    soundOn = !!window.__rrSoundOn;

    return () => {
      clearTimeout(t);
      window.removeEventListener('rr-sound', handler);
      stopAmbient();
    };
  });

  // ESC to flip back from Night
  function onKey(e) {
    if (e.key === 'Escape' && mode === 'night' && !flipping) flip();
  }
</script>

<svelte:window on:keydown={onKey} />

<!-- the trigger: the period after "Rene" -->
<button
  class="dot"
  class:hinted
  on:click={flip}
  aria-label="Flip the tape — switch to the B-side"
  title="."
>.</button>

<!-- flip overlay -->
<div class="flip-overlay" class:active={flipping} aria-hidden="true">
  <div class="stage">
    <div class="cassette-3d" class:flipping>
      <CassetteSVG spinning={flipping} side={mode === 'day' ? 'A' : 'B'} />
    </div>
    <div class="caption">
      {#if mode === 'day'}
        <span>side A · day</span> <span class="arr">→</span> <span class="dim">side B · night</span>
      {:else}
        <span>side B · night</span> <span class="arr">→</span> <span class="dim">side A · day</span>
      {/if}
    </div>
  </div>
</div>

<style>
  /* the dot */
  .dot {
    display: inline-block;
    color: var(--accent);
    font: inherit;
    background: none; border: none;
    padding: 0 0.05em;
    margin: 0;
    cursor: pointer;
    transform-origin: center;
    transition: transform 0.25s ease, filter 0.25s ease;
    line-height: 1;
  }
  .dot:focus-visible { outline: 2px dashed var(--accent); outline-offset: 4px; border-radius: 2px; }
  .dot:hover { transform: scale(1.25); filter: drop-shadow(0 0 8px var(--accent)); }
  .dot.hinted { animation: pulseSoft 2.6s ease-in-out infinite; }
  .dot.hinted:hover { animation: none; }
  @keyframes pulseSoft {
    0%, 100% { transform: scale(1);    opacity: 1;    }
    50%      { transform: scale(1.18); opacity: 0.75; }
  }

  /* overlay */
  .flip-overlay {
    position: fixed; inset: 0;
    z-index: 9999;
    background: var(--bg);
    display: grid; place-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 350ms ease;
  }
  .flip-overlay.active { opacity: 1; pointer-events: auto; }

  .stage {
    display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
    perspective: 1400px;
  }

  /* the 3D-ish flip wrapper */
  .cassette-3d {
    width: min(82vw, 420px);
    aspect-ratio: 5 / 3;
    transform-style: preserve-3d;
    transition: transform 1100ms cubic-bezier(0.68, 0.04, 0.22, 1.0);
  }
  .cassette-3d.flipping {
    transform: rotateY(540deg) scale(1.03);
  }

  .caption {
    font-family: 'VT323', monospace;
    font-size: 0.95rem;
    color: var(--muted);
    letter-spacing: 0.18em;
  }
  .caption .arr { color: var(--accent); margin: 0 0.5rem; }
  .caption .dim { color: var(--fg); opacity: 0.55; }
</style>
