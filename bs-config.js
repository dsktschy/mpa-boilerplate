module.exports = {
  host: process.env.WEBPACK_BROWSER_SYNC_HOST || 'localhost',
  port: process.env.WEBPACK_BROWSER_SYNC_PORT || 3000,
  proxy: process.env.WEBPACK_BROWSER_SYNC_PROXY || false,
  server: process.env.WEBPACK_BROWSER_SYNC_PROXY
    ? false
    : process.env.WEBPACK_DIST_RELATIVE_PATH,
  https:
    !!process.env.WEBPACK_BROWSER_SYNC_HTTPS_CERT &&
    !!process.env.WEBPACK_BROWSER_SYNC_HTTPS_KEY
      ? {
          cert: process.env.WEBPACK_BROWSER_SYNC_HTTPS_CERT,
          key: process.env.WEBPACK_BROWSER_SYNC_HTTPS_KEY
        }
      : false,
  open: false,
  files: [process.env.WEBPACK_DIST_RELATIVE_PATH],
  // This setting doesn't work now
  // Reloading connot be avoid even if changed file is CSS
  // https://github.com/Va1/browser-sync-webpack-plugin/pull/79
  injectChanges: true
}
