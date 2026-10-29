const pluginCypress = require('eslint-plugin-cypress')

module.exports = [
  pluginCypress.configs.recommended,
  {
    files: ['cypress.config.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
]
