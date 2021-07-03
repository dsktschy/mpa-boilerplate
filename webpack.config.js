const path = require('path')
const dotenv = require('dotenv')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { ImagePool, encoders } = require('@squoosh/lib')
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin')
const squooshConfig = require('./.squooshrc.js')
const svgoConfig = require('./.svgorc.js')

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
 * Create instance of html-webpack-plugin to set common options
 */
const createHtmlWebpackPlugin = (template, filename, templateParameters = {}) =>
  new HtmlWebpackPlugin({
    template,
    filename,
    inject: false,
    templateParameters: (compilation, assets, assetTags, options) => ({
      // Default parameters
      // https://github.com/jantimon/html-webpack-plugin/blob/0a6568d587a82d88fd3a0617234ca98d26a1e0a6/index.js#L1098
      compilation,
      webpackConfig: compilation.options,
      htmlWebpackPlugin: {
        tags: assetTags,
        files: assets,
        options
      },

      /**
       * Create hashed assets path
       */
      h: (_path = '') => {
        const rootRelative = _path.startsWith('/')
        const relativePath = rootRelative ? _path.slice(1) : _path
        if (!relativePath) {
          console.error(`\`${_path}\` doesn't exist in manifest.json.`)
          return ''
        }
        const { dir, name, ext } = path.parse(relativePath)
        const hashedRelativePath = dir
          ? `${dir}/${name}.${compilation.hash}${ext}`
          : `${name}.${compilation.hash}${ext}`
        // Non-hashed assets
        if (!Object.keys(compilation.assets).includes(hashedRelativePath)) {
          return _path
        }
        // Hashed assets
        return (rootRelative ? '/' : '') + hashedRelativePath
      },

      // Custom parameters per page
      ...templateParameters
    })
  })

/**
 * Create instance of svg-spritemap-webpack-plugin to set common options
 */
const createSVGSpritemapPlugin = (input, filename) =>
  new SVGSpritemapPlugin(input, {
    output: {
      filename,
      svgo: svgoConfig,
      svg4everybody: typeof process.env.WEBPACK_LEGACY !== 'undefined'
    }
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

/**
 * Optimize image by Squoosh
 * https://web.dev/introducing-libsquoosh/
 * https://github.com/webpack-contrib/image-minimizer-webpack-plugin/blob/2736c42319fc54f2701123957e7ad6ec5aaa600f/src/utils/squooshMinify.js#L57
 */
const optimizeImage = async (content, absoluteFrom) => {
  let encoder = ''
  const ext = path.extname(absoluteFrom)
  for (const key of Object.keys(encoders)) {
    if (ext === `.${encoders[key].extension}`) encoder = key
  }
  if (!encoder) return content
  const imagePool = new ImagePool()
  const image = imagePool.ingestImage(content)
  let encodedImage = null
  try {
    await imagePool.close()
    await image.encode(squooshConfig)
    encodedImage = await image.encodedWith[encoder]
  } catch (error) {
    console.error(error)
    return content
  }
  return Buffer.from(encodedImage.binary)
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
          from: path.resolve(__dirname, publicRelativePath)
        },
        {
          from: path.resolve(__dirname, `${srcRelativePath}/assets/images`),
          to: 'assets/images/[name].[fullhash][ext]',
          transform: {
            transformer:
              process.env.NODE_ENV === 'production'
                ? optimizeImage
                : content => content
          }
        },
        {
          from: path.resolve(__dirname, `${srcRelativePath}/assets/sprites/_`),
          to: 'assets/sprites/[name].[fullhash][ext]'
        }
      ]
    }),

    // If artifacts is outputted to dist,
    // svg-spritemap-webpack-plugin occurs unexpected and complicated behavior
    // with copy-webpack-plugin. So output to temporary directory in src
    // https://github.com/cascornelissen/svg-spritemap-webpack-plugin/issues/157
    createSVGSpritemapPlugin(
      path.resolve(__dirname, `${srcRelativePath}/assets/sprites/index/*.svg`),
      `../${srcRelativePath}/assets/sprites/_/index.svg`
    ),
    createSVGSpritemapPlugin(
      path.resolve(__dirname, `${srcRelativePath}/assets/sprites/foobar/*.svg`),
      `../${srcRelativePath}/assets/sprites/_/foobar.svg`
    ),

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
    }),

    new WebpackManifestPlugin({
      generate: optimizeManifests,
      // https://github.com/shellscape/webpack-manifest-plugin/issues/229
      publicPath: ''
    })
  ]
}

module.exports = config
