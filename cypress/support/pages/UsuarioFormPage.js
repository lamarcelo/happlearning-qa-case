const campo = (testId) => cy.get(`[data-testid="${testId}"]`)

const UsuarioFormPage = {
  pathCriar: '/app/admin/usuarios/listagem/criar',

  campos: {
    login: () => campo('input-networkLogin'),
    nome: () => campo('input-name'),
    email: () => campo('input-email'),
    cpf: () => campo('input-cpf'),
    empresa: () => campo('input-company'),
    pais: () => campo('input-country'),
    cidade: () => campo('input-city'),
    estado: () => campo('input-state'),
    matricula: () => campo('input-registration'),
    matriculaGestor: () => campo('input-managerRegistration'),
    cargo: () => campo('input-office'),
    senha: () => campo('input-password').find('input'),
  },

  botaoSalvar: () => campo('button-salvar'),
  botaoCancelar: () => campo('button-cancel'),

  erroDoCampo(campoChainable) {
    return campoChainable.closest('mat-form-field').find('mat-error')
  },

  preencher(usuario) {
    const textos = {
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      empresa: usuario.empresa,
      pais: usuario.pais,
      cidade: usuario.cidade,
      estado: usuario.estado,
      matricula: usuario.matricula,
      cargo: usuario.cargo,
    }

    Object.entries(textos).forEach(([nomeCampo, valor]) => {
      if (valor) {
        this.campos[nomeCampo]().clear().type(valor)
      }
    })

    if (usuario.senha) {
      this.campos.senha().clear().type(usuario.senha, { log: false })
    }
    return this
  },

  salvar() {
    this.botaoSalvar().click()
    return this
  },
}

export default UsuarioFormPage
