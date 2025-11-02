import { getUser } from "../utils/api.js";

const btnLogout = document.getElementById("btnLogout");

document.addEventListener("DOMContentLoaded", async () => {
    const email = localStorage.getItem("loggedUserEmail");
    if(!email) {
        window.location.href = "index.html";
        return alert("Usuario não logado");
     }
  try {
    const user = {
      email: email
    };

    const result = await getUser(user);

    document.getElementById("name").textContent = `Nome: ${result.user.name}`;
    document.getElementById("email").textContent = `Email: ${result.user.email}`;
    document.getElementById("phone").textContent = `Telefone: ${result.user.phone}`;
  } catch (error) {
    alert("Error finding user:" + error.message);
  }
  btnLogout.addEventListener("click", async (e) => {
    localStorage.removeItem("loggedUserEmail");
    window.location.href = "index.html";
  });
});
