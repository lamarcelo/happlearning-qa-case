import UsuariosListaPage from '../../support/pages/UsuariosListaPage'
import UsuarioFormPage from '../../support/pages/UsuarioFormPage'
import { novoUsuario, novoUsuarioCompleto } from '../../support/factories/usuario'

describe('Usuários - Criação de usuário', () => {
  let mensagens

  before(() => {
    cy.fixture('dados-invalidos').then((dados) => {
      mensagens = dados.mensagens
    })
  })

  beforeEach(() => {
    cy.loginAdmin()
  })

  it('CRI-01 / STA-03: cria usuário com dados mínimos e valida o contrato da resposta', () => {
    const usuario = novoUsuario()

    cy.criarUsuarioPelaTela(usuario).then(({ response }) => {
      expect(response.statusCode, 'status HTTP').to.eq(200)
      expect(response.body.email).to.eq(usuario.email)
      expect(response.body.name).to.eq(usuario.nome)
      expect(response.body.networkLogin, 'login igual ao e-mail').to.eq(usuario.email)
      expect(response.body.status, 'status inicial').to.eq('INATIVO')
      expect(response.body.groupsAD).to.include('PERFIL_Aluno')
      expect(response.body).not.to.have.property('password')
    })

    cy.validarAlerta('success', mensagens.sucessoCriacao)
  })

  it('CRI-15 / BUS-01: usuário criado aparece na busca por e-mail, inativo', () => {
    const usuario = novoUsuario()

    cy.criarUsuarioPelaTela(usuario).its('response.statusCode').should('eq', 200)
    cy.validarAlerta('success', mensagens.sucessoCriacao)

    UsuariosListaPage.visitar().pesquisar(usuario.email)

    UsuariosListaPage.linhaDoUsuario(usuario.email).should('be.visible')
    // a célula do nome vem com "&nbsp" antes e depois do texto
    UsuariosListaPage.celulaNome(usuario.email).should(($celula) => {
      expect($celula.text().trim()).to.eq(usuario.nome)
    })
    UsuariosListaPage.toggleStatus(usuario.email).should('not.be.checked')
    UsuariosListaPage.paginador().should('contain.text', '1 - 1 de 1')
  })

  it('CRI-02: cria usuário com CPF válido e dados complementares, e os dados persistem na visualização', () => {
    cy.fixture('dados-complementares').then((complemento) => {
      const usuario = novoUsuarioCompleto(complemento)

      cy.criarUsuarioPelaTela(usuario).then(({ response }) => {
        expect(response.statusCode).to.eq(200)
        expect(response.body.cpf, 'CPF salvo sem máscara').to.eq(usuario.cpf)
        expect(response.body.company).to.eq(usuario.empresa)
        expect(response.body.office).to.eq(usuario.cargo)
      })
      cy.validarAlerta('success', mensagens.sucessoCriacao)

      UsuariosListaPage.visitar().pesquisar(usuario.email)
      UsuariosListaPage.abrirMenuAcoes(usuario.email)
      UsuariosListaPage.itemMenu.visualizar().click()

      UsuarioFormPage.campos.nome().should('be.disabled').and('have.value', usuario.nome)
      UsuarioFormPage.campos.email().should('have.value', usuario.email)
      UsuarioFormPage.campos.login().should('have.value', usuario.email)
      UsuarioFormPage.campos.empresa().should('have.value', usuario.empresa)
      UsuarioFormPage.campos.cargo().should('have.value', usuario.cargo)
    })
  })
})
