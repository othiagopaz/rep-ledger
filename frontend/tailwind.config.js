/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Libbs Sans"', '"Myriad Pro"', 'Myriad', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eafbeb',
          100: '#c5f3c8',
          200: '#8ee793',
          300: '#57db5f',
          400: '#2fcf38',
          500: '#23c02e',
          600: '#1da626',
          700: '#178b1e',
          800: '#117016',
          900: '#0d5511',
        },
      },
      screens: {
        "ipad": "768px",
        "ipad-pro": "1024px",
        "ipad-landscape": { raw: "(min-width: 1024px) and (orientation: landscape)" },
      },
    },
  },
  plugins: [],
};
