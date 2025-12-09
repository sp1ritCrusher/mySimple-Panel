import { validateLogin, showError, clearError} from "../utils/validation.js";
import { loginUser } from "../utils/api.js";

/* Página Inicial */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM Loaded");

  const password = document.getElementById("pass");
  const email = document.getElementById("e-mail");
  const btnLogin = document.getElementById("btnLogin");

  function updateButtonState() {
    const { emailValid } = validateLogin(email,password);
    btnLogin.disabled = !(emailValid) || !password.value.trim() || !email.value.trim();
  }

  //Checando se o usuário já tem uma sessão iniciada 

  const checkSession = await fetch("http://127.0.0.1:3000/users", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
 
    if(checkSession.ok) {

      window.location.href = "./main.html"

    }

  // Login

  email.addEventListener("blur", () => {
    const { emailValid } = validateLogin(email,password);

    if (!emailValid && email.value.trim() !== " ") {
      showError(email, "Erro: email inválido");
    } else {
      clearError(email);
    }
    updateButtonState();
  });

  email.addEventListener("input", () => {
    const { emailValid } = validateLogin(email,password);
    if (!emailValid && email.value.trim() !== "") {
      showError(email, "Erro: email inválido");
    } else {
      clearError(email);
    }
    updateButtonState();
  });

  password.addEventListener("input", () => {

   if (password.value.trim() == "") {
      showError(password, "Erro: senha inválida");
    } else {
      clearError(password);
    }
    updateButtonState();
  });


  btnLogin.addEventListener("click", async () => {
    const UserData = {
      email: email.value,
      password: password.value,
    };

    try {
      const result = await loginUser(UserData);
      window.location.href = "main.html";
    } catch (error) {
      alert(error.message);
    }
  });
});
