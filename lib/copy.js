/**
 * Module for copy-webpack-plugin
 */

const path = require('path')
const { ImagePool, encoders } = require('@squoosh/lib')
const squooshConfig = require('../.squooshrc.js')

/**
 * Optimize image by Squoosh
 * https://web.dev/introducing-libsquoosh/
 * https://github.com/webpack-contrib/image-minimizer-webpack-plugin/blob/2736c42319fc54f2701123957e7ad6ec5aaa600f/src/utils/squooshMinify.js#L57
 */
exports.optimizeImage = async (content, absoluteFrom) => {
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
    await image.encode(squooshConfig)
    // imagePool must be closed after image.encode
    await imagePool.close()
    encodedImage = await image.encodedWith[encoder]
  } catch (error) {
    // eslint-disable-next-line
    console.error(error)
    return content
  }
  return Buffer.from(encodedImage.binary)
}
