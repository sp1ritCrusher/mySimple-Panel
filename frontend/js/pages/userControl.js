import { getUsers } from "../utils/api.js";
import { set_linkPermissions } from "../utils/validation.js";

/* Página administrativa - Listagem de todos os usuários */

document.addEventListener("DOMContentLoaded", async () => {

  set_linkPermissions("admin");
  try {
    // listagem/paginação dinamica com innerHTML
    const result = await getUsers();
    console.log(result.user);
    let currentPage = 1;
    const itemsPerPage = 10;
    const table = document.getElementById("userTable");
    const tbody = document.getElementById("userTableBody");
    const noUser = document.getElementById("noUsers");
    const searchUser = document.getElementById("searchUser");

    function renderPage(users) {
      tbody.innerHTML = "";
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      const pageItems = users.slice(start, end);

      pageItems.forEach((item) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td title="${item._id}">${item._id.slice(0, 15)}...</td>
        <td>${item.name}</td>
        <td>${item.email}</td>
        <td>${item.phone}</td>
        <td>${item.power}</td>
        <td class="actions">
            <img class="icon edit-btn" src="./assets/edit.png" data-id="${item._id}">
            <img class="icon remove-btn" src="./assets/remove.jpg" data-id="${item._id}">
        </td>`;
        tbody.appendChild(tr);
      });
      renderPaginationControls(users.length);
    }

    function renderPaginationControls(totalItems) {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const pagination = document.getElementById("pagination");

      pagination.innerHTML = "";

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("page-btn");

        if (i === currentPage) btn.classList.add("active");

        btn.addEventListener("click", () => {
          currentPage = i;
          renderPage(result.user);
        });
        pagination.appendChild(btn);
      }
    }

    searchUser.addEventListener("input", () => {
      const value = searchUser.value.toLowerCase();

      const filtered = result.user.filter(
        (item) =>
          item.name.toLowerCase().includes(value) ||
          item.email.toLowerCase().includes(value) ||
          item._id.toLowerCase().includes(value) ||
          item.phone.toLowerCase().includes(value)
      );
      currentPage = 1;
      renderPage(filtered);

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Nenhum usuario encontrado.</td></tr>`;
      }
    });

    if (result.user.length === 0) {
      table.style.display = "none";
      noUser.style.display = "block";
      return;
    }

    table.style.display = "table";
    noUser.style.display = "none";


    tbody.innerHTML = "";
    renderPage(result.user);
    
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".edit-btn");
      if (!btn) return;
      const id = btn.dataset.id;
      window.location.href = `./editUser.html?id=${id}`;
    });

    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("remove-btn")) {
        const id = e.target.dataset.id;

        const response = await fetch(`http://127.0.0.1:3000/userControl/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        alert(data.message);
        window.location.reload();
      }
    });
  } catch (error) {
    console.error(error);
  }
});
