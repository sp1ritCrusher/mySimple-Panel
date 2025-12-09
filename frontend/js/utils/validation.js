import { getUser, logoutUser } from "./api.js";


/* FRONTEND middlewares/validações */

// Validação dos inputs pra registro

export function validateForm(name, email, password, phone) {
  const nameValid = name.value.length >= 6 && !name.value.includes(" ");
  const emailValid = /^[^@\s]+@[^@\s]+\.[^\s@]+$/.test(email.value);
  const passwordValid = /^(?=(?:.*\d){4,})(?=.*[A-Za-z]).{8,}$/.test(
    password.value.trim()
  );
  const phoneValid = /^[0-9]{10,11}$/.test(phone.value);

  console.log({ nameValid, emailValid, passwordValid, phoneValid });
  return { nameValid, emailValid, passwordValid, phoneValid };
}

// Validação dos inputs pra login
export function validateLogin(email, password) {
  const emailValid = /^[^@\s]+@[^@\s]+\.[^\s@]+$/.test(email.value);
  const passwordValid = /^(?=(?:.*\d){4,})(?=.*[A-Za-z]).{8,}$/.test(
    password.value.trim()
  );
  return { emailValid, passwordValid };
}

// Erro dinâmico adicionado acima dos inputs não válidos

export function showError(input, message) {
  let p = document.getElementById(`error-${input.id}`);
  {
    if (!p) {
      p = document.createElement("p");
      p.className = "error-msg";
      p.id = `error-${input.id}`;
      input.parentNode.insertBefore(p, input);
    }
    p.textContent = message;
  }
}

// Erro dinâmico pro form de produtos

export function showproductError(input, message) {
  let p = document.getElementById(`error-${input.id}`);
  {
    if (!p) {
      p = document.createElement("p");
      p.className = "error-msg";
      p.id = `error-${input.id}`;
      p.textContent = message;
      input.insertAdjacentElement("afterend", p);
    }
  }
}

export function clearError(input) {
  let p = document.getElementById(`error-${input.id}`);
  console.log("cleaning", p, "from", input);
  if (p) p.remove();
}

//validação dos inputs pra produto
export function validateProduct(price, ammount) {
  const validPrice = /^\d+(\.\d{1,2})?$/.test(price.value.trim());
  const validAmmount = /^\d+$/.test(ammount.value.trim());

  const validProduct = validPrice && validAmmount;

  return { validPrice, validAmmount, validProduct};
}

//Verifica a role do usuário e manipula elementos conforme isso

export async function set_linkPermissions (linkType) {

  const result = await getUser();
  document.getElementById("name").textContent = `${result.user.name} ▼`;
  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", async () => { logoutUser(); });
  const isAdmin = result.user.power === "admin";
  if(linkType === "admin") {
    if (!isAdmin) {
      alert("Permissão negada");
      window.location.href = "./main.html";
    }
  }
    if (isAdmin) {
    const navbar = document.getElementById("mainnavbar");
    const adminPanel = document.createElement("li");
        adminPanel.innerHTML = `<a href="http://127.0.0.1:5500/frontend/controlPanel.html">Painel Administrativo</a>`;
        adminPanel.id = "adminPanel";
        navbar.insertAdjacentElement("beforeend", adminPanel);
          if(window.location.href === "http://127.0.0.1:5500/frontend/controlPanel.html") {
            adminPanel.className = "selected"
          }
}
}
