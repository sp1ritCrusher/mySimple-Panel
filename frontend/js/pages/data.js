import { getUser, logoutUser } from "../utils/api.js";
import { set_linkPermissions } from "../utils/validation.js";

/* Dados do usuário */

document.addEventListener("DOMContentLoaded", async () => {
set_linkPermissions("user");

  try {
    const result = await getUser();

    document.getElementById("nome").textContent = `Nome: ${result.user.name}`;
    document.getElementById("email").textContent = `Email: ${result.user.email}`;
    document.getElementById("telefone").textContent = `Telefone: ${result.user.phone}`;
    document.getElementById("produtos-length").textContent = `Produtos cadastrados: ${result.user.registeredProducts}`;
    
  } catch (error) {
    alert("Erro: logue-se novamente");
    localStorage.setItem("loggedUser", "false");
    window.location.href = "index.html";
  }
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    logoutUser();
  })
});
