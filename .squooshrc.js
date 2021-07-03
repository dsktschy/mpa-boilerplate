// https://github.com/GoogleChromeLabs/squoosh/blob/dev/libsquoosh/src/codecs.ts#L251

module.exports = {
  mozjpeg: {
    quality: 75
  },
  webp: {
    quality: 75
  },
  avif: {
    // [0 - 63]
    // https://github.com/GoogleChromeLabs/squoosh/blob/ff9dea465f33c1712b145153360aa0244116887d/codecs/avif/enc/avif_enc.cpp#L9
    cqLevel: 33
  },
  jxl: {
    quality: 75
  },
  wp2: {
    quality: 75
  },
  oxipng: {
    // [1 - 6]
    // https://www.vox.me.uk/post/2020/08/oxipng-and-pngout/#oxipng
    level: 2
  }
}
