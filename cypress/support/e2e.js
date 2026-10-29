import './commands'

// aviso do Angular Material que não quebra nada na tela, qualquer outro erro continua falhando o teste
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return undefined
})
