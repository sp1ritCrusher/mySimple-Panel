import { validateForm, showError, clearError } from "../utils/validation.js";
import { registerUser } from "../utils/api.js";

/* Registro de novo usuário */

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("loggedUser") === "true") {
    window.location.href = "main.html";
  }

  const name = document.getElementById("name");
  const password = document.getElementById("pass");
  const email = document.getElementById("e-mail");
  const phone = document.getElementById("phone-number");
  const btnCadastro = document.getElementById("btnCadastro");

  function updateButtonState() {
    const { nameValid, emailValid, passwordValid, phoneValid } = validateForm(name,email,password,phone);
    btnCadastro.disabled = !(nameValid && emailValid && passwordValid && phoneValid );
  }


  // Cadastro com validação de dados

  name.addEventListener("blur", () => {
    const { nameValid } = validateForm(name,email,password,phone);

    if (!nameValid && name.value.trim() !== " ") {
      showError(name, "Erro: nome inválido");
    } else {
      clearError(name);
    }
    updateButtonState();
  });

  name.addEventListener("input", () => {
    const { nameValid } = validateForm(name,email,password,phone);
    if (!nameValid && name.value.trim() !== "") {
      showError(name, "Erro: nome inválido");
    } else {
      clearError(name);
    }
    updateButtonState();
  });

  email.addEventListener("input", () => {
    const { emailValid } = validateForm(name,email,password,phone);

    if (!emailValid && email.value.trim() !== "") {
      showError(email, "Erro: e-mail inválido");
    } else {
      clearError(email);
    }
    updateButtonState();
  });

  password.addEventListener("input", () => {
    const { passwordValid } = validateForm(name,email,password,phone);

    if (!passwordValid && password.value.trim() !== "") {
      showError(password, "Erro: senha inválida");
    } else {
      clearError(password);
    }
    updateButtonState();
  });

  phone.addEventListener("input", () => {
    const { phoneValid } = validateForm(name,email,password,phone);

    if (!phoneValid && phone.value.trim() !== "") {
      showError(phone, "Erro: Telefone inválido");
    } else {
      clearError(phone);
    }
    updateButtonState();
  });

  btnCadastro.addEventListener("click", async (e) => {
    e.preventDefault();
    const UserData = {
      name: name.value,
      password: password.value,
      email: email.value,
      phone: phone.value,
    };

    try {
      const result = await registerUser(UserData);
      const data = await result.json();
      if(result.ok) {
      alert(data.message);
      window.location.href = "./index.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  });
});
