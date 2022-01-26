module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    fontFamily: {
      sans: ['ui-rounded', 'Helvetica', 'sans-serif'],
    },
    opacity: {
      0: '0.00',
      5: '0.05',
      10: '0.10',
      15: '0.15',
      20: '0.20',
      50: '0.50',
      70: '0.70',
      100: '1.00',
    },
    extend: {
      colors: {
        gray: {
          100: '#f8f8f8',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
    },
  },
  variants: {
    extend: {
      scale: ['active'],
    },
  },
  plugins: [],
};
