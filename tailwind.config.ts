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
          dark: '#0a3a3c',
          light: '#1a6b6e',
          muted: '#e8f0f0',
        },
        gold: {
          DEFAULT: '#c8aa4a',
          light: '#f5ecc8',
          muted: '#b89a3a',
        },
        pearl: {
          DEFAULT: '#F9F8F5',
          dark: '#F0EFE9',
        },
        ink: '#1a1a18',
        mist: '#8a8880',
        rule: '#e5e2db',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
