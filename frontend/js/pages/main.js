import { getUser, logoutUser } from "../utils/api.js";
import { set_linkPermissions } from "../utils/validation.js";


/* Página principal */

document.addEventListener("DOMContentLoaded", async () => {

set_linkPermissions("user");

  try {
    await getUser();
  } catch (error) {
    alert("Erro: logue-se novamente");
    window.location.href = "index.html";
  }
});
