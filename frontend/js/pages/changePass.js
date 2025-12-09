import { changePass } from "../utils/api.js";
import { getUser } from "../utils/api.js";
document.addEventListener("DOMContentLoaded", async () => {
  const currentPass = document.getElementById("currentPass");
  const newPass = document.getElementById("inputPass");
  const user = await getUser();

  /* Mudança de senha */
  
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log(currentPass.value, newPass.value);
    try {
      const passwordData = {
        userid: user.user._id,
        current: currentPass.value,
        newPass: newPass.value,
      };
      console.log(currentPass, newPass);
      const result = await changePass(passwordData);
      const data = await result.json();
      console.log(data);
      if(!result.ok) {
        currentPass.style.backgroundColor = "#FAD2D2";
        currentPass.value = "";
        currentPass.focus();
        alert(data.message);
      } else {
        alert(data.message);
        window.location.href = "./config.html"
      }
    } catch (error) {
      alert(error);
    }
  });
});
