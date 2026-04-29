import { changePass } from "../utils/api.js";
import { getUser } from "../utils/api.js";
import { loadLink } from "../utils/validation.js";
document.addEventListener("DOMContentLoaded", async () => {
  const lblcurrentPass = document.getElementById("labelcurrentPass");
  const labelnewPass = document.getElementById("labelnewPass");
  const currentPass = document.getElementById("currentPass");
  const newPass = document.getElementById("inputPass");
  const form = document.querySelector("form");
  loadLink("user");
  const user = await getUser();
  console.log(user.user.status);
  /* Mudança de senha */
    if(user.user.status === "pending_password_reset") {
      lblcurrentPass.style.display = "none";
      currentPass.style.display = "none";
      labelnewPass.textContent = "Você precisa de uma nova senha:";
    }

  form.addEventListener("submit", async (e) => {
    
    e.preventDefault();

    try {
      const passwordData = {
        userid: user.user._id,
        current: currentPass.value,
        newPass: newPass.value,
      };
      const result = await changePass(passwordData);
      console.log(result);
      if (!result.ok) {
        currentPass.style.backgroundColor = "#eea2a2ff";
        currentPass.value = "";
        currentPass.focus();
        alert(result);
      } else {
        alert(result);
        window.location.href = "./config.html";
      }
    } catch (error) {
      alert(error);
    }
  });
});
