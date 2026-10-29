const UsuariosListaPage = {
  path: '/app/admin/usuarios/listagem',

  campoPesquisa: () => cy.get('input[placeholder="Pesquisar"]'),
  botaoAdicionarUsuario: () => cy.get('button[aria-label="Adicionar usuário"]'),
  aba: (nome) => cy.contains('[role="tab"]', nome),
  paginador: () => cy.get('mat-paginator'),
  estadoVazio: () => cy.contains(/nenhum dado encontrado/i),

  visitar() {
    cy.visit(this.path)
    this.botaoAdicionarUsuario().should('be.visible')
    return this
  },

  pesquisar(termo) {
    // espera a busca terminar, senão a tabela recarrega no meio do próximo clique
    cy.intercept({ method: 'GET', pathname: '/api/users', query: { searchBy: termo } }).as(
      'pesquisarUsuarios'
    )
    this.campoPesquisa().clear().type(`${termo}{enter}`)
    cy.wait('@pesquisarUsuarios')
    return this
  },

  linhaDoUsuario(email) {
    return cy.contains('td.mat-column-email', email).closest('tr')
  },

  celulaNome(email) {
    return this.linhaDoUsuario(email).find('td.mat-column-name')
  },

  toggleStatus(email) {
    return this.linhaDoUsuario(email).find('td.mat-column-status input[type="checkbox"]')
  },

  abrirMenuAcoes(email) {
    this.linhaDoUsuario(email).find('td.mat-column-actions button').click()
    return this
  },

  itemMenu: {
    alterarSenha: () => cy.get('[data-tour-disabled="menuAction-changePasswordEvent"]'),
    visualizar: () => cy.get('[data-tour-disabled="menuView"]'),
    editar: () => cy.get('[data-tour-disabled="menuEdit"]'),
    emular: () => cy.get('[data-tour-disabled="menuEmulate"]'),
  },
}

export default UsuariosListaPage
