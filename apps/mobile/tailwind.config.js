/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#071018',
        panel: '#0D1822',
        mint: '#57E0B7',
        sky: '#6CB7FF',
        violet: '#A58BFF',
        coral: '#FF8A76'
      }
    }
  },
  plugins: []
};
