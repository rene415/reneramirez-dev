// 15 tracks total, 3 per Night-mode channel. Files live in
// public/music/ (bind-mounted into the container — see docker-compose.yml,
// they're not in git). When a channel becomes active, one of its 3 tracks
// is picked at random; tracks rotate through the channel's pool without
// immediate repeats.
//
// To rearrange: just move lines between sections below. No code changes
// needed. To add a track: drop the MP3 into public/music/ and add an entry.

export type Track = {
  src: string;       // URL-encoded path under /music/
  title: string;     // display name
  date: string;      // ISO yyyy-mm-dd, '' if unknown
};

const m = (filename: string) => encodeURI('/music/' + filename);

export const channelTracks: Record<string, Track[]> = {
  // CH 01 — Decks: music & mixes, energetic
  decks: [
    { src: m('05-18-2025 - Gorillaz Inspired v2.mp3'),  title: 'Gorillaz Inspired v2',     date: '2025-05-18' },
    { src: m('03-14-2025 - challange day.mp3'),         title: 'challange day',            date: '2025-03-14' },
    { src: m('03-05-2025- attention (Remastered).mp3'), title: 'attention (Remastered)',   date: '2025-03-05' },
  ],

  // CH 02 — Lenses: photography (Rene-assigned)
  lenses: [
    { src: m('03-12-2024 - Ally (Demo).mp3'),                              title: 'Ally (Demo)',                       date: '2024-03-12' },
    { src: m('01-20-25 - life 3.1.mp3'),                                    title: 'Life 3.1',                          date: '2025-01-20' },
    { src: m('03-19-2024 - with ease (psychosassquatch remix).mp3'),       title: 'With Ease (psychosassquatch remix)', date: '2024-03-19' },
  ],

  // CH 03 — Garage: motorcycle, gritty/industrial
  garage: [
    { src: m('08-19-2024 - workv6.mp3'),    title: 'workv6',        date: '2024-08-19' },
    { src: m('Art.mp3'),                     title: 'Art',           date: '' },
    { src: m('01-16-24 alter edit 3.mp3'),  title: 'alter edit 3',  date: '2024-01-16' },
  ],

  // CH 04 — Lab: experiments / works in progress
  lab: [
    { src: m('10-30-2024 - try 2.mp3'),             title: 'try 2',                  date: '2024-10-30' },
    { src: m('04-28-2026 - feel alone(test).mp3'),  title: 'feel alone (test)',      date: '2026-04-28' },
    { src: m('April Fools - Mastered.mp3'),         title: 'April Fools (Mastered)', date: '' },
  ],

  // CH 02 — Studio: production / sketches / studio-room vibes
  studio: [
    { src: m('11-10-2025 - Nov Has come.mp3'),     title: 'Nov Has Come',     date: '2025-11-10' },
    { src: m('07-15-2025 - finnies and ferb.mp3'), title: 'finnies and ferb', date: '2025-07-15' },
    { src: m('05-25-2024 - La Table.mp3'),         title: 'La Table',         date: '2024-05-25' },
  ],
};

// Legacy flat export — only used by old code paths. Kept just to avoid
// breaking imports if anything still references it.
export const tracks: Track[] = Object.values(channelTracks).flat();
