# Casos de teste

As seções estão em ordem de risco, não na ordem das telas. Os testes cobrem os módulos onde a aplicação grava ou altera dados de alguém (criação, edição e ações sensíveis) e módulos de leitura (listagem, busca e paginação).

| Módulo                      | Casos  | Sucesso | Falha  | Pendente de regra |
| --------------------------- | ------ | ------- | ------ | ----------------- |
| Criação                     | 15     | 7       | 6      | 2                 |
| Edição                      | 7      | 2       | 5      | 0                 |
| Ações e status              | 8      | 4       | 4      | 0                 |
| Listagem, busca e paginação | 7      | 6       | 0      | 1                 |
| Permissão (bônus)           | 3      | 2       | 0      | 1                 |
| **Total**                   | **40** | **21**  | **15** | **4**             |

**Legenda.** Os casos cobertos pela automação estão marcados com asterisco (`*`). "Pendente de regra" indica um comportamento que depende de uma decisão de negócio que não está documentada. Os bugs estão detalhados em [`bugs.md`](bugs.md).

## Criação

É por onde todo usuário entra, e é onde estão as regras de dado (nome, e-mail, CPF e senha). Cada regra foi conferida na tela e na resposta da API, porque as duas nem sempre concordam: o formulário só marca a senha como obrigatória, mas a API exige nome e e-mail.

| ID      | Prioridade | Cenário e resultado esperado                                                                                                    | Resultado obtido                                                                                                                   | Status            |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| CRI-01* | Alta       | Criar com nome, e-mail único e senha válida: `200`, mensagem de sucesso, `networkLogin` igual ao e-mail e perfil `PERFIL_Aluno` | Conforme esperado                                                                                                                  | Passou            |
| CRI-02* | Alta       | Criar com CPF válido, empresa, país, estado, cidade e cargo: os dados são salvos e aparecem iguais em Visualizar                | Conforme esperado. As datas ficaram fora porque o campo só aceita o calendário                                                     | Passou            |
| CRI-15* | Alta       | O usuário criado aparece na busca por e-mail, com o nome informado e o status desligado                                         | Conforme esperado                                                                                                                  | Passou            |
| CRI-04* | Alta       | Criar sem nome: `400` `users.errors.nameRequired` e a mensagem "Nome é obrigatório"                                             | Conforme esperado na API, mas o campo não aparece como obrigatório no formulário                                                   | Passou            |
| CRI-05* | Alta       | Criar com nome de 3 espaços: `400` com mensagem clara                                                                           | `500` em texto puro ("Algo deu errado. Faça um novo acesso"). Nada é gravado. BUG-03                                               | Falhou            |
| CRI-06  | Alta       | Criar sem e-mail: o formulário indica que o campo é obrigatório e a mensagem explica o problema                                 | O front não valida. A API devolve `400` "Campo de login 'email' não informado", e a tela mostra só "Erro ao criar usuário". BUG-09 | Falhou            |
| CRI-07* | Alta       | E-mail sem formato válido (`marcelo.qa@`, `marcelo.qa.teste.com`, `@teste.com`): erro "Email inválido" abaixo do campo          | Conforme esperado                                                                                                                  | Passou            |
| CRI-08* | Alta       | Criar com e-mail já cadastrado: `409` `users.errors.userAlreadyExists` e a mensagem "Usuário já existe"                         | Conforme esperado                                                                                                                  | Passou            |
| CRI-09* | Alta       | CPF `111.111.111-11` ou `123.456.789-00`: rejeitado como inválido                                                               | Usuário criado nos dois casos; o sistema só confere a quantidade de dígitos. BUG-05                                                | Falhou            |
| CRI-10  | Alta       | CPF já usado por outro usuário: criação bloqueada                                                                               | Usuário criado. Existem 13 usuários com o mesmo CPF. BUG-06                                                                        | Falhou            |
| CRI-11  | Alta       | Senha `1234567`: salvar é bloqueado e o checklist mostra os requisitos que faltam                                               | Conforme esperado                                                                                                                  | Passou            |
| CRI-03* | Média      | Salvar o formulário vazio: a mensagem cita todos os campos obrigatórios                                                         | Cita só "Alterar senha". Nome e e-mail não aparecem. BUG-13                                                                        | Falhou            |
| CRI-14  | Média      | Nome, e-mail e senha aparecem marcados como obrigatórios                                                                        | Só a senha tem asterisco, e com o rótulo errado ("Alterar senha"). BUG-13                                                          | Falhou            |
| CRI-12  | Média      | Existe idade mínima para o cadastro?                                                                                            | O calendário permite até a data de ontem, e o cadastro foi aceito com essa data                                                    | Pendente de regra |
| CRI-13  | Baixa      | "Data de criação" deveria ser gerada pelo sistema, sem edição manual                                                            | O campo é editável, repete o `createdAt` e fica `null` quando não é preenchido                                                     | Pendente de regra |

