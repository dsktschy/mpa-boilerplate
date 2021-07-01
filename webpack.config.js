const path = require('path')
const dotenv = require('dotenv')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

dotenv.config()

const srcRelativePath =
  process.env.WEBPACK_SRC_RELATIVE_PATH?.replace(/\/$/, '') || 'src'
const publicRelativePath =
  process.env.WEBPACK_PUBLIC_RELATIVE_PATH?.replace(/\/$/, '') || 'public'
const distRelativePath =
  process.env.WEBPACK_DIST_RELATIVE_PATH?.replace(/\/$/, '') || 'dist'

const createHtmlWebpackPlugin = (template, filename, templateParameters = {}) =>
  new HtmlWebpackPlugin({
    template,
    filename,
    inject: false,
    templateParameters: ({ hash }) => ({
      ...templateParameters,
      /**
       * Create hashed assets path
       */
      h: (_path = '') => {
        if (!_path) return ''
        const { dir, name, ext } = path.parse(_path)
        if (dir) return `${dir}/${name}.${hash}${ext}`
        return `${name}.${hash}${ext}`
      }
    })
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

    new WebpackManifestPlugin({
      // https://github.com/shellscape/webpack-manifest-plugin/issues/229
      publicPath: ''
    }),

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
