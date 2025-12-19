import { getUser, logoutUser, user_updateData } from "../utils/api.js";
import { set_linkPermissions } from "../utils/validation.js";

/* Configurações de usuário */
// manipulação de inputs/icones

document.addEventListener("DOMContentLoaded", async () => {
  set_linkPermissions("user");
  const form = document.getElementById("editForm");
  const result = await getUser();
  const name = document.getElementById("nome");
  const editPass = {
    current: document.getElementById("currentPass"),
    input: document.getElementById("inputPass"),
  };
  const email = document.getElementById("email");
  const phone = document.getElementById("telefone");
  const inputName = document.getElementById("inputName");
  const inputEmail = document.getElementById("inputEmail");
  const inputPhone = document.getElementById("inputPhone");
  const btn = document.getElementById("submitbtn");
  btn.disabled = true;
  name.textContent = `Nome: ${result.user.name}`;
  name.dataset.name = result.user.name;
  email.textContent = `Email: ${result.user.email}`;
  email.dataset.email = result.user.email;
  phone.textContent = `Telefone: ${result.user.phone}`;
  phone.dataset.phone = result.user.phone;

  try {
    //função pra detectar se algum input foi modificado e ativando/desativando o botão
    function check_editedInputs(name, email, phone) {
      if (
        name.dataset.name === result.user.name &&
        email.dataset.email === result.user.email &&
        phone.dataset.phone === result.user.phone
      ) {
        btn.disabled = true;
      } else {
        btn.disabled = false;
      }
    }

    /* Edição dinamica de nome */

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-name")) {
        const editName = document.querySelector(".icon.edit-name");
        const undo_name = document.querySelector(".icon.undo-name");
        const confirmName = document.querySelector(".icon.confirm-name");
        undo_name.style.display = "none";
        confirmName.style.display = "block";
        name.style.display = "none";
        editName.style.display = "none";
        inputName.style.display = "block";
        inputName.value = name.dataset.name;
        confirmName.addEventListener("click", async () => {
          const settedName = inputName.value;
          name.textContent = `Novo nome: ${settedName}`;
          name.dataset.name = settedName;
          confirmName.style.display = "none";
          inputName.style.display = "none";
          name.style.display = "block";
          editName.style.display = "block";
          undo_name.style.display = "block";

          if (name.dataset.name === result.user.name) {
            name.textContent = `Nome: ${result.user.name}`;
            undo_name.style.display = "none";
            confirmName.style.display = "none";
            name.style.display = "block";
            editName.style.display = "none";
            inputName.style.display = "none";
            editName.style.display = "block";
          }
        });
        undo_name.addEventListener("click", () => {
          name.dataset.name = result.user.name;
          name.textContent = `Nome: ${result.user.name}`;
          undo_name.style.display = "none";
        });
      }
      check_editedInputs(name, email, phone);
    });
    /* Edição dinamica de senha */
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-pass")) {
        editPass.current.style.display = "block";
        editPass.input.style.display = "block";
        const confirmPass = document.querySelector(".icon.confirm-pass");
        const editPass_icon = document.querySelector(".icon.edit-pass");
        document.getElementById("pass").style.display = "none";
        document.getElementById("labelnewPass").style.display = "block";
        document.getElementById("labelcurrentPass").style.display = "block";
        editPass_icon.style.display = "none";
        confirmPass.style.display = "block";
        confirmPass.addEventListener("click", (e) => {});
      }
    });
    /* Edição dinamica de email */
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-email")) {
        const editEmail = document.querySelector(".icon.edit-email");
        const undo_email = document.querySelector(".icon.undo-email");
        const confirmEmail = document.querySelector(".icon.confirm-email");
        undo_email.style.display = "none";
        confirmEmail.style.display = "block";
        email.style.display = "none";
        editEmail.style.display = "none";
        inputEmail.style.display = "block";
        inputEmail.value = email.dataset.email;
        confirmEmail.addEventListener("click", async () => {
          const settedEmail = inputEmail.value;
          email.textContent = `Novo email: ${settedEmail}`;
          email.dataset.email = settedEmail;
          confirmEmail.style.display = "none";
          inputEmail.style.display = "none";
          email.style.display = "block";
          editEmail.style.display = "block";
          undo_email.style.display = "block";
          if (email.dataset.email === result.user.email) {
            email.textContent = `Nome: ${result.user.email}`;
            undo_email.style.display = "none";
            confirmEmail.style.display = "none";
            email.style.display = "block";
            editEmail.style.display = "none";
            inputEmail.style.display = "none";
            editEmail.style.display = "block";
          }
        });
        undo_email.addEventListener("click", () => {
          email.dataset.email = result.user.email;
          email.textContent = `Email: ${result.user.email}`;
          undo_email.style.display = "none";
        });
      }
      check_editedInputs(name, email, phone);
    });

    /* Edição dinamica de telefone */

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-phone")) {
        const editPhone = document.querySelector(".icon.edit-phone");
        const undo_phone = document.querySelector(".icon.undo-phone");
        const confirmPhone = document.querySelector(".icon.confirm-phone");
        undo_phone.style.display = "none";
        confirmPhone.style.display = "block";
        phone.style.display = "none";
        editPhone.style.display = "none";
        inputPhone.style.display = "block";
        inputPhone.value = phone.dataset.phone;

        confirmPhone.addEventListener("click", async () => {
          const settedPhone = inputPhone.value;
          phone.textContent = `Novo telefone: ${settedPhone}`;
          phone.dataset.phone = settedPhone;
          confirmPhone.style.display = "none";
          inputPhone.style.display = "none";
          phone.style.display = "block";
          editPhone.style.display = "block";
          undo_phone.style.display = "block";

          if (phone.dataset.phone === result.user.phone) {
            phone.textContent = `Nome: ${result.user.phone}`;
            undo_phone.style.display = "none";
            confirmPhone.style.display = "none";
            phone.style.display = "block";
            editPhone.style.display = "none";
            inputPhone.style.display = "none";
            editPhone.style.display = "block";
          }
        });
        undo_phone.addEventListener("click", () => {
          phone.dataset.phone = result.user.phone;
          phone.textContent = `Telefone: ${result.user.phone}`;
          undo_phone.style.display = "none";
        });
      }
      check_editedInputs(name, email, phone);
    });

    form.addEventListener("submit", async () => {
      try {
      const newData = {
        name: name.dataset.name,
        email: email.dataset.email,
        phone: phone.dataset.phone,
      };
      const result = await user_updateData(newData);
      if(result.ok) {
        const data = await result.json();
        alert(data.message);
      }
       } catch(error) {
        alert(error);
       }
    });
  } catch (error) {
    alert("Erro: logue-se novamente");
    localStorage.setItem("loggedUser", "false");
    window.location.href = "index.html";
  }
  const logout = document.getElementById("logout");
  logout.addEventListener("click", () => {
    logoutUser();
  });
});
