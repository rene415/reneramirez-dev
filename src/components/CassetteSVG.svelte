<script>
  // a richer cassette graphic — used inside CassetteToggle during the flip
  export let spinning = false;
  export let side = 'A';   // 'A' or 'B'
</script>

<svg class="cassette-svg" class:spinning viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#3a3a3a"/>
      <stop offset="40%"  stop-color="#1f1f1f"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="bodyEdge" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="rgba(255,255,255,0.18)"/>
      <stop offset="6%"   stop-color="rgba(255,255,255,0.04)"/>
      <stop offset="94%"  stop-color="rgba(0,0,0,0.4)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <radialGradient id="reelGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#5a5a5a"/>
      <stop offset="55%" stop-color="#1f1f1f"/>
      <stop offset="100%" stop-color="#000"/>
    </radialGradient>
    <linearGradient id="labelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#f4efe5"/>
      <stop offset="100%" stop-color="#e5dfd0"/>
    </linearGradient>
    <linearGradient id="tapeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#1a1a1a"/>
      <stop offset="50%" stop-color="#3a2814"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <filter id="cassetteShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- body -->
  <g filter="url(#cassetteShadow)">
    <rect x="10" y="10" width="380" height="220" rx="10" fill="url(#bodyGrad)"/>
    <rect x="10" y="10" width="380" height="220" rx="10" fill="url(#bodyEdge)" />
    <rect x="10" y="10" width="380" height="220" rx="10" fill="none" stroke="#444" stroke-width="1.5"/>
  </g>

  <!-- 4 screws -->
  {#each [[30,30],[370,30],[30,210],[370,210]] as [x, y]}
    <g transform={`translate(${x} ${y})`}>
      <circle r="6" fill="#1a1a1a" stroke="#555" stroke-width="1"/>
      <line x1="-4" y1="0" x2="4" y2="0" stroke="#888" stroke-width="1"/>
    </g>
  {/each}

  <!-- top brand strip -->
  <text x="200" y="32" text-anchor="middle"
        font-family="VT323, monospace" font-size="14"
        fill="#888" letter-spacing="6">R · R · 9 0</text>

  <!-- label -->
  <g transform="translate(50 50)">
    <rect width="300" height="68" rx="3" fill="url(#labelGrad)" stroke="#c4571e" stroke-width="1.2"/>
    <!-- top stripe -->
    <rect x="0" y="0" width="300" height="14" rx="3" fill="#c4571e" opacity="0.85"/>
    <text x="150" y="11" text-anchor="middle"
          font-family="VT323, monospace" font-size="11"
          fill="#fff" letter-spacing="5">RENE RAMIREZ</text>
    <!-- side label -->
    <text x="14" y="32" font-family="VT323, monospace" font-size="20"
          fill="#161311" letter-spacing="3">SIDE {side}</text>
    <text x="286" y="32" text-anchor="end"
          font-family="VT323, monospace" font-size="11"
          fill="#5c554c" letter-spacing="2">
      {side === 'A' ? 'DAY' : 'NIGHT'}
    </text>
    <line x1="14" y1="40" x2="286" y2="40" stroke="#a8a097" stroke-width="0.5"/>
    <!-- tracklist -->
    {#if side === 'A'}
      <text x="14" y="55" font-family="VT323, monospace" font-size="10" fill="#5c554c">01. work</text>
      <text x="120" y="55" font-family="VT323, monospace" font-size="10" fill="#5c554c">02. currently</text>
      <text x="220" y="55" font-family="VT323, monospace" font-size="10" fill="#5c554c">03. contact</text>
    {:else}
      <text x="14" y="55" font-family="VT323, monospace" font-size="10" fill="#5c554c">01. decks</text>
      <text x="80" y="55" font-family="VT323, monospace" font-size="10" fill="#5c554c">02. lenses</text>
      <text x="148" y="55" font-family="VT323, monospace" font-size="10" fill="#5c554c">03. garage</text>
      <text x="220" y="55" font-family="VT323, monospace" font-size="10" fill="#5c554c">04. lab</text>
    {/if}
  </g>

  <!-- left reel window -->
  <g transform="translate(110 165)">
    <circle r="40" fill="#0a0a0a" stroke="#444" stroke-width="2"/>
    <circle r="36" fill="url(#reelGrad)"/>
    <g class="reel-spin reel-l">
      <!-- spokes (8 teeth) -->
      {#each [0,45,90,135,180,225,270,315] as a}
        <rect x="-2.5" y="-22" width="5" height="10" rx="1" fill="#1a1a1a"
              transform={`rotate(${a})`}/>
      {/each}
      <circle r="9" fill="#0a0a0a" stroke="#333" stroke-width="0.5"/>
      <circle r="3.5" fill="#222"/>
    </g>
  </g>

  <!-- right reel window -->
  <g transform="translate(290 165)">
    <circle r="40" fill="#0a0a0a" stroke="#444" stroke-width="2"/>
    <circle r="36" fill="url(#reelGrad)"/>
    <g class="reel-spin reel-r">
      {#each [0,45,90,135,180,225,270,315] as a}
        <rect x="-2.5" y="-22" width="5" height="10" rx="1" fill="#1a1a1a"
              transform={`rotate(${a})`}/>
      {/each}
      <circle r="9" fill="#0a0a0a" stroke="#333" stroke-width="0.5"/>
      <circle r="3.5" fill="#222"/>
    </g>
  </g>

  <!-- tape window (bottom) -->
  <g transform="translate(70 195)">
    <rect width="260" height="22" rx="3" fill="url(#tapeGrad)" stroke="#333"/>
    <rect x="2" y="9" width="256" height="4" fill="#6b3a1a" opacity="0.9"/>
    <rect x="2" y="13" width="256" height="1" fill="#3a2110" opacity="0.6"/>
  </g>

  <!-- bottom markings -->
  <text x="200" y="226" text-anchor="middle"
        font-family="VT323, monospace" font-size="8"
        fill="#666" letter-spacing="2">DOLBY B NR · TYPE I · 60 min · MADE IN BAY AREA</text>
</svg>

<style>
  .cassette-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .reel-spin {
    transform-origin: center;
    transform-box: fill-box;
  }
  .cassette-svg.spinning .reel-l { animation: spinL 1.2s linear infinite; }
  .cassette-svg.spinning .reel-r { animation: spinR 1.2s linear infinite; }
  @keyframes spinL { to { transform: rotate(360deg); } }
  @keyframes spinR { to { transform: rotate(-360deg); } }
</style>
