const path = require('path')
const dotenv = require('dotenv')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
const svgoConfig = require('./.svgorc.js')
const { optimizeImage } = require('./lib/copy')
const { createTemplateParameters } = require('./lib/html')
const { createGenerate } = require('./lib/manifest')

dotenv.config()

const productionMode = process.env.NODE_ENV === 'production'
const legacyMode = typeof process.env.WEBPACK_LEGACY !== 'undefined'
const srcRelativePath =
  process.env.WEBPACK_SRC_RELATIVE_PATH?.replace(/\/$/, '') || 'src'
const publicRelativePath =
  process.env.WEBPACK_PUBLIC_RELATIVE_PATH?.replace(/\/$/, '') || 'public'
const distRelativePath =
  process.env.WEBPACK_DIST_RELATIVE_PATH?.replace(/\/$/, '') || 'dist'

const config = {
  entry: {
    index: path.resolve(__dirname, `${srcRelativePath}/assets/index.ts`),
    foobar: path.resolve(__dirname, `${srcRelativePath}/assets/foobar.ts`)
  },

  output: {
    path: path.resolve(__dirname, distRelativePath),
    filename: 'assets/scripts/[name].[fullhash].js'
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
          to: 'assets/sprites/[name].[fullhash][ext]',
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
    new SVGSpritemapPlugin(
      path.resolve(__dirname, `${srcRelativePath}/assets/sprites/foobar/*.svg`),
      {
        output: {
          filename: `../${srcRelativePath}/assets/sprites/_/foobar.svg`,
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
      templateParameters: createTemplateParameters({})
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(
        __dirname,
        `${srcRelativePath}/templates/foobar.ejs`
      ),
      filename: 'foobar.html',
      inject: false,
      templateParameters: createTemplateParameters({})
    }),

    new MiniCssExtractPlugin({
      filename: 'assets/stylesheets/[name].[fullhash].css'
    })
  ]
}

config.plugins.push(
  new WebpackManifestPlugin({
    generate: createGenerate(config, 'assets/scripts/', 'assets/stylesheets/'),
    // Avoid unexpected prefix to manifest values
    // https://github.com/shellscape/webpack-manifest-plugin/issues/229
    publicPath: ''
  })
)

module.exports = config
