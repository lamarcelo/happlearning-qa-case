# HappLearning - Case QA

Entrega do teste prático para a vaga de Analista de QA (Automação) da Happmobi.

Escopo: **Admin > Usuários > Listar** (listagem, criação, edição na aba Usuário e ações), com a aba Permissão como bônus.

## Entregáveis

| #     | Pedido no briefing                  | Onde está                                                                                                                                                                                                                                                                                                               |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Casos de teste e cenários           | [`docs/casos-de-teste.md`](docs/casos-de-teste.md): 40 casos executados no ambiente indicado, organizados por risco, com o que ficou de fora e por quê. Bugs em [`docs/bugs.md`](docs/bugs.md) (16 achados) |
| 2     | Riscos de qualidade                 | [`docs/riscos.md`](docs/riscos.md)                                                                                                                                                                                                                                                                                      |
| 3     | Automação em Cypress                | [`cypress/`](cypress/)                                                                                                                                                                                                                                                                                                  |
| 4     | Priorização                         | [`docs/priorizacao.md`](docs/priorizacao.md)                                                                                                                                                                                                                                                                            |

## Como trabalhei

1. **Leitura do briefing e do documento de escopo**, separando o núcleo (listagem, criação, edição e ações) do bônus.
2. **Exploração do HML** com DevTools: mapeamento do DOM de cada tela e da aba Network (contratos de API, formatos de erro etc.).
3. **Testes exploratórios** me fizeram enxergar diversos comportamentos "estranhos" que viraram perguntas, que por fim, viraram testes e bugs. Exemplo: um usuário sem nome na listagem me levou a testar nome vazio na criação (bloqueado), nome só com espaços (erro `500`) e, por fim, nome vazio na edição (aceito, origem do bug).
4. **Registro** de casos, bugs e riscos.
5. **Automação** dos fluxos de maior risco.

## Principais bugs encontrados

| Gravidade | Achado                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Crítica   | Trocar o e-mail não atualiza o `clientUserKey`, e o e-mail antigo pode ser reutilizado: dois registros com a mesma chave única (BUG-01) |
| Alta      | Edição para e-mail existente (BUG-02) e criação com nome só de espaços (BUG-03) geram `500`                                             |
| Alta      | Edição aceita nome vazio (BUG-04)                                                                                                       |
| Alta      | CPF sem validação de dígito verificador e sem bloqueio de duplicidade (BUG-05, BUG-06)                                                  |
| Alta      | "Gerar aleatória" troca a senha sem confirmação (BUG-07)                                                                                |
| Alta      | Emulação permitida para usuário inativo, sem aviso (BUG-08)                                                                             |
| Média     | Quatro formatos diferentes de erro na API, e o front esconde a mensagem real de erro (BUG-09, BUG-10)                                   |

O que funciona bem também está registrado: fluxo de permissões com confirmação e reversão, política de senha na criação, `409` para e-mail duplicado na criação etc.

## Automação

### Estrutura

```
cypress/
├── e2e/
│   ├── usuarios/
│   │   ├── criar-usuario.cy.js
│   │   └── validacoes-criacao.cy.js
│   └── bugs-conhecidos/
│       └── criacao.cy.js
├── fixtures/
│   ├── dados-complementares.json
│   └── dados-invalidos.json
└── support/
    ├── commands.js
    ├── factories/usuario.js
    └── pages/
```

### Decisões

- **Seletores:** prioridade para `data-testid` semânticos (todo o formulário tem). Onde eles não existem ou são gerados por posição (listagem e menu), cada linha é localizada pelo e-mail, que é único, e os elementos pelas classes de coluna. Nenhum seletor depende da posição na tabela.
- **Massa de dados:** o ambiente é compartilhado e não existe exclusão de usuário. Cada execução gera nome e e-mail únicos (`qa.cypress.<timestamp>@teste.com`), e os testes não dependem do total nem da ordem da listagem. Os usuários criados nascem inativos.
- **UI e API no mesmo teste:** o fluxo é executado pela tela, e utilizei o `cy.intercept` para capturar o response das APIs para validar o contrato (`status`, `networkLogin`, `groupsAD`, códigos de erro etc.).
- **Sessão:** utilizei o `cy.session` com `cacheAcrossSpecs` para fazer o login uma única vez por execução.
- **Credenciais fora do código:** `cypress.env.json` ou variáveis de ambiente.
- **Bugs como testes:** os testes de `bugs-conhecidos` descrevem o comportamento correto e ficam fora da execução padrão. Servem como critério de aceite para uma futura correção.

### Como executar

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
cp cypress.env.example.json cypress.env.json
npm run cy:open        # modo interativo
npm run cy:run         # suíte padrão
npm run cy:run:bugs    # bugs conhecidos (falham enquanto não forem corrigidos)
```

## Recomendações

1. Corrigir a atualização do `clientUserKey` na troca de e-mail e criar índice único no banco, além da checagem na aplicação.
2. Centralizar as validações de usuário no back-end e aplicá-las igualmente na criação e na edição, com um único formato de erro.
3. Confirmar ações sensíveis (gerar senha, emular, alterar status) e sinalizar a sessão de usuário emulada.
4. Definir as regras pendentes listadas em [`docs/riscos.md`](docs/riscos.md) (seção 5).
