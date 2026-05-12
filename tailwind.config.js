/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,svelte,ts,tsx,vue,md,mdx}'],
  darkMode: ['class', '[data-mode="night"]'],
  theme: {
    extend: {
      colors: {
        day: {
          bg: '#f4efe5',
          fg: '#161311',
          muted: '#5c554c',
          line: '#d8d2c4',
          accent: '#c4571e',
        },
        night: {
          bg: '#08041a',
          bgDeep: '#03020c',
          fg: '#e8e8ff',
          muted: '#9a8fbf',
          line: '#2a1e54',
          magenta: '#ff2b8a',
          cyan: '#00f0ff',
          green: '#4dff88',
          amber: '#ffb74d',
        },
      },
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
        pixel: ['"VT323"', 'monospace'],
      },
      fontSize: {
        wordmark: 'clamp(2.5rem, 9vw, 5.5rem)',
        section: 'clamp(1.5rem, 4vw, 2.5rem)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'blink': 'blink 1.5s steps(2) infinite',
        'scanlines': 'scanlines 8s linear infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.7' },
        },
        blink: {
          '50%': { opacity: '0.2' },
        },
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100px' },
        },
      },
    },
  },
  plugins: [],
};
