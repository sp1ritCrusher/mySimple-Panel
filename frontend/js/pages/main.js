import { getUser, logoutUser } from "../utils/api.js";
import { loadLink } from "../utils/validation.js";


/* Página principal */

document.addEventListener("DOMContentLoaded", async () => {

loadLink("user");

  try {
    await getUser();
  } catch (error) {
    alert("Erro: logue-se novamente");
    window.location.href = "index.html";
  }
});
