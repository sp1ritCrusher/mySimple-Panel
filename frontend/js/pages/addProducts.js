import { addProduct, getUser } from "../utils/api.js";
import {
  validateProduct,
  clearError,
  showproductError,
  set_linkPermissions
} from "../utils/validation.js";

/* Adicionando Produtos */

document.addEventListener("DOMContentLoaded", async () => {

  set_linkPermissions("user");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const productName = document.getElementById("productName");
  console.log(productName);
  const productDescription = document.getElementById("description");
  const productPrice = document.getElementById("price");
  const productAmmount = document.getElementById("ammount");
  const addBtn = document.getElementById("btnAddProduct");

  // validando o estado do botao a partir dos inputs
  updateButtonState();
  function updateButtonState() {
    const { validProduct } = validateProduct(productPrice, productAmmount);
    addBtn.disabled =
      !validProduct ||
      !productName.value.trim() ||
      !productDescription.value.trim() ||
      !productPrice.value.trim();
  }

  productName.addEventListener("blur", () => {
    console.log("input detected");
    console.log({ productName: productName.value });

    if (productName.value.trim() == "") {
      showproductError(productName, "Erro: Nome inválido");
    } else {
      clearError(productName);
    }

    updateButtonState();
  });

  productName.addEventListener("input", () => {
    if (productName.value.trim() == "") {
      showproductError(productName, "Erro: Nome inválido");
    } else {
      clearError(productName);
    }
    updateButtonState();
  });

  productDescription.addEventListener("blur", () => {
    console.log("input detected");
    console.log({ productName: productDescription.value });

    if (productDescription.value.trim() == "") {
      showproductError(productDescription, "Erro: Descrição inválida");
    } else {
      clearError(productDescription);
    }
    updateButtonState();
  });

  productDescription.addEventListener("input", () => {
    if (productDescription.value.trim() == "") {
      showproductError(productDescription, "Erro: Descrição inválida");
    } else {
      clearError(productDescription);
    }
    updateButtonState();
  });

  productPrice.addEventListener("blur", () => {
    const { validPrice } = validateProduct(productPrice, productAmmount);
    console.log("input detected");
    console.log({ price: productPrice.value });

    if (!validPrice && productPrice.value.trim() !== " ") {
      showproductError(productPrice, "Erro: Preço inválido");
    } else {
      clearError(productPrice);
    }
    updateButtonState();
  });

  productPrice.addEventListener("input", () => {
    const { validPrice } = validateProduct(productPrice, productAmmount);
    console.log("input detected");
    console.log({ price: productPrice.value });

    if (!validPrice && productPrice.value.trim() !== " ") {
      showproductError(productPrice, "Erro: Preço inválido");
    } else {
      clearError(productPrice);
    }
    updateButtonState();
  });

  productAmmount.addEventListener("blur", () => {
    const { validAmmount } = validateProduct(productPrice, productAmmount);
    console.log("input detected");
    console.log({ Qtd: productAmmount.value });

    if (!validAmmount && productAmmount.value.trim() !== " ") {
      showproductError(productAmmount, "Erro: Quantia inválida");
    } else {
      clearError(productAmmount);
    }
    updateButtonState();
  });

  productAmmount.addEventListener("input", () => {
    const { validAmmount } = validateProduct(productPrice, productAmmount);
    console.log("input detected");
    console.log({ Qtd: productAmmount.value });
    
    if (!validAmmount && productAmmount.value.trim() !== " ") {
      showproductError(productAmmount, "Erro: Quantia inválida");
    } else {
      clearError(productAmmount);
    }
    updateButtonState();
  });


  addBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("btn clicked");
          const result = await getUser();
      const ProductData = {
        userid: result.user._id,
        name: productName.value,
        description: productDescription.value,
        price: productPrice.value,
        ammount: productAmmount.value
      };
    try {
      //admin adiciona produto pra um determinado usuario 
        if (window.location.href.includes("id=") && result.user.power === "admin") {
        ProductData.userid = id;
        const result = await addProduct(ProductData);
        alert(result.message);
        } else {

        const result = await addProduct(ProductData);
        alert(result.message);
        window.location.href = "./products.html";
        console.log("Server response:", result);
      } 
    } catch (error) {
        alert(error.message);
      }
  });
});
