import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#4a2a00',
        'brand-light': '#5b3200',
        tan: '#9a6516',
        gold: '#d9b44c',
        paper: '#f4f2ef',
        'paper-dark': '#e9e3dc',
        ivory: '#f7efe0',
      },
    },
  },
  plugins: [],
} satisfies Config
