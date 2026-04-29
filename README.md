# mySimple Panel

Sistema de gestão de estoque SaaS com autenticação completa, controle de sessões e painel administrativo.

## Tecnologias

- **Backend**: Node.js, Express, PostgreSQL
- **Autenticação**: JWT (Access + Refresh Token), cookies httpOnly
- **Segurança**: bcrypt, sessões, verificação por email

## Funcionalidades

- Cadastro com verificação de código por email
- Login com controle de sessão
- Recuperação de senha
- CRUD de produtos
- Painel administrativo completo
- Sistema de logs com auditoria por domínio
- Controle de status de usuário

## Instalação

```bash
git clone ...
cd mysimplepanel
npm install
cp .env.example .env
# configure suas variáveis de ambiente
npm start
```

## Variáveis de Ambiente

```
JWT_SECRET=
REFRESH_SECRET=
CHANGE_PASSWORD_SECRET=
DATABASE_URL=
```

## Decisões Técnicas

**PostgreSQL ao invés de MongoDB**
Migrado para suportar relações complexas futuras — funcionários, empresas, billing com planos.

**JWT com Access + Refresh Token**
Access token de curta duração (1h) + refresh de longa duração (7d) com tabela de sessões no banco atrelada ao accessToken.

**Sistema de Logs por Domínio**
Auditoria separada por contexto (auth, admin, product, user) para facilitar rastreabilidade.

**Verificação por email com Intention Token**
Código temporário + JWT de contexto evita exposição de userid e garante ownership da verificação.