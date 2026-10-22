import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#171917',
        paper: '#f5f1e8',
        cream: '#ebe4d7',
        copper: '#b85c38',
        sage: '#687766'
      },
      boxShadow: {
        card: '0 18px 55px rgba(30, 28, 24, 0.08)'
      }
    }
  },
  plugins: []
} satisfies Config
