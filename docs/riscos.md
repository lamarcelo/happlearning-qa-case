# Riscos de qualidade

Riscos levantados a partir da exploração do ambiente. Cada risco aponta os bugs ([`bugs.md`](bugs.md)) e os casos ([`casos-de-teste.md`](casos-de-teste.md)) que o evidenciam.

## 1. Integridade de ID único do usuário

|               |                                                                  |
| ------------- | ---------------------------------------------------------------- |
| Impacto       | Alto                                                             |
| Probabilidade | Alta (trocar o e-mail de um colaborador acredito ser algo comum) |
| Evidências    | BUG-01, BUG-02, BUG-05, BUG-06                                   |

O e-mail é o login (`networkLogin`), e a unicidade depende do `clientUserKey` (`clientId@@email`). Ao trocar o e-mail, o `clientUserKey` não é atualizado, e outro usuário pode ser criado com a mesma chave. A unicidade é verificada só pela aplicação, de formas diferentes em algumas operações:

| Operação                                             | Comportamento                                |
| ---------------------------------------------------- | -------------------------------------------- |
| Criação de usuário com e-mail já existente           | `409` tratado                                |
| Editar e-mail de um usuário para um e-mail existente | `500` sem tratamento                         |
| Editar o e-mail                                      | Chave antiga mantida, permitindo duplicidade |

O CPF também não é confiável, o campo aceita dígitos repetidos, dígito verificador inválido e duplicidade (atualmente existem 13 usuários com o mesmo CPF).

**Por que preocupa:** login, importações, integrações e relatórios dependem dessas chaves. Dados duplicados ou órfãos virarão incidentes depois que chegam à produção.

## 2. Validação divergente entre front-end, criação e edição

|               |                                                |
| ------------- | ---------------------------------------------- |
| Impacto       | Alto                                           |
| Probabilidade | Alta                                           |
| Evidências    | BUG-03, BUG-04, BUG-09, BUG-13, CRI-06, CRI-14 |

As regras não são aplicadas no mesmo lugar nem da mesma forma:

- O formulário marca como obrigatória só a senha, mas a API exige Nome e E-mail.
- A criação bloqueia nome vazio, mas a edição aceita.
- Um nome só com espaços gera `500` em vez de `400`.

**Por que preocupa:** cada tela nova tende a herdar uma regra diferente. A tendência é de mais dados inválidos na base, como o usuário sem nome que já existe na listagem.

## 3. Ações sensíveis sem pop-up de confirmação

|               |                                |
| ------------- | ------------------------------ |
| Impacto       | Alto                           |
| Probabilidade | Média                          |
| Evidências    | BUG-07, BUG-08, BUG-11, BUG-12 |

- **Gerar senha aleatória** troca a senha e envia ao usuário no primeiro clique (se clicar por engano, não é possível desfazer a ação).
- **Emular usuário** funciona até para usuário inativo, sem confirmação e sem aviso de que a sessão é emulada.
- **Toggle de status** bloqueia ou libera o acesso com um clique, sem confirmação (a aba Permissão na edição de usuário faz confirmação por pop-up).
- O campo de nova senha fica em texto na tela e expõe a senha a quem estiver vendo a tela.

**Por que preocupa:** essas ações mudam acesso e identidade. A emulação de inativo, somada à falta de indicador, permite que um admin aja em nome de outra pessoa sem perceber, por exemplo aceitando termos.

## 4. Tratamento de erro e contrato das APIs

|               |                |
| ------------- | -------------- |
| Impacto       | Médio          |
| Probabilidade | Alta           |
| Evidências    | BUG-09, BUG-10 |

A API responde erros em quatro formatos:

- `{code, data.message}`
- `{message}`
- texto puro
- Code `500` sem JSON.

O front aparentemente só é capaz de ler `data.message`, então parte dos erros vira um erro genérico "Erro ao criar usuário" ou "Faça um novo acesso", que sugere de forma errada um problema de sessão.

As rotas também seguem padrões distintos:

- `POST /api/users/users`
- `PUT /api/users` (ID do usuário no payload)
- `POST /api/users/add-permission`
- `PATCH /api/users/{id}/status` (ID do usuário na URL).

## 5. Regras de negócio não documentadas

|               |                                                |
| ------------- | ---------------------------------------------- |
| Impacto       | Médio                                          |
| Probabilidade | Média                                          |
| Evidências    | LST-03, CRI-12, CRI-13, PER-03, STA-03, BUG-15 |

Pontos a discutir com o time antes de virarem bug:

- Usuário nasce `INATIVO`, mas com `enabled: true`. Qual campo controla o acesso?
- Existe idade mínima para um usuário? Hoje é possível cadastrar alguém nascido no dia anterior.
- "Data de criação" realmente deve ser editável mesmo se o sistema já grava `createdAt`?
- O briefing cita "filtros Ativos/Inativos", mas a tela exibe só contadores que não funcionam como filtros.
- O perfil padrão Aluno (é atribuído já na criação de qualquer usuário) não aparece na aba Permissão, e os nomes dos perfis mudam entre Permissão e Gestores.
