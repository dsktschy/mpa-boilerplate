const path = require('path')
const dotenv = require('dotenv')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

dotenv.config()

const srcRelativePath =
  process.env.WEBPACK_SRC_RELATIVE_PATH?.replace(/\/$/, '') || 'src'
const publicRelativePath =
  process.env.WEBPACK_PUBLIC_RELATIVE_PATH?.replace(/\/$/, '') || 'public'
const distRelativePath =
  process.env.WEBPACK_DIST_RELATIVE_PATH?.replace(/\/$/, '') || 'dist'
const scriptManifestKeyPrefix = 'assets/scripts/'
const stylesheetManifestKeyPrefix = 'assets/stylesheets/'

/**
 * Create instance of html-webpack-plugin to provide common parameters
 */
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

/**
 * Override generated manifest.json
 * Because keys of entry files are not relative path, but only filename
 */
const optimizeManifests = (seed, files) => {
  const manifests = {}
  const scriptNameList = []
  const stylesheetNameList = []
  for (const entryKey of Object.keys(config.entry)) {
    scriptNameList.push(`${entryKey}.js`)
    stylesheetNameList.push(`${entryKey}.css`)
  }
  for (const file of files) {
    let name = file.name
    if (file.isChunk) {
      if (scriptNameList.includes(file.name)) {
        name = `${scriptManifestKeyPrefix}${file.name}`
      } else if (stylesheetNameList.includes(file.name)) {
        name = `${stylesheetManifestKeyPrefix}${file.name}`
      }
    }
    manifests[name] = file.path
  }
  return manifests
}

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
          typeof process.env.WEBPACK_LEGACY === 'undefined'
            ? {
                loader: 'esbuild-loader',
                options: {
                  loader: 'ts'
                }
              }
            : 'ts-loader'
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
                config:
                  typeof process.env.WEBPACK_LEGACY === 'undefined'
                    ? path.resolve(__dirname, '.postcssrc.js')
                    : path.resolve(__dirname, '.postcssrc.legacy.js')
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
    ),

    createHtmlWebpackPlugin(
      path.resolve(__dirname, `${srcRelativePath}/templates/foobar.ejs`),
      'foobar.html'
    ),

    new MiniCssExtractPlugin({
      filename: 'assets/stylesheets/[name].[fullhash].css'
    })
  ]
}

config.plugins.push(
  new WebpackManifestPlugin({
    generate: optimizeManifests,
    // https://github.com/shellscape/webpack-manifest-plugin/issues/229
    publicPath: ''
  })
)

module.exports = config
