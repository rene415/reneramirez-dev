// Projects shown on the Day side under "Selected work".
// Each entry renders as a stacked browser-frame embed of the live site.
// To add a project: drop a new object below. To reorder: just rearrange.

export type Project = {
  id: string;            // short slug, used for keys
  name: string;          // display name
  role: string;          // your role / what you did
  year: string;          // human-readable year span
  url: string;           // full URL (iframe src)
  displayUrl: string;    // what shows in the URL bar (no scheme)
  blurb: string;         // one short sentence under the header
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
      'Family business. Custom WordPress on a Dockerized stack I run from a closet in the Bay Area — every piece of the stack, from the metal up.',
  },
  // Add more like:
  // {
  //   id: 'client-two',
  //   name: 'Client Two',
  //   role: 'Site rebuild',
  //   year: '2024',
  //   url: 'https://client-two.com',
  //   displayUrl: 'client-two.com',
  //   blurb: 'One-line story of the project.',
  // },
];
