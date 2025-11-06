# mySimple Panel project — BETA 0.2v

### UPDATE

Nessa etapa eu incrementei na parte de segurança básica, intermediaria e avançada no projeto. Primeiro quis aprender do basico pra internalizar bem os conceitos, então eu joguei um bcrypt hash na senha no cadastro, mandando pro database.

![alt text](<commit-imgs/1- implementando bcrypt/1-bcrypt no register.png>)

Depois foi só jogar um compare no login pro servidor comparar o hash da senha e liberar o acesso:

![alt text](<commit-imgs/1- implementando bcrypt/2-bcrypt no login.png>)

O resultado final foi uma senha com hash e segura no database

![alt text](<commit-imgs/1- implementando bcrypt/3-bcrypt no database.png>)

Depois do bcrypt, quis aprender autenticaçao via token. Implementei um JWT simples via localStorage mesmo, so pra conhecer o conceito. Primeiro dei um sign ao logar guardando id e email do user no payload:

![alt text](<commit-imgs/2-implementando jwt(localStorage)/1-jwt sign ao logar.png>)

Em seguida criei um middleware pra checar o token na rota privada na qual eu iria criar. Criei um middleware simples, só pra teste. Utilizei o método Bearers pra mandar o token gerado no JWT sign do login pelo Headers da request, e uma assinatura simples "chaveSecreta" pois a intenção era so absorver a forma mais basica possivel pra passar pro proximo passo:

![alt text](<commit-imgs/2-implementando jwt(localStorage)/2-middeware pra verificar token.png>)

Criei a rota "/users", e antes de chamar o controller getUser, foi inserido o middleware verifyToken.

![alt text](<commit-imgs/2-implementando jwt(localStorage)/3-rotas do server com get em users com middeware aplicado.png>)

Então é so imprimir no front, usando o token que foi gerado pelo localStorage

![alt text](<commit-imgs/2-implementando jwt(localStorage)/6-imprimindo dados do usuario no front atraves do token.png>)

Aqui tem também o post/get utilizando o ThunderClient pra ficar bem nitida a dinamica:

![alt text](<commit-imgs/2-implementando jwt(localStorage)/7-POST da rota login.png>)

![alt text](<commit-imgs/2-implementando jwt(localStorage)/8-GET com o Bearer token.png>)

Deu pra entender bem o conceito de token, porem atraves de pesquisas eu vi que armazena-lo no localStorage não é o ideal pois dá pra pegar esse token via javaScript e fazer requisições a partir dele. Pesquisei os melhores métodos de segurança atuais, e obtive a resposta de que utilizar cookies com um acessToken de curta duração, e um refreshToken de longa duração, seria o mais prudente em um sistema real. Sendo assim, eu consegui aplicar um sistema de autenticação com acces/Refresh Tokens no meu projeto. 

O primeiro passo foi instalar o cookie-parser e importar em server.js. Depois foi só dar inicio a implementação:

Primeiro passo:
Atualização do controller loginUser, criando dois novos jwt.signs, um pra gerar o acessToken(coloquei com duraçao de 10s pra poder testar o refresh), e outro pra gerar o refreshToken que tem longa duraçao. Em seguida foi só atribuir duas responses com cookies, um pro seu respectivo Token:

![alt text](<commit-imgs/3-implementando JWT com cookies/1-novo controller pra rota login.png>)

Tive uma dor de cabeça tremenda com esses cookies, por conta do ambiente de desenvolvimento. Tive que me informar sobre as atribuiçoes dos cookies. O samesite: none tava bloqueando o acesso do front ao back, pois o dominio era diferente(front em 127.0.0.1:5500, e o back em localhost:3000). Mesmo autorizando no CORS ele não dava acesso de jeito nenhum. Pesquisei bastante, quebrei a cabeça, e a solução foi mudar o dominio do servidor, que passou a rodar em 127.0.0.1:3000. Vi que isso é normal, pois o ambiente está em desenvolvimento(utilizando o mesmo host), oque causa um conflito interno. Pra resolver isso se eu fosse jogar o projeto em produçao era so ativar o https e jogar o samesite pra none. Nesse caso eu tive que deixar o secure: false(https desativado) e o samesite em lax.

O segundo passo foi criar um secret coerente com segurança real. Criei um dotenv contendo uma chave segura com criptografia, e chamei no controller de login(como pode ver no print acima) e no jwt.verify do middleware:

![alt text](<commit-imgs/3-implementando JWT com cookies/2 - middleware da rota users.png>)

![alt text](<commit-imgs/3-implementando JWT com cookies/5-dotenv do secret das assinaturas.png>)

Terceiro passo: Foi a criaçao em si da rota /refresh atraves de um novo controller authController.js. Consiste em 
receber o refreshToken que foi atribuido no login atraves de um fetch(que vou mostrar em breve), verifica-lo com jwt.verify, e ver de "quem é" o refresh token com o payload e o secret. A partir disso, atribuir um novo acessToken pro usuario, e mandar numa response via cookies pro front.

![alt text](<commit-imgs/3-implementando JWT com cookies/4- controller da rota refresh.png>)

O quarto passo foi ajustar o front pra trabalhar com cookies, atraves do "credentials: include" inserido na request:

![alt text](<commit-imgs/3-implementando JWT com cookies/6 - fetch do front pra rota login.png>)

O quinto e ultimo passo foi ajustar a function que contem o fetch da rota privada, que seria getUser na API. Basicamente o fetch exige o "credentials: include", procedimento padrão, onde a requisição exige cookies, que estão no navegador. O navegador recebe o recado, e manda a request pro server com o conteúdo dos cookies(os tokens), e volta com a response. Se a response não retornar ".ok", o front manda outra requisiçao pra /refresh.  Se o token bater, o server da a response ok. Então foi criada uma lógica onde se a response do refreshToken for ok(com um novo acessToken criado), o front dá um "retry" em /users com esse mesmo novo Token.

![alt text](<commit-imgs/3-implementando JWT com cookies/7 - fetch do front pra rota privada users.png>)

# CONCLUSOES

Eu pensei bem, e vi que não faria sentido criar um projeto tão extenso assim. Quis criar uma solução real, mas creio que devo dar prioridade a replicar essa dinamica de criação em outros projetos até internalizar 100% a base Node.js/Express. Vou apenas criar um CRUD simples de produtos, só pra não ficar muito simples, e já vou partir pra outro projeto do zero. Aqui está a versão 0.2 desse projeto, com segurança implementada. Enjoy

## Roadmap ATUAL
- [x] Página de Login — #Start Point  
- [x] Integração inicial com backend (API própria)  
- [x] CRUD básico com Fetch (vanilla) 
- [x] Implementar JWT/bcrypt
- [ ] CRUD completo de produtos  
- [ ] Implementar roles simples: user / admin  


Developed by sp1ritCrusher,2025
