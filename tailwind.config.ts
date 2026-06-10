import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display:  ['Pretendard', 'sans-serif'],
        subtitle: ['Space Grotesk', 'Pretendard', 'sans-serif'],
        body:     ['Pretendard', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void:    '#080A12',
        deep:    '#0D1120',
        surface: '#131829',
        ivory:   '#F5F0E8',
        'ivory-dim': '#A09888',
        amber: {
          DEFAULT: '#FF8A3D',
          bright:  '#FFB870',
        },
        aqua: {
          DEFAULT: '#4FD8C8',
          bright:  '#7FEEE2',
        },
        violet: {
          DEFAULT: '#8B6FE8',
        },
      },
      animation: {
        breathe: 'breathe 5s cubic-bezier(0.45,0.05,0.55,0.95) infinite',
        drift:   'drift 8s ease-in-out infinite',
        scan:    'scan 3s ease-in-out infinite',
        pulse2:  'pulse2 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%,100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%':     { opacity: '0.85', transform: 'scale(1.015)' },
        },
        drift: {
          '0%,100%': { transform: 'translate(0,0) rotate(0deg)' },
          '33%':     { transform: 'translate(4px,-6px) rotate(0.5deg)' },
          '66%':     { transform: 'translate(-3px,4px) rotate(-0.3deg)' },
        },
        scan: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        pulse2: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.5', transform: 'scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
