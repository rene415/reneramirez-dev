// Tracks served from public/music/. Drop new files there, add an entry below,
// commit src/data/music.ts + redeploy.
// Audio files are bind-mounted from the host (see docker-compose.yml) — they
// don't live in git.

export type Track = {
  src: string;       // URL-encoded path
  title: string;
  date: string;      // ISO yyyy-mm-dd
};

const m = (filename: string) => encodeURI('/music/' + filename);

export const tracks: Track[] = [
  { src: m('11-10-2025 - Nov Has come.mp3'),         title: 'Nov Has Come',         date: '2025-11-10' },
  { src: m('05-18-2025 - Gorillaz Inspired v2.mp3'), title: 'Gorillaz Inspired v2', date: '2025-05-18' },
  { src: m('03-14-2025 - challange day.mp3'),        title: 'challange day',        date: '2025-03-14' },
  { src: m('03-05-2025- attention (Remastered).mp3'), title: 'attention (Remastered)', date: '2025-03-05' },
  { src: m('04-28-2026 - feel alone(test).mp3'),     title: 'feel alone (test)',    date: '2026-04-28' },
];
