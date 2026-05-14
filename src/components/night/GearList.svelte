<script>
  import GearIcon from './GearIcon.svelte';
  // gear: { haves: GearItem[], wants: GearItem[] }
  export let gear = { haves: [], wants: [] };
  export let accentColor = 'var(--accent)';
</script>

<div class="gear" style="--gl-accent: {accentColor};">
  <div class="gear-section">
    <h4 class="gear-heading">
      <span class="dot" aria-hidden="true">●</span>
      <span>In the rack</span>
      <span class="count">{gear.haves.length}</span>
    </h4>
    <ul class="gear-list">
      {#each gear.haves as item}
        <li class="gear-item">
          <div class="icon-wrap"><GearIcon name={item.icon} /></div>
          <div class="info">
            <div class="name">{item.name}</div>
            <div class="meta">
              <span class="cat">{item.category}</span>
              {#if item.blurb}<span class="sep">·</span><span class="blurb">{item.blurb}</span>{/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>

  {#if gear.wants && gear.wants.length}
    <div class="gear-section wishlist">
      <h4 class="gear-heading">
        <span class="dot dim" aria-hidden="true">○</span>
        <span>Wishlist</span>
        <span class="count">{gear.wants.length}</span>
      </h4>
      <ul class="gear-list">
        {#each gear.wants as item}
          <li class="gear-item want">
            <div class="icon-wrap"><GearIcon name={item.icon} /></div>
            <div class="info">
              <div class="name">{item.name}</div>
              <div class="meta">
                <span class="cat">{item.category}</span>
                {#if item.blurb}<span class="sep">·</span><span class="blurb">{item.blurb}</span>{/if}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .gear {
    display: grid;
    gap: 2.5rem;
    margin-top: 1.75rem;
  }
  .gear-heading {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    font-family: 'VT323', monospace;
    font-size: 0.95rem;
    color: var(--muted);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--line);
  }
  .gear-heading .dot { color: var(--gl-accent); font-size: 0.7rem; line-height: 1; }
  .gear-heading .dot.dim { color: var(--muted); }
  .gear-heading .count {
    margin-left: auto;
    color: var(--muted);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    opacity: 0.7;
  }

  .gear-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.7rem;
  }

  .gear-item {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 0.85rem;
    align-items: center;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--line);
    border-radius: 4px;
    background: color-mix(in oklab, var(--bg), var(--fg) 2%);
    transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
  }
  .gear-item:hover {
    border-color: var(--gl-accent);
    background: color-mix(in oklab, var(--bg), var(--gl-accent) 6%);
    transform: translateY(-2px);
  }
  .gear-item.want { opacity: 0.78; }
  .gear-item.want:hover { opacity: 1; }

  .icon-wrap {
    width: 48px;
    height: 48px;
    color: var(--gl-accent);
    display: grid;
    place-items: center;
    padding: 6px;
    border-radius: 4px;
    background: color-mix(in oklab, var(--bg), var(--gl-accent) 6%);
    box-shadow: inset 0 0 0 1px rgba(var(--accent-rgb), 0.18);
  }
  .gear-item.want .icon-wrap {
    color: var(--muted);
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--line);
  }
  .gear-item.want:hover .icon-wrap {
    color: var(--gl-accent);
    background: color-mix(in oklab, var(--bg), var(--gl-accent) 4%);
  }

  .info { min-width: 0; }
  .name {
    color: var(--fg);
    font-size: 0.95rem;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    margin-top: 0.25rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta .cat   { color: var(--gl-accent); opacity: 0.85; }
  .meta .sep   { margin: 0 0.4em; opacity: 0.5; }
  .meta .blurb { color: var(--muted); }
</style>
