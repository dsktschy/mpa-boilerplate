require('dotenv').config()
const path = require('path')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
const bsConfig = require('./bs-config.js')
const svgoConfig = require('./svgo.config.js')

const legacyMode = process.env.WEBPACK_LEGACY?.toLowerCase() === 'on'

module.exports = {
  entry: {
    'assets/scripts/index': path.resolve(
      __dirname,
      `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/scripts/index.ts`
    ),
    'assets/styles/index': path.resolve(
      __dirname,
      `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/styles/index.css`
    )
  },

  output: {
    path: path.resolve(__dirname, process.env.WEBPACK_DIST_RELATIVE_PATH),
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
        test: [/\.css$/],
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
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  target: legacyMode ? ['web', 'es5'] : ['web'],

  plugins: [
    new BrowserSyncPlugin(bsConfig),

    new CleanWebpackPlugin({
      // Remove unnecessary output files
      // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: [
        'assets/styles/**/*',
        '!assets/styles/**/*.css'
      ]
    }),

    // noErrorOnMissing must be true
    // because each directories may not exist
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            process.env.WEBPACK_PUBLIC_RELATIVE_PATH
          ),
          to: '[path][name][ext]',
          globOptions: {
            ignore: ['**/.*']
          },
          noErrorOnMissing: true
        },
        {
          from: path.resolve(
            __dirname,
            `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/images`
          ),
          to: 'assets/images/[name].[fullhash][ext]',
          globOptions: {
            ignore: ['**/.*']
          },
          noErrorOnMissing: true
        }
      ]
    }),

    new SVGSpritemapPlugin(
      path.resolve(
        __dirname,
        `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/sprites/index/*.svg`
      ),
      {
        output: {
          filename: 'assets/sprites/index.svg',
          svgo: svgoConfig,
          svg4everybody: legacyMode
        }
      }
    ),

    new HtmlWebpackPlugin({
      template: path.resolve(
        __dirname,
        `${process.env.WEBPACK_SRC_RELATIVE_PATH}/templates/index.ejs`
      ),
      filename: 'index.html',
      inject: false,
      templateParameters: {}
    }),

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
