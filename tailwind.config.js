module.exports = {
  purge: [
    'src/assets/scripts/**/*',
    'src/assets/templates/**/*',
    'public/**/*.php',
    'public/**/*.html'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        rainbow: 'rainbow 0.5s linear infinite'
      },
      keyframes: theme => ({
        rainbow: {
          '0%': {
            color: theme('colors.red.500')
          },
          '14.2%': {
            color: theme('colors.yellow.500')
          },
          '28.5%': {
            color: theme('colors.green.500')
          },
          '42.8%': {
            color: theme('colors.blue.500')
          },
          '57.1%': {
            color: theme('colors.indigo.500')
          },
          '71.4%': {
            color: theme('colors.purple.500')
          },
          '85.7%': {
            color: theme('colors.pink.500')
          },
          '100%': {
            color: theme('colors.red.500')
          }
        }
      })
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
