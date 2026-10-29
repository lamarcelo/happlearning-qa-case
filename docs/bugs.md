# Bugs

Os casos citados estão em [`casos-de-teste.md`](casos-de-teste.md).

| Severidade | Quantidade |
|---|---|
| Crítica | 1 |
| Alta | 7 |
| Média | 5 |
| Baixa | 3 |

## Crítica

### BUG-01: trocar o e-mail não atualiza o `clientUserKey`, e o e-mail antigo pode ser reutilizado

Casos: EDI-04 e EDI-05.

1. Criar o usuário A com o e-mail X.
2. Editar A, trocando o e-mail para Y.
3. Criar o usuário B com o e-mail X.

**Esperado:** o `clientUserKey` de A passa a usar Y, e nunca existem dois registros com a mesma chave.

**Obtido:** A continua com `clientUserKey` `9992@@X`, e B é criado com a mesma chave. A evidência são dois `_id` diferentes com a mesma chave de unicidade (`6ae24bfb91dab000134d3d06` e `6ae2582291dab000134d425f`), vistos nas respostas do `PUT /api/users` e do `POST /api/users/users`.

## Alta

### BUG-02: editar para um e-mail que já existe retorna `500`

Caso: EDI-03. Ao editar o usuário A com o e-mail do usuário B, o esperado é `409` `users.errors.userAlreadyExists`, como na criação. O obtido é `500` em texto puro: "Algo deu errado. Faça um novo acesso".

### BUG-03: nome só com espaços derruba a criação com `500`

Caso: CRI-05. Criar um usuário com o nome "   " e e-mail e senha válidos. O esperado é `400` com uma mensagem clara. O obtido é `500` em texto puro, e a tela mostra "Erro ao criar usuário". Nada é criado.

### BUG-04: a edição aceita nome vazio

Caso: EDI-02. Ao apagar o nome na edição e salvar, o esperado é o bloqueio com "Nome é obrigatório", como na criação. O cadastro é salvo, e o usuário passa a aparecer sem nome na listagem.

### BUG-05: o CPF não tem validação de dígito verificador nem bloqueia dígitos repetidos

Caso: CRI-09. Os CPFs `111.111.111-11` e `123.456.789-00` são aceitos. Só a quantidade de dígitos é conferida.

### BUG-06: CPF duplicado é aceito

Casos: CRI-10 e BUS-02. É possível criar um usuário com um CPF que já pertence a outro, e a busca por `11111111111` retorna 13 usuários.

### BUG-07: "Gerar aleatória" troca a senha sem confirmação

Caso: ACO-03. Em Menu de ações > Alterar senha > Gerar aleatória, a senha é trocada e enviada ao usuário no mesmo clique, com o aviso "Senha alterada e enviada para o usuário". O esperado é mostrar a sugestão e só trocar a senha depois de clicar em "Alterar".

### BUG-08: emulação de usuário inativo é permitida, sem confirmação e sem aviso

Caso: ACO-05. Para um usuário inativo, `POST /api/users/emulation` devolve um token e abre uma nova aba, sem pedir confirmação e sem nada na tela indicando que a sessão é emulada. O esperado é bloquear a emulação de inativos, confirmar antes de emular e sinalizar a sessão emulada.

## Média

| ID | Bug | Caso | Esperado | Obtido |
|---|---|---|---|---|
| BUG-09 | O erro real da API fica escondido atrás de uma mensagem genérica | CRI-06 | Mensagem dizendo que o e-mail é obrigatório | A API devolve "Campo de login 'email' não informado", mas a tela mostra "Erro ao criar usuário" |
| BUG-10 | O contrato de erro da API não é consistente | CRI-04, CRI-05, CRI-06, CRI-08, EDI-03 | Um único formato, por exemplo `{code, data.message}` | Quatro formatos: `{code, data.message}`, `{message}`, texto puro e `500` sem JSON |
| BUG-11 | O campo de senha do modal mostra o texto digitado | ACO-04 | `type="password"` | `type="text"` |
| BUG-12 | O toggle de status muda sem confirmação | STA-02 | Confirmação antes de bloquear ou liberar o acesso | A mudança é imediata |
| BUG-13 | O formulário não marca os campos obrigatórios, e a validação do front está incompleta | CRI-03, CRI-14 | Nome, e-mail e senha marcados e validados | Só a senha é marcada, com o rótulo "Alterar senha", e a mensagem de erro cita só ela |

## Baixa

| ID | Bug | Caso | Obtido |
|---|---|---|---|
| BUG-14 | A dica "Apenas números" na tela de login contradiz o login por e-mail | - | O login é o e-mail (`networkLogin`) |
| BUG-15 | Rótulos, textos e atributos de teste e de acessibilidade inconsistentes | CRI-14 | `label for="password"` aponta para `id="password-password"`, o Cancelar tem `aria-label="Voltar"`, o CPF incompleto fica vermelho sem mensagem, `id="sliderControl"` se repete várias vezes, os toggles tem `data-testid="boolean-undefined"`, os botões tem `data-testid` por posição, "Alterar senha" às vezes aparece só com o ícone, há erros como "Gerar aletória" e "Hautoria", e os nomes dos perfis mudam entre Permissão e Gestores |
| BUG-16 | F5 na edição descarta as alterações sem avisar | EDI-06 | Volta para a listagem, a rota `/editar` não tem o ID do usuário |
