const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const srcRelativePath = 'src'
const publicRelativePath = 'public'
const distRelativePath = 'dist'

const createHtmlWebpackPlugin = (template, filename, templateParameters = {}) =>
  new HtmlWebpackPlugin({
    template,
    filename,
    inject: false,
    templateParameters: {
      ...templateParameters
    }
  })

module.exports = {
  entry: {
    'assets/scripts/app': path.resolve(
      __dirname,
      `${srcRelativePath}/assets/main.js`
    )
  },

  output: {
    path: path.resolve(__dirname, distRelativePath),
    filename: '[name].[fullhash].js'
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
    }),

    createHtmlWebpackPlugin(
      path.resolve(__dirname, `${srcRelativePath}/templates/index.ejs`),
      'index.html'
    )
  ]
}
