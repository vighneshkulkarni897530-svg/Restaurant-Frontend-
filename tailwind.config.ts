import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8ea',
          100: '#f5efc7',
          200: '#ebde92',
          300: '#dfca5c',
          400: '#d5b534',
          500: '#bfa023',
          600: '#a3811b',
          700: '#826118',
          800: '#6d4f1a',
          900: '#5c421b',
        },
        brand: {
          dark: '#0b0f17',
          surface: '#121824',
          card: '#1a2234',
          border: '#26334d',
          gold: '#e5a93c',
          goldLight: '#fcd34d',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};
export default config;
