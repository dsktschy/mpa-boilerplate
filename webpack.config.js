const path = require('path')
const dotenv = require('dotenv')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
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
      `${srcRelativePath}/assets/main.ts`
    )
  },

  output: {
    path: path.resolve(__dirname, distRelativePath),
    filename: '[name].[fullhash].js'
  },

  module: {
    rules: [
      {
        test: [/\.ts$/, /\.js$/],
        exclude: /node_modules/,
        use: [
          typeof process.env.WEBPACK_LEGACY === 'undefined'
            ? {
                loader: 'esbuild-loader',
                options: {
                  loader: 'ts'
                }
              }
            : 'ts-loader'
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  target:
    typeof process.env.WEBPACK_LEGACY === 'undefined'
      ? ['web']
      : ['web', 'es5'],

  plugins: [
    new BrowserSyncPlugin({
      host: process.env.WEBPACK_BROWSER_SYNC_HOST || 'localhost',
      port: process.env.WEBPACK_BROWSER_SYNC_PORT || 3000,
      proxy: process.env.WEBPACK_BROWSER_SYNC_PROXY || false,
      server: process.env.WEBPACK_BROWSER_SYNC_PROXY ? false : distRelativePath,
      https:
        !!process.env.WEBPACK_BROWSER_SYNC_HTTPS_CERT &&
        !!process.env.WEBPACK_BROWSER_SYNC_HTTPS_KEY
          ? {
              cert: process.env.WEBPACK_BROWSER_SYNC_HTTPS_CERT,
              key: process.env.WEBPACK_BROWSER_SYNC_HTTPS_KEY
            }
          : false,
      open: false,
      // This setting doesn't work now
      // Reloading connot be avoid even if changed file is CSS
      // https://github.com/Va1/browser-sync-webpack-plugin/pull/79
      injectChanges: true
    }),

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
