const LoginPage = {
  path: '/login/entrar',

  campoLogin: () => cy.get('[data-testid="loginInput"]'),
  campoSenha: () => cy.get('[data-testid="passwordInput"]'),
  botaoEntrar: () => cy.contains('button', /^\s*entrar\s*$/i),

  visitar() {
    cy.visit(this.path)
    return this
  },

  entrar(login, senha) {
    this.campoLogin().clear().type(login)
    this.campoSenha().clear().type(senha, { log: false })
    this.botaoEntrar().click()
    return this
  },
}

export default LoginPage
