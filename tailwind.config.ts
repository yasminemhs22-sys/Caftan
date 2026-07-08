import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          DEFAULT: 'rgb(var(--color-noir) / <alpha-value>)',
          soft: 'rgb(var(--color-noir-soft) / <alpha-value>)',
        },
        creme: 'rgb(var(--color-creme) / <alpha-value>)',
        dore: {
          DEFAULT: 'rgb(var(--color-dore) / <alpha-value>)',
          light: 'rgb(var(--color-dore-light) / <alpha-value>)',
          dark: 'rgb(var(--color-dore-dark) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        arDisplay: ['var(--font-ar-display)', 'serif'],
        arSans: ['var(--font-ar-sans)', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      backgroundImage: {
        shimmer: 'linear-gradient(110deg, transparent 35%, rgb(var(--color-dore) / 0.55) 50%, transparent 65%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        fadeUp: 'fadeUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
