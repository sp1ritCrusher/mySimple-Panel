import { set_linkPermissions } from "../utils/validation.js";

/* Edição de produto pelo usuário */

document.addEventListener("DOMContentLoaded", async () => {
  set_linkPermissions("user");
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const name = document.getElementById("nameInput");
  const description = document.getElementById("descInput");
  const price = document.getElementById("priceInput");
  const ammount = document.getElementById("ammountInput");
  const btn = document.getElementById("submitbtn");
  const form = document.querySelector("form");
  btn.disabled = true;
  async function loadProduct() {
    const response = await fetch(
      `http://127.0.0.1:3000/products/${productId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const product = data.product;
    name.value = product.name;
    description.value = product.description;
    price.value = product.price;
    ammount.value = product.ammount;
    return product;
  }

  //impede digitação se os campos estiverem vazios/iguais ao estado inicial
 const product = await loadProduct(); 
function checkEqual() {
    if(name.value.trim() === product.name && description.value.trim() === product.description && Number(price.value) === product.price && Number(ammount.value) === product.ammount) {
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

  description.addEventListener("input", () => {
    if (description.value.trim() !== "") {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
    checkEqual();
  });

    price.addEventListener("input", () => {
    if (price.value.trim() !== "") {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
    checkEqual();
  });

   ammount.addEventListener("input", () => {
    if (ammount.value.trim() !== "") {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
    checkEqual();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updateProduct = {
      name: name.value,
      description: description.value,
      price: price.value,
      ammount: ammount.value,
    };

   const result = await fetch(`http://127.0.0.1:3000/products/${productId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateProduct),
    });
    const info = await result.json();
    alert(info.message);
    window.location.href = "./products.html";
  });
});
