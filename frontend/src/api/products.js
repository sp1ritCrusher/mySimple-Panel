import { apiRequest } from "./client.js";

export function listProducts() {
  return apiRequest("/products");
}

export function getProduct(id) {
  return apiRequest(`/products/${id}`);
}

export function loadDashboard () {
  return apiRequest("/dashboard");
}

export function createProduct(payload) {
  return apiRequest("/products/addproduct", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return apiRequest(`/products/${id}`, { method: "DELETE" });
}
