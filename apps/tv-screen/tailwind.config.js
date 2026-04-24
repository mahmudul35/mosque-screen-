/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'tv-xs': '0.8vw',
        'tv-sm': '1.2vw',
        'tv-base': '1.6vw',
        'tv-lg': '2.2vw',
        'tv-xl': '3.2vw',
        'tv-2xl': '4.5vw',
        'tv-3xl': '6vw',
      },
      spacing: {
        'tv-1': '0.5vw',
        'tv-2': '1vw',
        'tv-4': '2vw',
        'tv-6': '3vw',
        'tv-8': '4vw',
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
