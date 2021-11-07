require('dotenv').config()
const path = require('path')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
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
    'assets/stylesheets/index': path.resolve(
      __dirname,
      `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/stylesheets/index.scss`
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
    new BrowserSyncPlugin(bsConfig),

    new CleanWebpackPlugin(),

    // noErrorOnMissing must be true
    // because each directories may not exist
    // and SVG sprite artifacts don't exist before first building
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            process.env.WEBPACK_PUBLIC_RELATIVE_PATH
          ),
          to: '[path][name][ext]',
          noErrorOnMissing: true
        },
        {
          from: path.resolve(
            __dirname,
            `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/images`
          ),
          to: 'assets/images/[name].[fullhash][ext]',
          noErrorOnMissing: true
        },
        {
          from: path.resolve(
            __dirname,
            `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/sprites/_`
          ),
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
      path.resolve(
        __dirname,
        `${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/sprites/index/*.svg`
      ),
      {
        output: {
          filename: `../${process.env.WEBPACK_SRC_RELATIVE_PATH}/assets/sprites/_/index.svg`,
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
