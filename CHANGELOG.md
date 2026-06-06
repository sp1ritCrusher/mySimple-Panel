### CHANGELOG

# Limpeza dos controllers/refatoração dos services

Visando uma arquitetura escalável e legível, os controllers foram refatorados pra sua funcionalidade primária: a orquestração do fluxo HTTP. As regras de negócio são processadas única e exclusivamente pelos services. Estes também foram refatorados, utilizando-se de helpers para validações gerais, assim tornando-os mais limpos e menos redundantes.

# Criação de middlewares de validação

Para a limpeza dos controllers foram necessárias as criações de middlewares para validação dos tokens, permitindo a remoção praticamente total do try/catch em praticamente todas as requisições HTTP. Um erroHandler foi implementado com a intenção justamente de erros de requisição.

# Implementação de oAuth com Google + merge de contas

Visando uma UX mais fluida, foi implementado um sistema de autenticação externa via Google. O usuário pode-se cadastrar de forma independente via Google(google-only), ou apenas localmente. Mas se assim desejar poderá mesclar essa autenticação. Arquitetei esse fluxo através de metadados(JSONB) em uma coluna adicionada em "users" denominada "providers", no qual seria:

1) Um usuário google-only cadastra-se na plataforma e imediatamente é lançada uma query no database em "users_providers" com o estado de inativa(pending_verification). O backend gera um código de verificação e só através dessa confirmação aonde o estado muda-se pra "active", o usuário poderá autenticar. 

2) Um usuário google-only poderá mesclar sua conta apenas registrando uma conta no mesmo email vinculado ao Google. O backend detecta esse cadastro e armazena a senha digitada em Redis. Assim, é lançado uma confirmação via código pra mesclagem. Com o código confirmado o servidor seta a senha armazenada em Redis na coluna password_hash e é adicionado o provedor "local" na coluna JSONB "providers".

3) O fluxo de local-only para google é semelhante ao inverso acima citado. O usuário autentica com o Google, e se tiver um mesmo email cadastrado localmente, sem dados na tabela user_providers, o backend gera código de validação. Com a confirmação do código, o merge é implementado. 

# Transição do frontend para React

Utilizando IA, gerei um frontend mais moderno e bem arquitetado pela mesma. Através de alguns ajustes gerei uma landing page com o objetivo de um protótipo de produto mais próximo da realidade o possível. 

A reestruturação desse front inclui:

- Migração da interface para React
- Criação de landing page para autenticação
- Implementação de hero section
- Inclusão de preview do dashboard
- Melhorias de UX e hierarquia visual
- Refatoração da estrutura CSS
- Correção de problemas de layout e overflow