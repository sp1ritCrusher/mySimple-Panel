const PORT = process.env.PORT || 3000;

/** URL pública da API (OAuth e links externos). */
export const API_PUBLIC_URL =
  process.env.API_PUBLIC_URL || `http://localhost:${PORT}`;

/** Redirect URI registrado no Google Cloud Console. */
export const OAUTH_REDIRECT_URI =
  process.env.OAUTH_REDIRECT_URI ||
  `${API_PUBLIC_URL}/callback/oauth?provider=google`;
