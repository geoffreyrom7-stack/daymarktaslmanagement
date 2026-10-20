/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#1f2937',
        muted: '#8992a5',
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#5558e8',
          700: '#4548ca',
        },
      },
      boxShadow: {
        card: '0 12px 40px rgba(30, 41, 59, 0.06)',
      },
    },
  },
  plugins: [],
};
