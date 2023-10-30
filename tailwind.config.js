const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/**/*.js',
    './src/**/*.tsx',
    './node_modules/@apideck/wayfinder/**/*.js',
    './node_modules/@apideck/components/**/*.js'
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      'basier-circle': [
        'basier_circle',
        '-apple-system',
        'system-ui',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif'
      ]
    },
    extend: {
      colors: {
        primary: {
          50: '#f6f7fe',
          100: '#f2f3fd',
          200: '#e0e1fa',
          300: '#c9c8f4',
          400: '#aba4ea',
          500: '#9182de',
          600: '#775ad8',
          700: '#6434d5',
          800: '#5922b9',
          900: '#5a1aa8'
        },
        main: '#5D50CE',
        background: '#F4F6FB',
        'warning-lighter': '#FEF5E5',
        warning: '#ff9800',
        'warning-dark': '#f57c00'
      },
      boxShadow: {
        main: '0 0 80px 0 rgba(4,7,45,0.10)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
