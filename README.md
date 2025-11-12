# mySimple Panel project — BETA 0.3v

### UPDATES

Hoje venho trazer o 0.3v do meu projeto, o mySimple Panel. Nessa versão, invés de implementar o CRUD de produtos, decidi aprimorar minhas habilidades e conhecimentos em segurança, aplicando conceitos lógicos que resultam na segurança dos dados do usuário e da sessão do mesmo.

1) Implementação de uma blacklist no DataBase

Pensando num sistema de segurança real, implementei um sistema(no commit anterior) de tokens, contendo um acessToken(token de curta duração), e um refreshToken(utilizado como um passe pra gerar outro acessToken; têm longa duração). Pra refinar isso, criei um novo model no Database:

![alt text](<commit-imgs/1- blacklist model.png>)

O model consiste em 4 objetos, 3 do tipo String e 1 do tipo data.
userId: id do usuário correspondente no database
token: refreshToken atual do usuário, que será hasheado com bcrypt(evita roubo e acesso forçado para gerar accessTokens)
sessionId: Um número de sessão que criei através da lib uuid, pra reconhecimento da sessão do usuario.
expiresAt: esse campo corresponde a exclusão automatica dessa query, que é exatamente igual ao prazo do refreshToken(7 dias). Como são gerados juntos(como vou mostrar logo), em caso do usuário não utilizar a plataforma durante 7 dias, seu refreshToken vai expirar conforme definido no sign do JWT, e junto com essa definição do model, a query no database também irá ser excluída, evitando dados fantasmas e inúteis no banco de dados.
O segredo está em "expiresAfterSeconds", que apaga automaticamente do banco a query quando "acaba o tempo" definido.

2) Configuração da rota /login

![alt text](<commit-imgs/2- blacklist system em login.png>)

No endpoint /login, inseri a criação da query com as credenciais necessárias conforme o modelo criado. Basicamente pegamos o refreshToken, hasheamos através do bcrypt, e salvamos no banco de dados a seguinte query: id do usuário, refreshToken hashed, e a sessionId gerada com uuid. Assim, obtemos o seguinte resultado no db:

![alt text](<commit-imgs/3- blacklist no database.png>)

Também gerei um cookie pra sessionId, pra poder tornar uma "sessão ativa" através do navegador, sendo necessário esse cookie nas requisições através do "credentials: include".

![alt text](<commit-imgs/4- cookie sessionId.png>)

![alt text](<commit-imgs/4- cookies no navegador.png>)

3) Rota /refresh

Na rota /refresh onde gera-se um novo acessToken ao usuário, nós inserimos três linhas simples, onde pegamos o "req.cookies.refreshToken" enviado nas credenciais da request, pegamos o id do usuário definido no payload(definido na rota /login), e damos um "findOne" pelo id do usuário. Se a query não existir, é porque o refreshToken foi revogado, e o usuário deve logar novamente pra gerar um novo.

![alt text](<commit-imgs/5- rota refresh.png>)

4) Middleware de verificação

No nosso middleware de verificação, que será inserido em todas as rotas privadas do sistema, incrementamos uma verificação através dos cookies do usuário. A autorização nessa rota é definida através das credenciais, e se caso não forem equivalentes, o acesso é barrado.

![alt text](<commit-imgs/5- middleware verifyToken.png>)

5) Rota /logout

Por fim, na rota logout, o algoritmo remove todas as credenciais do usuário, e através do payload do refreshToken, pegamos o id do usuário, localizamos e apagamos na blacklist com um simplório "findOneandDelete", e em seguida removemos todos os cookies do navegador, tendo um logout de forma segura.

![alt text](<commit-imgs/5- rota logout.png>)

6) Resultados

Temos um sistema de autenticação, com rotas privadas e um sistema de login/logout seguro, seguindo os padrões de segurança atuais. Em resumo:
* Ao logar o usuário recebe um accessToken, refreshToken e um sessionId via cookies. Estes são utilizados pra obter acesso nas rotas privadas do servidor. 
* Quando o usuário desloga, a query da sua sessão é removida no banco de dados, juntamente com os cookies e suas credenciais.
* Se caso o usuário fechar o sistema sem deslogar, seu accessToken e sua sessionId expiram, tendo que gerar uma nova requisição em uma rota privada pra poder gerar novas credenciais de autenticação, e transitar pelo sistema.
* Se o usuário não abrir o sistema por 7 dias, o refreshToken é automaticamente expirado pelo próprio JWT, e a query no banco de dados é removida, conforme definido no model do Schema Blacklist.
* Se caso a conta do usuário receber uma nova solicitação de login, criei uma simples condicional que detecta se aquele usuário já está na blacklist, permitindo somente um usuário por sessão/token, evitando duplicidade de sessões:

![alt text](<commit-imgs/5- double session prevent.png>)

# Conclusão

Agora temos a parte de segurança, autenticação e login finalizados. O usuário pode transitar livremente através do sistema com uma segurança de ponta, que segue os padrões atuais. Contudo, concluo aqui a parte da segurança desse projeto, e agora sim, finalmente pretendo implementar a "main function" dele. Vou começar com o CRUD básico de produtos, através do endpoint /products.

## Roadmap ATUAL
- [x] Página de Login — #Start Point  
- [x] Integração inicial com backend (API própria)  
- [x] CRUD básico com Fetch (vanilla) 
- [x] Implementar JWT/bcrypt
- [x] Refinação e finalização da segurança
- [ ] CRUD completo de produtos  
- [ ] Implementar roles simples: user / admin  


Developed by sp1ritCrusher,2025
