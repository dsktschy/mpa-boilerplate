module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['defaults', 'iOS >= 9', 'not ie 11']
    })
  ]
}
