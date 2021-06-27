const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const srcRelativePath = 'src'
const publicRelativePath = 'public'
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

  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, publicRelativePath),
          to: path.resolve(__dirname, distRelativePath)
        }
      ]
    })
  ]
}
