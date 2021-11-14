module.exports = {
  plugins: [
    'tailwindcss',
    require('autoprefixer')({
      overrideBrowserslist: ['defaults', 'iOS >= 9', 'ie 11']
    }),
    ...(process.env.NODE_ENV === 'production' ? ['cssnano'] : [])
  ]
}
