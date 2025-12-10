# mySimple Panel project — BETA 0.4v

Relatório de atualização do projeto pra nova versão 0.4, contando com diversos features novos

# Introdução

Devo confessar que cometi um erro, e me empolguei demais. Implementei diversos features e isso acabou por tornar esse commit extenso demais, peço desculpas ao leitor. Mas em resumo, levando em consideração o commit anterior, eu não só criei um CRUD de produtos, mas criei um sisteminha de roles(admin/user por enquanto), CRUD's de produtos/administração de usuários, informações e configurações de usuário, e mais alguns features que serão apresentados abaixo. 

![alt text](commit-imgs/crud-produtos.png)

Esse CRUD no front é dinamicamente mutável com estados no DOM através do Javascript. Também foi inserido um sisteminha de paginação, onde acima de 10 produtos ela será ativada, evitando uma extensa lista de produtos.

![alt text](commit-imgs/crud-funcional.png)

Exemplo da paginação dinâmica:

![alt text](commit-imgs/paginação.png)


![alt text](commit-imgs/paginação2.png)

# Adição de produtos

Os inputs de adição tem os regex bem definidos e o estado do botão também é flexível

![alt text](commit-imgs/addProducts.png)


![alt text](commit-imgs/erros-produtos.png)

O botão só libera se todos os inputs forem preenchidos corretamente de acordo com o regex

![alt text](commit-imgs/validatingProduct.png)

![alt text](commit-imgs/successAdding.png)

![alt text](commit-imgs/showingAdded.png)

Na aba de produtos do usuário, temos as opções de remoção e edição com icons ao lado de cada produto. Pra inserir essa funcionalidade utilizei o metódo dataset do HTML, pegando o ID do produto através de um controller e atribuindo no dataset. Através desse ID, criei uma requisição na API que removia, ou editava(em uma página paralela) através dos parâmetros.

![alt text](commit-imgs/setting-dataId.png)

![alt text](commit-imgs/dataid-example.png)

Através desse dataset podemos manipular as funções de cada botão. O botão de remoção remove diretamente com uma requisição no próprio script da página de produtos(products.js), sendo bem direto. 

![alt text](commit-imgs/remove-product.png)

Pra edição decidi criar uma página paralela, e a validação consiste na possibilidade de alterar apenas um campo.

![alt text](commit-imgs/edit-products.png)


![alt text](commit-imgs/editing-product.png)


![alt text](commit-imgs/edit-response.png)


![alt text](commit-imgs/edit-success.png)

O dropdown de usuário foi finalizado com sucesso, permitindo o usuário verificar seus dados e configurar dinamicamente a suas informações.

![alt text](commit-imgs/user-dropdown.png)


![alt text](commit-imgs/user-data.png)


![alt text](commit-imgs/user-config.png)


![alt text](commit-imgs/user-editing.png)


![alt text](commit-imgs/newNickname.png)


Possibilitei o usuário de voltar ao seu nome original também:


![alt text](commit-imgs/undo_name.png)


O front retorna um alert informando que a edição foi bem-sucedida:


![alt text](commit-imgs/useredit-success.png)


Pra mudança de senha decidi inserir uma página paralela, pois ficaria muita informação de dados na página principal. A mudança consiste em receber a senha atual e digitar uma nova, e o backend faz a validação através do bcrypt compare, recebe a nova senha no req.body, e hasheia através do bcrypt.hash

![alt text](commit-imgs/change-pass.png)

O script da página de mudança de senha recebe e envia pro backend o id do usuário(pra poder atualizar no DB, eu poderia até ter usado o payload do token pra isso, mas achei mais limpo mandar direto do front através do getUser), a senha atual e a nova:

![alt text](commit-imgs/changePassJS.png)

Backend recebe e atualiza:

![alt text](commit-imgs/backend-changepass.png)

# ROLES

Aproveitando a deixa, irei introduzir o sistema de ROLES que eu implementei nesse sistema também. Em resumo, pra criar esse dropdown, eu utilizei um pequeno middleware no front, que além de manipular o DOM, ele verifica a role do usuário, assim eu posso definir quais páginas são administrativas, e quais são comuns. Tenho ciência que ainda preciso criar uma validação eficiente no backend pra isso também... e pretendo nos próximos versionamentos.

Middleware: 

![alt text](commit-imgs/role-middleware.png)

Então, é só ir definindo em cada página oque é oque chamando a função no início do DOM:

![alt text](commit-imgs/calling-role-system-1.png)

Se a role for admin o front exibe esse painel administrativo

![alt text](commit-imgs/controlPanel.png)


![alt text](commit-imgs/userControl.png)


![alt text](editUser-page.png)

commit-imgs/
Edição de produtos de determinado usuário:

![alt text](commit-imgs/selectUser.png)


![alt text](commit-imgs/userProducts.png)


A lógica é a mesma do CRUD de produtos e também do CRUD de usuários, então não entrarei muito em detalhes. Só que invés de enviar os dados do refresh, utilizamos os req.params de cada user que foram atribuídos no front pra saber lá no back quem é quem.

![alt text](commit-imgs/reqParams.png)


Lógica do params:

![alt text](commit-imgs/params-code.png)

Inseri a mesma página de "editProduct" utilizada pela role de usuário comum, e reutilizei a rota "editProduct" no back recebendo tanto quanto params quanto o payload do refresh, e diferenciando.

![alt text](commit-imgs/editPage.png)

E por fim, foi essa a lógica que criei no backend:

![alt text](commit-imgs/backend-Editing.png)

Rota:

![alt text](commit-imgs/editRoute.png)

# Conclusão

Em resumo, foram essas as maiores alterações do projeto, e tive algumas refatorações também, mas coisas bem pequenas e pontuais típicas de um processo de desenvolvimento. Tenho tido um desempenho satisfatório ao meu ver, e pretendo já no próximo commit implementar API's externas tanto de pagamento(sandbox) quanto de email, pra ficarmos cada vez mais próximos de um sistema REAL,e escalável. Esse projeto tem sido um ótimo laboratório pro meu aprendizado. Já aprendi a manipular DOM,e criar uma boa lógica sobre backend, requisições/respostas, e modularização. 

# Roadmap atual

 [x] CRUD completo de produtos
 [x] Implementar roles simples: user / admin
 [] Criar um sistema de logs/rastreamento de IP
 [] Implementar API's de pagamento sandbox e de email(verificação de código para mudança de senha/cadastro)

