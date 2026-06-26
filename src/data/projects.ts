// Projects shown on the Day side under "Selected work".
// Each entry renders as a stacked browser-frame embed of the live site.
// To add a project: drop a new object below. To reorder: just rearrange.

export type Project = {
  id: string;             // short slug, used for keys
  name?: string;          // display name (real projects)
  role?: string;          // your role / what you did
  year?: string;          // human-readable year span
  url?: string;           // full URL (iframe src)
  displayUrl?: string;    // what shows in the URL bar (no scheme)
  blurb?: string;         // one short sentence under the header
  placeholder?: boolean;  // renders a "reserved" tile of the same size
};

export const projects: Project[] = [
  {
    id: 'elrubenstamales',
    name: "El Ruben's Tamales",
    role: 'Hosting · dev · maintenance',
    year: '2023 — ongoing',
    url: 'https://elrubenstamales.com',
    displayUrl: 'elrubenstamales.com',
    blurb:
      'Family business. Custom WordPress on a Dockerized stack I run from a closet in the Bay Area.',
  },
  {
    id: 'depth-of-field-studio',
    name: 'Depth of Field Studio',
    role: 'Hosting · dev · deploy',
    year: '2026 — ongoing',
    url: 'https://learn.madm3x.com',
    displayUrl: 'learn.madm3x.com',
    blurb:
      'Photography learning studio. Static site on a self-hosted container, git-deployed behind Cloudflare.',
  },
  // Reserved slots — fill them in when sites are ready. Just replace
  // `placeholder: true` with the same shape as the first entry.
  { id: 'placeholder-3', placeholder: true },
  { id: 'placeholder-4', placeholder: true },
];
