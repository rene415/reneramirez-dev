<script>
  // Stroke-only icon set matching the night-mode aesthetic.
  // Use as: <GearIcon name="mic" />
  export let name = 'plug';
</script>

<svg
  class="gi"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'daw'}
    <!-- Ableton-style clip launcher: 3x3 grid, one cell highlighted -->
    <rect x="3" y="3" width="18" height="18" rx="1.5" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.55" stroke="none" />
  {:else if name === 'pad'}
    <!-- Pad controller: 4x4 grid -->
    <g stroke-width="1.2">
      <rect x="2.5" y="2.5"  width="4" height="4" rx="0.6" />
      <rect x="7.5" y="2.5"  width="4" height="4" rx="0.6" />
      <rect x="12.5" y="2.5" width="4" height="4" rx="0.6" />
      <rect x="17.5" y="2.5" width="4" height="4" rx="0.6" />
      <rect x="2.5" y="7.5"  width="4" height="4" rx="0.6" />
      <rect x="7.5" y="7.5"  width="4" height="4" rx="0.6" fill="currentColor" opacity="0.5" stroke="none" />
      <rect x="12.5" y="7.5" width="4" height="4" rx="0.6" />
      <rect x="17.5" y="7.5" width="4" height="4" rx="0.6" />
      <rect x="2.5" y="12.5" width="4" height="4" rx="0.6" />
      <rect x="7.5" y="12.5" width="4" height="4" rx="0.6" />
      <rect x="12.5" y="12.5" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.5" stroke="none" />
      <rect x="17.5" y="12.5" width="4" height="4" rx="0.6" />
      <rect x="2.5" y="17.5" width="4" height="4" rx="0.6" />
      <rect x="7.5" y="17.5" width="4" height="4" rx="0.6" />
      <rect x="12.5" y="17.5" width="4" height="4" rx="0.6" />
      <rect x="17.5" y="17.5" width="4" height="4" rx="0.6" />
    </g>
  {:else if name === 'monitor'}
    <!-- Studio monitor: cabinet with woofer + tweeter -->
    <rect x="6" y="2" width="12" height="20" rx="1.2" />
    <circle cx="12" cy="9" r="3.5" />
    <circle cx="12" cy="9" r="1" />
    <circle cx="12" cy="16.5" r="1.6" />
    <line x1="8" y1="4.5" x2="16" y2="4.5" opacity="0.5" />
  {:else if name === 'interface'}
    <!-- Audio interface: rack box with two big knobs + jacks -->
    <rect x="2" y="6" width="20" height="12" rx="1.5" />
    <circle cx="7" cy="12" r="2.4" />
    <line x1="7" y1="9.8" x2="7" y2="11" />
    <circle cx="14" cy="12" r="2.4" />
    <line x1="14" y1="9.8" x2="14" y2="11" />
    <circle cx="19" cy="10.5" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="19" cy="13.5" r="0.7" fill="currentColor" stroke="none" />
  {:else if name === 'mic'}
    <!-- Studio mic: capsule + stand -->
    <rect x="8.5" y="2" width="7" height="11" rx="3.5" />
    <line x1="10.5" y1="5" x2="13.5" y2="5" opacity="0.55" />
    <line x1="10.5" y1="7.5" x2="13.5" y2="7.5" opacity="0.55" />
    <line x1="10.5" y1="10" x2="13.5" y2="10" opacity="0.55" />
    <path d="M5 13a7 7 0 0 0 14 0" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="9" y1="22" x2="15" y2="22" />
  {:else if name === 'keyboard'}
    <!-- Piano keys: white + black -->
    <rect x="2" y="6" width="20" height="13" rx="1" />
    <line x1="6.5" y1="6" x2="6.5" y2="19" />
    <line x1="11" y1="6" x2="11" y2="19" />
    <line x1="15.5" y1="6" x2="15.5" y2="19" />
    <rect x="4.8" y="6" width="2.5" height="7" rx="0.3" fill="currentColor" stroke="none" />
    <rect x="9.5" y="6" width="2.5" height="7" rx="0.3" fill="currentColor" stroke="none" />
    <rect x="14"  y="6" width="2.5" height="7" rx="0.3" fill="currentColor" stroke="none" />
    <rect x="18.5" y="6" width="2.5" height="7" rx="0.3" fill="currentColor" stroke="none" />
  {:else if name === 'synth'}
    <!-- Synth: keys with knob row above -->
    <rect x="2" y="3" width="20" height="6" rx="1" />
    <circle cx="6" cy="6" r="1.3" />
    <circle cx="10" cy="6" r="1.3" />
    <circle cx="14" cy="6" r="1.3" />
    <circle cx="18" cy="6" r="1.3" />
    <rect x="2" y="11" width="20" height="9" rx="0.8" />
    <line x1="6" y1="11" x2="6" y2="20" />
    <line x1="10" y1="11" x2="10" y2="20" />
    <line x1="14" y1="11" x2="14" y2="20" />
    <line x1="18" y1="11" x2="18" y2="20" />
    <rect x="4.5" y="11" width="1.6" height="5" fill="currentColor" stroke="none" />
    <rect x="8.5" y="11" width="1.6" height="5" fill="currentColor" stroke="none" />
    <rect x="13.2" y="11" width="1.6" height="5" fill="currentColor" stroke="none" />
    <rect x="17.2" y="11" width="1.6" height="5" fill="currentColor" stroke="none" />
  {:else if name === 'plug'}
    <!-- VST / plug-in: TRS jack -->
    <line x1="12" y1="2" x2="12" y2="6" />
    <rect x="9.5" y="6" width="5" height="9" rx="0.5" />
    <line x1="9.5" y1="8.5"  x2="14.5" y2="8.5" opacity="0.55" />
    <line x1="9.5" y1="11"   x2="14.5" y2="11"   opacity="0.55" />
    <path d="M9.5 15v3a2.5 2.5 0 0 0 2.5 2.5h0a2.5 2.5 0 0 0 2.5 -2.5v-3" />
    <line x1="12" y1="20.5" x2="12" y2="22" />
  {/if}
</svg>

<style>
  .gi {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
