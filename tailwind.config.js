/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'app-bg': '#faf9ff',
        'app-red': '#d83c30',
        'app-yellow': '#ffc736',
        'app-gray': '#808184',
      },
    },
  },
  plugins: [],
};
