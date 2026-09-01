import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#071018',
        panel: '#0d1822',
        mint: '#57e0b7',
        sky: '#6cb7ff',
      },
    },
  },
  plugins: [],
};

export default config;
