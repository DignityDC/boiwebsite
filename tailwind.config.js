/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        boi: {
          bg:         '#080808',
          'bg-2':     '#0e0e0e',
          'bg-3':     '#141414',
          dark:       '#040404',
          gold:       '#c9a228',
          'gold-lt':  '#e8c96a',
          'gold-dim': '#6e5610',
          blue:       '#1a1a1a',
          steel:      '#2a2a2a',
          text:       '#e8eaf0',
          muted:      '#7a7a7a',
          border:     '#1e1e1e',
        },
      },
      fontFamily: {
        mono:  ['var(--font-mono)',  'monospace'],
        sans:  ['var(--font-sans)',  'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      animation: {
        ticker:       'ticker 40s linear infinite',
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
        scan:         'scan 8s linear infinite',
        'fade-in':    'fadeIn 1s ease-out forwards',
        'slide-up':   'slideUp 0.8s ease-out forwards',
        rotate:       'rotate 20s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '0.7', boxShadow: '0 0 15px rgba(201,162,40,0.2)' },
          '50%':      { opacity: '1',   boxShadow: '0 0 35px rgba(201,162,40,0.5)' },
        },
        scan: {
          '0%':   { top: '-4px' },
          '100%': { top: '100%' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        rotate: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
