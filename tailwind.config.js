/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        onyx: {
          950: '#070708',
          900: '#0c0c0e',
          800: '#131316',
          700: '#1c1c20',
          600: '#26262c',
          500: '#34343c',
          400: '#4a4a54',
        },
        jade: {
          50: '#eefbf4',
          100: '#d4f5e3',
          200: '#a8e9c8',
          300: '#6dd6a4',
          400: '#38bd82',
          500: '#16a16b',
          600: '#0c8057',
          700: '#0b6748',
          800: '#0c523a',
          900: '#0a4431',
        },
        caramel: {
          50: '#fdf6ee',
          100: '#f9e8d3',
          200: '#f0cda0',
          300: '#e6ad6b',
          400: '#dd9347',
          500: '#cf7a2e',
          600: '#b46325',
          700: '#934d20',
          800: '#763f1f',
          900: '#61351d',
        },
        pearl: {
          50: '#fbfbfa',
          100: '#f4f3f1',
          200: '#e8e6e2',
          300: '#d4d1cb',
          400: '#b0aca4',
          500: '#8c887f',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-jade': '0 0 60px -10px rgba(22,161,107,0.45)',
        'glow-caramel': '0 0 60px -10px rgba(207,122,46,0.45)',
        'card-luxe': '0 24px 60px -12px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        breathe: 'breathe 7s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 1.2s ease-out forwards',
        shimmer: 'shimmer 3s linear infinite',
        'spin-slow': 'spin-slow 24s linear infinite',
      },
    },
  },
  plugins: [],
}
