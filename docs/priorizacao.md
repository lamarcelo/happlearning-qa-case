# Priorização da automação

## Critério

Cada fluxo foi avaliado em três pontos:

1. **Impacto de negócio se quebrar:** a função do fluxo é adicionar pessoas na plataforma. Se a criação falha, ninguém novo consegue acessar os cursos.
2. **Frequência de uso:** o quanto o fluxo é utilizado no dia a dia.
3. **Custo e estabilidade da automação:** seletores disponíveis, dependência de dados e risco de teste instável em ambiente compartilhado.

## O que foi automatizado primeiro, e por quê

### 1. Criação de usuário com sucesso, e2e

Arquivo: `cypress/e2e/usuarios/criar-usuario.cy.js`.

- É o fluxo de maior impacto, sem ele, nenhum usuário novo acessa a plataforma.
- Passa por três telas do escopo (listagem, formulário e busca) e pela API de criação, então protege boa parte do módulo com um único teste.
- O formulário tem `data-testid` estáveis em todos os campos, o que deixa o teste barato de manter.
- Além da tela, o teste valida o response da API (`status: INATIVO`, `networkLogin` igual ao e-mail e perfil `PERFIL_Aluno`), que é onde estão as regras que se mostraram frágeis.

### 2. Validações da criação

Arquivo: `cypress/e2e/usuarios/validacoes-criacao.cy.js`.

- A exploração mostrou que a validação é o ponto mais frágil do módulo (seção 2 de `riscos.md`).
- Esses testes funcionam como uma base segura do fluxo para a correção dos bugs. Quando o time padronizar a validação, eles mostram se algo inesperado surgiu.
- São rápidos e não dependem de dados anteriores.

### 3. Bugs conhecidos como testes executáveis (opcional)

Arquivo: `cypress/e2e/bugs-conhecidos/criacao.cy.js`.

- Descrevem o comportamento esperado e **falham hoje de propósito**.
- Ficam fora da execução padrão e servem como critério de aceite para futura correção.

## Próximos cenários na fila

| Prioridade | Fluxo                             | Casos                  | Motivo                        | Observação                                                                    |
| ---------- | --------------------------------- | ---------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| 1          | Edição de e-mail e unicidade      | EDI-03, EDI-04, EDI-05 | Bug crítico de integridade    | Automatizar via API (`cy.request`) após a correção, validando `clientUserKey` |
| 2          | Status ativo/inativo e contadores | STA-01, LST-02         | Controla o acesso das pessoas | Depende de seletor estável no toggle (hoje está como `boolean-undefined`)     |
| 3          | Alterar senha                     | ACO-02, ACO-03         | Ação sensível                 | -                                                                             |

## Recomendações para o time

1. Adicionar `data-testid` semânticos na listagem e no menu, por exemplo `user-row-<id>`, `toggle-status`, `menu-edit` e `menu-change-password`.
2. Incluir o ID do usuário nas rotas das telas de edição e visualização (`/editar/:id`), o que também resolve o `F5` (BUG-16).
3. Padronizar o formato de erro da API. Os testes de validação passam a verificar um único formato.
4. Oferecer um endpoint ou script de limpeza de dados de teste no ambiente.
