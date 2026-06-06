import { apiRequest } from "./client.js";

export function listUsers() {
  return apiRequest("/userControl");
}

export function getUserById(id) {
  return apiRequest(`/userControl/${id}`);
}

export function listLogs() {
  return apiRequest("/logs");
}

export function getLogById(id) {
  return apiRequest(`/logs/${id}`);
}
