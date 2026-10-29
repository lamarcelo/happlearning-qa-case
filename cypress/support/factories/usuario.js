const sufixoUnico = () => `${Date.now()}${Cypress._.random(100, 999)}`

const gerarSenhaValida = () => `Qa@${Cypress._.random(1000, 9999)}Cy`

export function gerarCpfValido() {
  let base
  do {
    base = Array.from({ length: 9 }, () => Cypress._.random(0, 9))
  } while (base.every((d) => d === base[0]))

  const digito = (numeros) => {
    const pesoInicial = numeros.length + 1
    const soma = numeros.reduce((acc, n, i) => acc + n * (pesoInicial - i), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  const d1 = digito(base)
  const d2 = digito([...base, d1])
  return [...base, d1, d2].join('')
}

export function novoUsuario(sobrescrever = {}) {
  const sufixo = sufixoUnico()
  return {
    nome: `QA Cypress ${sufixo}`,
    email: `qa.cypress.${sufixo}@teste.com`,
    senha: gerarSenhaValida(),
    ...sobrescrever,
  }
}

export function novoUsuarioCompleto(sobrescrever = {}) {
  return novoUsuario({
    cpf: gerarCpfValido(),
    ...sobrescrever,
  })
}
