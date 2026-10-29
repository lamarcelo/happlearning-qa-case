import { novoUsuario } from '../../support/factories/usuario'

describe('Bugs conhecidos - Criação de usuário', () => {
  let dados

  before(() => {
    cy.fixture('dados-invalidos').then((fixture) => {
      dados = fixture
    })
  })

  beforeEach(() => {
    cy.loginAdmin()
  })

  it('BUG-03 / CRI-05: nome só com espaços deve retornar 400, não 500', () => {
    const usuario = novoUsuario({ nome: dados.nomeSomenteEspacos })

    cy.criarUsuarioPelaTela(usuario).then(({ response }) => {
      expect(response.statusCode, 'erro de validação, não de servidor').to.eq(400)
    })
  })

  it('BUG-05 / CRI-09: CPF com todos os dígitos iguais deve ser recusado', () => {
    const usuario = novoUsuario({ cpf: dados.cpfDigitosRepetidos })

    cy.criarUsuarioPelaTela(usuario).then(({ response }) => {
      expect(response.statusCode, 'CPF inválido não pode ser aceito').to.be.within(400, 499)
    })
  })
})