## Edição

Se a criação valida um dado, a edição precisa validar do mesmo jeito. Por isso os negativos da criação foram repetidos aqui, e foi na edição que apareceram os bugs mais graves. O ponto de partida foi um usuário sem nome visto na listagem: a criação bloqueava o nome vazio, então ele só podia ter vindo da edição (EDI-02).

| ID     | Prioridade | Cenário e resultado esperado                                                                                                                      | Resultado obtido                                                                                           | Status |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| EDI-04 | Crítica    | Trocar o e-mail de `marcelo.qa.1@teste.com` para `marcelo.qa.1b@teste.com`: `email`, `networkLogin` e `clientUserKey` passam a usar o novo e-mail | `email` e `networkLogin` são atualizados, mas o `clientUserKey` continua com o e-mail antigo. BUG-01       | Falhou |
| EDI-05 | Crítica    | Depois do EDI-04, criar B com o e-mail antigo de A: não pode haver dois registros com o mesmo `clientUserKey`                                     | B é criado, e passam a existir dois `_id` com a mesma chave. BUG-01                                        | Falhou |
| EDI-03 | Alta       | Trocar o e-mail de A para o e-mail de B: `409`, como na criação                                                                                   | `500` em texto puro. BUG-02                                                                                | Falhou |
| EDI-02 | Alta       | Apagar o nome e salvar: bloqueado com "Nome é obrigatório", como na criação                                                                       | Salva com o nome vazio, e o usuário passa a aparecer sem nome na listagem. BUG-04                          | Falhou |
| EDI-01 | Alta       | Alterar o nome: `PUT /api/users` retorna `200` e o novo nome aparece na listagem e em Visualizar                                                  | Conforme esperado                                                                                          | Passou |
| EDI-07 | Alta       | Ativar o perfil Instrutor na aba Permissão, voltar à aba Usuário, alterar o cargo e salvar: o perfil continua ativo                               | Conforme esperado; o `PUT` envia o `groupsAD` atualizado                                                   | Passou |
| EDI-06 | Baixa      | Apertar F5 com alterações não salvas: o sistema avisa ou continua na edição                                                                       | Volta para a listagem e descarta as alterações sem aviso. A rota `/editar` não tem o ID do usuário. BUG-16 | Falhou |

## Ações e status

São ações sobre o acesso de outra pessoa, como trocar a senha, emular e ativar ou inativar. Além de verificar se a ação funciona, os testes olharam se há confirmação e se dá para desfazer um clique errado.

