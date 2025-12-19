import { set_linkPermissions } from "../utils/validation.js";


/* Rota Administrativa pra edição dos dados de um usuário */

document.addEventListener("DOMContentLoaded", async () => {

    set_linkPermissions("admin");
    const params = new URLSearchParams(window.location.search);
    const userid = params.get("id");
    const name = document.getElementById("nameInput");
    const email = document.getElementById("emailInput");
    const phone = document.getElementById("phoneInput");
    const btn = document.getElementById("submitbtn");
    btn.disabled = true;
    const form = document.querySelector("form");

    async function getUser() {
        const response = await fetch(`http://127.0.0.1:3000/userControl/${userid}`, 
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await response.json();
        const user = data.user;
        
        name.value =  user.name;
        email.value =  user.email;
        phone.value =  user.phone;
        return user;
    }
    const user = await getUser();
    //Desativa o botão em caso dos dados serem os mesmos
    function checkEqual() {
    if(name.value.trim() === user.name && email.value.trim() === user.email && phone.value.trim() === user.phone) {
        btn.disabled = true;
        return;
    }
}

  name.addEventListener("input", () => {
    if (name.value.trim() !== "") {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
    checkEqual();
  });

    email.addEventListener("input", () => {
    if (email.value.trim() !== "") {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
    checkEqual();
  });

     phone.addEventListener("input", () => {
    if (phone.value.trim() !== "") {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
    checkEqual();
  });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
try {
        const updateUser = {
            id: userid,
            name: name.value,
            email: email.value,
            phone: phone.value,
        }
        const response = await fetch(`http://127.0.0.1:3000/userControl/${userid}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateUser)
        });
if (!response.ok) {
  const errorData = await response.json();
  alert(errorData.message);
  return;
} else {
  alert("Usuario atualizado com sucesso!");
  window.location.href = "./userControl.html";
}

} catch(error) {
    alert(error);
}
    });
});