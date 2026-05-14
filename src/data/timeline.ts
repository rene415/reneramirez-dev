// Life timeline — feeds Timeline.astro
// Each event: personal one-liner + pop-culture/world-event context for that year

export type Decade = "'90s" | "'00s" | "'10s" | "'20s";

export type TimelineEvent = {
  year: number;
  decade: Decade;
  headline: string;     // your one-liner
  context: string;      // "meanwhile in <year>: ..."
  current?: boolean;    // the latest entry — gets the gentle pulse
};

export const timeline: TimelineEvent[] = [
  {
    year: 1996,
    decade: "'90s",
    headline: 'born in Mexico City',
    context: "Pokémon Red & Green launches in Japan — Nintendo accidentally invents a generation's obsession.",
  },
  {
    year: 2004,
    decade: "'00s",
    headline: 'moved to the SF Bay Area',
    context: 'Facebook quietly boots up in a Harvard dorm room. Nobody yet knows what they\'ve made.',
  },
  {
    year: 2013,
    decade: "'10s",
    headline: 'spent 3 months on liver disease research at UCSF',
    context: 'Grand Theft Auto V shatters every entertainment release record — $800M on day one.',
  },
  {
    year: 2014,
    decade: "'10s",
    headline: 'graduated high school',
    context: 'Buckets of ice water cascade across the internet for ALS. It actually works.',
  },
  {
    year: 2015,
    decade: "'10s",
    headline: 'dropped out of college',
    context: 'Star Wars: The Force Awakens revives the franchise; lightsabers light up every screen.',
  },
  {
    year: 2016,
    decade: "'10s",
    headline: 'found 42 and started learning to code',
    context: "Pokémon Go drags everyone outside — even into other people's lawns.",
  },
  {
    year: 2017,
    decade: "'10s",
    headline: 'hired at 42 as event coordinator',
    context: 'A total solar eclipse cuts an arc across America. For two minutes the country looks up at the same thing.',
  },
  {
    year: 2020,
    decade: "'20s",
    headline: 'COVID. 42 closes its US doors. I start trying to infiltrate the tech industry.',
    context: 'COVID-19 closes the world. Sourdough becomes a personality. Tiger King happens.',
  },
  {
    year: 2021,
    decade: "'20s",
    headline: "realized software engineering wasn't for me — pivoted to IT support",
    context: "Squid Game becomes the biggest Netflix debut ever; tracksuit chic ensues.",
  },
  {
    year: 2022,
    decade: "'20s",
    headline: 'persistence paid off — opened my own IT services company',
    context: 'ChatGPT launches on November 30. Three months later, everyone is on it.',
  },
  {
    year: 2024,
    decade: "'20s",
    headline: 'desktop support at Mattson Technology',
    context: "Charli XCX's brat paints the entire summer apple green — lowercase title and all.",
  },
  {
    year: 2025,
    decade: "'20s",
    headline: 'promoted to System Administrator',
    context: 'Trump returns to the White House for a second term. *huge sigh*.',
  },
  {
    year: 2026,
    decade: "'20s",
    headline: 'here. making it work, exploring new horizons.',
    context: "we don't know yet. but tune in for more.",
    current: true,
  },
];
