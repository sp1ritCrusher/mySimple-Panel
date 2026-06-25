import { apiRequest } from "./client.js";

export function listUsers() {
  return apiRequest("/userControl");
}

export function editUser(data) {
  return apiRequest(`/userControl/${data.id}`, { 
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function removeUser(id) {
  console.log("ID:", id)
  return apiRequest(`/userControl/${id}`, { 
    method: "DELETE",
  });
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
