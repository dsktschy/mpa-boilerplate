/**
 * Module for html-webpack-plugin
 */

const path = require('path')

/**
 * Create common templateParameters option
 */
exports.createTemplateParameters = (templateParameters = {}) => {
  /**
   * Provide variables to templates
   */
  return (compilation, assets, assetTags, options) => ({
    // Default parameters
    // https://github.com/jantimon/html-webpack-plugin/blob/0a6568d587a82d88fd3a0617234ca98d26a1e0a6/index.js#L1098
    compilation,
    webpackConfig: compilation.options,
    htmlWebpackPlugin: {
      tags: assetTags,
      files: assets,
      options
    },

    // Enable to use console in templates
    console,

    /**
     * Create hashed assets path
     */
    h: (_path = '') => {
      const rootRelative = _path.startsWith('/')
      const relativePath = rootRelative ? _path.slice(1) : _path
      if (!relativePath) {
        // eslint-disable-next-line
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
}
