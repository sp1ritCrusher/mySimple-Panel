# mySimple Panel — Frontend (React)

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre em [http://localhost:5173](http://localhost:5173).

## Variáveis

Copie `.env.example` para `.env`:

```
VITE_API_URL=/api
```

O Vite faz proxy de `/api` → `http://localhost:3000`. **Não use `127.0.0.1` no browser** com front em `localhost` — os cookies não são compartilhados.

No **backend** (`.env`):

```
HOST=localhost
FRONTEND_URL=http://localhost:5173
OAUTH_REDIRECT_URI=http://localhost:5173/api/callback/oauth?provider=google
```

No **Google Cloud Console**, a redirect URI deve ser a mesma de `OAUTH_REDIRECT_URI`.

## Backend

Rode em `http://localhost:3000` (`npm start` na pasta backend).

## Build

```bash
npm run build
npm run preview
```
