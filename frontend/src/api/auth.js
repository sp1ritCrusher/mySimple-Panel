import { apiRequest } from "./client.js";

export function loginLocal({ email, password }) {
  return apiRequest("/auth/local", {
    method: "POST",
    body: JSON.stringify({ email, password, context: "local" }),
  });
}

export function startGoogleOAuth() {
  return apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({ provider: "google" }),
  });
}

export function registerUser(payload) {
  return apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return apiRequest("/logout", { method: "GET" });
}

export function getCurrentUser() {
  return apiRequest("/users");
}

export function resolveIntention({ email, context }) {
  return apiRequest("/resolveIntention", {
    method: "POST",
    body: JSON.stringify({ email, context }),
  });
}

export function oauthCallback(body) {
  console.log("TESTE", body)
  return apiRequest("/callback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function validateCode(code) {
  return apiRequest("/validateCode", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function resendCode() {
  return apiRequest("/resendCode", { method: "GET" });
}

export function changePassword({ current, newPass }) {
  return apiRequest("/changePassword", {
    method: "POST",
    body: JSON.stringify({ current, newPass }),
  });
}

export function recoverPassword({ newPass }) {
  return apiRequest("/recoverPassword", {
    method: "POST",
    body: JSON.stringify({ newPass }),
  });
}

export function updateProfile(payload) {
  return apiRequest("/edit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
