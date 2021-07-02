// https://github.com/GoogleChromeLabs/squoosh/blob/dev/libsquoosh/src/codecs.ts#L251

module.exports = {
  mozjpeg: {
    quality: 100
  },
  webp: {
    quality: 100
  },
  avif: {
    // [0 - 63]
    // https://github.com/GoogleChromeLabs/squoosh/blob/ff9dea465f33c1712b145153360aa0244116887d/codecs/avif/enc/avif_enc.cpp#L9
    cqLevel: 0
  },
  jxl: {
    quality: 100
  },
  wp2: {
    quality: 100
  },
  oxipng: {
    // [1 - 6]
    // https://www.vox.me.uk/post/2020/08/oxipng-and-pngout/#oxipng
    level: 1
  }
}
