import { getUser } from "../utils/api.js";

const btnLogout = document.getElementById("btnLogout");
document.addEventListener("DOMContentLoaded", async () => {

  try {
    const result = await getUser();
    console.log(result);

    document.getElementById("name").textContent = `Nome: ${result.user.name}`;
    document.getElementById("email").textContent = `Email: ${result.user.email}`;
    document.getElementById("phone").textContent = `Telefone: ${result.user.phone}`;
  } catch (error) {
    alert("Error finding user:" + error.message);
  }
  btnLogout.addEventListener("click", async (e) => {
    window.location.href = "index.html";
  });
});
