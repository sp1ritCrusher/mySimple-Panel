import { validateLogin, showError, clearError, showAlert} from "../utils/validation.js";
import { loginUser } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded");

  //userdata;
  const password = document.getElementById("pass");
  const email = document.getElementById("e-mail");
  const btnLogin = document.getElementById("btnLogin");

  function updateButtonState() {
    const { emailValid } = validateLogin(email,password);
    btnLogin.disabled = !(emailValid) || !password.value.trim() || !email.value.trim();
  }


  // CADASTRO
  email.addEventListener("blur", () => {
    const { emailValid } = validateLogin(email,password);
    console.log("input detected");
    console.log({ email: email.value });

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
    const { passwordValid } = validateLogin(email,password);
    console.log("input detected");
    console.log({ password: password.value });

 /*   if (!passwordValid && password.value.trim() !== "") {
      showError(password, "Erro: senha inválida");
    } else {
      clearError(password);
    }*/
    updateButtonState();
  });


  btnLogin.addEventListener("click", async () => {
    console.log("btn clicked");
    const UserData = {
      email: email.value,
      password: password.value,
    };

    try {
      const result = await loginUser(UserData);
      console.log("Server response:", result);
      localStorage.setItem("loggedUserEmail", email.value);
      window.location.href = "main.html";
    } catch (error) {
      showAlert(error.message);
    }
  });
});
