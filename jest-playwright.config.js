// https://github.com/playwright-community/jest-playwright/#configuration
module.exports = {
  serverOptions: {
    command: 'next dev -p 3004',
    port: 3004,
    usedPortAction: 'kill',
    launchTimeout: 10000,
    debug: true,
    options: {
      env: {
        BROWSER: 'none'
      }
    }
  },
  launchOptions: {
    headless: true
  }
}
