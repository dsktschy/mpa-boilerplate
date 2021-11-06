const path = require('path')
const dotenv = require('dotenv')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
const svgoConfig = require('./.svgorc.js')
const { optimizeImage } = require('./lib/copy')

dotenv.config()

const productionMode = process.env.NODE_ENV === 'production'
const legacyMode = process.env.WEBPACK_LEGACY?.toLowerCase() === 'on'
const srcRelativePath =
  process.env.WEBPACK_SRC_RELATIVE_PATH?.replace(/\/$/, '') || 'src'
const publicRelativePath =
  process.env.WEBPACK_PUBLIC_RELATIVE_PATH?.replace(/\/$/, '') || 'public'
const distRelativePath =
  process.env.WEBPACK_DIST_RELATIVE_PATH?.replace(/\/$/, '') || 'dist'

module.exports = {
  entry: {
    'assets/scripts/index': path.resolve(
      __dirname,
      `${srcRelativePath}/assets/scripts/index.ts`
    ),
    'assets/stylesheets/index': path.resolve(
      __dirname,
      `${srcRelativePath}/assets/stylesheets/index.scss`
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
          legacyMode
            ? 'ts-loader'
            : {
                loader: 'esbuild-loader',
                options: {
                  loader: 'ts'
                }
              }
        ]
      },
      {
        test: [/\.scss$/, /\.css$/],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: legacyMode
                  ? path.resolve(__dirname, '.postcssrc.legacy.js')
                  : path.resolve(__dirname, '.postcssrc.js')
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  target: legacyMode ? ['web', 'es5'] : ['web'],

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
      files: [distRelativePath],
      // This setting doesn't work now
      // Reloading connot be avoid even if changed file is CSS
      // https://github.com/Va1/browser-sync-webpack-plugin/pull/79
      injectChanges: true
    }),

    new CleanWebpackPlugin(),

    // noErrorOnMissing must be true
    // because each directories may not exist
    // and SVG sprite artifacts don't exist before first building
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, publicRelativePath),
          to: '[path][name][ext]',
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, `${srcRelativePath}/assets/images`),
          to: 'assets/images/[name].[fullhash][ext]',
          noErrorOnMissing: true,
          transform: {
            transformer: productionMode ? optimizeImage : content => content
          }
        },
        {
          from: path.resolve(__dirname, `${srcRelativePath}/assets/sprites/_`),
          to: 'assets/sprites/[name][ext]',
          noErrorOnMissing: true
        }
      ]
    }),

    // If artifacts is outputted to dist,
    // svg-spritemap-webpack-plugin occurs unexpected and complicated behavior
    // with copy-webpack-plugin. So output to temporary directory in src
    // https://github.com/cascornelissen/svg-spritemap-webpack-plugin/issues/157
    new SVGSpritemapPlugin(
      path.resolve(__dirname, `${srcRelativePath}/assets/sprites/index/*.svg`),
      {
        output: {
          filename: `../${srcRelativePath}/assets/sprites/_/index.svg`,
          svgo: svgoConfig,
          svg4everybody: legacyMode
        }
      }
    ),

    new HtmlWebpackPlugin({
      template: path.resolve(
        __dirname,
        `${srcRelativePath}/templates/index.ejs`
      ),
      filename: 'index.html',
      inject: false,
      templateParameters: {}
    }),

    // Remove empty js file that style entry outputs
    // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
    new RemoveEmptyScriptsPlugin(),

    new MiniCssExtractPlugin({
      filename: '[name].[fullhash].css'
    }),

    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json',
      // Avoid unexpected prefix to manifest values, and output root relative paths
      // https://github.com/shellscape/webpack-manifest-plugin/issues/229
      publicPath: process.env.WEBPACK_MANIFEST_PUBLIC_PATH
    })
  ]
}
