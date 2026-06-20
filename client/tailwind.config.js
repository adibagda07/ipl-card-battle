/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
        pitch: { 900: '#0a0e0a', 800: '#111611', 700: '#1a2a1a' },
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
      },
      keyframes: {
        flip: { '0%': { transform: 'rotateY(0)' }, '50%': { transform: 'rotateY(90deg)' }, '100%': { transform: 'rotateY(0)' } },
        glow: { from: { boxShadow: '0 0 10px #F59E0B' }, to: { boxShadow: '0 0 30px #F59E0B, 0 0 60px #D97706' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseGold: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        bounceIn: { '0%': { transform: 'scale(0)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
