const config = require('@apideck/components/tailwind-config')

module.exports = config({
  purge: ['./**/*.js', './**/*.tsx'],
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
  variants: {
    textColor: ['responsive', 'hover', 'focus', 'group-hover'],
    translate: ['group-hover']
  },
  plugins: [
    function ({ addBase }) {
      addBase([
        {
          '@font-face': {
            fontFamily: 'Basier Circle',
            fontWeight: '100 400',
            fontStyle: 'normal',
            fontNamedInstance: 'Regular',
            fontDisplay: 'swap',
            src: `url("/fonts/barier-circle/basiercircle-regular.woff2") format("woff2"), url("/fonts/barier-circle/basiercircle-regular.woff") format("woff"), url("/fonts/barier-circle/basiercircle-regular.otf") format("otf")`
          }
        },
        {
          '@font-face': {
            fontFamily: 'Basier Circle',
            fontWeight: '500 700',
            fontStyle: 'normal',
            fontNamedInstance: 'Medium',
            fontDisplay: 'swap',
            src: `url("/fonts/barier-circle/basiercircle-medium.woff2") format("woff2"), url("/fonts/barier-circle/basiercircle-medium.woff") format("woff"), url("/fonts/barier-circle/basiercircle-medium.otf") format("otf")`
          }
        },
        {
          '@font-face': {
            fontFamily: 'Basier Circle',
            fontWeight: '800 900',
            fontStyle: 'normal',
            fontNamedInstance: 'Bold',
            fontDisplay: 'swap',
            src: `url("/fonts/barier-circle/basiercircle-semibold.woff2") format("woff2"), url("/fonts/barier-circle/basiercircle-semibold.woff") format("woff"), url("/fonts/barier-circle/basiercircle-semibold.otf") format("otf")`
          }
        }
      ])
    }
  ]
})
