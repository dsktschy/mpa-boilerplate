module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['defaults', 'iOS >= 9', 'ie 11']
    })
  ]
}
