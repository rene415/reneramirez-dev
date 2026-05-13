<script>
  import { onMount } from 'svelte';

  let soundOn = true;        // default ON — music autoplays in Night

  onMount(() => {
    try {
      const stored = localStorage.getItem('rr.sound');
      // null = never set → respect default (ON). Otherwise respect choice.
      if (stored === 'off') soundOn = false;
      window.__rrSoundOn = soundOn;
      // Tell subscribers (NightShell etc.) the initial state so they
      // can spin up audio on the first user gesture.
      window.dispatchEvent(new CustomEvent('rr-sound', { detail: soundOn }));
    } catch (_) {}
  });

  function toggle() {
    soundOn = !soundOn;
    try {
      localStorage.setItem('rr.sound', soundOn ? 'on' : 'off');
      window.__rrSoundOn = soundOn;
      window.dispatchEvent(new CustomEvent('rr-sound', { detail: soundOn }));
    } catch (_) {}
  }
</script>

<button class="sound-toggle" on:click={toggle} aria-pressed={soundOn} title={soundOn ? 'Mute' : 'Enable sound'}>
  <span class="icon" aria-hidden="true">{soundOn ? '♫' : '⌀'}</span>
  <span class="lbl">{soundOn ? 'SOUND ON' : 'SOUND OFF'}</span>
</button>

<style>
  .sound-toggle {
    position: fixed;
    top: 1.25rem; right: 1.25rem;
    z-index: 50;
    display: inline-flex; align-items: center; gap: 0.45rem;
    padding: 0.4rem 0.7rem;
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--line);
    border-radius: 999px;
    font-family: 'VT323', monospace;
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .sound-toggle:hover {
    color: var(--fg);
    border-color: var(--accent);
  }
  .icon { font-size: 0.9rem; line-height: 1; }
  .lbl  { font-size: 0.8rem; }
  @media (max-width: 480px) {
    .lbl { display: none; }
    .sound-toggle { padding: 0.45rem; }
  }
</style>
