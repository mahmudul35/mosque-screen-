/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'tv-xs': '1.5vw',
        'tv-sm': '2vw',
        'tv-base': '2.5vw',
        'tv-lg': '3.5vw',
        'tv-xl': '5vw',
        'tv-2xl': '7vw',
        'tv-3xl': '10vw',
      },
      spacing: {
        'tv-1': '1vw',
        'tv-2': '2vw',
        'tv-4': '4vw',
        'tv-8': '8vw',
        'tv-h-1': '1vh',
        'tv-h-2': '2vh',
        'tv-h-4': '4vh',
        'tv-h-8': '8vh',
      },
      colors: {
        tv: {
          background: '#0a0a0a',
          surface: '#171717',
          primary: '#10b981',
          accent: '#059669',
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
