/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        gold: {
          50:  '#fdf9ee',
          100: '#faf0d0',
          200: '#f5dfa0',
          300: '#efc96b',
          400: '#e8b43d',
          500: '#d99a1f',
          600: '#b87a17',
          700: '#8f5a16',
          800: '#764918',
          900: '#653d18',
        },
        riad: {
          dark:  '#0f0a05',
          card:  '#1a110a',
          panel: '#251808',
          border:'#3d2b1a',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f0a05 0%, #251808 50%, #1a110a 100%)',
        'gold-shimmer':  'linear-gradient(90deg, #d99a1f, #efc96b, #d99a1f)',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(217,154,31,0.15)',
        'gold-md': '0 0 24px rgba(217,154,31,0.25)',
        'card':    '0 8px 32px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease-out both',
        'shimmer':   'shimmer 2s linear infinite',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
    },
  },
  plugins: [],
};
