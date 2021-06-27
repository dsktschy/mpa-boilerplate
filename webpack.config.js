const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const srcRelativePath = 'src'
const distRelativePath = 'dist'

module.exports = {
  entry: {
    'assets/scripts/app': path.resolve(
      __dirname,
      `${srcRelativePath}/assets/main.js`
    )
  },

  output: {
    path: path.resolve(__dirname, distRelativePath)
  },

  plugins: [new CleanWebpackPlugin()]
}
