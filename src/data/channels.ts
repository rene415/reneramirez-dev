// ┌────────────────────────────────────────────────────────────┐
// │  Night-mode channel data — edit this file to update content│
// │  After editing: git push → click "Pull and redeploy" in    │
// │  Portainer → live in ~25–60 seconds.                       │
// │  Drop photos in public/photos/<channel-id>/ then reference │
// │  them in the `photos` array below.                         │
// └────────────────────────────────────────────────────────────┘

export type ChannelLink = { label: string; url: string; handle?: string };
export type ChannelFact = { k: string; v: string };

export type Channel = {
  id: 'decks' | 'lenses' | 'garage' | 'lab' | 'now';
  name: string;
  number: string;          // 'CH. 01' label
  tagline: string;
  body?: string;
  alias?: string[];
  links?: ChannelLink[];
  facts?: ChannelFact[];
  photos?: { src: string; alt: string }[];   // /photos/<id>/<file>
  accent?: 'magenta' | 'cyan' | 'green' | 'amber';
};

export const channels: Channel[] = [
  {
    id: 'decks',
    name: 'decks & mixes',
    number: 'CH. 01',
    tagline: 'music that will make you groove',
    body:
      'live sets on twitch, mixes everywhere else. same person, three spellings — depending on which platform let me have the name.',
    alias: ['psychosaucequatch', 'psychosassquatch', 'psychosasquatch'],
    accent: 'magenta',
    links: [
      { label: 'Twitch',      url: 'https://www.twitch.tv/psychosaucequatch',         handle: 'psychosaucequatch' },
      { label: 'SoundCloud',  url: 'https://soundcloud.com/psychosaucequatch',        handle: 'psychosaucequatch' },
      { label: 'Spotify',     url: 'https://open.spotify.com/artist/0l1iVFMMyljzebyWCPLgHV', handle: 'Psychosassquatch' },
      { label: 'Apple Music', url: 'https://music.apple.com/us/artist/psychosasquatch/1651102774', handle: 'Psychosasquatch' },
      { label: 'YouTube',     url: 'https://www.youtube.com/@psychosassquatch',        handle: '@psychosassquatch' },
    ],
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
  {
    id: 'now',
    name: 'now',
    number: 'CH. 05',
    tagline: 'currently, in real time',
    body:
      'live twitch status + now playing + latest IG — wired in Phase 4 via Cloudflare Workers.',
    accent: 'magenta',
  },
];
