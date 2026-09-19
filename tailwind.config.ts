import type { Config } from 'tailwindcss';

// Design tokens — Infectonorte HUB
// NOTA: paleta placeholder profesional ("Clinical Premium") a falta de archivos
// de marca oficiales. Reemplazar valores aquí cuando se reciban los assets reales;
// ningún componente referencia colores hardcodeados fuera de este archivo + globals.css.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1220',
          soft: '#3C4657',
          faint: '#6B7684',
        },
        surface: {
          DEFAULT: '#FAFAF9',
          raised: '#FFFFFF',
          sunken: '#F1F1EF',
        },
        border: {
          DEFAULT: '#E6E4DF',
          strong: '#D3D0C8',
        },
        primary: {
          50: '#EAF3F2',
          100: '#CFE4E2',
          300: '#7FB5B1',
          500: '#0F5C5C',
          600: '#0C4A4A',
          700: '#093838',
          900: '#052121',
        },
        accent: {
          100: '#FBE7CE',
          300: '#EFB871',
          500: '#D9822B',
          700: '#A6611D',
        },
        state: {
          vigente: '#1E8E5A',
          revision: '#C98A12',
          vencido: '#C23B3B',
          borrador: '#8A8F98',
          archivado: '#5C6470',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(11,18,32,0.04), 0 1px 1px rgba(11,18,32,0.03)',
        float: '0 8px 24px rgba(11,18,32,0.10), 0 2px 6px rgba(11,18,32,0.06)',
      },
      spacing: {
        18: '4.5rem',
      },
      maxWidth: {
        content: '1180px',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 180ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
