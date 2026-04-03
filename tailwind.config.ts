import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#0e4f51',
          light: '#1a6b6e',
          muted: '#e8f0f0',
        },
        gold: {
          DEFAULT: '#c8aa4a',
          light: '#f5ecc8',
        },
        pearl: '#F9F8F5',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Lato', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
