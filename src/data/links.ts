// All of Rene's platform links — single source of truth.
// Used by Day mode (sparingly) and Night mode (everywhere).

export type LinkEntry = {
  label: string;
  url: string;
  handle?: string;
  category: 'music' | 'photo' | 'video' | 'social' | 'code' | 'business';
};

export const links: LinkEntry[] = [
  // music — DJ / artist persona (Night)
  { label: 'Twitch',       url: 'https://www.twitch.tv/psychosaucequatch',         handle: 'psychosaucequatch',    category: 'music' },
  { label: 'SoundCloud',   url: 'https://soundcloud.com/psychosaucequatch',        handle: 'psychosaucequatch',    category: 'music' },
  { label: 'Spotify',      url: 'https://open.spotify.com/artist/0l1iVFMMyljzebyWCPLgHV', handle: 'Psychosassquatch', category: 'music' },
  { label: 'Apple Music',  url: 'https://music.apple.com/us/artist/psychosasquatch/1651102774', handle: 'Psychosasquatch', category: 'music' },
  { label: 'YouTube',      url: 'https://www.youtube.com/@psychosassquatch',       handle: '@psychosassquatch',    category: 'video' },

  // photography (Night)
  { label: 'Instagram',    url: 'https://www.instagram.com/_madm3x/',              handle: '_madm3x',              category: 'photo' },

  // social
  { label: 'Facebook',     url: 'https://www.facebook.com/psychosassquatch',       handle: 'psychosassquatch',     category: 'social' },
  { label: 'Instagram (music)', url: 'https://www.instagram.com/psychosassquatch', handle: 'psychosassquatch',     category: 'social' },

  // code (Day)
  { label: 'GitHub',       url: 'https://github.com/rene415',                       handle: 'rene415',              category: 'code' },

  // business / projects hosted by Rene (Day showcase)
  { label: 'El Ruben’s Tamales', url: 'https://elrubenstamales.com',          handle: 'family business',      category: 'business' },
];

export const linksByCategory = (cat: LinkEntry['category']) =>
  links.filter((l) => l.category === cat);

// Tagline pulled from psychosassquatch.com
export const djTagline = 'Music that will make you groove';
