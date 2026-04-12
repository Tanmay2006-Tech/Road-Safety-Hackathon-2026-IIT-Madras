/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050a12',
      },
      fontFamily: {
        body: ['Outfit', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

