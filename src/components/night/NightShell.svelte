<script>
  import { onMount } from 'svelte';
  import { links } from '../../data/links';

  let scrollY = 0;
  let viewport = 800;
  let mounted = false;

  // Update CSS vars based on scroll for parallax effects
  function onScroll() {
    scrollY = window.scrollY;
    document.documentElement.style.setProperty('--scroll', scrollY + 'px');
  }

  onMount(() => {
    viewport = window.innerHeight;
    mounted = true;
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  // small helper: scenes are 100vh each, fade in based on scroll position
  function progress(idx) {
    if (!mounted) return 0;
    const start = idx * viewport - viewport * 0.25;
    const end   = idx * viewport + viewport * 0.5;
    return Math.max(0, Math.min(1, (scrollY - start) / (end - start)));
  }

  const music = links.filter((l) => l.category === 'music' || l.category === 'video');
  const photo = links.filter((l) => l.category === 'photo');
</script>

<div class="night" aria-label="B-side">
  <div class="scanlines" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

  <!-- ── Scene 0 — Arrival ─────────────────────────────────── -->
  <section class="scene scene-arrival" style="opacity: {1 - progress(0)}">
    <div class="terminal">
      <div class="prompt"><span class="user">rene@b-side</span>:<span class="path">~</span>$ <span class="cursor">_</span></div>
      <div class="lines">
        <div>&gt; tape inserted &mdash; B-side detected</div>
        <div>&gt; loading <span class="hl">music</span> / <span class="hl">lenses</span> / <span class="hl">garage</span> / <span class="hl">lab</span></div>
        <div class="tagline">music that will make you groove.</div>
      </div>
      <div class="scroll-cue">scroll ↓</div>
    </div>
  </section>

  <!-- ── Scene 1 — Decks ───────────────────────────────────── -->
  <section class="scene scene-decks" style="--p: {progress(1)}">
    <div class="scene-inner">
      <div class="channel-label">CH. 01 — DECKS</div>
      <h2 class="scene-title">decks &amp; mixes</h2>
      <p class="scene-blurb">
        Live sets on Twitch, mixes everywhere else. <span class="alias">psychosaucequatch</span>
        / <span class="alias">psychosassquatch</span> / <span class="alias">psychosasquatch</span> &mdash;
        same person, three spellings, depending on which platform let me have the name.
      </p>
      <ul class="link-grid">
        {#each music as m}
          <li>
            <a href={m.url} target="_blank" rel="noopener noreferrer">
              <span class="lbl">{m.label}</span>
              <span class="hdl">@{m.handle}</span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </section>

  <!-- ── Scene 2 — Lenses (photography) ─────────────────────── -->
  <section class="scene scene-lenses" style="--p: {progress(2)}">
    <div class="scene-inner">
      <div class="channel-label">CH. 02 — LENSES</div>
      <h2 class="scene-title">photography</h2>
      <p class="scene-blurb">
        Shot on whatever's nearby. Mostly people in motion, sometimes a parking-lot
        at 2am that wouldn't shut up.
      </p>
      <ul class="link-grid">
        {#each photo as m}
          <li>
            <a href={m.url} target="_blank" rel="noopener noreferrer">
              <span class="lbl">{m.label}</span>
              <span class="hdl">@{m.handle}</span>
            </a>
          </li>
        {/each}
        <li class="placeholder-tile">
          <span class="lbl">More on madm3x.com</span>
          <span class="hdl">[soon]</span>
        </li>
      </ul>
    </div>
  </section>

  <!-- ── Scene 3 — Garage (motorcycles) ─────────────────────── -->
  <section class="scene scene-garage" style="--p: {progress(3)}">
    <div class="scene-inner">
      <div class="channel-label">CH. 03 — GARAGE</div>
      <h2 class="scene-title">motorcycles</h2>
      <p class="scene-blurb">
        [content placeholder &mdash; bike(s), rides, photos when you have them.]
      </p>
    </div>
  </section>

  <!-- ── Scene 4 — Lab (projects) ───────────────────────────── -->
  <section class="scene scene-lab" style="--p: {progress(4)}">
    <div class="scene-inner">
      <div class="channel-label">CH. 04 — LAB</div>
      <h2 class="scene-title">side projects</h2>
      <p class="scene-blurb">
        Experiments. Half-finished things. The SIGINT Sentinel hackathon project is in
        here when it gets dusted off.
      </p>
    </div>
  </section>

  <!-- ── Scene 5 — Now ──────────────────────────────────────── -->
  <section class="scene scene-now" style="--p: {progress(5)}">
    <div class="scene-inner">
      <div class="channel-label">CH. 05 — NOW</div>
      <h2 class="scene-title">currently</h2>
      <p class="scene-blurb">
        [Live Twitch status / now playing / latest IG post &mdash; wired in Phase 4 via
        Cloudflare Workers.]
      </p>
      <p class="fin">fin. &mdash; press <kbd>ESC</kbd> to return to A-side.</p>
    </div>
  </section>

  <div class="scroll-meter" aria-hidden="true">
    <div class="bar" style="height: {Math.min(100, (scrollY / (viewport * 5)) * 100)}%"></div>
  </div>
</div>

<style>
  .night {
    position: relative;
    background:
      radial-gradient(ellipse at 50% 0%, #2a0a4a 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, #4a0a2a 0%, transparent 50%),
      var(--bg);
    color: var(--fg);
    min-height: 100vh;
    font-family: 'JetBrains Mono', monospace;
  }

  .scanlines {
    position: fixed; inset: 0;
    background-image: repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 2px,
      rgba(255, 255, 255, 0.025) 2px,
      rgba(255, 255, 255, 0.025) 3px
    );
    pointer-events: none;
    z-index: 1;
  }
  .grain {
    position: fixed; inset: 0;
    background-image: radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
    pointer-events: none;
    z-index: 1;
  }

  .scene {
    position: relative;
    min-height: 100vh;
    padding: clamp(2rem, 6vw, 6rem) clamp(1.5rem, 6vw, 4rem);
    display: flex; align-items: center; justify-content: center;
    z-index: 2;
  }
  .scene-inner { width: 100%; max-width: 720px; }

  /* ── arrival ───────────────────────────────────────────── */
  .scene-arrival {
    position: sticky; top: 0;
  }
  .terminal {
    width: 100%; max-width: 640px;
    border: 1px solid var(--accent);
    border-radius: 4px;
    padding: 1.5rem 1.75rem;
    background: rgba(8, 4, 26, 0.7);
    backdrop-filter: blur(4px);
    box-shadow: 0 0 40px rgba(255, 43, 138, 0.18);
  }
  .prompt {
    font-size: 0.95rem;
    color: var(--night-cyan, #00f0ff);
    margin-bottom: 1rem;
  }
  .user { color: var(--night-green, #4dff88); }
  .path { color: var(--night-amber, #ffb74d); }
  .cursor { animation: blink 1.2s steps(2) infinite; color: var(--accent); }
  .lines div { line-height: 1.7; font-size: 0.92rem; color: var(--muted); }
  .hl { color: var(--accent); }
  .tagline {
    margin-top: 1rem;
    font-family: 'VT323', monospace;
    color: var(--fg);
    font-size: 1.2rem;
    letter-spacing: 0.05em;
  }
  .scroll-cue {
    margin-top: 1.5rem;
    font-size: 0.78rem;
    color: var(--muted);
    letter-spacing: 0.3em;
    animation: bounce 2s ease-in-out infinite;
  }

  /* ── channel scenes ────────────────────────────────────── */
  .channel-label {
    font-size: 0.78rem;
    color: var(--accent);
    letter-spacing: 0.25em;
    margin-bottom: 1rem;
  }
  .scene-title {
    font-family: 'VT323', monospace;
    font-size: clamp(2rem, 7vw, 4rem);
    color: var(--fg);
    letter-spacing: 0.02em;
    line-height: 1;
    text-shadow: 0 0 30px rgba(255, 43, 138, 0.35);
    margin-bottom: 1.25rem;
    transform: translateY(calc((1 - var(--p, 0)) * 24px));
    opacity: var(--p, 0.3);
    transition: transform 0.4s ease, opacity 0.4s ease;
  }
  .scene-blurb {
    color: var(--muted);
    line-height: 1.7;
    max-width: 52ch;
    transform: translateY(calc((1 - var(--p, 0)) * 18px));
    opacity: var(--p, 0.2);
    transition: transform 0.4s ease, opacity 0.4s ease;
  }
  .alias {
    font-family: 'JetBrains Mono', monospace;
    color: var(--night-cyan, #00f0ff);
    font-size: 0.92em;
  }

  .link-grid {
    list-style: none;
    margin-top: 1.5rem;
    display: grid; gap: 0.6rem;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
  .link-grid a, .placeholder-tile {
    display: flex; flex-direction: column; gap: 0.2rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--line);
    border-radius: 3px;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  .link-grid a:hover {
    border-color: var(--accent);
    background: rgba(255, 43, 138, 0.06);
    transform: translateX(2px);
  }
  .placeholder-tile { opacity: 0.5; }
  .lbl {
    color: var(--fg);
    font-size: 0.92rem;
    letter-spacing: 0.05em;
  }
  .hdl {
    color: var(--muted);
    font-size: 0.78rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .fin {
    margin-top: 2.5rem;
    color: var(--muted);
    font-size: 0.9rem;
  }
  .fin kbd {
    font-family: 'JetBrains Mono', monospace;
    padding: 1px 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--line);
    border-radius: 3px;
    font-size: 0.8rem;
  }

  /* ── scroll meter ──────────────────────────────────────── */
  .scroll-meter {
    position: fixed;
    right: 0.75rem; top: 50%;
    transform: translateY(-50%);
    width: 2px; height: 40vh;
    background: var(--line);
    z-index: 5;
  }
  .scroll-meter .bar {
    width: 100%;
    background: var(--accent);
    transition: height 0.1s linear;
  }

  @keyframes blink { 50% { opacity: 0.2; } }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50%      { transform: translateY(4px); opacity: 0.5; }
  }
</style>
