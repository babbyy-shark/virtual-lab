/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lab: {
          bg:      '#0a0a0f',
          surface: '#12121a',
          border:  '#2a2a3a',
          accent:  '#00e5a0',
          danger:  '#ff4466',
          warning: '#ffaa00',
          info:    '#4488ff',
          text:    '#e8e8f0',
          muted:   '#8888a0',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
