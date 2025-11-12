import { getUser, logoutUser } from "../utils/api.js";

const btnLogout = document.getElementById("btnLogout");
document.addEventListener("DOMContentLoaded", async () => {

  try {
    const result = await getUser();
    console.log(result);

    document.getElementById("name").textContent = `Nome: ${result.user.name}`;
    document.getElementById("email").textContent = `Email: ${result.user.email}`;
    document.getElementById("phone").textContent = `Telefone: ${result.user.phone}`;
  } catch (error) {
    alert("Erro: logue-se novamente");
    localStorage.setItem("loggedUser", "false");
    window.location.href = "index.html";
  }
  btnLogout.addEventListener("click", async (e) => {
    try {
    const logout = await logoutUser();
    console.log("Server response:", logout);
    window.location.href = "index.html";
  } catch(error) {
    console.log("Falha ao deslogar",error);
  }
});
});
