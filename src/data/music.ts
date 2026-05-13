// Tracks served from public/music/. Drop new files there, add an entry below,
// commit + redeploy.
//
// ⚠️ Format note: WAV files are huge (5–50 MB each). Visitors pay that
// bandwidth on play. Once you've validated the mixes, convert to MP3 or Opus:
//   ffmpeg -i input.wav -b:a 192k output.mp3
// (drops ~50 MB → ~5 MB, indistinguishable in a browser.)

export type Track = {
  src: string;       // URL-encoded path
  title: string;
  date: string;      // ISO yyyy-mm-dd
};

// encodeURI handles spaces, parens, etc. so the audio element fetches cleanly
const m = (filename: string) => encodeURI('/music/' + filename);

export const tracks: Track[] = [
  { src: m('11-10-2025 - Nov Has come.wav'),         title: 'Nov Has Come',         date: '2025-11-10' },
  { src: m('05-18-2025 - Gorillaz Inspired v2.wav'), title: 'Gorillaz Inspired v2', date: '2025-05-18' },
  { src: m('03-14-2025 - challange day.wav'),        title: 'challange day',        date: '2025-03-14' },
  { src: m('03-05-2025- attention (Remastered).wav'), title: 'attention (Remastered)', date: '2025-03-05' },
  { src: m('04-28-2026 - feel alone(test).wav'),     title: 'feel alone (test)',    date: '2026-04-28' },
];
