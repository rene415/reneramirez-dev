<script>
  import { onMount } from 'svelte';

  // ── state ──────────────────────────────────────────────────
  let mode = 'day';           // 'day' | 'night'
  let flipping = false;       // mid-transition
  let hinted = false;         // dot has started its subtle pulse
  let soundOn = false;        // user has opted into sound

  let audioCtx;               // lazy-init WebAudio

  // ── audio (synthesized, no asset files) ────────────────────
  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function click() {
    if (!soundOn) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    // sharp short click — like a cassette button
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  function whirr() {
    if (!soundOn) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    // a brief noise burst, low-passed — tape spin-up
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.6);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.6);
  }

  // ── flip ───────────────────────────────────────────────────
  async function flip() {
    if (flipping) return;
    flipping = true;
    click();

    // tiny pause, then whirr starts
    setTimeout(whirr, 120);

    // wait for the transition CSS to complete, then swap mode
    await new Promise((r) => setTimeout(r, 700));
    mode = mode === 'day' ? 'night' : 'day';
    document.body.dataset.mode = mode;
    document.documentElement.dataset.mode = mode;

    await new Promise((r) => setTimeout(r, 700));
    flipping = false;
  }

  // ── dot pulse (subtle invitation after a few seconds) ──────
  onMount(() => {
    const timer = setTimeout(() => { hinted = true; }, 4500);
    return () => clearTimeout(timer);
  });

  // ── expose for parent (sound toggle) ───────────────────────
  export function setSound(v) { soundOn = v; }

  // ── keyboard: ESC flips back to day ────────────────────────
  function onKey(e) {
    if (e.key === 'Escape' && mode === 'night' && !flipping) flip();
  }
</script>

<svelte:window on:keydown={onKey} />

<!-- The trigger: the period after "Rene" -->
<button
  class="dot"
  class:hinted
  on:click={flip}
  aria-label="Flip the tape — switch to the B-side"
  title="."
>.</button>

<!-- Full-screen flip overlay (only visible during transition) -->
<div class="flip-overlay" class:active={flipping} aria-hidden="true">
  <div class="cassette">
    <div class="cassette-body" class:flipping>
      <div class="reel reel-l"><span class="hub"></span></div>
      <div class="reel reel-r"><span class="hub"></span></div>
      <div class="label">
        <span class="side side-a">A · day</span>
        <span class="side side-b">B · night</span>
      </div>
      <div class="tape-window"></div>
    </div>
  </div>
</div>

<style>
  /* the dot — sits inline in the wordmark */
  .dot {
    display: inline-block;
    color: var(--accent);
    font: inherit;
    background: none;
    border: none;
    padding: 0 0.05em;
    margin: 0;
    cursor: pointer;
    transform-origin: center;
    transition: transform 0.25s ease, filter 0.25s ease;
    line-height: 1;
  }
  .dot:focus-visible { outline: 2px dashed var(--accent); outline-offset: 4px; border-radius: 2px; }
  .dot:hover         { transform: scale(1.25); filter: drop-shadow(0 0 6px var(--accent)); }
  .dot.hinted        { animation: pulseSoft 2.6s ease-in-out infinite; }
  .dot.hinted:hover  { animation: none; }

  @keyframes pulseSoft {
    0%, 100% { transform: scale(1);    opacity: 1;   }
    50%      { transform: scale(1.18); opacity: 0.75; }
  }

  /* ── flip overlay ──────────────────────────────────────── */
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

  /* ── cassette art ──────────────────────────────────────── */
  .cassette {
    width: min(80vw, 340px);
    aspect-ratio: 5 / 3;
    perspective: 1200px;
  }
  .cassette-body {
    position: relative;
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
    border: 2px solid var(--accent);
    border-radius: 6px;
    transform-style: preserve-3d;
    transition: transform 1100ms cubic-bezier(.7,.05,.2,1);
    box-shadow: 0 12px 32px rgba(0,0,0,.45);
  }
  .cassette-body.flipping { transform: rotateY(540deg); }

  .reel {
    position: absolute; top: 50%;
    width: 22%; aspect-ratio: 1;
    border-radius: 50%;
    background: radial-gradient(circle, #444 0 35%, #1a1a1a 36% 60%, #333 61%);
    transform: translateY(-50%);
    animation: spin 1.6s linear infinite paused;
  }
  .reel-l { left: 12%; }
  .reel-r { right: 12%; }
  .cassette-body.flipping .reel { animation-play-state: running; }
  .hub {
    position: absolute; inset: 30%;
    border-radius: 50%;
    background: #0a0a0a;
    box-shadow: inset 0 0 0 1px #555;
  }
  @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

  .label {
    position: absolute;
    left: 50%; top: 18%;
    transform: translateX(-50%);
    width: 56%; height: 22%;
    background: var(--bg);
    border: 1px solid var(--accent);
    border-radius: 3px;
    display: grid; place-items: center;
    font-family: 'VT323', monospace;
    font-size: 1rem;
    color: var(--fg);
    letter-spacing: 0.15em;
    overflow: hidden;
  }
  .side { position: absolute; transition: opacity 400ms ease, transform 400ms ease; }
  .side-a { opacity: 1; transform: translateY(0); }
  .side-b { opacity: 0; transform: translateY(120%); }
  :global([data-mode='night']) .side-a { opacity: 0; transform: translateY(-120%); }
  :global([data-mode='night']) .side-b { opacity: 1; transform: translateY(0); }

  .tape-window {
    position: absolute;
    left: 8%; right: 8%; bottom: 14%;
    height: 22%;
    background: linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
    border-radius: 2px;
    box-shadow: inset 0 0 0 1px #333;
  }
</style>
