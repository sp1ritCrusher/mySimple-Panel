import { getProduct } from "../utils/api.js";
import { set_linkPermissions } from "../utils/validation.js";

/* Renderização dos produtos do usuário */

document.addEventListener("DOMContentLoaded", async () => {

  set_linkPermissions("user");

  try {

    //paginação dinamica com innerHTML
    const result = await getProduct();
    let currentPage = 1;
    const itemsPerPage = 10;
    const addBtn = document.getElementById("add");
    const table = document.getElementById("productTable");
    const tbody = document.getElementById("productTableBody");
    const noProduct = document.getElementById("noProducts");
    const searchProduct = document.getElementById("searchProduct");

    function renderPage(products) {
      tbody.innerHTML = "";
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      const pageItems = products.slice(start, end);

      pageItems.forEach((item) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.description}</td>
        <td>${item.price} R$</td>
        <td>${item.ammount}</td>
        <td class="actions">
            <img class="icon edit-btn" src="./assets/edit.png" data-id="${item._id}">
            <img class="icon remove-btn" src="./assets/remove.jpg" data-id="${item._id}">
        </td>`;
        tbody.appendChild(tr);
      });
      renderPaginationControls(products.length);
    }

    function renderPaginationControls(totalItems) {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const pagination = document.getElementById("pagination");

      pagination.innerHTML = "";

      for(let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("page-btn");

        if(i === currentPage) btn.classList.add("active");

        btn.addEventListener("click", () => {
          currentPage = i;
          renderPage(result.product);
        });
        pagination.appendChild(btn);
      }
    }

    searchProduct.addEventListener("input", () => {
      const value = searchProduct.value.toLowerCase();

      const filtered = result.product.filter(
        (item) =>
          item.name.toLowerCase().includes(value) ||
          item.description.toLowerCase().includes(value)
      );
      currentPage = 1;
      renderPage(filtered);


      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Nenhum produto encontrado.</td></tr>`;
      }
      });

    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./addProduct.html";
    });

    if (result.product.length === 0) {
      table.style.display = "none";
      noProduct.style.display = "block";
      return;
    }

    table.style.display = "table";
    noProduct.style.display = "none";

    tbody.innerHTML = "";

    renderPage(result.product);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".edit-btn");
      if (!btn) return;
      const id = btn.dataset.id;
      window.location.href = `./editProduct.html?id=${id}`;
    });

    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("remove-btn")) {
        const id = e.target.dataset.id;

        const response = await fetch(`http://127.0.0.1:3000/products/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if(response.ok) {
        alert("Produto removido com sucesso");
        window.location.reload();
        } else {
          alert(data.message);
        }
      }
    });
  } catch (error) {}
});
