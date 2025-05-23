/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': {
          light: '#60A5FA',
          DEFAULT: '#1E3A8A',
          dark: '#172554',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
} 