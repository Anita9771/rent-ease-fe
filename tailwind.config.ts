import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1FB9C9',
          dark: '#0F2D3F',
          amber: '#FDBA4D',
          mist: '#F3F5F7',
          slate: '#9AA6B2',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0F2D3F 0%, #1FB9C9 100%)',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        heading: ['Poppins', ...fontFamily.sans],
      },
      boxShadow: {
        glass: '0 24px 48px -12px rgba(15,45,63,0.24)',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;