| ID      | Prioridade | Cenário e resultado esperado                                                                                                                     | Resultado obtido                                                                                                                     | Status |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| ACO-05  | Alta       | Emular um usuário inativo: a emulação é bloqueada. Para um usuário ativo, o sistema pede confirmação e mostra um aviso de que a sessão é emulada | A emulação é permitida: `POST /api/users/emulation` devolve um token e abre uma nova aba, sem confirmação e sem nenhum aviso. BUG-08 | Falhou |
| ACO-03  | Alta       | "Gerar aleatória" mostra a senha sugerida, e a troca só acontece depois de clicar em "Alterar"                                                   | A senha é trocada e enviada ao usuário no mesmo clique. BUG-07                                                                       | Falhou |
| STA-01  | Alta       | Ligar e desligar o toggle de status: `PATCH /api/users/{id}/status` e os contadores Ativos/Inativos são atualizados                              | Conforme esperado                                                                                                                    | Passou |
| ACO-04  | Média      | O campo de nova senha esconde o que é digitado                                                                                                   | O campo é `type="text"`, então a senha fica visível na tela. BUG-11                                                                  | Falhou |
| STA-02  | Média      | O toggle de status pede confirmação antes de bloquear ou liberar o acesso                                                                        | Muda com um clique. BUG-12                                                                                                           | Falhou |
| STA-03* | Média      | Um usuário recém-criado nasce inativo                                                                                                            | `status: INATIVO`, mas com `enabled: true` no mesmo registro (seção 5 de `riscos.md`)                                                | Passou |
| ACO-01  | Média      | Visualizar abre o cadastro com todos os campos desabilitados                                                                                     | Conforme esperado. Só os botões do calendário continuam habilitados                                                                  | Passou |
| ACO-02  | Média      | Alterar a senha com o campo vazio: o botão fica desabilitado e aparece "Campo obrigatório"                                                       | Conforme esperado                                                                                                                    | Passou |

## Listagem, busca e paginação

É a parte de menor risco, porque só lê dados. Os poucos casos conferem se os números batem e se o estado vazio aparece. A busca por CPF também serviu para medir o tamanho do problema de CPF duplicado.

| ID      | Prioridade | Cenário e resultado esperado                                                                          | Resultado obtido                              | Status            |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------- |
| LST-01  | Alta       | A listagem abre com as colunas Status, Nome, E-mail, Último acesso e Ações, e com 10 itens por página | Conforme esperado                             | Passou            |
| BUS-01* | Alta       | A busca pelo e-mail completo retorna só esse usuário                                                  | Conforme esperado                             | Passou            |
| LST-02  | Média      | A soma dos contadores Ativos e Inativos é igual ao total da paginação                                 | Conforme esperado                             | Passou            |
| BUS-02  | Média      | A busca pelo CPF retorna os usuários com esse CPF                                                     | Retornou 13 usuários com o mesmo CPF (BUG-06) | Passou            |
| BUS-03  | Média      | A busca sem resultado mostra "NENHUM DADO ENCONTRADO"                                                 | Conforme esperado                             | Passou            |
| PAG-01  | Média      | Com um único resultado, "Anterior" e "Próxima" ficam desabilitados                                    | Conforme esperado                             | Passou            |
| LST-03  | Baixa      | O briefing fala em "filtros Ativos/Inativos": clicar no contador filtra a listagem                    | Os contadores não são clicáveis               | Pendente de regra |

## Permissão (bônus)

Cobri só o fluxo principal e a sincronização com a aba Usuário (EDI-07), que é onde uma regressão entre abas apareceria.

| ID     | Prioridade | Cenário e resultado esperado                                                                                                             | Resultado obtido              | Status            |
| ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------- |
| PER-01 | Média      | Conceder e remover o perfil Instrutor, com confirmação: chama `add-permission` e `remove-permission`, e o estado se mantém ao recarregar | Conforme esperado             | Passou            |
| PER-02 | Média      | Responder "Não" na confirmação: o toggle volta para a posição anterior e nenhuma requisição é enviada                                    | Conforme esperado             | Passou            |
| PER-03 | Baixa      | O perfil padrão Aluno, que todo usuário recebe, aparece na aba Permissão                                                                 | Não aparece entre os 8 perfis | Pendente de regra |

## O que ficou de fora

As abas Turmas, Elegibilidade e Histórico, que são bônus, ficaram de fora. Os campos de data só foram testados pelo calendário, porque não aceitam digitação.
