module.exports = {
  plugins: [
    require('postcss-preset-env')({
      browsers: 'defaults, ie >= 10'
    })
  ]
}
