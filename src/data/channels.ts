// ┌────────────────────────────────────────────────────────────┐
// │  Night-mode channel data — edit this file to update content│
// │  After editing: git push → click "Pull and redeploy" in    │
// │  Portainer → live in ~25–60 seconds.                       │
// │  Drop photos in public/photos/<channel-id>/ then reference │
// │  them in the `photos` array below.                         │
// └────────────────────────────────────────────────────────────┘

export type ChannelLink = { label: string; url: string; handle?: string };
export type ChannelFact = { k: string; v: string };

// Gear item used by the Studio channel.
export type GearItem = {
  name: string;
  category: string;
  icon: 'daw' | 'pad' | 'monitor' | 'interface' | 'mic' | 'keyboard' | 'synth' | 'plug';
  blurb?: string;
};

export type Channel = {
  id: 'music' | 'lenses' | 'garage' | 'lab';
  name: string;
  number: string;          // 'CH. 01' label
  tagline: string;
  body?: string;
  alias?: string[];
  links?: ChannelLink[];
  facts?: ChannelFact[];
  photos?: { src: string; alt: string }[];
  gear?: { haves: GearItem[]; wants: GearItem[] };
  accent?: 'magenta' | 'cyan' | 'green' | 'amber';
};

export const channels: Channel[] = [
  {
    id: 'music',
    name: 'music',
    number: 'CH. 01',
    tagline: 'music that will make you groove',
    body:
      "live sets on twitch when the light's on. mixes on every platform that let me have the name — same person, three spellings, depending on who got there first. all of it built on the rig below: a pair of HS8s in the corner, Ableton on the screen, hands on a Push.",
    alias: ['psychosaucequatch', 'psychosassquatch', 'psychosasquatch'],
    accent: 'magenta',
    links: [
      { label: 'Twitch',      url: 'https://www.twitch.tv/psychosaucequatch',         handle: 'psychosaucequatch' },
      { label: 'SoundCloud',  url: 'https://soundcloud.com/psychosaucequatch',        handle: 'psychosaucequatch' },
      { label: 'Spotify',     url: 'https://open.spotify.com/artist/0l1iVFMMyljzebyWCPLgHV', handle: 'Psychosassquatch' },
      { label: 'Apple Music', url: 'https://music.apple.com/us/artist/psychosasquatch/1651102774', handle: 'Psychosasquatch' },
      { label: 'YouTube',     url: 'https://www.youtube.com/@psychosassquatch',        handle: '@psychosassquatch' },
    ],
    gear: {
      haves: [
        { name: 'Ableton Live 12',               category: 'DAW',                  icon: 'daw',       blurb: 'the brain' },
        { name: 'Yamaha HS8 (pair, black)',      category: 'studio monitors',     icon: 'monitor',   blurb: "sound that doesn't lie" },
        { name: 'Ableton Push 2',                category: 'control surface',     icon: 'pad',       blurb: 'play it like an instrument' },
        { name: 'Ableton Move',                  category: 'portable groovebox',  icon: 'pad',       blurb: 'sketch ideas on the couch' },
        { name: 'Apollo Twin X',                 category: 'audio interface',     icon: 'interface', blurb: 'clean preamps, low latency' },
        { name: 'Rode NT1',                      category: 'condenser mic',       icon: 'mic',       blurb: 'vocals + sources' },
        { name: 'Arturia KeyLab Essential 49',   category: 'MIDI controller',     icon: 'keyboard',  blurb: 'keys for melody work' },
      ],
      wants: [
        { name: 'Arturia AstroLab 37',           category: 'stage synth',         icon: 'synth',     blurb: 'stage-ready hardware' },
        { name: 'Universal Audio Sphere DLX',    category: 'modeling mic',        icon: 'mic',       blurb: 'classic mics emulated in one' },
        { name: 'VST plug-ins',                  category: 'software',            icon: 'plug',      blurb: 'always more.' },
      ],
    },
  },
  {
    id: 'lenses',
    name: 'photography',
    number: 'CH. 02',
    tagline: "shot on whatever's nearby",
    body:
      "people in motion, parking lots at 2am, the moments that won't shut up.",
    accent: 'cyan',
    // Lenses doesn't render the standard link tiles — the embedded
    // madm3x.com browser frame is the link. See NightShell.svelte.
    links: [],
    photos: [],
  },
  {
    id: 'garage',
    name: 'garage',
    number: 'CH. 03',
    tagline: '2019 harley davidson street bob',
    body:
      'daily commute. fun to ride, great to fall in — once on the freeway in oct \'25. still riding.',
    accent: 'amber',
    facts: [
      { k: 'BIKE',      v: '2019 Harley Davidson Street Bob' },
      { k: 'STATUS',    v: 'daily commute' },
      { k: 'INCIDENTS', v: '1 — Oct 2025, freeway, not my fault' },
      { k: 'STILL ON IT?', v: 'yes' },
    ],
    photos: [
      { src: '/photos/garage/nkz-7627.webp', alt: 'Street Bob, three-quarter view' },
      { src: '/photos/garage/nkz-7630.webp', alt: 'Street Bob, alt angle' },
      { src: '/photos/garage/nkz-7636.webp', alt: 'Street Bob, detail' },
      { src: '/photos/garage/nkz-7643.webp', alt: 'Street Bob, in the wild' },
    ],
  },
  {
    id: 'lab',
    name: 'lab',
    number: 'CH. 04',
    tagline: 'experiments. half-finished things. occasionally shipped.',
    body:
      'what i\'m poking at when no one\'s looking.',
    accent: 'green',
    links: [
      { label: 'reneramirez.dev (this site)', url: 'https://github.com/rene415/reneramirez-dev', handle: 'astro + svelte + caddy, self-hosted' },
      { label: 'SIGINT Sentinel',             url: 'https://github.com/rene415/nebius-hackathon', handle: 'wifi/bluetooth threat detection · nebius hackathon' },
      { label: 'Finance + AI',                url: '#',                                            handle: 'understanding the markets, with help' },
      { label: 'Home server upgrade & docs',  url: '#',                                            handle: 'took a while. several things working now.' },
    ],
  },
];
