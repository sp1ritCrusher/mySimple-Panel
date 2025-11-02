# mySimple Panel project — BETA 0.1v

### UPDATES

Eu realizei algumas mudanças em toda a estrutura do projeto nessa etapa:


### ORM e Modularizaçao
Primeiro, eu mudei totalmente a ORM pois o Prisma+MongoDB tava me dando uma dor de cabeça absurda com muitos bugs/erros em sequencia, então eu fui de Mongoose e tive um resultado bem melhor, portanto o projeto agora se dispõe dessa ORM. Em seguida eu decidi modularizar todo o projeto, pois estava uma bagunça kk, agora ta tudo no seu devido lugar.

### CRUD BASICO
O CRUD basico concluído foi um sucesso, agora temos um sistema HTML/JS criado do zero, com integração ao nosso proprio backend/database. Isso foi um marco pra mim, foi uma sensação unica construir algo assim do zero com minhas proprias maos e ideias, isso me dá mais sede pra aprender cada vez mais. Tentei lançar uma estrutura identitaria, como se fosse um produto mesmo, com varios recursos proprios, incluindo um alert personalizado em JS/HTML.

### FEATURES E PREVENÇOES NO LOGIN/CADASTRO
As requisiçoes de login/cadastro ficaram muito bem articuladas, com varias prevençoes e validaçoes de possiveis erros do usuario na digitaçao dos respectivos formularios, como a exibiçao de um paragrafo em tempo real em cima dos inputs, quando o usuario não corresponde a regex que eu defini no script(voce pode acompanhar isso em "/frontend/utils/validation.js"). Os alerts sao exibidos funcionalmente, em eventos esperados como "Senha incorreta", "usuario ja cadastrado", "etc". O CRUD basicamente é:
Um index onde o usuario loga-se, e digitando as credenciais corretas é redirecionado pra uma rota "privada"(ainda nao implementei JWT, mas será naturalmente o proximo passo, que registrarei nos proximos commits).
Um cadastro onde são lidos os dados do formulario de acordo com o Schema criado no Model do Mongoose, é perfeitamente cadastrado, e logável.
Uma página "main" simulando uma rota privada, que é só uma das etapas aonde eu queria chegar. Essa página contém todos os dados do usuário logado(em login inseri um pequeno localStorago pra reconhecer que o usuario esta logado pelo email, onde se o script nao reconhece, ele seta o user de volta pra index.html). E por fim, foi incrementado um botao de Deslogar, onde contem um href pra index, e o localStorage é removido(simulando um logout real).

Isso é só o Esqueleto de onde quero chegar, mas era uma meta que eu estipulei, afinal commits servem pra isso né?

Anyway voce pode acompanhar todos os prints na pasta "commit-imgs" que eu criei.

### RECALCULO DE ROTA
Mediante a tudo isso eu mudei bruscamente a proposta inicial do projeto, que era só criar um CRUD basico pra registro/login e um pra controle de produtos, mas eu pensei: isso é muito simples, eu quero algo mais próximo do real. Junto com esse sentimento, eu nao tinha certeza de onde aplicar um sistema de assinatura/pagamento num contexto tão basico. Então eu decidi que agora, vou tentar criar uma solução mais proxima do real. Um sistema que gerencia uma empresa de verdade:

Roles: Admin(como o proprio nome diz, gerencia todo o sistema internamente)
Owner: Será o "proprietario" da empresa, o dono da assinatura paga, onde ele cria suas empresas, insere dados como CNPJ, endereço, cadastra funcionarios e remove, e promove a Manager.
Manager: Usuario que simula um "gerente". Será o cara que gerencia o sistema, auxiliando o owner. Cadastra/Edita funcionarios, equipes e produtos, mas não tem permissão de remover. Atribui tarefas aos users comuns
User: O usuario padrao que verifica produtos, estoques, setores, manda mensagens e pode apenas verificar a sua lista de tarefas.

É um projeto ambicioso pra um iniciante, porem vejo com bastante otimismo e acho que tenho capacidade pra produzir isso.

#################################################

PORTANTO, EU VOS APRESENTO mySimple Panel v0.1 

#################################################
---

## Roadmap ATUAL
- [x] Página de Login — #Start Point  
- [x] Integração inicial com backend (API própria)  
- [x] CRUD básico com Fetch (vanilla) 
- [ ] Implementar JWT/bcrypt
- [ ] CRUD completo de produtos  
- [ ] Implementar roles simples: user / admin  
- [ ] Integração com API de pagamentos  
- [ ] Implementar outros models e seus sistemas: empresa, constituida por 1 owner, x managers, e x funcionarios
- [ ] Upload de imagens pra funcionarios/managers 
- [ ] Testes e otimizações finais


Developed by sp1ritCrusher,2025
