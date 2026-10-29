const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://lms.experimente5.happlearning.com.br',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    retries: { runMode: 1, openMode: 0 },
    video: false,
    screenshotOnRunFailure: true,
  },
})
