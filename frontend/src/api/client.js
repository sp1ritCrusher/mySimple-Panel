/**
 * Em dev usamos proxy do Vite (/api → backend) para cookies funcionarem
 * (mesma origem localhost:5173). Não use 127.0.0.0.1 no browser com localhost.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "/api" : "http://localhost:3000");

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest(path, options = {}) {
  const { skipRefresh = false, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  const data = await parseJson(response);

  if (response.status === 401 && !skipRefresh && path !== "/refresh") {
    const refreshed = await fetch(`${API_URL}/refresh`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const refreshData = await parseJson(refreshed);

    if (refreshed.ok) {
      return apiRequest(path, { ...options, skipRefresh: true });
    }

    throw new ApiError(
      refreshData.message || "Sessão expirada. Faça login novamente.",
      { status: 401, code: refreshData.code, data: refreshData }
    );
  }

  if (!response.ok) {
    throw new ApiError(data.message || "Erro na requisição", {
      status: response.status,
      code: data.code,
      data,
    });
  }

  return data;
}
