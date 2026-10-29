import LoginPage from './pages/LoginPage'
import UsuariosListaPage from './pages/UsuariosListaPage'
import UsuarioFormPage from './pages/UsuarioFormPage'

Cypress.Commands.add('loginAdmin', () => {
  cy.env(['ADMIN_LOGIN', 'ADMIN_PASSWORD'], { log: false }).then((credenciais) => {
    const login = credenciais.ADMIN_LOGIN
    const senha = credenciais.ADMIN_PASSWORD

    if (!login || !senha) {
      throw new Error(
        'Credenciais ausentes. Crie o arquivo cypress.env.json a partir de cypress.env.example.json ' +
          'ou defina CYPRESS_ADMIN_LOGIN e CYPRESS_ADMIN_PASSWORD.'
      )
    }

    cy.session(
      'admin',
      () => {
        LoginPage.visitar().entrar(login, senha)
        cy.location('pathname', { timeout: 20000 }).should('not.include', '/login')
      },
      {
        cacheAcrossSpecs: true,
        validate() {
          cy.visit(UsuariosListaPage.path)
          cy.location('pathname').should('include', '/admin/usuarios')
        },
      }
    )
  })
})

Cypress.Commands.add('validarAlerta', (tipo, textoEsperado) => {
  cy.get('.swal2-popup')
    .should('be.visible')
    .and('have.class', `swal2-icon-${tipo}`)
    .and('contain.text', textoEsperado)
  cy.get('.swal2-confirm').click()
  cy.get('.swal2-popup').should('not.exist')
})

Cypress.Commands.add('abrirFormularioDeCriacao', () => {
  UsuariosListaPage.visitar()
  UsuariosListaPage.botaoAdicionarUsuario().click()
  cy.location('pathname').should('eq', UsuarioFormPage.pathCriar)
  UsuarioFormPage.campos.nome().should('be.visible')
})

Cypress.Commands.add('criarUsuarioPelaTela', (usuario) => {
  cy.intercept('POST', '**/api/users/users').as('criarUsuario')
  cy.abrirFormularioDeCriacao()
  UsuarioFormPage.preencher(usuario).salvar()
  return cy.wait('@criarUsuario')
})
