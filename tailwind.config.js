/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        granate: {
          DEFAULT: '#8e161a', // Granate oscuro principal
          dark: '#6b1013',
        },
        negro: '#181818',
        blanco: '#fff',
        crudo: '#f8f6f2',
        gris: {
          claro: '#f3f4f6',
          medio: '#d1d5db',
          oscuro: '#374151',
        },
        beige: '#f5e9da',
        camel: '#c2b280',
        marron: '#8d6748',
        azul: {
          marino: '#1e293b',
          electrico: '#2563eb',
          cobalto: '#1939b7',
        },
        verde: {
          oscuro: '#14532d',
          esmeralda: '#047857',
          botella: '#174c3c',
        },
        rosa: {
          palo: '#e9b7b7',
          pastel: '#f8bbd0',
          viejo: '#c48a8a',
        },
        naranja: {
          quemado: '#cc5803',
          terracota: '#e2725b',
        },
        mostaza: '#f4d35e',
        amarillo: {
          suave: '#fff9c4',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-purple-100',
    'bg-teal-100',
    'text-blue-600',
    'text-green-600',
    'text-yellow-600',
    'text-purple-600',
    'text-teal-600',
  ],
};