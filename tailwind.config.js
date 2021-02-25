module.exports = {
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
        primary: '#5D50CE',
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
  plugins: []
}
