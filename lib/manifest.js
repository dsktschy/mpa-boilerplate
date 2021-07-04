/**
 * Module for webpack-manifest-plugin
 */

/**
 * Create generate option
 */
exports.createGenerate = (
  { entry },
  scriptManifestKeyPrefix,
  stylesheetManifestKeyPrefix
) => {
  /**
   * Override generated manifest.json
   * Because keys of entry files are not relative path, but only filename
   */
  return (seed, files) => {
    const manifests = {}
    const scriptNameList = []
    const stylesheetNameList = []
    for (const entryKey of Object.keys(entry)) {
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
}
