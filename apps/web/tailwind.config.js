/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'charcoal-blue': '#2c3e50',
        'cloudy-white': '#f7f9fb',
        'steel-gray': '#7f8c8d',
        'golden-yellow': '#f1c40f',
        'dark-charcoal': '#34495e',
        'light-gray': '#bdc3c7',
      },
      fontFamily: {
        'work-sans': ['Work Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
