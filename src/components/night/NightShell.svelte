<script>
  import { onMount } from 'svelte';
  import { channels } from '../../data/channels';
  import { channelTracks } from '../../data/music';

  // ── state ──────────────────────────────────────────────────
  let index = 0;
  let holding = false;
  let holdProgress = 0;
  let transitioning = false;
  let glitchVariant = 'vhs';
  let framePulse = false;

  // Hold SPACE for 3s → next CHANNEL (random track from its pool) + drop
  const HOLD_MS = 3000;
  let holdStartedAt = 0;
  let rafId = 0;

  // music
  let trackIdx = 0;
  let lastPlayedIdx = -1;
  let isPlaying = false;
  let soundOn = true;
  let audioCtx, audioEl, sourceNode, filterNode, gainNode, analyser;
  // pinch/tear are one-shot animations — only good for the climax.
  // vhs/rgb/corrupt loop forever — used during the buildup so the
  // intensity is consistent until the drop fires.
  const BUILDUP_VARIANTS    = ['vhs', 'rgb', 'corrupt'];
  const TRANSITION_VARIANTS = ['vhs', 'rgb', 'corrupt', 'pinch', 'tear'];

  // visualizer / particles canvases
  let visCanvas, partCanvas;
  let particles = [];
  let visRaf = 0, partRaf = 0;

  // glitch text
  let displayedTitle = '';
  let glitchInterval = null;
  let ambientGlitchTimer = null;

  $: current = channels[index];
  $: accentColor = accentToVar(current?.accent);
  $: activeTracks = channelTracks[current.id] || [];
  $: currentTrack = activeTracks[trackIdx] || activeTracks[0] || null;

  function accentToVar(a) {
    switch (a) {
      case 'cyan':  return 'var(--night-cyan, #00f0ff)';
      case 'green': return 'var(--night-green, #4dff88)';
      case 'amber': return 'var(--night-amber, #ffb74d)';
      default:      return 'var(--accent)';
    }
  }

  // ── audio ──────────────────────────────────────────────────
  function setupAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.crossOrigin = 'anonymous';
    audioEl.addEventListener('ended', onTrackEnded);
    sourceNode = audioCtx.createMediaElementSource(audioEl);
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 20000;
    filterNode.Q.value = 1.1;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.55;
    // source → filter → analyser → gain → destination
    sourceNode
      .connect(filterNode)
      .connect(analyser)
      .connect(gainNode)
      .connect(audioCtx.destination);
  }

  function playRandomFromChannel(channelIdx = index) {
    const channel = channels[channelIdx];
    if (!channel) return;
    const pool = channelTracks[channel.id] || [];
    if (!pool.length) return;
    let newIdx;
    if (pool.length === 1) newIdx = 0;
    else {
      do { newIdx = Math.floor(Math.random() * pool.length); }
      while (newIdx === lastPlayedIdx);
    }
    trackIdx = newIdx;
    lastPlayedIdx = newIdx;
    setupAudio();
    if (!audioEl) return;
    audioEl.src = pool[newIdx].src;
    if (!soundOn) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    audioEl.play()
      .then(() => { isPlaying = true; })
      .catch(() => { isPlaying = false; });
  }
  function onTrackEnded() { playRandomFromChannel(index); }
  function togglePlay() {
    if (!audioEl) return;
    if (isPlaying) { audioEl.pause(); isPlaying = false; }
    else { audioEl.play().then(() => isPlaying = true).catch(() => {}); }
  }

  // ── filter automation ──────────────────────────────────────
  function holdFilterDown() {
    if (!filterNode) return;
    const t = audioCtx.currentTime;
    filterNode.frequency.cancelScheduledValues(t);
    filterNode.frequency.setValueAtTime(filterNode.frequency.value, t);
    filterNode.frequency.exponentialRampToValueAtTime(260, t + HOLD_MS / 1000);
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(gainNode.gain.value, t);
    gainNode.gain.exponentialRampToValueAtTime(0.30, t + HOLD_MS / 1000);
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
    const wasBuilding = currentFreq < 5000 || currentGain < 0.5;
    if (dropMode && wasBuilding) {
      filterNode.frequency.exponentialRampToValueAtTime(20000, t + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.80, t + 0.10);
      gainNode.gain.exponentialRampToValueAtTime(0.55, t + 0.8);
    } else if (dropMode) {
      filterNode.frequency.linearRampToValueAtTime(20000, t + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.55, t + 0.1);
    } else {
      filterNode.frequency.exponentialRampToValueAtTime(20000, t + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.55, t + 0.5);
    }
  }

  // ── glitch sound ───────────────────────────────────────────
  function glitchSound() {
    if (!soundOn) return;
    setupAudio();
    const ctx = audioCtx;
    const t = ctx.currentTime;
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
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t); src.stop(t + 0.22);
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100 + Math.random() * 80, t);
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(og).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.08);
  }

  function flashFrame() {
    framePulse = true;
    setTimeout(() => { framePulse = false; }, 400);
  }

  // ── camera shutter (synthesized SLR shutter — two clicks ~130ms apart) ──
  function cameraShutter() {
    if (!soundOn) return;
    setupAudio();
    const ctx = audioCtx;
    const t = ctx.currentTime;
    function click(start, freq, dur, peak) {
      const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.55;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      f.Q.value = 2.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak, start + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      src.connect(f).connect(g).connect(ctx.destination);
      src.start(start); src.stop(start + dur + 0.01);
    }
    click(t,         2300, 0.04, 0.34);   // mirror up / shutter open
    click(t + 0.13,  1500, 0.05, 0.30);   // shutter close / mirror down
  }

  // ── random channel on Night entry ─────────────────────────────
  // Every time the user flips into Night, land on a random channel
  // instead of always starting at Decks. Picks index, resets the
  // no-repeat-track tracker, glitches the title in, fires per-channel
  // side effects (visualizer toggle, camera shutter, etc.).
  function pickRandomChannel() {
    const newIndex = Math.floor(Math.random() * channels.length);
    index = newIndex;
    lastPlayedIdx = -1;
    glitchTitle(channels[newIndex].name);
    onChannelEnter(channels[newIndex].id);
  }

  // Shared "we just entered Night" routine — random channel + maybe music
  function onEnterNight() {
    pickRandomChannel();
    if (soundOn) playRandomFromChannel();
  }

  // ── on entering a channel: per-channel side effects ───────────
  function onChannelEnter(channelId) {
    // Visualizer: ONLY on Decks (the DJ channel). Manage the RAF so we
    // don't waste CPU drawing invisible bars elsewhere.
    if (channelId === 'decks') {
      if (!visRaf) visRaf = requestAnimationFrame(drawVisualizer);
    } else if (visRaf) {
      cancelAnimationFrame(visRaf);
      visRaf = 0;
      if (visCanvas) {
        const c = visCanvas.getContext('2d');
        c && c.clearRect(0, 0, visCanvas.width, visCanvas.height);
      }
    }
    // Photography: SLR shutter on arrival.
    if (channelId === 'lenses') cameraShutter();
  }

  // ── channel transition (shared) ────────────────────────────
  // The caller is responsible for setting `glitchVariant`. For a held
  // buildup the variant was already chosen at hold-start (so the visual
  // ramps with the same effect from 0 → 1). For direct jumps goChannel
  // picks fresh from the full variant pool (including one-shot ones).
  async function transitionChannel(targetIdx, isDrop) {
    if (transitioning) return;
    transitioning = true;
    try {
      glitchSound();
      holdFilterUp(isDrop);
      if (isDrop) flashFrame();
      await new Promise((r) => setTimeout(r, 240));
      if (targetIdx !== index) {
        index = targetIdx;
        lastPlayedIdx = -1;
        glitchTitle(channels[targetIdx].name);
        onChannelEnter(channels[targetIdx].id);
      }
      playRandomFromChannel(targetIdx);
      await new Promise((r) => setTimeout(r, 480));
    } finally {
      transitioning = false;
    }
  }
  async function goChannel(target) {
    if (target === index) return;
    // Direct jump — fresh variant from full pool (any animation OK since
    // there's no buildup to keep consistent).
    glitchVariant = TRANSITION_VARIANTS[Math.floor(Math.random() * TRANSITION_VARIANTS.length)];
    return transitionChannel(target, false);
  }
  function nextChannel() { goChannel((index + 1) % channels.length); }
  function prevChannel() { goChannel((index - 1 + channels.length) % channels.length); }
  async function fireHoldDrop() {
    const target = (index + 1) % channels.length;
    // Keep the variant the buildup was using — same effect intensifies → drops.
    return transitionChannel(target, true);
  }

  // ── hold loop ──────────────────────────────────────────────
  function tick(now) {
    if (!holding) { holdProgress = 0; return; }
    const elapsed = now - holdStartedAt;
    holdProgress = Math.min(1, elapsed / HOLD_MS);
    if (holdProgress >= 1) {
      holding = false;
      holdProgress = 0;
      fireHoldDrop();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }
  function startHold() {
    if (holding || transitioning) return;
    // Pick the variant NOW so the glitch overlay can ramp up consistently
    // through the hold buildup with the same animation.
    glitchVariant = BUILDUP_VARIANTS[Math.floor(Math.random() * BUILDUP_VARIANTS.length)];
    holding = true;
    holdStartedAt = performance.now();
    if (audioCtx) holdFilterDown();
    rafId = requestAnimationFrame(tick);
  }
  function endHold() {
    if (!holding) return;
    holding = false;
    holdProgress = 0;
    cancelAnimationFrame(rafId);
    holdFilterUp(false);
  }

  // ── glitch text on title ───────────────────────────────────
  const GLITCH_CHARS = '!@#$%^&*<>?/+=_01';
  function glitchTitle(target) {
    if (!target) return;
    if (glitchInterval) clearInterval(glitchInterval);
    let frame = 0;
    const total = 7;
    glitchInterval = setInterval(() => {
      if (frame >= total) {
        displayedTitle = target;
        clearInterval(glitchInterval);
        glitchInterval = null;
        return;
      }
      const noiseLevel = (1 - frame / total) * 0.7;
      displayedTitle = target.split('').map((ch) => {
        if (ch === ' ') return ' ';
        return Math.random() < noiseLevel
          ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          : ch;
      }).join('');
      frame++;
    }, 35);
  }
  function scheduleAmbientGlitch() {
    clearTimeout(ambientGlitchTimer);
    const delay = 9000 + Math.random() * 8000;
    ambientGlitchTimer = setTimeout(() => {
      if (current) glitchTitle(current.name);
      scheduleAmbientGlitch();
    }, delay);
  }

  // ── magnetic hover (Svelte action) ─────────────────────────
  function magnetize(node, strength = 0.18) {
    function onMove(e) {
      const r = node.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      node.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    }
    function onLeave() { node.style.transform = ''; }
    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return {
      destroy() {
        node.removeEventListener('mousemove', onMove);
        node.removeEventListener('mouseleave', onLeave);
      }
    };
  }

  // ── canvases ───────────────────────────────────────────────
  function sizeCanvas(c) {
    if (!c) return;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
  }

  function drawVisualizer() {
    visRaf = requestAnimationFrame(drawVisualizer);
    if (!visCanvas) return;
    const c = visCanvas.getContext('2d');
    const w = visCanvas.width;
    const h = visCanvas.height;
    c.clearRect(0, 0, w, h);
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    // mirror the FFT — symmetric bars rising from baseline
    const bars = 72;
    const step = Math.max(1, Math.floor((data.length * 0.65) / bars));
    const barW = w / bars;
    for (let i = 0; i < bars; i++) {
      const v = data[i * step] / 255;
      const barH = Math.max(1, v * h * 0.95);
      const grad = c.createLinearGradient(0, h, 0, h - barH);
      grad.addColorStop(0,    'rgba(255, 43, 138, 0.65)');
      grad.addColorStop(0.55, 'rgba(0, 240, 255, 0.40)');
      grad.addColorStop(1,    'rgba(0, 240, 255, 0)');
      c.fillStyle = grad;
      c.fillRect(i * barW + 1, h - barH, barW - 2, barH);
    }
  }

  function setupParticles() {
    if (!partCanvas) return;
    sizeCanvas(partCanvas);
    const w = partCanvas.width;
    const h = partCanvas.height;
    particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -Math.random() * 0.45 - 0.08,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.4 + 0.08,
      color: Math.random() < 0.55 ? '255, 43, 138' : '0, 240, 255',
    }));
  }
  function drawParticles() {
    partRaf = requestAnimationFrame(drawParticles);
    if (!partCanvas) return;
    const c = partCanvas.getContext('2d');
    const w = partCanvas.width;
    const h = partCanvas.height;
    c.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -5)  p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      c.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      c.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  // ── keyboard ───────────────────────────────────────────────
  function onKeyDown(e) {
    if (document.body.dataset.mode !== 'night') return;
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      startHold();
    }
    if (e.key >= '1' && e.key <= '5' && !transitioning) {
      const t = parseInt(e.key, 10) - 1;
      if (t < channels.length) goChannel(t);
    }
    if (e.key === 'ArrowRight' && !transitioning) { e.preventDefault(); nextChannel(); }
    if (e.key === 'ArrowLeft'  && !transitioning) { e.preventDefault(); prevChannel(); }
  }
  function onKeyUp(e) {
    if (document.body.dataset.mode !== 'night') return;
    if (e.code === 'Space') { e.preventDefault(); endHold(); }
  }

  // ── mount ──────────────────────────────────────────────────
  onMount(() => {
    displayedTitle = current?.name || '';
    const onSound = (e) => {
      const wasOff = !soundOn;
      soundOn = !!(e && e.detail);
      if (!soundOn) { if (audioEl) { audioEl.pause(); isPlaying = false; } return; }
      if (!audioCtx) setupAudio();
      if (wasOff && document.body.dataset.mode === 'night') playRandomFromChannel();
    };
    soundOn = !!window.__rrSoundOn;
    window.addEventListener('rr-sound', onSound);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    window.addEventListener('resize', setupParticles);

    const obs = new MutationObserver(() => {
      const m = document.body.dataset.mode;
      if (m === 'night') {
        onEnterNight();        // ← new: random channel + music
      } else {
        if (audioEl) { audioEl.pause(); isPlaying = false; }
        if (holding) endHold();
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-mode'] });

    // First mount runs AFTER client:visible fires, which happens AFTER
    // the cassette flip set data-mode='night'. So the MutationObserver
    // above won't see that initial change — explicit check here.
    if (document.body.dataset.mode === 'night') {
      onEnterNight();
    }

    // Particles always run (subtle ambient — only visible in Night
    // because the day-shell hides this whole element).
    setupParticles();
    partRaf = requestAnimationFrame(drawParticles);
    scheduleAmbientGlitch();
    // The visualizer RAF + initial channel selection are handled by
    // onEnterNight() below — no need to duplicate here.

    return () => {
      window.removeEventListener('rr-sound', onSound);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      window.removeEventListener('resize', setupParticles);
      obs.disconnect();
      cancelAnimationFrame(visRaf);
      cancelAnimationFrame(partRaf);
      clearTimeout(ambientGlitchTimer);
      if (glitchInterval) clearInterval(glitchInterval);
      if (audioEl) audioEl.pause();
    };
  });
</script>

<!-- Frame buildup — two SVG paths from bottom-middle meeting at top-middle -->
<svg
  class="frame-buildup"
  class:active={holding}
  class:flashing={framePulse}
  width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
  aria-hidden="true"
>
  <path
    d="M 50,100 L 0,100 L 0,0 L 50,0"
    fill="none" stroke="currentColor" stroke-width="3"
    stroke-linecap="square" pathLength="100" stroke-dasharray="100"
    stroke-dashoffset={100 - holdProgress * 100}
    vector-effect="non-scaling-stroke"
  />
  <path
    d="M 50,100 L 100,100 L 100,0 L 50,0"
    fill="none" stroke="currentColor" stroke-width="3"
    stroke-linecap="square" pathLength="100" stroke-dasharray="100"
    stroke-dashoffset={100 - holdProgress * 100}
    vector-effect="non-scaling-stroke"
  />
</svg>

<div class="night" aria-label="B-side">
  <!-- background canvases (behind content) -->
  <canvas bind:this={partCanvas} class="particles" aria-hidden="true"></canvas>
  <div class="scanlines" aria-hidden="true"></div>
  <div class="vignette"  aria-hidden="true"></div>

  <div class="hud-top">
    <span class="ch-name" style="color: {accentColor}">{current.name}</span>
  </div>

  <div class="stage" class:transitioning>
    {#key current.id}
      <article class="channel" data-id={current.id}>
        <h2 class="ch-title" style="text-shadow: 0 0 30px rgba(255,43,138,0.35);">
          {displayedTitle || current.name}
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
                   use:magnetize={0.15}
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
    {/key}
  </div>

  <!-- audio visualizer — only visible on the Decks channel -->
  <canvas
    bind:this={visCanvas}
    class="visualizer"
    class:visible={current?.id === 'decks'}
    aria-hidden="true"
  ></canvas>

  <!--
    Glitch overlay — opacity ramps with holdProgress (buildup), stays at
    1 during the actual transitioning state. CSS animations on g-l1/2/3
    run continuously regardless; opacity reveals them.
  -->
  <div
    class="glitch glitch-{glitchVariant}"
    style:opacity={transitioning ? 1 : (holding ? Math.min(1, holdProgress * 1.15) : 0)}
    aria-hidden="true"
  >
    <div class="g-l1"></div>
    <div class="g-l2"></div>
    <div class="g-l3"></div>
    <div class="g-static"></div>
  </div>

  <div class="hud-bottom">
    <div class="now-playing" class:playing={isPlaying}>
      <button class="np-btn play" on:click={togglePlay} aria-label={isPlaying ? 'pause' : 'play'}>
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <span class="np-title">{currentTrack ? currentTrack.title : '—'}</span>
      {#if currentTrack && currentTrack.date}
        <span class="np-date">{currentTrack.date}</span>
      {/if}
      <span class="np-pool">·  {current.name}  ·  {activeTracks.length} tracks</span>
    </div>
    <div class="channels-strip">
      {#each channels as c, i}
        <button
          class="ch-dot"
          class:active={i === index}
          on:click={() => goChannel(i)}
          aria-label={`Channel ${i + 1}: ${c.name}`}
          title={`${i + 1}. ${c.name}`}
        >{i + 1}</button>
      {/each}
    </div>
    <div class="hint">
      hold <kbd>SPACE</kbd> next channel · <kbd>1</kbd>–<kbd>5</kbd> jump · <kbd>←</kbd><kbd>→</kbd> · <kbd>ESC</kbd> A-side
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

  /* ── particles canvas ──────────────────────────────────── */
  .particles {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  /* ── audio visualizer canvas (only visible on Decks) ──── */
  .visualizer {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    width: 100%; height: 200px;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    mix-blend-mode: screen;
    filter: blur(0.4px);
    transition: opacity 0.6s ease;
  }
  .visualizer.visible { opacity: 0.55; }

  /* ── frame buildup (perimeter SVG, two halves) ─────────── */
  .frame-buildup {
    position: fixed; inset: 0;
    pointer-events: none; z-index: 9000;
    color: var(--accent);
    filter: drop-shadow(0 0 6px currentColor);
    opacity: 0;
    transition: opacity 180ms ease;
  }
  .frame-buildup.active   { opacity: 1; }
  .frame-buildup.flashing {
    opacity: 1 !important;
    color: #fff;
    filter:
      drop-shadow(0 0 18px #fff)
      drop-shadow(0 0 36px var(--accent));
    transition: all 380ms cubic-bezier(.2,.85,.4,1);
  }
  .frame-buildup.flashing path { stroke-width: 6; }

  /* ── HUD top ───────────────────────────────────────────── */
  .hud-top {
    position: absolute; top: 1rem; left: 1.25rem;
    z-index: 5;
    display: flex; gap: 1rem; align-items: center;
    font-size: 0.78rem; letter-spacing: 0.2em;
  }
  .ch-name {
    text-transform: lowercase;
    font-weight: 500;
  }

  /* ── stage / channel content with staggered entrance ───── */
  .stage {
    position: absolute; inset: 0;
    overflow-y: auto; overflow-x: hidden;
    padding: clamp(4rem, 8vh, 6rem) clamp(1.5rem, 6vw, 4rem) 10rem;
    z-index: 3;
    transition: opacity 400ms ease, transform 400ms ease, filter 400ms ease;
  }
  .stage::-webkit-scrollbar { width: 0; }
  .stage.transitioning {
    opacity: 0.2; transform: translateY(8px); filter: blur(2px);
  }
  .channel { max-width: 760px; margin: 0 auto; }
  /* each direct child fades up with a stagger — #key re-creates the
     <article> on channel change so animations re-fire from zero */
  .channel > * {
    opacity: 0;
    transform: translateY(14px);
    animation: stagIn 680ms cubic-bezier(.2,.85,.4,1) forwards;
  }
  .channel > *:nth-child(1) { animation-delay: 0ms; }
  .channel > *:nth-child(2) { animation-delay: 70ms; }
  .channel > *:nth-child(3) { animation-delay: 140ms; }
  .channel > *:nth-child(4) { animation-delay: 210ms; }
  .channel > *:nth-child(5) { animation-delay: 280ms; }
  .channel > *:nth-child(6) { animation-delay: 350ms; }
  .channel > *:nth-child(7) { animation-delay: 420ms; }
  .channel > *:nth-child(8) { animation-delay: 490ms; }
  @keyframes stagIn {
    to { opacity: 1; transform: translateY(0); }
  }

  .ch-title {
    font-family: 'VT323', monospace;
    font-size: clamp(2.5rem, 9vw, 5rem);
    line-height: 1; margin-bottom: 1rem; letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
  }
  .ch-tagline { font-size: clamp(1rem, 2.5vw, 1.2rem); margin-bottom: 1.25rem; letter-spacing: 0.02em; }
  .ch-body { color: var(--muted); line-height: 1.7; max-width: 52ch; margin-bottom: 1.5rem; }

  .aliases { margin: 1rem 0 1.5rem; font-size: 0.95rem; letter-spacing: 0.05em; }
  .alias { padding: 0 0.25rem; }
  .sep { color: var(--muted); padding: 0 0.15rem; }

  .facts { display: grid; gap: 0.5rem; margin: 1.5rem 0; max-width: 36rem; }
  .fact {
    display: grid; grid-template-columns: 11rem 1fr; gap: 1rem;
    padding: 0.65rem 0; border-top: 1px solid var(--line);
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
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.18s cubic-bezier(.3,1.4,.4,1);
    will-change: transform;
  }
  .links a:hover {
    border-color: var(--ch-accent, var(--accent));
    background: rgba(255,255,255,0.03);
    box-shadow: 0 4px 18px -8px rgba(255,43,138,0.5);
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
    transition: transform 0.4s cubic-bezier(.2,.85,.4,1);
  }
  .photos figure:hover { transform: scale(1.02); border-color: var(--accent); }
  .photos img { width: 100%; height: 100%; object-fit: cover; display: block;
                transition: transform 0.6s cubic-bezier(.2,.85,.4,1); }
  .photos figure:hover img { transform: scale(1.06); }
  .photo-empty {
    margin-top: 1.5rem; color: var(--muted);
    font-size: 0.85rem; padding: 0.85rem;
    border: 1px dashed var(--line); border-radius: 3px;
    max-width: 52ch;
  }
  .photo-empty code {
    background: rgba(255,255,255,0.05);
    padding: 1px 5px; border-radius: 2px; font-size: 0.85em;
  }

  /* ── HUD bottom ────────────────────────────────────────── */
  .hud-bottom {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 1rem 1.5rem 1.25rem;
    background: linear-gradient(to top, rgba(0,0,0,0.62), transparent);
    z-index: 6;
    display: grid; gap: 0.7rem; justify-items: center; text-align: center;
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
  .ch-dot:hover { color: var(--fg); border-color: var(--accent); transform: translateY(-2px); }
  .ch-dot.active {
    color: var(--bg); background: var(--accent); border-color: var(--accent);
    box-shadow: 0 0 14px rgba(255, 43, 138, 0.4);
  }
  .now-playing {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.45rem 0.95rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    font-size: 0.78rem;
    color: var(--muted);
    letter-spacing: 0.06em;
    max-width: min(94vw, 600px);
    background: rgba(0,0,0,0.42);
    backdrop-filter: blur(6px);
  }
  .now-playing.playing { border-color: var(--accent); color: var(--fg); box-shadow: 0 0 16px rgba(255,43,138,0.25); }
  .np-btn {
    background: transparent; border: none; color: inherit; cursor: pointer;
    padding: 0.15rem 0.4rem; font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem; line-height: 1;
  }
  .np-btn:hover { color: var(--accent); }
  .np-btn.play  { color: var(--fg); }
  .np-title { color: var(--fg); margin-left: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 18rem; }
  .np-date  { font-size: 0.7rem; color: var(--muted); opacity: 0.7; }
  .np-pool  { font-size: 0.7rem; color: var(--muted); opacity: 0.6; letter-spacing: 0.08em; }
  @media (max-width: 600px) {
    .np-pool, .np-date { display: none; }
    .np-title { max-width: 10rem; }
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

  /* ── glitch overlay variants ───────────────────────────── */
  /* Opacity is driven inline by JS (holdProgress + transitioning) so the
     buildup is smooth. The animated children (g-l1/2/3) run their CSS
     keyframes continuously regardless of opacity. */
  .glitch {
    position: absolute; inset: 0;
    pointer-events: none; z-index: 4;
    opacity: 0;
  }
  .glitch > div { position: absolute; inset: 0; }

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
    background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px);
    mix-blend-mode: screen;
  }
  @keyframes vhsSlide {
    0%   { transform: translateY(-15%) skewX(-4deg); opacity: 0.6; }
    50%  { transform: translateY(30%)  skewX(2deg);  opacity: 0.9; }
    100% { transform: translateY(-10%) skewX(-3deg); opacity: 0.5; }
  }

  .glitch-rgb { mix-blend-mode: screen; }
  .glitch-rgb .g-l1 { background: rgba(255,43,138,0.45); animation: rgbShiftR 0.4s ease-in-out infinite; }
  .glitch-rgb .g-l2 { background: rgba(0,240,255,0.4);   animation: rgbShiftG 0.5s ease-in-out infinite; }
  .glitch-rgb .g-l3 { background: rgba(77,255,136,0.35); animation: rgbShiftB 0.55s ease-in-out infinite; }
  .glitch-rgb .g-static { background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px); }
  @keyframes rgbShiftR { 0%,100% { transform: translateX(-8px); } 50% { transform: translateX(10px); } }
  @keyframes rgbShiftG { 0%,100% { transform: translateX(8px); }  50% { transform: translateX(-10px); } }
  @keyframes rgbShiftB { 0%,100% { transform: translateY(-4px); } 50% { transform: translateY(6px); } }

  .glitch-corrupt .g-l1 {
    background: linear-gradient(90deg, transparent 12%, var(--accent) 12% 22%, transparent 22% 60%, rgba(0,240,255,0.55) 60% 72%, transparent 72%);
    height: 14%; top: 32%; animation: corruptShift 0.18s steps(3) infinite;
  }
  .glitch-corrupt .g-l2 {
    background: linear-gradient(90deg, transparent 5%, rgba(77,255,136,0.6) 5% 18%, transparent 18% 70%, var(--accent) 70% 88%, transparent 88%);
    height: 8%; top: 55%; animation: corruptShift 0.13s steps(4) infinite reverse;
  }
  .glitch-corrupt .g-l3 {
    background: linear-gradient(90deg, transparent 30%, rgba(255,183,77,0.5) 30% 38%, transparent 38% 65%, rgba(255,255,255,0.4) 65% 75%, transparent 75%);
    height: 6%; top: 72%; animation: corruptShift 0.21s steps(5) infinite;
  }
  .glitch-corrupt .g-static {
    background-image:
      repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 5px),
      repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0 1px, transparent 1px 3px);
  }
  @keyframes corruptShift { 0% { transform: translateX(0)   scaleX(1); } 50% { transform: translateX(-8%) scaleX(0.97); } 100% { transform: translateX(6%)  scaleX(1.02); } }

  .glitch-pinch .g-l1 { background: var(--bg); animation: pinchTop 0.7s ease-in-out; }
  .glitch-pinch .g-l2 { background: var(--bg); animation: pinchBot 0.7s ease-in-out; }
  .glitch-pinch .g-l3 { background: rgba(255,255,255,0.85); height: 2px; top: 50%; animation: pinchLine 0.7s ease-in-out; box-shadow: 0 0 12px var(--accent); }
  @keyframes pinchTop  { 0%{height:0;top:0;} 60%{height:48%;top:0;} 100%{height:50%;top:0;} }
  @keyframes pinchBot  { 0%{height:0;bottom:0;top:auto;} 60%{height:48%;bottom:0;top:auto;} 100%{height:50%;bottom:0;top:auto;} }
  @keyframes pinchLine { 0%{opacity:0; transform: scaleX(0);} 40%{opacity:1; transform: scaleX(1.05);} 100%{opacity:0; transform: scaleX(0);} }

  .glitch-tear .g-l1 { background: var(--bg); clip-path: polygon(0 0, 100% 0, 100% 45%, 0 55%); animation: tearTop 0.55s ease-in-out; }
  .glitch-tear .g-l2 { background: var(--bg); clip-path: polygon(0 55%, 100% 45%, 100% 100%, 0 100%); animation: tearBot 0.55s ease-in-out; }
  .glitch-tear .g-l3 { background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%); height: 8%; top: 46%; animation: tearStatic 0.55s ease-in-out; mix-blend-mode: screen; }
  @keyframes tearTop    { 0%{transform:translateX(0);} 50%{transform:translateX(-6%);} 100%{transform:translateX(0);} }
  @keyframes tearBot    { 0%{transform:translateX(0);} 50%{transform:translateX(6%);}  100%{transform:translateX(0);} }
  @keyframes tearStatic { 0%,100%{opacity:0;} 50%{opacity:1;} }
</style>
