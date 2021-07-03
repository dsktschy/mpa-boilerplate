module.exports = {
  plugins: [
    require('postcss-preset-env')({
      browsers: 'defaults, not IE 11'
    })
  ]
}
