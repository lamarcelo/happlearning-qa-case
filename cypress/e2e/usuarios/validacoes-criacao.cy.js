import UsuarioFormPage from '../../support/pages/UsuarioFormPage'
import { novoUsuario } from '../../support/factories/usuario'

describe('Usuários - Validações da criação', () => {
  let dados

  before(() => {
    cy.fixture('dados-invalidos').then((fixture) => {
      dados = fixture
    })
  })

  beforeEach(() => {
    cy.loginAdmin()
  })

  it('CRI-07: e-mail com formato inválido mostra erro no próprio campo', () => {
    cy.abrirFormularioDeCriacao()

    dados.emailsInvalidos.forEach((emailInvalido) => {
      UsuarioFormPage.campos.email().clear().type(emailInvalido).blur()
      UsuarioFormPage.erroDoCampo(UsuarioFormPage.campos.email())
        .should('be.visible')
        .and('contain.text', dados.mensagens.emailInvalido)
    })
  })

  it('CRI-03: formulário vazio não é enviado para a API', () => {
    cy.intercept('POST', '**/api/users/users').as('criarUsuario')
    cy.abrirFormularioDeCriacao()

    UsuarioFormPage.salvar()

    cy.validarAlerta('error', dados.mensagens.formularioIncorreto)
    cy.location('pathname').should('eq', UsuarioFormPage.pathCriar)
    cy.get('@criarUsuario.all').should('have.length', 0)
  })

  it('CRI-04: criação sem nome é recusada pela API com mensagem clara', () => {
    const { email, senha } = novoUsuario()

    cy.criarUsuarioPelaTela({ email, senha }).then(({ response }) => {
      expect(response.statusCode).to.eq(400)
      expect(response.body.code).to.eq(dados.codigosApi.nomeObrigatorio)
    })

    cy.validarAlerta('error', dados.mensagens.nomeObrigatorio)
  })

  it('CRI-08: e-mail já cadastrado é recusado com 409', () => {
    const existente = novoUsuario()
    cy.criarUsuarioPelaTela(existente).its('response.statusCode').should('eq', 200)
    cy.validarAlerta('success', dados.mensagens.sucessoCriacao)

    const duplicado = novoUsuario({ email: existente.email })
    cy.criarUsuarioPelaTela(duplicado).then(({ response }) => {
      expect(response.statusCode).to.eq(409)
      expect(response.body.code).to.eq(dados.codigosApi.usuarioJaExiste)
    })

    cy.validarAlerta('error', dados.mensagens.usuarioJaExiste)
  })
})
